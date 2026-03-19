import type { OptionType } from "@/lib/mock-data";

export async function safeJsonFetch<T>(
  url: string,
  timeoutMs = 10_000
): Promise<T> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function computeApr(
  bidUsd: number,
  strike: number,
  dte: number
): number {
  if (dte <= 0 || strike <= 0) return 0;
  return Math.round((bidUsd / strike) * (365 / dte) * 100);
}

export function computeOtm(
  spotPrice: number,
  strike: number,
  type: OptionType
): number {
  if (spotPrice <= 0) return 0;
  if (type === "PUT") {
    return Math.round(((spotPrice - strike) / spotPrice) * 1000) / 10;
  }
  // CALL
  return Math.round(((strike - spotPrice) / spotPrice) * 1000) / 10;
}

export function parseDte(expiryMs: number): number {
  return Math.ceil((expiryMs - Date.now()) / 86_400_000);
}

/** Run promises with a concurrency limit */
export async function pMap<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let idx = 0;

  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      try {
        results[i] = { status: "fulfilled", value: await fn(items[i]) };
      } catch (reason) {
        results[i] = { status: "rejected", reason };
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}
