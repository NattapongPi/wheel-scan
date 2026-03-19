# WheelScan

> Crypto options intelligence for wheel traders.

WheelScan is a modern Next.js dashboard that scans BTC and ETH options across multiple venues, ranks opportunities by yield and quality, and presents a clean trading desk view for fast decision-making.

## What it does

- **Aggregates live options data** from Deribit, OKX, Bybit, and Binance.
- **Ranks contracts** using APR, OTM distance, implied volatility, open interest, and days to expiration.
- **Highlights top picks** for put and call wheel strategies.
- **Falls back to demo data** when every live exchange request fails.
- **Auto-refreshes** the market view on a 60-second cadence.

## Core workflow

1. Choose an asset: `BTC` or `ETH`.
2. Filter the venue set you want to include.
3. Tune the scoring weights and OTM target.
4. Review the highest-ranked contracts in the table and top-picks cards.

## Tech stack

- **Framework:** Next.js 16 with the App Router
- **UI:** React 19, Tailwind CSS, Radix UI, Lucide icons
- **Data:** Live exchange APIs with an internal fallback dataset
- **Telemetry:** Vercel Analytics

## Architecture

- **Frontend:** `app/page.tsx` renders the dashboard shell from `components/dashboard/dashboard.tsx`.
- **Market API:** `app/api/options/route.ts` serves normalized option rows for the selected asset.
- **Exchange adapters:** `lib/exchanges/*.ts` fetch and normalize venue-specific payloads.
- **Scoring helpers:** `lib/mock-data.ts` and `components/dashboard/*` define ranking inputs, colors, and the demo dataset.

## API

### `GET /api/options?asset=BTC|ETH`

Returns normalized option rows, spot price, exchange errors, and demo-mode state.

Example response shape:

```json
{
  "options": [],
  "spotPrice": 0,
  "errors": [],
  "isDemo": true,
  "timestamp": 1710000000000
}
```

## Scoring model

WheelScan computes a custom score per contract using:

- **Moneyness** vs the target OTM level
- **APR** from premium collected
- **IV** for premium richness
- **OI** as a liquidity proxy
- **DTE** to balance time decay

The dashboard lets you adjust the weights live, so you can bias the scan toward yield, liquidity, or the strike distance you prefer.

## Local development

### Install

```bash
npm install
```

### Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## Project structure

```text
app/
  api/options/route.ts   # options aggregation endpoint
  layout.tsx             # global metadata, fonts, analytics
  page.tsx               # dashboard entry
components/dashboard/    # trading desk UI
lib/exchanges/           # venue adapters and fetch helpers
lib/mock-data.ts         # demo data, types, and style tokens
```

## Data notes

- **Live data availability** depends on the exchange API responses at runtime.
- **Demo mode** is shown when all exchange requests fail and mock data is used instead.
- **Caching** is applied server-side for short bursts to reduce unnecessary API traffic.

## Deployment

This project is ready for Vercel-style deployment as a standard Next.js app.

## References

- Next.js: https://nextjs.org/docs
- Vercel Analytics: https://vercel.com/analytics
