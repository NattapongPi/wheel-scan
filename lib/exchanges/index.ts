import type { Asset, Exchange, OptionRow } from "@/lib/mock-data";
import { BTC_OPTIONS, ETH_OPTIONS, SPOT_PRICES } from "@/lib/mock-data";
import { fetchDeribitOptions } from "./deribit";
import { fetchBinanceOptions } from "./binance";
import { fetchOkxOptions } from "./okx";
import { fetchBybitOptions } from "./bybit";

export interface ExchangeError {
  exchange: Exchange;
  error: string;
}

export interface FetchResult {
  options: OptionRow[];
  spotPrice: number;
  errors: ExchangeError[];
  isDemo: boolean;
}

// Simple in-memory cache
const cache = new Map<string, { data: FetchResult; ts: number }>();
const CACHE_TTL = 30_000; // 30 seconds

export async function fetchAllOptions(asset: Asset): Promise<FetchResult> {
  const key = `options-${asset}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  const errors: ExchangeError[] = [];
  const allOptions: OptionRow[] = [];
  let spotPrice = 0;

  // Fetch all exchanges in parallel
  const [deribitResult, binanceResult, okxResult, bybitResult] =
    await Promise.allSettled([
      fetchDeribitOptions(asset),
      fetchBinanceOptions(asset),
      fetchOkxOptions(asset),
      fetchBybitOptions(asset),
    ]);

  for (const [result, exchange] of [
    [deribitResult, "Deribit"],
    [binanceResult, "Binance"],
    [okxResult, "OKX"],
    [bybitResult, "Bybit"],
  ] as const) {
    if (result.status === "fulfilled") {
      allOptions.push(...result.value.options);
      // Use the first successful spot price
      if (spotPrice === 0 && result.value.spotPrice > 0) {
        spotPrice = result.value.spotPrice;
      }
    } else {
      errors.push({
        exchange,
        error: String((result as PromiseRejectedResult).reason),
      });
    }
  }

  // If all exchanges failed, fall back to mock data
  if (allOptions.length === 0) {
    return {
      options: asset === "BTC" ? BTC_OPTIONS : ETH_OPTIONS,
      spotPrice: SPOT_PRICES[asset],
      errors,
      isDemo: true,
    };
  }

  const result: FetchResult = {
    options: allOptions,
    spotPrice,
    errors,
    isDemo: false,
  };
  cache.set(key, { data: result, ts: Date.now() });
  return result;
}
