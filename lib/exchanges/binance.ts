import type { Asset, OptionRow, OptionType } from "@/lib/mock-data";
import { safeJsonFetch, computeApr, computeOtm, parseDte } from "./utils";

const BASE = "https://eapi.binance.com";

interface BinanceTicker {
  symbol: string; // e.g. "BTC-250328-80000-P"
  bidPrice: string;
  markIV: string; // 0-1 scale
  openInterest: string;
}

interface BinanceIndexPrice {
  indexPrice: string;
}

interface BinanceMark {
  symbol: string;
  markIV: string;
}

interface BinanceOpenInterest {
  symbol: string;
  sumOpenInterest: string;
  sumOpenInterestUsd: string;
  timestamp: string;
}

interface ParsedBinanceOption {
  symbol: string;
  strike: number;
  type: OptionType;
  expiryDate: string;
  dte: number;
  bidUsd: number;
  otm: number;
}

async function fetchBinanceMarkMap(): Promise<Map<string, number>> {
  const data = await safeJsonFetch<BinanceMark[]>(`${BASE}/eapi/v1/mark`);
  const markMap = new Map<string, number>();

  for (const row of data) {
    const markIv = parseFloat(row.markIV);
    if (Number.isFinite(markIv)) {
      markMap.set(row.symbol, Math.round(markIv * 1000) / 10);
    }
  }

  return markMap;
}

async function fetchBinanceOpenInterestMap(
  asset: Asset,
  expirationDate: string
): Promise<Map<string, number>> {
  const attempts = [
    new URLSearchParams({ underlyingAsset: asset, expirationDate }),
    new URLSearchParams({ underlying: asset, expirationDate }),
  ];

  for (const params of attempts) {
    try {
      const data = await safeJsonFetch<BinanceOpenInterest[]>(
        `${BASE}/eapi/v1/openInterest?${params.toString()}`
      );

      const oiMap = new Map<string, number>();
      for (const row of data) {
        const openInterest = parseFloat(row.sumOpenInterest);
        if (Number.isFinite(openInterest)) {
          oiMap.set(row.symbol, Math.round(openInterest * 100) / 100);
        }
      }

      return oiMap;
    } catch {
      // Try the next parameter shape.
    }
  }

  return new Map();
}

export async function fetchBinanceSpot(asset: Asset): Promise<number> {
  const underlying = asset === "BTC" ? "BTCUSDT" : "ETHUSDT";
  const data = await safeJsonFetch<BinanceIndexPrice>(
    `${BASE}/eapi/v1/index?underlying=${underlying}`
  );
  return parseFloat(data.indexPrice);
}

export async function fetchBinanceOptions(
  asset: Asset
): Promise<{ options: OptionRow[]; spotPrice: number }> {
  const underlying = asset === "BTC" ? "BTCUSDT" : "ETHUSDT";

  const [spotPrice, tickers] = await Promise.all([
    fetchBinanceSpot(asset),
    safeJsonFetch<BinanceTicker[]>(
      `${BASE}/eapi/v1/ticker?underlying=${underlying}`
    ),
  ]);

  const parsed: ParsedBinanceOption[] = [];
  const expirations = new Set<string>();

  for (const t of tickers) {
    const bid = parseFloat(t.bidPrice);
    if (!bid || bid <= 0) continue;

    // Parse symbol: BTC-250328-80000-P
    const parts = t.symbol.split("-");
    if (parts.length < 4) continue;

    const type: OptionType = parts[parts.length - 1] === "P" ? "PUT" : "CALL";
    const strike = parseFloat(parts[parts.length - 2]);
    if (!strike) continue;

    // Parse expiry from YYMMDD
    const expiryDate = parts[1];
    const year = 2000 + parseInt(expiryDate.slice(0, 2));
    const month = parseInt(expiryDate.slice(2, 4)) - 1;
    const day = parseInt(expiryDate.slice(4, 6));
    const expiryMs = new Date(Date.UTC(year, month, day, 8, 0, 0)).getTime();
    const dte = parseDte(expiryMs);

    if (dte < 1 || dte > 90) continue;
    if (Math.abs(strike - spotPrice) / spotPrice > 0.3) continue;

    const otm = computeOtm(spotPrice, strike, type);
    if (otm < 0) continue;

    expirations.add(expiryDate);
    parsed.push({
      symbol: t.symbol,
      strike,
      type,
      expiryDate,
      dte,
      bidUsd: Math.round(bid * 100) / 100,
      otm,
    });
  }

  const [markMap, oiMaps] = await Promise.all([
    fetchBinanceMarkMap(),
    Promise.all(
      [...expirations].map((expirationDate) =>
        fetchBinanceOpenInterestMap(asset, expirationDate)
      )
    ),
  ]);

  const oiMap = new Map<string, number>();
  for (const map of oiMaps) {
    for (const [symbol, openInterest] of map) {
      oiMap.set(symbol, openInterest);
    }
  }

  const options: OptionRow[] = [];

  for (const option of parsed) {
    const markIv = markMap.get(option.symbol);
    const fallbackIv = Number.isFinite(markIv)
      ? markIv
      : Math.round(
          parseFloat(
            tickers.find((t) => t.symbol === option.symbol)?.markIV || ""
          ) * 1000
        ) / 10;

    options.push({
      id: `binance-${option.symbol}`,
      exchange: "Binance",
      instrument: option.symbol,
      asset,
      type: option.type,
      strike: option.strike,
      bid: option.bidUsd,
      dte: option.dte,
      apr: computeApr(option.bidUsd, option.strike, option.dte),
      otm: option.otm,
      iv: Number.isFinite(fallbackIv) ? fallbackIv : 0,
      oi: oiMap.get(option.symbol) ?? 0,
      score: 0,
    });
  }

  return { options, spotPrice };
}
