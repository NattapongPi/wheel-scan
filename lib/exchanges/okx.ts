import type { Asset, OptionRow, OptionType } from "@/lib/mock-data";
import { safeJsonFetch, computeApr, computeOtm, parseDte } from "./utils";

const BASE = "https://www.okx.com";

interface OkxResponse<T> {
  code: string;
  data: T[];
}

interface OkxTicker {
  instId: string;
  bidPx: string;
}

interface OkxOptSummary {
  instId: string;
  markVol: string; // decimal e.g. "0.72"
  oi: string;
}

interface OkxIndexTicker {
  instId: string;
  idxPx: string;
}

interface OkxInstrument {
  instId: string;
  strike: string;
  optType: "C" | "P";
  expTime: string; // unix ms as string
}

export async function fetchOkxSpot(asset: Asset): Promise<number> {
  const instId = asset === "BTC" ? "BTC-USD" : "ETH-USD";
  const data = await safeJsonFetch<OkxResponse<OkxIndexTicker>>(
    `${BASE}/api/v5/market/index-tickers?instId=${instId}`
  );
  if (!data.data.length) throw new Error("OKX: no index ticker data");
  return parseFloat(data.data[0].idxPx);
}

export async function fetchOkxOptions(
  asset: Asset
): Promise<{ options: OptionRow[]; spotPrice: number }> {
  const uly = asset === "BTC" ? "BTC-USD" : "ETH-USD";

  const [spotPrice, instrData, summaryData, tickerData] = await Promise.all([
    fetchOkxSpot(asset),
    safeJsonFetch<OkxResponse<OkxInstrument>>(
      `${BASE}/api/v5/public/instruments?instType=OPTION&uly=${uly}`
    ),
    safeJsonFetch<OkxResponse<OkxOptSummary>>(
      `${BASE}/api/v5/public/opt-summary?uly=${uly}`
    ),
    safeJsonFetch<OkxResponse<OkxTicker>>(
      `${BASE}/api/v5/market/tickers?instType=OPTION&uly=${uly}`
    ),
  ]);

  const summaryMap = new Map<string, OkxOptSummary>();
  for (const s of summaryData.data) summaryMap.set(s.instId, s);

  const tickerMap = new Map<string, OkxTicker>();
  for (const t of tickerData.data) tickerMap.set(t.instId, t);

  const options: OptionRow[] = [];

  for (const instr of instrData.data) {
    const ticker = tickerMap.get(instr.instId);
    const summary = summaryMap.get(instr.instId);
    if (!ticker || !summary) continue;

    const bidInUnderlying = parseFloat(ticker.bidPx);
    if (!bidInUnderlying || bidInUnderlying <= 0) continue;

    const bidUsd = bidInUnderlying * spotPrice;
    const strike = parseFloat(instr.strike);
    const type: OptionType = instr.optType === "P" ? "PUT" : "CALL";
    const expiryMs = parseInt(instr.expTime);
    const dte = parseDte(expiryMs);

    if (dte < 1 || dte > 90) continue;
    if (Math.abs(strike - spotPrice) / spotPrice > 0.3) continue;

    const otm = computeOtm(spotPrice, strike, type);
    if (otm < 0) continue;

    const iv = parseFloat(summary.markVol) * 100;

    options.push({
      id: `okx-${instr.instId}`,
      exchange: "OKX",
      instrument: instr.instId,
      asset,
      type,
      strike,
      bid: Math.round(bidUsd * 100) / 100,
      dte,
      apr: computeApr(bidUsd, strike, dte),
      otm,
      iv: Math.round(iv * 10) / 10,
      oi: Math.round(parseFloat(summary.oi) || 0),
      score: 0,
    });
  }

  return { options, spotPrice };
}
