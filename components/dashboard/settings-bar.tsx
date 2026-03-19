'use client'

import { Exchange, Weights, WeightKey } from '@/lib/mock-data'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const EXCHANGES: Exchange[] = ['Deribit', 'OKX', 'Bybit', 'Binance']

const WEIGHT_CONFIG: { key: WeightKey; label: string; color: string; description: string }[] = [
  { key: 'moneyness', label: 'Moneyness', color: 'text-[#58a6ff] border-[#58a6ff]/40 bg-[#58a6ff]/10', description: 'How far out-of-the-money the option is relative to your OTM target' },
  { key: 'apr',       label: 'APR',       color: 'text-[#3fb950] border-[#3fb950]/40 bg-[#3fb950]/10', description: 'Annualized percentage return on the premium collected' },
  { key: 'iv',        label: 'IV',        color: 'text-purple-400 border-purple-400/40 bg-purple-400/10', description: 'Implied volatility - higher IV means higher premiums' },
  { key: 'oi',        label: 'OI',        color: 'text-amber-400  border-amber-400/40  bg-amber-400/10', description: 'Open interest - higher OI means better liquidity' },
  { key: 'dte',       label: 'DTE',       color: 'text-teal-400  border-teal-400/40  bg-teal-400/10', description: 'Days to expiration - time decay factor for your position' },
]

const EXCHANGE_DESCRIPTIONS: { [key in Exchange]: string } = {
  'Deribit': 'Largest crypto options exchange with deep liquidity',
  'OKX': 'Multi-chain options with strong trading volumes',
  'Bybit': 'User-friendly platform with competitive spreads',
  'Binance': 'Largest spot and derivatives platform',
}

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
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-muted-foreground text-xs font-medium whitespace-nowrap cursor-help hover:text-foreground transition-colors">
              OTM Target
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Your target out-of-the-money percentage for selling covered calls or puts
          </TooltipContent>
        </Tooltip>
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
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-muted-foreground text-xs font-medium cursor-help hover:text-foreground transition-colors">
              Weights
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Adjust how much each metric influences the overall score
          </TooltipContent>
        </Tooltip>
        {WEIGHT_CONFIG.map(({ key, label, color, description }) => (
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <div className={cn('flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-medium cursor-help transition-opacity hover:opacity-80', color)}>
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
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {description}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Exchange filter */}
      <div className="flex items-center gap-2 flex-wrap ml-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-muted-foreground text-xs font-medium cursor-help hover:text-foreground transition-colors">
              Exchange
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Filter options by exchange source
          </TooltipContent>
        </Tooltip>
        {EXCHANGES.map((ex) => {
          const active = selectedExchanges.includes(ex)
          return (
            <Tooltip key={ex}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onExchangeToggle(ex)}
                  className={cn(
                    'px-2 py-0.5 rounded border text-xs font-medium transition-colors cursor-help',
                    active
                      ? 'bg-primary/15 text-primary border-primary/40 hover:bg-primary/20'
                      : 'bg-transparent text-muted-foreground border-border hover:border-muted-foreground'
                  )}
                >
                  {ex}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {EXCHANGE_DESCRIPTIONS[ex]}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}
