import type { SymbolInfo } from '../types'
import { formatChange, formatPercent, formatPrice } from '../utils/format'

interface Props {
  info: SymbolInfo
  price: number | undefined
  onRemove: (symbol: string) => void
}

function WatchlistRow({ info, price, onRemove }: Props) {
  // price is undefined until the first tick arrives
  let change = 0
  let percent = 0
  if (price !== undefined) {
    change = price - info.prevClose
    percent = (change / info.prevClose) * 100
  }

  let colorClass = ''
  if (change > 0) colorClass = 'up'
  if (change < 0) colorClass = 'down'

  return (
    <tr>
      <td>
        <div className="symbol">{info.symbol}</div>
        <div className="muted">{info.name}</div>
      </td>
      <td className="number price">
        {price === undefined ? '--' : formatPrice(price)}
      </td>
      <td className={'number ' + colorClass}>
        {price === undefined ? '--' : formatChange(change)}
      </td>
      <td className={'number ' + colorClass}>
        {price === undefined ? '--' : formatPercent(percent)}
      </td>
      <td className="number">
        <button
          className="remove-button"
          onClick={() => onRemove(info.symbol)}
          aria-label={'Remove ' + info.symbol}
        >
          ✕
        </button>
      </td>
    </tr>
  )
}

export default WatchlistRow
