import type { Asset, OptionRow, OptionType } from "@/lib/mock-data";
import { safeJsonFetch, computeApr, computeOtm, parseDte } from "./utils";

const BASE = "https://api.bybit.com";

interface BybitResponse<T> {
  retCode: number;
  result: {
    list: T[];
  };
}

interface BybitTicker {
  symbol: string; // e.g. "BTC-28MAR25-80000-P"
  bid1Price: string;
  markIv: string; // decimal e.g. "0.7234"
  openInterest: string;
}

interface BybitSpotTicker {
  symbol: string;
  lastPrice: string;
}

interface BybitInstrument {
  symbol: string;
  strikePrice: string;
  optionsType: "Call" | "Put";
  deliveryTime: string; // unix ms as string
}

export async function fetchBybitSpot(asset: Asset): Promise<number> {
  const symbol = asset === "BTC" ? "BTCUSDT" : "ETHUSDT";
  const data = await safeJsonFetch<BybitResponse<BybitSpotTicker>>(
    `${BASE}/v5/market/tickers?category=spot&symbol=${symbol}`
  );
  if (!data.result.list.length) throw new Error("Bybit: no spot ticker");
  return parseFloat(data.result.list[0].lastPrice);
}

export async function fetchBybitOptions(
  asset: Asset
): Promise<{ options: OptionRow[]; spotPrice: number }> {
  const baseCoin = asset;

  const [spotPrice, instrData, tickerData] = await Promise.all([
    fetchBybitSpot(asset),
    safeJsonFetch<BybitResponse<BybitInstrument>>(
      `${BASE}/v5/market/instruments-info?category=option&baseCoin=${baseCoin}&limit=500`
    ),
    safeJsonFetch<BybitResponse<BybitTicker>>(
      `${BASE}/v5/market/tickers?category=option&baseCoin=${baseCoin}`
    ),
  ]);

  const instrMap = new Map<string, BybitInstrument>();
  for (const i of instrData.result.list) instrMap.set(i.symbol, i);

  const options: OptionRow[] = [];

  for (const t of tickerData.result.list) {
    const bid = parseFloat(t.bid1Price);
    if (!bid || bid <= 0) continue;

    const instr = instrMap.get(t.symbol);
    if (!instr) continue;

    const strike = parseFloat(instr.strikePrice);
    const type: OptionType = instr.optionsType === "Put" ? "PUT" : "CALL";
    const expiryMs = parseInt(instr.deliveryTime);
    const dte = parseDte(expiryMs);

    if (dte < 1 || dte > 90) continue;
    if (Math.abs(strike - spotPrice) / spotPrice > 0.3) continue;

    const otm = computeOtm(spotPrice, strike, type);
    if (otm < 0) continue;

    const iv = parseFloat(t.markIv) * 100;

    options.push({
      id: `bybit-${t.symbol}`,
      exchange: "Bybit",
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
