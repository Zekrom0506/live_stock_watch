import type { SymbolInfo } from '../types'
import { formatPrice } from '../utils/format'

interface Props {
  items: SymbolInfo[]
  onRemove: (symbol: string) => void
}

function Watchlist({ items, onRemove }: Props) {
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
          <th className="number">Prev close</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.symbol}>
            <td>
              <div className="symbol">{item.symbol}</div>
              <div className="muted">{item.name}</div>
            </td>
            <td className="number">{formatPrice(item.prevClose)}</td>
            <td className="number">
              <button onClick={() => onRemove(item.symbol)}>Remove</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Watchlist
