"use client";

import { useState, useEffect } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Asset, Exchange } from "@/lib/mock-data";
import type { ExchangeError } from "@/lib/exchanges";
import { cn } from "@/lib/utils";

interface HeaderProps {
  asset: Asset;
  onAssetChange: (asset: Asset) => void;
  spotPrice: number;
  lastRefresh: Date;
  onRefresh: () => void;
  isRefreshing: boolean;
  isDemo?: boolean;
  apiErrors?: ExchangeError[];
}

export function Header({
  asset,
  onAssetChange,
  spotPrice,
  lastRefresh,
  onRefresh,
  isRefreshing,
  isDemo,
  apiErrors = [],
}: HeaderProps) {
  const formatPrice = (price: number) =>
    price > 0
      ? price.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        })
      : "—";

  const failedExchanges = apiErrors.map((e) => e.exchange).join(", ");

  return (
    <header className="flex flex-col shrink-0 bg-card border-b border-border">
      <div className="flex items-center justify-between px-3 md:px-5 h-12 md:h-14 gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-6 min-w-0">
          <span className="text-sm md:text-lg font-semibold tracking-tight text-primary font-mono whitespace-nowrap">
            WheelScan
          </span>

          {/* Asset toggle */}
          <div className="flex items-center gap-0.5 md:gap-1 bg-secondary rounded-md p-0.5 md:p-1 shrink-0">
            <button
              onClick={() => onAssetChange("BTC")}
              className={cn(
                "px-2 md:px-3 py-0.5 md:py-1 rounded text-xs md:text-sm font-semibold transition-colors",
                asset === "BTC"
                  ? "bg-amber-500 text-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              BTC
            </button>
            <button
              onClick={() => onAssetChange("ETH")}
              className={cn(
                "px-2 md:px-3 py-0.5 md:py-1 rounded text-xs md:text-sm font-semibold transition-colors",
                asset === "ETH"
                  ? "bg-indigo-500 text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              ETH
            </button>
          </div>

          {/* Spot price */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Spot
            </span>
            <span className="text-sm md:text-base font-mono font-semibold text-foreground">
              {formatPrice(spotPrice)}
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          {isDemo && (
            <span className="hidden sm:inline text-xs text-amber-400 font-medium">
              Demo Mode
            </span>
          )}
          <span className="text-xs text-muted-foreground hidden md:block">
            Auto 60s
          </span>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              "flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap",
              "bg-[#3fb950]/15 text-[#3fb950] border border-[#3fb950]/30 hover:bg-[#3fb950]/25",
              isRefreshing && "opacity-60 cursor-not-allowed"
            )}
          >
            <RefreshCw
              className={cn(
                "h-3 md:h-3.5 w-3 md:w-3.5",
                isRefreshing && "animate-spin"
              )}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Exchange error banner */}
      {apiErrors.length > 0 && !isDemo && (
        <div className="flex items-center gap-2 px-3 md:px-5 py-1 bg-amber-500/10 border-t border-amber-500/20 text-xs text-amber-400">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <span>
            {failedExchanges} unavailable — showing data from remaining
            exchanges
          </span>
        </div>
      )}
    </header>
  );
}
