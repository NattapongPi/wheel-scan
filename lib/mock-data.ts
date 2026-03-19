export type OptionType = 'PUT' | 'CALL'
export type Exchange = 'Deribit' | 'OKX' | 'Bybit' | 'Binance'
export type Asset = 'BTC' | 'ETH'

export interface OptionRow {
  id: string
  exchange: Exchange
  instrument: string
  asset: Asset
  type: OptionType
  strike: number
  bid: number
  dte: number
  apr: number
  otm: number
  iv: number
  oi: number
  score: number
}

export const EXCHANGE_COLORS: Record<Exchange, { bg: string; text: string; border: string }> = {
  Deribit: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  OKX:     { bg: 'bg-teal-500/15',  text: 'text-teal-400',  border: 'border-teal-500/30'  },
  Bybit:   { bg: 'bg-purple-500/15',text: 'text-purple-400',border: 'border-purple-500/30'},
  Binance: { bg: 'bg-yellow-500/15',text: 'text-yellow-400',border: 'border-yellow-500/30'},
}

const BTC_SPOT = 83420
const ETH_SPOT = 3180

export const BTC_OPTIONS: OptionRow[] = [
  { id: 'btc-1',  exchange: 'Deribit', instrument: 'BTC-28MAR-80000-P', asset: 'BTC', type: 'PUT',  strike: 80000, bid: 420,  dte: 9,  apr: 184, otm: 4.1,  iv: 72, oi: 3210, score: 87 },
  { id: 'btc-2',  exchange: 'OKX',     instrument: 'BTC-28MAR-79000-P', asset: 'BTC', type: 'PUT',  strike: 79000, bid: 380,  dte: 9,  apr: 162, otm: 5.3,  iv: 68, oi: 2880, score: 82 },
  { id: 'btc-3',  exchange: 'Bybit',   instrument: 'BTC-28MAR-78000-P', asset: 'BTC', type: 'PUT',  strike: 78000, bid: 310,  dte: 9,  apr: 133, otm: 6.5,  iv: 65, oi: 1540, score: 79 },
  { id: 'btc-4',  exchange: 'Binance', instrument: 'BTC-28MAR-77000-P', asset: 'BTC', type: 'PUT',  strike: 77000, bid: 280,  dte: 9,  apr: 121, otm: 7.7,  iv: 63, oi: 1290, score: 74 },
  { id: 'btc-5',  exchange: 'Deribit', instrument: 'BTC-28MAR-76000-P', asset: 'BTC', type: 'PUT',  strike: 76000, bid: 240,  dte: 9,  apr: 105, otm: 8.9,  iv: 61, oi: 980,  score: 69 },
  { id: 'btc-6',  exchange: 'OKX',     instrument: 'BTC-28MAR-75000-P', asset: 'BTC', type: 'PUT',  strike: 75000, bid: 198,  dte: 9,  apr:  87, otm: 10.1, iv: 59, oi: 730,  score: 63 },
  { id: 'btc-7',  exchange: 'Bybit',   instrument: 'BTC-28MAR-74000-P', asset: 'BTC', type: 'PUT',  strike: 74000, bid: 162,  dte: 9,  apr:  71, otm: 11.3, iv: 57, oi: 590,  score: 57 },
  { id: 'btc-8',  exchange: 'Deribit', instrument: 'BTC-28MAR-73000-P', asset: 'BTC', type: 'PUT',  strike: 73000, bid: 130,  dte: 9,  apr:  57, otm: 12.5, iv: 55, oi: 440,  score: 51 },
  { id: 'btc-9',  exchange: 'Binance', instrument: 'BTC-28MAR-72000-P', asset: 'BTC', type: 'PUT',  strike: 72000, bid: 102,  dte: 9,  apr:  45, otm: 13.7, iv: 53, oi: 310,  score: 44 },
  { id: 'btc-10', exchange: 'OKX',     instrument: 'BTC-28MAR-71000-P', asset: 'BTC', type: 'PUT',  strike: 71000, bid:  78,  dte: 9,  apr:  34, otm: 14.9, iv: 52, oi: 220,  score: 37 },
  // Calls
  { id: 'btc-c1', exchange: 'Bybit',   instrument: 'BTC-28MAR-93000-C', asset: 'BTC', type: 'CALL', strike: 93000, bid: 340,  dte: 9,  apr: 143, otm: 11.5, iv: 65, oi: 1940, score: 79 },
  { id: 'btc-c2', exchange: 'Deribit', instrument: 'BTC-28MAR-91000-C', asset: 'BTC', type: 'CALL', strike: 91000, bid: 390,  dte: 9,  apr: 164, otm: 9.1,  iv: 67, oi: 2200, score: 83 },
  { id: 'btc-c3', exchange: 'OKX',     instrument: 'BTC-28MAR-95000-C', asset: 'BTC', type: 'CALL', strike: 95000, bid: 295,  dte: 9,  apr: 124, otm: 13.9, iv: 63, oi: 1560, score: 71 },
  { id: 'btc-c4', exchange: 'Binance', instrument: 'BTC-28MAR-90000-C', asset: 'BTC', type: 'CALL', strike: 90000, bid: 420,  dte: 9,  apr: 176, otm: 7.9,  iv: 70, oi: 2540, score: 85 },
  { id: 'btc-c5', exchange: 'Bybit',   instrument: 'BTC-28MAR-97000-C', asset: 'BTC', type: 'CALL', strike: 97000, bid: 240,  dte: 9,  apr: 101, otm: 16.3, iv: 61, oi: 1100, score: 62 },
  { id: 'btc-c6', exchange: 'Deribit', instrument: 'BTC-28MAR-88000-C', asset: 'BTC', type: 'CALL', strike: 88000, bid: 475,  dte: 9,  apr: 199, otm: 5.5,  iv: 73, oi: 2980, score: 88 },
  { id: 'btc-c7', exchange: 'OKX',     instrument: 'BTC-28MAR-99000-C', asset: 'BTC', type: 'CALL', strike: 99000, bid: 190,  dte: 9,  apr:  80, otm: 18.7, iv: 59, oi:  840, score: 54 },
  { id: 'btc-c8', exchange: 'Binance', instrument: 'BTC-28MAR-86000-C', asset: 'BTC', type: 'CALL', strike: 86000, bid: 510,  dte: 9,  apr: 214, otm: 3.1,  iv: 75, oi: 3120, score: 81 },
]

