import type { ConnectionState } from '../types'

interface Props {
  status: ConnectionState
}

const LABELS: Record<ConnectionState, string> = {
  connecting: 'Connecting...',
  live: 'Live',
  reconnecting: 'Reconnecting...',
  offline: 'Offline',
}

function ConnectionStatus({ status }: Props) {
  return (
    <span className={'status status-' + status}>
      <span className="status-dot"></span>
      {LABELS[status]}
    </span>
  )
}

export default ConnectionStatus
