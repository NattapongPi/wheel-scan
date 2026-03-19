'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Asset,
  Exchange,
  OptionType,
  OptionRow,
  Weights,
  WeightKey,
  BTC_OPTIONS,
  ETH_OPTIONS,
  DEFAULT_WEIGHTS,
} from '@/lib/mock-data'
import { Header } from './header'
import { SettingsBar } from './settings-bar'
import { TopPicks } from './top-picks'
import { OptionsTable } from './options-table'

const ALL_EXCHANGES: Exchange[] = ['Deribit', 'OKX', 'Bybit', 'Binance']

export function Dashboard() {
  const [asset, setAsset] = useState<Asset>('BTC')
  const [activeType, setActiveType] = useState<OptionType>('PUT')
  const [otmTarget, setOtmTarget] = useState(10)
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS)
  const [selectedExchanges, setSelectedExchanges] = useState<Exchange[]>(ALL_EXCHANGES)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLastRefresh(new Date())
      setIsRefreshing(false)
    }, 800)
  }, [])

  // Auto-refresh every 60s
  useEffect(() => {
    const timer = setInterval(handleRefresh, 60_000)
    return () => clearInterval(timer)
  }, [handleRefresh])

  function handleExchangeToggle(ex: Exchange) {
    setSelectedExchanges((prev) =>
      prev.includes(ex)
        ? prev.length > 1 ? prev.filter((e) => e !== ex) : prev // keep at least one
        : [...prev, ex]
    )
  }

  function handleWeightChange(key: WeightKey, val: number) {
    setWeights((prev) => ({ ...prev, [key]: Math.max(0, Math.min(100, val)) }))
  }

  const rawOptions = asset === 'BTC' ? BTC_OPTIONS : ETH_OPTIONS

  // Filter by selected exchanges
  const filtered = rawOptions.filter((r) => selectedExchanges.includes(r.exchange))

  // Score override based on current weights and otm target
  const scored: OptionRow[] = filtered.map((row) => {
    const otmDiff = Math.abs(row.otm - otmTarget)
    const moneynessScore = Math.max(0, 100 - otmDiff * 8)
    const aprScore = Math.min(100, (row.apr / 200) * 100)
    const ivScore = Math.min(100, (row.iv / 80) * 100)
    const oiScore = Math.min(100, (row.oi / 5000) * 100)
    const dteScore = Math.max(0, 100 - Math.abs(row.dte - 14) * 3)

    const total = weights.moneyness + weights.apr + weights.iv + weights.oi + weights.dte || 1
    const score = Math.round(
      (moneynessScore * weights.moneyness +
        aprScore * weights.apr +
        ivScore * weights.iv +
        oiScore * weights.oi +
        dteScore * weights.dte) /
        total
    )
    return { ...row, score }
  })

  const sortedAll = [...scored].sort((a, b) => b.score - a.score)
  const topPicks = sortedAll.slice(0, 3)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Header
        asset={asset}
        onAssetChange={setAsset}
        lastRefresh={lastRefresh}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      <SettingsBar
        otmTarget={otmTarget}
        onOtmChange={setOtmTarget}
        weights={weights}
        onWeightChange={handleWeightChange}
        selectedExchanges={selectedExchanges}
        onExchangeToggle={handleExchangeToggle}
      />
      <main className="flex flex-col flex-1 min-h-0 overflow-auto">
        <TopPicks picks={topPicks} />
        <OptionsTable
          rows={scored}
          activeType={activeType}
          onTypeChange={setActiveType}
        />
      </main>
    </div>
  )
}
