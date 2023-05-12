import cluster from 'node:cluster'
import EventEmitter from 'node:events'

import { Server } from 'socket.io'

import * as vdb from './vdb.js'

const ipcEvent = new EventEmitter()

export const ioRaw = new Server({
  serveClient: false, allowEIO3: true,
  cors: {
    origin: true,
    credentials: true,
  }
})

type Emit = [string, ...any[]]
type To = string[]
type Info = {
  mid: number
  newInfo: any
}

type ShareDB = {
  key: string
  value: any
}

type Message = {
  io?: {
    emit: Emit
    to: To
  }
  info?: Info
  deleteOld?: boolean
  emitInfoArray?: boolean
  sharedDB?: ShareDB
}

const sharedDB = new Map()

const rawSetSharedDB = (key: string, value: any) => sharedDB.set(key, value)

const setSharedDB = (key: string, value: any) => {
  if (cluster.isPrimary) {
    rawSetSharedDB(key, value)
    dispatch({ sharedDB: { key, value } })
  } else {
    ipcEvent.emit('shareDB', { key, value })
  }
}

const getSharedDB = (key: string) => sharedDB.get(key)

export const setWormArray = (value: any) => setSharedDB('wormArray', value)
export const getWormArray = () => getSharedDB('wormArray')

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

const emitInfoArrayRaw = () => rawEmit(['info', infoArray()], [])

export const emitInfoArray = () => {
  emitInfoArrayRaw()
  if (cluster.isPrimary) {
    dispatch({ emitInfoArray: true })
  }
}

const rawEmit = (emit: Emit, to: To) => {
  let raw = ioRaw as typeof ioRaw | ReturnType<typeof ioRaw['to']>
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
  ipcEvent.on('shareDB', ({ key, value }: ShareDB) => {
    setSharedDB(key, value)
  })
} else {
  process.on('message', async ({ io, info, deleteOld, emitInfoArray, sharedDB }: Message) => {
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
    if (emitInfoArray) {
      emitInfoArrayRaw()
    }
    if (sharedDB) {
      const { key, value } = sharedDB
      rawSetSharedDB(key, value)
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
