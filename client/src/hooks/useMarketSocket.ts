import { useEffect, useRef, useState } from 'react'
import { WS_URL } from '../config'
import type { PriceMap, Tick } from '../types'
import { applyTicks } from '../utils/ticks'

// how often buffered ticks are applied to state (in ms)
const FLUSH_INTERVAL_MS = 100

// Opens the websocket and keeps the latest price of every watchlist symbol.
export function useMarketSocket(symbols: string[]) {
  const [prices, setPrices] = useState<PriceMap>({})

  const socketRef = useRef<WebSocket | null>(null)
  // symbols the server is currently sending us
  const subscribedRef = useRef<string[]>([])
  // ticks that arrived since the last flush
  const bufferRef = useRef<Tick[]>([])

  // open the connection once
  useEffect(() => {
    const socket = new WebSocket(WS_URL)
    socketRef.current = socket

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.type === 'tick') {
        // don't set state here, a render for every single tick is too many.
        // just keep the tick and let the timer below apply them together
        bufferRef.current.push(message.tick)
      }
    }

    return () => {
      socket.close()
    }
  }, [])

  // apply all buffered ticks in one state update, about 10 times a second
  useEffect(() => {
    const timer = setInterval(() => {
      if (bufferRef.current.length === 0) return

      const ticks = bufferRef.current
      bufferRef.current = []
      setPrices((oldPrices) => applyTicks(oldPrices, ticks))
    }, FLUSH_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [])

  // when the watchlist changes, subscribe to new symbols and unsubscribe removed ones
  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    function updateSubscriptions() {
      if (!socket || socket.readyState !== WebSocket.OPEN) return

      const current = subscribedRef.current
      const toAdd = symbols.filter((symbol) => !current.includes(symbol))
      const toRemove = current.filter((symbol) => !symbols.includes(symbol))

      if (toAdd.length > 0) {
        socket.send(JSON.stringify({ type: 'subscribe', symbols: toAdd }))
      }
      if (toRemove.length > 0) {
        socket.send(JSON.stringify({ type: 'unsubscribe', symbols: toRemove }))
      }
      subscribedRef.current = symbols
    }

    if (socket.readyState === WebSocket.OPEN) {
      updateSubscriptions()
    } else {
      // socket is still connecting, wait for it to open
      socket.addEventListener('open', updateSubscriptions)
      return () => socket.removeEventListener('open', updateSubscriptions)
    }
  }, [symbols])

  return { prices }
}
