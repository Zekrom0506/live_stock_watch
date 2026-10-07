import { useEffect, useRef, useState } from 'react'
import { WS_URL } from '../config'
import type { ConnectionState, PriceMap, Tick } from '../types'
import { applyTicks } from '../utils/ticks'

// how often buffered ticks are applied to state (in ms)
const FLUSH_INTERVAL_MS = 100
// reconnect waits 1s, 2s, 4s, 8s and then stays at 10s
const MAX_RETRY_DELAY_MS = 10000
// after this many failed tries in a row we show "offline" instead of "reconnecting"
const MAX_QUICK_RETRIES = 4

// Tell the server which symbols we want. Only sends the difference
// between what we want and what we are already subscribed to.
function updateSubscriptions(
  socket: WebSocket | null,
  wanted: string[],
  current: string[],
) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return current
  }

  const toAdd = wanted.filter((symbol) => !current.includes(symbol))
  const toRemove = current.filter((symbol) => !wanted.includes(symbol))

  if (toAdd.length > 0) {
    socket.send(JSON.stringify({ type: 'subscribe', symbols: toAdd }))
  }
  if (toRemove.length > 0) {
    socket.send(JSON.stringify({ type: 'unsubscribe', symbols: toRemove }))
  }
  return wanted
}

// Opens the websocket and keeps the latest price of every watchlist symbol.
export function useMarketSocket(symbols: string[]) {
  const [prices, setPrices] = useState<PriceMap>({})
  const [status, setStatus] = useState<ConnectionState>('connecting')

  const socketRef = useRef<WebSocket | null>(null)
  // latest watchlist, needed inside the socket callbacks
  const symbolsRef = useRef<string[]>(symbols)
  // symbols the server is currently sending us
  const subscribedRef = useRef<string[]>([])
  // ticks that arrived since the last flush
  const bufferRef = useRef<Tick[]>([])

  // open the connection, and open it again if it drops
  useEffect(() => {
    let failedTries = 0
    let retryTimer: number | undefined
    let closedByUs = false

    function connect() {
      const socket = new WebSocket(WS_URL)
      socketRef.current = socket

      socket.onopen = () => {
        failedTries = 0
        setStatus('live')
        // a new connection has no subscriptions on the server,
        // so subscribe to the whole watchlist again
        subscribedRef.current = updateSubscriptions(socket, symbolsRef.current, [])
      }

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data)
        if (message.type === 'tick') {
          // don't set state here, a render for every single tick is too many.
          // just keep the tick and let the timer below apply them together
          bufferRef.current.push(message.tick)
        }
      }

      socket.onclose = () => {
        // closed because the component unmounted, nothing to do
        if (closedByUs) return

        failedTries = failedTries + 1
        if (failedTries > MAX_QUICK_RETRIES) {
          setStatus('offline')
        } else {
          setStatus('reconnecting')
        }

        // wait longer after every failed try: 1s, 2s, 4s, 8s, 10s, 10s...
        const delay = Math.min(1000 * 2 ** (failedTries - 1), MAX_RETRY_DELAY_MS)
        retryTimer = window.setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      closedByUs = true
      window.clearTimeout(retryTimer)
      if (socketRef.current) {
        socketRef.current.close()
      }
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
    symbolsRef.current = symbols
    subscribedRef.current = updateSubscriptions(
      socketRef.current,
      symbols,
      subscribedRef.current,
    )
  }, [symbols])

  return { prices, status }
}
