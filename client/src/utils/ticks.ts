import type { HistoryMap, PriceMap, Tick } from '../types'

// Apply a batch of ticks to the price map and return a new map.
// If a symbol has more than one tick in the batch, the last one wins.
export function applyTicks(oldPrices: PriceMap, ticks: Tick[]): PriceMap {
  const newPrices = { ...oldPrices }
  for (const tick of ticks) {
    newPrices[tick.symbol] = tick.price
  }
  return newPrices
}

// Add the ticks to the recent price list of each symbol.
// Only the last maxPoints prices are kept so the lists don't grow forever.
export function addToHistory(
  oldHistory: HistoryMap,
  ticks: Tick[],
  maxPoints: number,
): HistoryMap {
  const newHistory = { ...oldHistory }
  for (const tick of ticks) {
    const oldPoints = newHistory[tick.symbol] || []
    const points = [...oldPoints, tick.price]
    if (points.length > maxPoints) {
      points.shift() // drop the oldest price
    }
    newHistory[tick.symbol] = points
  }
  return newHistory
}
