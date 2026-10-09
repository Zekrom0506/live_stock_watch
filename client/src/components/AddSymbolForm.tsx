import { useState } from 'react'
import type { SymbolInfo } from '../types'

interface Props {
  allSymbols: SymbolInfo[]
  watchlist: string[]
  onAdd: (symbol: string) => void
}

function AddSymbolForm({ allSymbols, watchlist, onAdd }: Props) {
  const [query, setQuery] = useState('')
  // the list is open while the input has focus
  const [open, setOpen] = useState(false)

  // start with every symbol that is not in the watchlist yet,
  // then narrow it down if something is typed
  const text = query.trim().toLowerCase()
  let suggestions = allSymbols.filter((item) => !watchlist.includes(item.symbol))
  if (text !== '') {
    suggestions = suggestions.filter((item) => {
      return (
        item.symbol.toLowerCase().includes(text) ||
        item.name.toLowerCase().includes(text)
      )
    })
  }

  function handleAdd(symbol: string) {
    onAdd(symbol)
    setQuery('')
  }

  // pressing enter adds the first suggestion
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (suggestions.length > 0) {
      handleAdd(suggestions[0].symbol)
    }
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder="Search or pick a symbol, e.g. TCS"
        aria-label="Search symbol"
      />

      {open && (
        <ul className="suggestions">
          {suggestions.length === 0 && (
            <li className="no-match">
              {text === '' ? 'All symbols are already added' : 'No matching symbols'}
            </li>
          )}
          {suggestions.map((item) => (
            <li key={item.symbol}>
              {/* preventDefault on mouse down keeps the focus in the input,
                  otherwise the list closes before the click happens */}
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleAdd(item.symbol)}
              >
                <span className="suggestion-symbol">{item.symbol}</span>
                <span className="suggestion-name">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}

export default AddSymbolForm
