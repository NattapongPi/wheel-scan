'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { OptionRow, OptionType, EXCHANGE_COLORS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type SortKey = keyof Pick<OptionRow, 'score' | 'apr' | 'otm' | 'iv' | 'oi' | 'dte' | 'strike' | 'bid'>
type SortDir = 'asc' | 'desc'

interface OptionsTableProps {
  rows: OptionRow[]
  activeType: OptionType
  onTypeChange: (t: OptionType) => void
}

const COL_HEADERS: { key: SortKey | null; label: string; align?: string; colored?: string }[] = [
  { key: null,     label: '#',          align: 'text-center' },
  { key: null,     label: 'Exchange',   align: 'text-left' },
  { key: null,     label: 'Instrument', align: 'text-left' },
  { key: 'strike', label: 'Strike',     align: 'text-right' },
  { key: 'bid',    label: 'Bid',        align: 'text-right' },
  { key: 'dte',    label: 'DTE',        align: 'text-right' },
  { key: 'apr',    label: 'APR %',      align: 'text-right', colored: 'text-[#3fb950]' },
  { key: 'otm',    label: 'OTM %',      align: 'text-right', colored: 'text-[#58a6ff]' },
  { key: 'iv',     label: 'IV %',       align: 'text-right', colored: 'text-purple-400' },
  { key: 'oi',     label: 'Open Int.',  align: 'text-right', colored: 'text-amber-400' },
  { key: 'score',  label: 'Score',      align: 'text-right' },
  { key: null,     label: '',           align: 'text-left' },
]

export function OptionsTable({ rows, activeType, onTypeChange }: OptionsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const putRows  = rows.filter((r) => r.type === 'PUT')
  const callRows = rows.filter((r) => r.type === 'CALL')
  const active   = activeType === 'PUT' ? putRows : callRows

  const sorted = [...active].sort((a, b) => {
    const av = a[sortKey] as number
    const bv = b[sortKey] as number
    return sortDir === 'desc' ? bv - av : av - bv
  })

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <section className="flex flex-col flex-1 min-h-0 px-5 pb-5" aria-label="Options table">
      {/* Tabs */}
      <div className="flex items-center gap-0.5 mb-0 mt-4 border-b border-border">
        {(['PUT', 'CALL'] as OptionType[]).map((t) => (
          <button
            key={t}
            onClick={() => onTypeChange(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-t-md transition-colors border border-b-0 -mb-px',
              activeType === t
                ? 'bg-card border-border text-foreground'
                : 'bg-transparent border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t === 'PUT' ? 'Puts' : 'Calls'}
            <span className="ml-1.5 text-xs text-muted-foreground">
              ({t === 'PUT' ? putRows.length : callRows.length})
            </span>
          </button>
        ))}
      </div>

      {/* Table wrapper */}
      <div className="overflow-auto flex-1 border border-t-0 border-border rounded-b-lg">
        <table className="w-full text-sm border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[#1c2128] sticky top-0 z-10">
              {COL_HEADERS.map((col, i) => (
                <th
                  key={i}
                  onClick={col.key ? () => handleSort(col.key!) : undefined}
                  className={cn(
                    'px-3 py-2.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap border-b border-border',
                    col.align ?? 'text-left',
                    col.colored ?? 'text-muted-foreground',
                    col.key && 'cursor-pointer select-none hover:text-foreground transition-colors'
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.key === sortKey && (
                      sortDir === 'desc'
                        ? <ChevronDown className="h-3 w-3" />
                        : <ChevronUp className="h-3 w-3" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => (
              <TableRow key={row.id} row={row} rank={idx + 1} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function TableRow({ row, rank }: { row: OptionRow; rank: number }) {
  const ec = EXCHANGE_COLORS[row.exchange]
  const isPut = row.type === 'PUT'

  const scoreColor =
    row.score >= 80 ? 'text-[#3fb950]'
    : row.score >= 65 ? 'text-[#58a6ff]'
    : row.score >= 50 ? 'text-amber-400'
    : 'text-muted-foreground'

  const barColor =
    row.score >= 80 ? 'bg-[#3fb950]'
    : row.score >= 65 ? 'bg-[#58a6ff]'
    : row.score >= 50 ? 'bg-amber-400'
    : 'bg-muted-foreground'

  return (
    <tr
      className={cn(
        'border-b border-border transition-colors hover:bg-accent/30',
        isPut ? 'bg-[#3fb950]/[0.03]' : 'bg-[#58a6ff]/[0.03]'
      )}
    >
      {/* Rank */}
      <td className="px-3 py-2.5 text-center">
        <span className={cn('text-xs font-bold font-mono', scoreColor)}>{rank}</span>
      </td>

      {/* Exchange badge */}
      <td className="px-3 py-2.5">
        <span className={cn('text-xs px-2 py-0.5 rounded border font-medium whitespace-nowrap', ec.bg, ec.text, ec.border)}>
          {row.exchange}
        </span>
      </td>

      {/* Instrument */}
      <td className="px-3 py-2.5">
        <span className="font-mono text-xs text-foreground">{row.instrument}</span>
      </td>

      {/* Strike */}
      <td className="px-3 py-2.5 text-right font-mono text-xs text-foreground">
        ${row.strike.toLocaleString()}
      </td>

      {/* Bid */}
      <td className="px-3 py-2.5 text-right font-mono text-xs text-foreground">
        ${row.bid.toLocaleString()}
      </td>

      {/* DTE */}
      <td className="px-3 py-2.5 text-right font-mono text-xs text-foreground">
        {row.dte}
      </td>

      {/* APR */}
      <td className="px-3 py-2.5 text-right font-mono text-xs text-[#3fb950] font-semibold">
        {row.apr}%
      </td>

      {/* OTM */}
      <td className="px-3 py-2.5 text-right font-mono text-xs text-[#58a6ff]">
        {row.otm}%
      </td>

      {/* IV */}
      <td className="px-3 py-2.5 text-right font-mono text-xs text-purple-400">
        {row.iv}%
      </td>

      {/* OI */}
      <td className="px-3 py-2.5 text-right font-mono text-xs text-amber-400">
        {row.oi.toLocaleString()}
      </td>

      {/* Score */}
      <td className="px-3 py-2.5 text-right">
        <span className={cn('font-mono text-sm font-bold', scoreColor)}>{row.score}</span>
      </td>

      {/* Score bar */}
      <td className="px-3 py-2.5 w-36">
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full', barColor)}
            style={{ width: `${row.score}%` }}
          />
        </div>
      </td>
    </tr>
  )
}
