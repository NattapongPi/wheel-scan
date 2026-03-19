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

  const options: OptionRow[] = [];

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
    const expiryStr = parts[1];
    const year = 2000 + parseInt(expiryStr.slice(0, 2));
    const month = parseInt(expiryStr.slice(2, 4)) - 1;
    const day = parseInt(expiryStr.slice(4, 6));
    const expiryMs = new Date(Date.UTC(year, month, day, 8, 0, 0)).getTime();
    const dte = parseDte(expiryMs);

    if (dte < 1 || dte > 90) continue;
    if (Math.abs(strike - spotPrice) / spotPrice > 0.3) continue;

    const otm = computeOtm(spotPrice, strike, type);
    if (otm < 0) continue;

    const iv = parseFloat(t.markIV) * 100;

    options.push({
      id: `binance-${t.symbol}`,
      exchange: "Binance",
      instrument: t.symbol,
      asset,
      type,
      strike,
      bid: Math.round(bid * 100) / 100,
      dte,
      apr: computeApr(bid, strike, dte),
      otm,
      iv: Math.round(iv * 10) / 10,
      oi: Math.round(parseFloat(t.openInterest) || 0),
      score: 0,
    });
  }

  return { options, spotPrice };
}
