import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { SymbolInfo } from '../types'
import Watchlist from './Watchlist'

const items: SymbolInfo[] = [
  { symbol: 'TCS', name: 'Tata Consultancy Services', prevClose: 3500 },
  { symbol: 'INFY', name: 'Infosys', prevClose: 1500 },
]

// helper so every test does not repeat all the props
function renderWatchlist(list: SymbolInfo[], onRemove = vi.fn()) {
  render(
    <Watchlist
      items={list}
      prices={{ TCS: 3535, INFY: 1485 }}
      stale={false}
      selectedSymbol={null}
      onSelect={vi.fn()}
      onRemove={onRemove}
    />,
  )
}

describe('Watchlist', () => {
  it('shows a message when the watchlist is empty', () => {
    renderWatchlist([])

    expect(screen.getByText('Your watchlist is empty.')).toBeInTheDocument()
  })

  it('shows price, change and percent change for a row', () => {
    renderWatchlist(items)

    expect(screen.getByText('3,535.00')).toBeInTheDocument()
    expect(screen.getByText('+35.00')).toBeInTheDocument()
    expect(screen.getByText('+1.00%')).toBeInTheDocument()
    // INFY is below its previous close
    expect(screen.getByText('-15.00')).toBeInTheDocument()
    expect(screen.getByText('-1.00%')).toBeInTheDocument()
  })

  it('calls onRemove with the symbol when remove is clicked', () => {
    const onRemove = vi.fn()
    renderWatchlist(items, onRemove)

    fireEvent.click(screen.getByLabelText('Remove INFY'))

    expect(onRemove).toHaveBeenCalledWith('INFY')
  })

  it('sorts rows by price when the price header is clicked', () => {
    renderWatchlist(items)

    fireEvent.click(screen.getByText('Price'))

    // row 0 is the header row
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('INFY')
    expect(rows[2]).toHaveTextContent('TCS')
  })
})