export const ETH_OPTIONS: OptionRow[] = [
  { id: 'eth-1',  exchange: 'Deribit', instrument: 'ETH-28MAR-3000-P',  asset: 'ETH', type: 'PUT',  strike: 3000,  bid: 18,   dte: 9,  apr: 182, otm: 5.7,  iv: 74, oi: 5200, score: 85 },
  { id: 'eth-2',  exchange: 'OKX',     instrument: 'ETH-28MAR-2950-P',  asset: 'ETH', type: 'PUT',  strike: 2950,  bid: 15,   dte: 9,  apr: 152, otm: 7.2,  iv: 70, oi: 4100, score: 79 },
  { id: 'eth-3',  exchange: 'Bybit',   instrument: 'ETH-28MAR-2900-P',  asset: 'ETH', type: 'PUT',  strike: 2900,  bid: 12,   dte: 9,  apr: 121, otm: 8.8,  iv: 67, oi: 3300, score: 73 },
  { id: 'eth-4',  exchange: 'Binance', instrument: 'ETH-28MAR-2850-P',  asset: 'ETH', type: 'PUT',  strike: 2850,  bid: 9.5,  dte: 9,  apr:  96, otm: 10.4, iv: 64, oi: 2700, score: 67 },
  { id: 'eth-5',  exchange: 'Deribit', instrument: 'ETH-28MAR-2800-P',  asset: 'ETH', type: 'PUT',  strike: 2800,  bid: 7.2,  dte: 9,  apr:  73, otm: 11.9, iv: 62, oi: 2100, score: 61 },
  { id: 'eth-6',  exchange: 'OKX',     instrument: 'ETH-28MAR-2750-P',  asset: 'ETH', type: 'PUT',  strike: 2750,  bid: 5.4,  dte: 9,  apr:  55, otm: 13.5, iv: 60, oi: 1600, score: 54 },
  { id: 'eth-7',  exchange: 'Bybit',   instrument: 'ETH-28MAR-2700-P',  asset: 'ETH', type: 'PUT',  strike: 2700,  bid: 3.9,  dte: 9,  apr:  39, otm: 15.1, iv: 58, oi: 1200, score: 47 },
  { id: 'eth-8',  exchange: 'Deribit', instrument: 'ETH-28MAR-2650-P',  asset: 'ETH', type: 'PUT',  strike: 2650,  bid: 2.8,  dte: 9,  apr:  28, otm: 16.7, iv: 57, oi:  890, score: 40 },
  // Calls
  { id: 'eth-c1', exchange: 'Deribit', instrument: 'ETH-28MAR-3400-C',  asset: 'ETH', type: 'CALL', strike: 3400,  bid: 14,   dte: 9,  apr: 141, otm: 6.9,  iv: 68, oi: 3800, score: 76 },
  { id: 'eth-c2', exchange: 'OKX',     instrument: 'ETH-28MAR-3350-C',  asset: 'ETH', type: 'CALL', strike: 3350,  bid: 16.5, dte: 9,  apr: 167, otm: 5.3,  iv: 71, oi: 4200, score: 82 },
  { id: 'eth-c3', exchange: 'Bybit',   instrument: 'ETH-28MAR-3450-C',  asset: 'ETH', type: 'CALL', strike: 3450,  bid: 12,   dte: 9,  apr: 121, otm: 8.5,  iv: 66, oi: 3100, score: 70 },
  { id: 'eth-c4', exchange: 'Binance', instrument: 'ETH-28MAR-3300-C',  asset: 'ETH', type: 'CALL', strike: 3300,  bid: 19,   dte: 9,  apr: 192, otm: 3.8,  iv: 73, oi: 4900, score: 87 },
  { id: 'eth-c5', exchange: 'Deribit', instrument: 'ETH-28MAR-3500-C',  asset: 'ETH', type: 'CALL', strike: 3500,  bid: 9.8,  dte: 9,  apr:  99, otm: 10.1, iv: 64, oi: 2400, score: 63 },
]

export const SPOT_PRICES: Record<Asset, number> = {
  BTC: BTC_SPOT,
  ETH: ETH_SPOT,
}

export type WeightKey = 'moneyness' | 'apr' | 'iv' | 'oi' | 'dte'

export interface Weights {
  moneyness: number
  apr: number
  iv: number
  oi: number
  dte: number
}

export const DEFAULT_WEIGHTS: Weights = {
  moneyness: 35,
  apr: 30,
  iv: 20,
  oi: 10,
  dte: 5,
}
