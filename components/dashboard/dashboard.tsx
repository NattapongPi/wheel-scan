"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Asset,
  Exchange,
  OptionType,
  OptionRow,
  Weights,
  WeightKey,
  DEFAULT_WEIGHTS,
} from "@/lib/mock-data";
import type { ExchangeError } from "@/lib/exchanges";
import { Header } from "./header";
import { SettingsBar } from "./settings-bar";
import { TopPicks } from "./top-picks";
import { OptionsTable } from "./options-table";

const ALL_EXCHANGES: Exchange[] = ["Deribit", "OKX", "Bybit", "Binance"];

export function Dashboard() {
  const [asset, setAsset] = useState<Asset>("BTC");
  const [activeType, setActiveType] = useState<OptionType>("PUT");
  const [otmTarget, setOtmTarget] = useState(10);
  const [otmTargetCommitted, setOtmTargetCommitted] = useState(10);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [selectedExchanges, setSelectedExchanges] =
    useState<Exchange[]>(ALL_EXCHANGES);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // API state
  const [options, setOptions] = useState<OptionRow[]>([]);
  const [spotPrice, setSpotPrice] = useState<number>(0);
  const [apiErrors, setApiErrors] = useState<ExchangeError[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/options?asset=${asset}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOptions(data.options ?? []);
      setSpotPrice(data.spotPrice ?? 0);
      setApiErrors(data.errors ?? []);
      setIsDemo(data.isDemo ?? false);
      setLastRefresh(new Date(data.timestamp));
    } catch {
      // Keep existing data on failure; just update timestamp
      setLastRefresh(new Date());
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [asset]);

  // Fetch on mount and when asset changes
  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 60s
  useEffect(() => {
    const timer = setInterval(fetchData, 60_000);
    return () => clearInterval(timer);
  }, [fetchData]);

  function handleExchangeToggle(ex: Exchange) {
    setSelectedExchanges((prev) =>
      prev.includes(ex)
        ? prev.length > 1
          ? prev.filter((e) => e !== ex)
          : prev
        : [...prev, ex]
    );
  }

  function handleWeightChange(key: WeightKey, val: number) {
    setWeights((prev) => ({ ...prev, [key]: Math.max(0, Math.min(100, val)) }));
  }

  // Filter by selected exchanges
  const filtered = useMemo(
    () => options.filter((r) => selectedExchanges.includes(r.exchange)),
    [options, selectedExchanges]
  );

  // Score override based on current weights and otm target
  const scored = useMemo(() => filtered.map((row) => {
    const otmDiff = Math.abs(row.otm - otmTargetCommitted);
    const moneynessScore = Math.max(0, 100 - otmDiff * 8);
    const aprScore = Math.min(100, (row.apr / 200) * 100);
    const ivScore = Math.min(100, (row.iv / 80) * 100);
    const oiScore = Math.min(100, (row.oi / 5000) * 100);
    const dteScore = Math.max(0, 100 - Math.abs(row.dte - 14) * 3);

    const total =
      weights.moneyness + weights.apr + weights.iv + weights.oi + weights.dte ||
      1;
    const score = Math.round(
      (moneynessScore * weights.moneyness +
        aprScore * weights.apr +
        ivScore * weights.iv +
        oiScore * weights.oi +
        dteScore * weights.dte) /
        total
    );
    return { ...row, score };
  }), [filtered, otmTargetCommitted, weights]);

  const sortedAll = [...scored].sort((a, b) => b.score - a.score);
  const topPicks = sortedAll.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen md:h-screen overflow-x-hidden md:overflow-hidden bg-background">
      <Header
        asset={asset}
        onAssetChange={setAsset}
        spotPrice={spotPrice}
        lastRefresh={lastRefresh ?? new Date(0)}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
        isDemo={isDemo}
        apiErrors={apiErrors}
      />
      <SettingsBar
        otmTarget={otmTarget}
        onOtmChange={setOtmTarget}
        onOtmCommit={setOtmTargetCommitted}
        weights={weights}
        onWeightChange={handleWeightChange}
        selectedExchanges={selectedExchanges}
        onExchangeToggle={handleExchangeToggle}
      />
      <main className="flex flex-col flex-1 min-h-0 overflow-visible md:overflow-auto pb-6 md:pb-0">
        {isLoading ? (
          <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
            Loading live options data…
          </div>
        ) : (
          <>
            <TopPicks picks={topPicks} />
            <OptionsTable
              rows={scored}
              activeType={activeType}
              onTypeChange={setActiveType}
            />
          </>
        )}
      </main>
    </div>
  );
}
