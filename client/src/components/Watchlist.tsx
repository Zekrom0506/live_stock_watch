import { useState } from 'react'
import type { PriceMap, SymbolInfo } from '../types'
import WatchlistRow from './WatchlistRow'

interface Props {
  items: SymbolInfo[]
  prices: PriceMap
  stale: boolean
  onRemove: (symbol: string) => void
}

// 'none' keeps the order in which the symbols were added
type SortKey = 'none' | 'symbol' | 'price' | 'percent'

function getPercent(item: SymbolInfo, prices: PriceMap): number {
  const price = prices[item.symbol]
  if (price === undefined) return 0
  return ((price - item.prevClose) / item.prevClose) * 100
}

function Watchlist({ items, prices, stale, onRemove }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('none')
  const [ascending, setAscending] = useState(true)

  if (items.length === 0) {
    return (
      <div className="message-box">
        <p>Your watchlist is empty.</p>
        <p className="muted">Search for a symbol above to add your first stock.</p>
      </div>
    )
  }

  // clicking the same column again flips the direction
  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setAscending(!ascending)
    } else {
      setSortKey(key)
      setAscending(true)
    }
  }

  // copy the array first because sort() changes the array it is called on
  const sortedItems = [...items]
  if (sortKey !== 'none') {
    sortedItems.sort((a, b) => {
      let result = 0
      if (sortKey === 'symbol') {
        result = a.symbol.localeCompare(b.symbol)
      } else if (sortKey === 'price') {
        result = (prices[a.symbol] || 0) - (prices[b.symbol] || 0)
      } else {
        result = getPercent(a, prices) - getPercent(b, prices)
      }
      return ascending ? result : -result
    })
  }

  // small arrow next to the column that is sorted
  function arrow(key: SortKey) {
    if (key !== sortKey) return ''
    return ascending ? ' ▲' : ' ▼'
  }

  return (
    <table className="watchlist">
      <thead>
        <tr>
          <th>
            <button className="sort-button" onClick={() => handleSort('symbol')}>
              Symbol{arrow('symbol')}
            </button>
          </th>
          <th className="number">
            <button className="sort-button" onClick={() => handleSort('price')}>
              Price{arrow('price')}
            </button>
          </th>
          <th className="number">Change</th>
          <th className="number">
            <button className="sort-button" onClick={() => handleSort('percent')}>
              % Change{arrow('percent')}
            </button>
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {sortedItems.map((item) => (
          <WatchlistRow
            key={item.symbol}
            info={item}
            price={prices[item.symbol]}
            stale={stale}
            onRemove={onRemove}
          />
        ))}
      </tbody>
    </table>
  )
}

export default Watchlist
