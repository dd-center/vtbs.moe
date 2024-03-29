import cluster from 'node:cluster'
import type { Server as HTTPServer } from 'node:http'

import { Server } from 'socket.io'
import { setupMaster, setupWorker } from '@socket.io/sticky'

import * as vdb from './vdb.js'

export const ioRaw = new Server({
  serveClient: false, allowEIO3: true,
  cors: {
    origin: true,
    credentials: true,
  }
})

type Emit = [string, ...any[]]
type Channel = 'guardMacroK' | 'guardMacroWeekK'
type To = (Channel)[]
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
  updateVDB?: true
  online?: number
}

type MessageToPrimary = {
  online?: number
}

const ONLINE_REPORT_INTERVAL = 1000 * 7

const sharedDB = new Map()

const rawSetSharedDB = (key: string, value: any) => sharedDB.set(key, value)

const sendMessageToWorkers = (message: Message) => {
  for (const worker of Object.values(cluster.workers)) {
    if (worker.isConnected()) {
      worker.send(message)
    }
  }
}

const sendMessageToPrimary = (message: MessageToPrimary) => {
  process.send(message)
}

const setSharedDB = (key: string, value: any) => {
  if (cluster.isPrimary) {
    rawSetSharedDB(key, value)
    sendMessageToWorkers({ sharedDB: { key, value } })
  }
}

const getSharedDB = (key: string) => sharedDB.get(key)

export const setWormArray = (value: any) => setSharedDB('wormArray', value)
export const getWormArray = () => getSharedDB('wormArray') || []

const infoFilter = ({ mid, uuid, uname, roomid, sign, face, rise, archiveView, follower, liveStatus, guardNum, lastLive, guardType, online, title }: any) => ({ mid, uuid, uname, roomid, sign, face, rise, archiveView, follower, liveStatus, guardNum, lastLive, guardType, online, title })

const infoArrayMap = new Map()
export const updateInfoArrayMapRaw = (mid: number, newInfo: any) => infoArrayMap.set(mid, infoFilter(newInfo))
export const updateInfoArrayMap = (mid: number, newInfo: any) => {
  updateInfoArrayMapRaw(mid, newInfo)
  if (cluster.isPrimary) {
    const info = { mid, newInfo }
    sendMessageToWorkers({ info })
  }
}
const deleteOldInfoArrayRaw = async () => {
  const mids = (await vdb.getPure()).map(({ mid }) => mid)
  const keys = [...infoArrayMap.keys()]
  keys.filter(mid => !mids.includes(mid)).forEach(mid => infoArrayMap.delete(mid))
}
export const deleteOldInfoArray = async () => {
  if (cluster.isPrimary) {
    sendMessageToWorkers({ deleteOld: true })
  }
  await deleteOldInfoArrayRaw()
}
export const infoArray = () => [...infoArrayMap.values()]

const emitInfoArrayRaw = () => rawEmit(['info', infoArray()], [])

export const emitInfoArray = () => {
  emitInfoArrayRaw()
  if (cluster.isPrimary) {
    sendMessageToWorkers({ emitInfoArray: true })
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

const fork = () => {
  if (Object.keys(cluster.workers).length < 6) {
    cluster.fork()
  }
}

if (cluster.isPrimary) {
  cluster.setupPrimary({
    serialization: 'advanced'
  })

  cluster.on('disconnect', worker => {
    console.log('Worker disconnect', worker.id)
    fork()
  })

  cluster.on('exit', worker => {
    console.log('Worker exited', worker.id)
    fork()
  })

  let online = 0

  fork()
  fork()
  fork()
  fork()
  fork()
  fork()

  setInterval(async () => {
    sendMessageToWorkers({ online })
  }, ONLINE_REPORT_INTERVAL * 0.7)

  cluster.on('message', (_, message: MessageToPrimary) => {
    if (message.online !== undefined) {
      online += message.online
      setTimeout(() => {
        online -= message.online
      }, ONLINE_REPORT_INTERVAL)
    }
  })
} else {
  setInterval(() => {
    sendMessageToPrimary({ online: (ioRaw.engine as any || {}).clientsCount || 0 })
  }, ONLINE_REPORT_INTERVAL)
  process.on('message', async ({ io, info, deleteOld, emitInfoArray, sharedDB, online, updateVDB }: Message) => {
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
    if (updateVDB) {
      await vdb.update()
    }
    if (online !== undefined) {
      emit(['online', online])
    }
  })
}

export const emit = (emit: Emit, ids: To = []) => {
  if (cluster.isPrimary) {
    const io = { emit, to: ids }
    const message: Message = { io }
    sendMessageToWorkers(message)
  } else {
    rawEmit(emit, ids)
  }
}

export const to = (...ids: To) => {
  return {
    to: (id: Channel) => to(...ids, id),
    emit: (e: Emit) => emit(e, ids)
  }
}

export const updateVDB = () => {
  if (cluster.isPrimary) {
    sendMessageToWorkers({ updateVDB: true })
  }
}

export const setupConnectionMaster = (server: HTTPServer) => {
  setupMaster(server)
}

export const setupConnectionLimit = () => {
  setupWorker(ioRaw)
}
