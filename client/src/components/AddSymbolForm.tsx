import { useState } from 'react'
import type { SymbolInfo } from '../types'

interface Props {
  allSymbols: SymbolInfo[]
  watchlist: string[]
  onAdd: (symbol: string) => void
}

const MAX_SUGGESTIONS = 6

function AddSymbolForm({ allSymbols, watchlist, onAdd }: Props) {
  const [query, setQuery] = useState('')

  // suggestions = symbols that match the text and are not in the watchlist yet
  const text = query.trim().toLowerCase()
  let suggestions: SymbolInfo[] = []
  if (text !== '') {
    suggestions = allSymbols
      .filter((item) => !watchlist.includes(item.symbol))
      .filter((item) => {
        return (
          item.symbol.toLowerCase().includes(text) ||
          item.name.toLowerCase().includes(text)
        )
      })
      .slice(0, MAX_SUGGESTIONS)
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
        placeholder="Search symbol or company, e.g. TCS"
        aria-label="Search symbol"
      />

      {text !== '' && (
        <ul className="suggestions">
          {suggestions.length === 0 && (
            <li className="no-match">No matching symbols</li>
          )}
          {suggestions.map((item) => (
            <li key={item.symbol}>
              <button type="button" onClick={() => handleAdd(item.symbol)}>
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
