import { useEffect, useState } from 'react'
import AddSymbolForm from './components/AddSymbolForm'
import Watchlist from './components/Watchlist'
import { API_URL } from './config'
import { useMarketSocket } from './hooks/useMarketSocket'
import { useWatchlist } from './hooks/useWatchlist'
import type { LoadState, SymbolInfo } from './types'

function App() {
  const [allSymbols, setAllSymbols] = useState<SymbolInfo[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  // increasing this number runs the fetch again (used by the retry button)
  const [attempt, setAttempt] = useState(0)

  const { watchlist, addSymbol, removeSymbol } = useWatchlist()
  const { prices } = useMarketSocket(watchlist)

  // get the list of available symbols once when the page opens
  useEffect(() => {
    let cancelled = false

    async function loadSymbols() {
      try {
        const response = await fetch(API_URL + '/api/symbols')
        if (!response.ok) {
          throw new Error('Request failed with status ' + response.status)
        }
        const data: SymbolInfo[] = await response.json()
        if (!cancelled) {
          setAllSymbols(data)
          setLoadState('ready')
        }
      } catch (err) {
        console.log('Could not load symbols', err)
        if (!cancelled) {
          setLoadState('error')
        }
      }
    }

    loadSymbols()

    return () => {
      cancelled = true
    }
  }, [attempt])

  function handleRetry() {
    setLoadState('loading')
    setAttempt(attempt + 1)
  }

  // full details of the symbols that are in the watchlist
  const items = allSymbols.filter((item) => watchlist.includes(item.symbol))

  return (
    <div className="app">
      <header className="header">
        <h1>Live Watchlist</h1>
      </header>

      {loadState === 'loading' && (
        <div className="message-box">Loading symbols...</div>
      )}

      {loadState === 'error' && (
        <div className="message-box error">
          <p>Could not load the symbol list. Is the server running?</p>
          <button onClick={handleRetry}>Retry</button>
        </div>
      )}

      {loadState === 'ready' && (
        <>
          <AddSymbolForm
            allSymbols={allSymbols}
            watchlist={watchlist}
            onAdd={addSymbol}
          />
          <Watchlist items={items} prices={prices} onRemove={removeSymbol} />
        </>
      )}
    </div>
  )
}

export default App
