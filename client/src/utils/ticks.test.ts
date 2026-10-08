import { describe, expect, it } from 'vitest'
import { addToHistory, applyTicks } from './ticks'

describe('applyTicks', () => {
  it('updates the price of the symbols in the batch', () => {
    const oldPrices = { TCS: 3500, INFY: 1500 }
    const ticks = [{ symbol: 'TCS', price: 3510, time: 1 }]

    const result = applyTicks(oldPrices, ticks)

    expect(result.TCS).toBe(3510)
    expect(result.INFY).toBe(1500)
  })

  it('keeps the last price when a symbol has many ticks in one batch', () => {
    const ticks = [
      { symbol: 'TCS', price: 3510, time: 1 },
      { symbol: 'TCS', price: 3520, time: 2 },
      { symbol: 'TCS', price: 3515, time: 3 },
    ]

    const result = applyTicks({}, ticks)

    expect(result.TCS).toBe(3515)
  })

  it('does not change the old object', () => {
    const oldPrices = { TCS: 3500 }

    applyTicks(oldPrices, [{ symbol: 'TCS', price: 3510, time: 1 }])

    expect(oldPrices.TCS).toBe(3500)
  })
})

describe('addToHistory', () => {
  it('adds new prices at the end', () => {
    const oldHistory = { TCS: [3500, 3505] }
    const ticks = [{ symbol: 'TCS', price: 3510, time: 1 }]

    const result = addToHistory(oldHistory, ticks, 60)

    expect(result.TCS).toEqual([3500, 3505, 3510])
  })

  it('drops the oldest prices when the list is full', () => {
    const oldHistory = { TCS: [1, 2, 3] }
    const ticks = [
      { symbol: 'TCS', price: 4, time: 1 },
      { symbol: 'TCS', price: 5, time: 2 },
    ]

    const result = addToHistory(oldHistory, ticks, 3)

    expect(result.TCS).toEqual([3, 4, 5])
  })
})
