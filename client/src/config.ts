// The server url can be changed with a .env file (VITE_API_URL)
export const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// http://localhost:4000 -> ws://localhost:4000/ws
export const WS_URL: string = API_URL.replace('http', 'ws') + '/ws'
