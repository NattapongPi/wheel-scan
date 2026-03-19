'use client'

import { Exchange, Weights, WeightKey } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const EXCHANGES: Exchange[] = ['Deribit', 'OKX', 'Bybit', 'Binance']

const WEIGHT_CONFIG: { key: WeightKey; label: string; color: string }[] = [
  { key: 'moneyness', label: 'Moneyness', color: 'text-[#58a6ff] border-[#58a6ff]/40 bg-[#58a6ff]/10' },
  { key: 'apr',       label: 'APR',       color: 'text-[#3fb950] border-[#3fb950]/40 bg-[#3fb950]/10' },
  { key: 'iv',        label: 'IV',        color: 'text-purple-400 border-purple-400/40 bg-purple-400/10' },
  { key: 'oi',        label: 'OI',        color: 'text-amber-400  border-amber-400/40  bg-amber-400/10'  },
  { key: 'dte',       label: 'DTE',       color: 'text-teal-400  border-teal-400/40  bg-teal-400/10'   },
]

interface SettingsBarProps {
  otmTarget: number
  onOtmChange: (val: number) => void
  weights: Weights
  onWeightChange: (key: WeightKey, val: number) => void
  selectedExchanges: Exchange[]
  onExchangeToggle: (ex: Exchange) => void
}

export function SettingsBar({
  otmTarget,
  onOtmChange,
  weights,
  onWeightChange,
  selectedExchanges,
  onExchangeToggle,
}: SettingsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-2.5 bg-muted border-b border-border text-sm">
      {/* OTM sweet spot slider */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-muted-foreground text-xs font-medium whitespace-nowrap">OTM Target</span>
        <input
          type="range"
          min={2}
          max={25}
          step={0.5}
          value={otmTarget}
          onChange={(e) => onOtmChange(Number(e.target.value))}
          className="w-28 accent-primary h-1.5 cursor-pointer"
          aria-label="OTM sweet spot percentage"
        />
        <span className="font-mono text-primary text-xs w-9">{otmTarget}%</span>
      </div>

      {/* Weight chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-muted-foreground text-xs font-medium">Weights</span>
        {WEIGHT_CONFIG.map(({ key, label, color }) => (
          <div key={key} className={cn('flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-medium', color)}>
            <span>{label}</span>
            <input
              type="number"
              min={0}
              max={100}
              value={weights[key]}
              onChange={(e) => onWeightChange(key, Number(e.target.value))}
              className="w-8 bg-transparent text-right font-mono outline-none"
              aria-label={`${label} weight percentage`}
            />
            <span className="opacity-70">%</span>
          </div>
        ))}
      </div>

      {/* Exchange filter */}
      <div className="flex items-center gap-2 flex-wrap ml-auto">
        <span className="text-muted-foreground text-xs font-medium">Exchange</span>
        {EXCHANGES.map((ex) => {
          const active = selectedExchanges.includes(ex)
          return (
            <button
              key={ex}
              onClick={() => onExchangeToggle(ex)}
              className={cn(
                'px-2 py-0.5 rounded border text-xs font-medium transition-colors',
                active
                  ? 'bg-primary/15 text-primary border-primary/40'
                  : 'bg-transparent text-muted-foreground border-border hover:border-muted-foreground'
              )}
            >
              {ex}
            </button>
          )
        })}
      </div>
    </div>
  )
}
