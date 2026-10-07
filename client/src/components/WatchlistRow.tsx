import { memo, useEffect, useRef, useState } from 'react'
import type { SymbolInfo } from '../types'
import { formatChange, formatPercent, formatPrice } from '../utils/format'

interface Props {
  info: SymbolInfo
  price: number | undefined
  // true when the connection is down, so the price might be old
  stale: boolean
  onRemove: (symbol: string) => void
}

function WatchlistRow({ info, price, stale, onRemove }: Props) {
  // 'flash-up' or 'flash-down' for a short time after the price changes
  const [flash, setFlash] = useState('')
  const previousPrice = useRef(price)

  useEffect(() => {
    const previous = previousPrice.current
    previousPrice.current = price
    if (price === undefined || previous === undefined || price === previous) {
      return
    }

    setFlash(price > previous ? 'flash-up' : 'flash-down')
    const timer = setTimeout(() => setFlash(''), 400)
    return () => clearTimeout(timer)
  }, [price])

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
    <tr className={stale ? 'stale' : ''}>
      <td>
        <div className="symbol">{info.symbol}</div>
        <div className="muted">{info.name}</div>
      </td>
      <td className={'number price ' + flash}>
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

// memo: a row only re-renders when its own props change,
// so a tick for TCS does not re-render the INFY row
export default memo(WatchlistRow)
