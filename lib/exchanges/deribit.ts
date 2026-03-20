import type { Asset, OptionRow, OptionType } from "@/lib/mock-data";
import { safeJsonFetch, computeApr, computeOtm, parseDte, pMap } from "./utils";

const BASE = "https://www.deribit.com/api/v2";

interface DeribitInstrument {
  instrument_name: string;
  strike: number;
  option_type: "call" | "put";
  expiration_timestamp: number;
  is_active: boolean;
}

interface DeribitTicker {
  instrument_name: string;
  best_bid_price: number | null;
  mark_iv: number;
  open_interest: number;
}

interface DeribitIndexPrice {
  index_price: number;
}

interface DeribitResult<T> {
  result: T;
}

export async function fetchDeribitSpot(asset: Asset): Promise<number> {
  const indexName = asset === "BTC" ? "btc_usd" : "eth_usd";
  const data = await safeJsonFetch<DeribitResult<DeribitIndexPrice>>(
    `${BASE}/public/get_index_price?index_name=${indexName}`
  );
  return data.result.index_price;
}

export async function fetchDeribitOptions(
  asset: Asset
): Promise<{ options: OptionRow[]; spotPrice: number }> {
  const spotPrice = await fetchDeribitSpot(asset);

  const instrData = await safeJsonFetch<DeribitResult<DeribitInstrument[]>>(
    `${BASE}/public/get_instruments?currency=${asset}&kind=option&expired=false`
  );

  const instruments = instrData.result.filter((i) => {
    if (!i.is_active) return false;
    const dte = parseDte(i.expiration_timestamp);
    if (dte < 1 || dte > 90) return false;
    return Math.abs(i.strike - spotPrice) / spotPrice <= 0.3;
  });

  const tickerResults = await pMap(
    instruments,
    async (instr) => {
      const data = await safeJsonFetch<DeribitResult<DeribitTicker>>(
        `${BASE}/public/ticker?instrument_name=${instr.instrument_name}`
      );
      return { instrument: instr, ticker: data.result };
    },
    15
  );

  const options: OptionRow[] = [];

  for (const result of tickerResults) {
    if (result.status !== "fulfilled") continue;
    const { instrument: instr, ticker } = result.value;

    const bidInUnderlying = ticker.best_bid_price;
    if (!bidInUnderlying || bidInUnderlying <= 0) continue;

    const bidUsd = bidInUnderlying * spotPrice;
    const type: OptionType = instr.option_type === "put" ? "PUT" : "CALL";
    const dte = parseDte(instr.expiration_timestamp);
    const otm = computeOtm(spotPrice, instr.strike, type);
    if (otm < 0) continue;

    const oi = Math.round((ticker.open_interest || 0) * spotPrice);
    if (oi <= 0) continue;

    options.push({
      id: `deribit-${instr.instrument_name}`,
      exchange: "Deribit",
      instrument: instr.instrument_name,
      asset,
      type,
      strike: instr.strike,
      bid: Math.round(bidUsd * 100) / 100,
      dte,
      apr: computeApr(bidUsd, instr.strike, dte),
      otm,
      iv: Math.round(ticker.mark_iv * 10) / 10,
      oi,
      score: 0,
    });
  }

  return { options, spotPrice };
}
