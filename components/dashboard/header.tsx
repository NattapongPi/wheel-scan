'use client'

import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { Asset, SPOT_PRICES } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface HeaderProps {
  asset: Asset
  onAssetChange: (asset: Asset) => void
  lastRefresh: Date
  onRefresh: () => void
  isRefreshing: boolean
}

export function Header({ asset, onAssetChange, lastRefresh, onRefresh, isRefreshing }: HeaderProps) {
  const spotPrice = SPOT_PRICES[asset]

  const formatPrice = (price: number) =>
    price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

  return (
    <header className="flex items-center justify-between px-3 md:px-5 h-12 md:h-14 bg-card border-b border-border shrink-0 gap-2">
      {/* Logo */}
      <div className="flex items-center gap-2 md:gap-6 min-w-0">
        <span className="text-sm md:text-lg font-semibold tracking-tight text-primary font-mono whitespace-nowrap">
          WheelScan
        </span>

        {/* Asset toggle */}
        <div className="flex items-center gap-0.5 md:gap-1 bg-secondary rounded-md p-0.5 md:p-1 shrink-0">
          <button
            onClick={() => onAssetChange('BTC')}
            className={cn(
              'px-2 md:px-3 py-0.5 md:py-1 rounded text-xs md:text-sm font-semibold transition-colors',
              asset === 'BTC'
                ? 'bg-amber-500 text-black'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            BTC
          </button>
          <button
            onClick={() => onAssetChange('ETH')}
            className={cn(
              'px-2 md:px-3 py-0.5 md:py-1 rounded text-xs md:text-sm font-semibold transition-colors',
              asset === 'ETH'
                ? 'bg-indigo-500 text-white'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            ETH
          </button>
        </div>

        {/* Spot price */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Spot</span>
          <span className="text-sm md:text-base font-mono font-semibold text-foreground">
            {formatPrice(spotPrice)}
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <span className="text-xs text-muted-foreground hidden md:block">Auto 60s</span>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={cn(
            'flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap',
            'bg-[#3fb950]/15 text-[#3fb950] border border-[#3fb950]/30 hover:bg-[#3fb950]/25',
            isRefreshing && 'opacity-60 cursor-not-allowed'
          )}
        >
          <RefreshCw className={cn('h-3 md:h-3.5 w-3 md:w-3.5', isRefreshing && 'animate-spin')} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  )
}
