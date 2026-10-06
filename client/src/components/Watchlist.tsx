import type { PriceMap, SymbolInfo } from '../types'
import WatchlistRow from './WatchlistRow'

interface Props {
  items: SymbolInfo[]
  prices: PriceMap
  onRemove: (symbol: string) => void
}

function Watchlist({ items, prices, onRemove }: Props) {
  if (items.length === 0) {
    return (
      <div className="message-box">
        <p>Your watchlist is empty.</p>
        <p className="muted">Search for a symbol above to add your first stock.</p>
      </div>
    )
  }

  return (
    <table className="watchlist">
      <thead>
        <tr>
          <th>Symbol</th>
          <th className="number">Price</th>
          <th className="number">Change</th>
          <th className="number">% Change</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <WatchlistRow
            key={item.symbol}
            info={item}
            price={prices[item.symbol]}
            onRemove={onRemove}
          />
        ))}
      </tbody>
    </table>
  )
}

export default Watchlist
