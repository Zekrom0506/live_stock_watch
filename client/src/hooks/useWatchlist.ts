import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'watchlist'

// read the saved watchlist from localStorage (empty list if nothing is saved)
function loadSavedWatchlist(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (err) {
    console.log('Could not read saved watchlist', err)
  }
  return []
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(loadSavedWatchlist)

  // save every time the list changes so it survives a refresh
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist))
  }, [watchlist])

  // useCallback keeps the same function between renders,
  // so the memoised rows don't re-render because of a new function
  const addSymbol = useCallback((symbol: string) => {
    setWatchlist((oldList) => {
      if (oldList.includes(symbol)) {
        return oldList
      }
      return [...oldList, symbol]
    })
  }, [])

  const removeSymbol = useCallback((symbol: string) => {
    setWatchlist((oldList) => oldList.filter((item) => item !== symbol))
  }, [])

  return { watchlist, addSymbol, removeSymbol }
}
