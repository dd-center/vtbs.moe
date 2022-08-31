import cluster from 'node:cluster'
import EventEmitter from 'node:events'

import Server from 'socket.io'

import * as vdb from './vdb.js'

const ipcEvent = new EventEmitter()

export const ioRaw = Server({ serveClient: false })

type Emit = [string, ...any[]]
type To = string[]
type Info = {
  mid: number
  newInfo: any
}

type Message = {
  io?: {
    emit: Emit
    to: To
  }
  info?: Info
  deleteOld?: boolean
}

const infoFilter = ({ mid, uuid, uname, roomid, sign, face, rise, archiveView, follower, liveStatus, guardNum, lastLive, guardType, online, title }: any) => ({ mid, uuid, uname, roomid, sign, face, rise, archiveView, follower, liveStatus, guardNum, lastLive, guardType, online, title })

const dispatch = (message: Message) => {
  for (const worker of Object.values(cluster.workers)) {
    worker.send(message)
  }
}

const infoArrayMap = new Map()
export const updateInfoArrayMapRaw = (mid: number, newInfo: any) => infoArrayMap.set(mid, infoFilter(newInfo))
export const updateInfoArrayMap = (mid: number, newInfo: any) => {
  updateInfoArrayMapRaw(mid, newInfo)
  if (cluster.isPrimary) {
    const info = { mid, newInfo }
    dispatch({ info })
  }
}
const deleteOldInfoArrayRaw = async () => {
  const mids = (await vdb.getPure()).map(({ mid }) => mid)
  const keys = [...infoArrayMap.keys()]
  keys.filter(mid => !mids.includes(mid)).forEach(mid => infoArrayMap.delete(mid))
}
export const deleteOldInfoArray = async () => {
  if (cluster.isPrimary) {
    dispatch({ deleteOld: true })
  }
  await deleteOldInfoArrayRaw()
}
export const infoArray = () => [...infoArrayMap.values()]



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
    const io = { emit, to }
    const message: Message = { io }
    dispatch(message)
  })
} else {
  process.on('message', async ({ io, info, deleteOld }: Message) => {
    if (io) {
      const { emit, to } = io
      rawEmit(emit, to)
    }
    if (info) {
      const { mid, newInfo } = info
      updateInfoArrayMapRaw(mid, newInfo)
    }
    if (deleteOld) {
      await deleteOldInfoArrayRaw()
    }
  })
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
