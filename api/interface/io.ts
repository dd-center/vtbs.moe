import cluster from 'node:cluster'
import EventEmitter from 'node:events'

import Server from 'socket.io'

const ipcEvent = new EventEmitter()

export const ioRaw = Server({ serveClient: false })

type Emit = [string, ...any[]]
type To = string[]

type Message = {
  emit: Emit,
  to: To
}

const rawEmit = (emit: Emit, to: To) => {
  let raw = ioRaw as unknown as Server.Namespace
  for (const id of to) {
    raw = raw.to(id)
  }
  if (emit) {
    raw.emit(...emit)
  }
}

if (cluster.isPrimary) {
  ipcEvent.on('emit', (emit: Emit, to: To) => {
    for (const worker of Object.values(cluster.workers)) {
      const message: Message = { emit, to }
      worker.send(message)
    }
  })
} else {
  process.on('message', ({ emit, to }: Message) => rawEmit(emit, to))
}

export const emit = (emit: Emit, ids: To = []) => {
  if (cluster.isPrimary) {
    ipcEvent.emit('emit', emit, ids)
  } else {
    rawEmit(emit, ids)
  }
}
export const to = (...ids: To) => {
  return {
    to: (id: string) => to(...ids, id),
    emit: (e: Emit) => emit(e, ids)
  }
}
