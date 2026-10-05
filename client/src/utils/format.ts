// 3510.2 -> "3,510.20"
export function formatPrice(price: number): string {
  return price.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// 12.5 -> "+12.50" and -3 -> "-3.00"
export function formatChange(change: number): string {
  const sign = change > 0 ? '+' : ''
  return sign + change.toFixed(2)
}

export function formatPercent(percent: number): string {
  return formatChange(percent) + '%'
}
