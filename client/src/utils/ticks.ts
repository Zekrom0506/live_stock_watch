import type { PriceMap, Tick } from '../types'

// Apply a batch of ticks to the price map and return a new map.
// If a symbol has more than one tick in the batch, the last one wins.
export function applyTicks(oldPrices: PriceMap, ticks: Tick[]): PriceMap {
  const newPrices = { ...oldPrices }
  for (const tick of ticks) {
    newPrices[tick.symbol] = tick.price
  }
  return newPrices
}
