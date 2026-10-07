import { useCallback, useEffect, useState } from 'react'
import ConnectionStatus from './components/ConnectionStatus'
import AddSymbolForm from './components/AddSymbolForm'
import PriceChart from './components/PriceChart'
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
  const { prices, history, status } = useMarketSocket(watchlist)

  // symbol whose chart is open (null means no chart)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)

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

  // clicking the selected row again closes the chart
  const handleSelect = useCallback((symbol: string) => {
    setSelectedSymbol((current) => (current === symbol ? null : symbol))
  }, [])

  const handleRemove = useCallback(
    (symbol: string) => {
      removeSymbol(symbol)
      // close the chart if its symbol was removed
      setSelectedSymbol((current) => (current === symbol ? null : current))
    },
    [removeSymbol],
  )

  // full details of the watchlist symbols, in the order they were added
  const items: SymbolInfo[] = []
  for (const symbol of watchlist) {
    const info = allSymbols.find((item) => item.symbol === symbol)
    if (info) {
      items.push(info)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Live Watchlist</h1>
          <span className="muted">Simulated market data</span>
        </div>
        <ConnectionStatus status={status} />
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
          <Watchlist
            items={items}
            prices={prices}
            stale={status !== 'live'}
            selectedSymbol={selectedSymbol}
            onSelect={handleSelect}
            onRemove={handleRemove}
          />
          {selectedSymbol && (
            <PriceChart
              symbol={selectedSymbol}
              points={history[selectedSymbol] || []}
            />
          )}
        </>
      )}
    </div>
  )
}

export default App
