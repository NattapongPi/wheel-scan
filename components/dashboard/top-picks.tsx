"use client";

import { OptionRow, EXCHANGE_COLORS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const RANK_COLORS = [
  {
    badge: "bg-[#3fb950] text-black",
    border: "border-[#3fb950]/50",
    bar: "bg-[#3fb950]",
  },
  {
    badge: "bg-[#58a6ff] text-black",
    border: "border-[#58a6ff]/50",
    bar: "bg-[#58a6ff]",
  },
  {
    badge: "bg-purple-500 text-white",
    border: "border-purple-500/50",
    bar: "bg-purple-500",
  },
];

interface TopPicksProps {
  picks: OptionRow[];
}

function formatUSD(val: number) {
  if (typeof val !== "number" || !Number.isFinite(val)) return "—";
  return val >= 1000
    ? `$${(val / 1000).toFixed(1)}k`
    : `$${val.toLocaleString()}`;
}

function formatCount(val: number) {
  return typeof val === "number" && Number.isFinite(val)
    ? val.toLocaleString()
    : "—";
}

export function TopPicks({ picks }: TopPicksProps) {
  if (picks.length === 0) return null;

  return (
    <section aria-label="Top picks" className="px-5 pt-4 pb-2">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Top Picks
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {picks.slice(0, 3).map((pick, i) => {
          const rc = RANK_COLORS[i];
          const ec = EXCHANGE_COLORS[pick.exchange];
          return (
            <div
              key={pick.id}
              className={cn(
                "bg-card rounded-lg border p-4 flex flex-col gap-3",
                rc.border
              )}
            >
              {/* Top row */}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded",
                    rc.badge
                  )}
                >
                  #{i + 1}
                </span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded border font-medium",
                    ec.bg,
                    ec.text,
                    ec.border
                  )}
                >
                  {pick.exchange}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {pick.type}
                </span>
              </div>

              {/* Instrument */}
              <div>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {pick.instrument}
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold text-foreground">
                    {pick.score}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>

              {/* Score bar */}
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", rc.bar)}
                  style={{ width: `${pick.score}%` }}
                />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <Metric
                  label="APR"
                  value={`${pick.apr}%`}
                  highlight="text-[#3fb950]"
                />
                <Metric
                  label="OTM"
                  value={`${pick.otm}%`}
                  highlight="text-[#58a6ff]"
                />
                <Metric
                  label="IV"
                  value={`${pick.iv}%`}
                  highlight="text-purple-400"
                />
                <Metric label="OI" value={formatCount(pick.oi)} />
                <Metric label="DTE" value={`${pick.dte}d`} />
                <Metric label="Strike" value={formatUSD(pick.strike)} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn("font-mono font-medium", highlight ?? "text-foreground")}
      >
        {value}
      </span>
    </div>
  );
}
