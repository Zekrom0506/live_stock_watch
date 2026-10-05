// one symbol from the /api/symbols endpoint
export interface SymbolInfo {
  symbol: string
  name: string
  prevClose: number
}

// one price update from the websocket
export interface Tick {
  symbol: string
  price: number
  time: number
}

// latest price for each symbol, e.g. { TCS: 3510.2 }
export type PriceMap = Record<string, number>

// recent prices for each symbol, used by the chart
export type HistoryMap = Record<string, number[]>

export type ConnectionState = 'connecting' | 'live' | 'reconnecting' | 'offline'

export type LoadState = 'loading' | 'ready' | 'error'
