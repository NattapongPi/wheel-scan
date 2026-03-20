import type { Asset, OptionRow, OptionType } from "@/lib/mock-data";
import { safeJsonFetch, computeApr, computeOtm, parseDte, pMap } from "./utils";

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
  oi?: string;
  oiCcy?: string;
  oiUsd?: string;
}

interface OkxOpenInterest {
  instId: string;
  instType: string;
  oi: string;
  oiCcy: string;
  oiUsd: string;
  ts: string;
}

interface OkxIndexTicker {
  instId: string;
  idxPx: string;
}

interface OkxInstrument {
  instId: string;
  strike?: string;
  stk?: string;
  optType: "C" | "P";
  expTime: string; // unix ms as string
}

function parseOkxStrike(instr: OkxInstrument): number {
  const directStrike = Number.parseFloat(instr.stk ?? instr.strike ?? "");
  if (Number.isFinite(directStrike)) return directStrike;

  const fallbackStrike = Number.parseFloat(instr.instId.split("-")[3] ?? "");
  return Number.isFinite(fallbackStrike) ? fallbackStrike : NaN;
}

function parseOkxOpenInterest(
  row: Partial<OkxOptSummary> | Partial<OkxOpenInterest> | undefined,
  spotPrice: number
): number {
  if (!row) return 0;

  const oiCcy = Number.parseFloat(row.oiCcy ?? "");
  if (Number.isFinite(oiCcy) && oiCcy > 0) return Math.round(oiCcy * spotPrice);

  return 0;
}

async function fetchOkxOpenInterest(
  instId: string,
  uly: string
): Promise<OkxOpenInterest | null> {
  const params = new URLSearchParams({
    instType: "OPTION",
    uly,
    instId,
  });

  const data = await safeJsonFetch<OkxResponse<OkxOpenInterest>>(
    `${BASE}/api/v5/public/open-interest?${params.toString()}`
  );

  return data.data[0] ?? null;
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

  const openInterestEntries = await pMap(
    instrData.data,
    async (instr) =>
      [instr.instId, await fetchOkxOpenInterest(instr.instId, uly)] as const,
    8
  );
  const openInterestMap = new Map<string, OkxOpenInterest | null>(
    openInterestEntries
      .filter((e): e is PromiseFulfilledResult<readonly [string, OkxOpenInterest | null]> => e.status === "fulfilled")
      .map((e) => e.value)
  );

  const options: OptionRow[] = [];

  for (const instr of instrData.data) {
    const ticker = tickerMap.get(instr.instId);
    if (!ticker) continue;

    const bidInUnderlying = parseFloat(ticker.bidPx);
    if (!Number.isFinite(bidInUnderlying) || bidInUnderlying <= 0) continue;

    const bidUsd = bidInUnderlying * spotPrice;
    const strike = parseOkxStrike(instr);
    if (!Number.isFinite(strike) || strike <= 0) continue;

    const type: OptionType = instr.optType === "P" ? "PUT" : "CALL";
    const expiryMs = parseInt(instr.expTime);
    const dte = parseDte(expiryMs);

    if (dte < 1 || dte > 90) continue;
    if (Math.abs(strike - spotPrice) / spotPrice > 0.3) continue;

    const otm = computeOtm(spotPrice, strike, type);
    if (otm < 0) continue;

    const summary = summaryMap.get(instr.instId);
    const openInterest = openInterestMap.get(instr.instId) ?? null;
    const iv = Number.parseFloat(summary?.markVol ?? "");
    const oi =
      parseOkxOpenInterest(openInterest ?? undefined, spotPrice) || parseOkxOpenInterest(summary, spotPrice);

    if (oi <= 0) continue;

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
      iv: Number.isFinite(iv) ? Math.round(iv * 1000) / 10 : 0,
      oi: Number.isFinite(oi) ? Math.round(oi) : 0,
      score: 0,
    });
  }

  return { options, spotPrice };
}
