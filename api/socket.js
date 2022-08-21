import { deflate } from 'zlib'
import { promisify } from 'util'

import * as vdb from './interface/vdb.js'
import { io } from './interface/io.js'
import { site, active, guard, fullGuard, guardType, status, macro, num, info } from './database.js'
import { wormResult } from './worm.js'

const deflateAsync = promisify(deflate)

export const infoFilter = ({ mid, uuid, uname, roomid, sign, face, rise, archiveView, follower, liveStatus, guardNum, lastLive, guardType, online, title }) => ({ mid, uuid, uname, roomid, sign, face, rise, archiveView, follower, liveStatus, guardNum, lastLive, guardType, online, title })

const metaMap = new WeakMap()

let lastOnlineUpdate = 0

const infoArrayMap = new Map()
export const updateInfoArrayMap = (mid, newInfo) => infoArrayMap.set(mid, infoFilter(newInfo))
export const deleteOldInfoArray = async () => {
  const mids = (await vdb.getPure()).map(({ mid }) => mid)
  const keys = [...infoArrayMap.keys()]
  keys.filter(mid => !mids.includes(mid)).forEach(mid => infoArrayMap.delete(mid))
}
export const infoArray = () => [...infoArrayMap.values()]
const fillInfoArray = async () => {
  const mids = (await vdb.getPure()).map(({ mid }) => mid)
  const arrayPromise = await Promise.all(mids.map(mid => info.get(mid)))
  arrayPromise.filter(Boolean)
    .forEach(({ mid, ...newInfo }) => infoArrayMap.set(mid, { mid, ...newInfo }))
}
await fillInfoArray()
console.log('fillInfoArray')

const wsRouter = ({ socket }) => ([key, ...rest], map = []) => {
  if (map.includes(key)) {
    return undefined
  }
  const handler = wsRouter({ socket })
  const handlerTable = new Proxy({
    vdbTable: () => vdb.getVdbTable(),
    fullInfo: async () => {
      const vtbs = await vdb.getPure()
      return (await Promise.all(vtbs.map(({ mid }) => mid).map(mid => info.get(mid))))
        .filter(Boolean)
    },
    async guardMacroK([week = false]) {
      const kNum = await num.get(week ? 'guardMacroWeekKNum' : 'guardMacroKNum')
      const result = await macro.bulkGet({ mid: week ? 'guardMacroWeekK' : 'guardMacroK', num: kNum })
      socket.join(week ? 'guardMacroWeekK' : 'guardMacroK')
      return result
    },
    devHashRank: () => Object
      .entries(Object
        .values(io.of('/').connected)
        .map(s => metaMap.get(s))
        .map(({ hash = 'undefined' }) => hash)
        .reduce((hashs, hash) => {
          if (!hashs[hash]) {
            hashs[hash] = 0
          }
          hashs[hash]++
          return hashs
        }, {}))
      .sort(([_, a], [_hash, b]) => b - a),
    arrayMinimizer: async keys => {
      const result = await handler(keys)
      const ks = Object.keys(result[0])
      const value = result.map(object => ks.map(k => object[k]))
      return { value, keys: ks }
    },
    deflate: async keys => {
      return deflateAsync(JSON.stringify(await handler(keys)))
    },
  }, { get: (obj, prop) => obj[prop] || (() => undefined) })
  return handlerTable[key](rest)
}

export const linkDanmaku = ({ io, cState }) => {
  cState.subscribe('cluster').on('danmaku', (nickname, danmaku) => {
    io.emit('danmaku', { nickname, danmaku })
  })
}

export const connect = ({ PARALLEL, INTERVAL }) => async socket => {
  const newHandler = wsRouter({ socket })
  const handler = e => socket.on(e, async (target, arc) => {
    if (typeof arc === 'function') {
      const arcDeflate = async data => arc(await deflateAsync(JSON.stringify(data)))
      const arcTimeSeriesDeflate = data => {
        const keys = Object.keys(data[0] || {})
        const value = data.map(object => keys.map(key => object[key]))
        return arcDeflate({ value, keys, timeSeries: true })
      }

      if (e === 'new') {
        arc(await newHandler(target))
      }

      if (e === 'vupMacroCompressed') {
        socket.join('vupMacro', async () => {
          const macroNum = await num.get('vupMacroNum')
          arcTimeSeriesDeflate(await macro.bulkGet({ mid: 'vup', num: macroNum }))
        })
      }
      if (e === 'vtbMacroCompressed') {
        socket.join('vtbMacro', async () => {
          const macroNum = await num.get('vtbMacroNum')
          arcTimeSeriesDeflate(await macro.bulkGet({ mid: 'vtb', num: macroNum }))
        })
      }
      if (e === 'vtbMacroWeekCompressed') {
        socket.join('vtbMacro', async () => {
          const macroNum = await num.get('vtbMacroNum')
          const skip = macroNum - 24 * 60 * 7 / 5
          arcTimeSeriesDeflate(await macro.bulkGet({ mid: 'vtb', num: Math.min(24 * 60 * 7 / 5, macroNum), skip: Math.max(0, skip) }))
        })
      }
      if (e === 'guardMacroCompressed') {
        socket.join('guardMacro', async () => {
          const macroNum = await num.get('guardMacroNum')
          arcTimeSeriesDeflate(await macro.bulkGet({ mid: 'guard', num: macroNum }))
        })
      }
      if (e === 'info') {
        socket.join(target, async () => {
          arc(await info.get(target))
        })
      }
      if (e === 'bulkActiveCompressed') {
        const { recordNum, mid } = target
        const result = await active.bulkGet({ mid, num: recordNum })
        arcTimeSeriesDeflate(result)
      }
      if (e === 'bulkActiveSomeCompressed') {
        const { recordNum, mid } = target
        const skip = recordNum - 512
        arcTimeSeriesDeflate(await active.bulkGet({ mid, num: Math.min(512, recordNum), skip: Math.max(0, skip) }))
      }
      if (e === 'bulkActiveRangeCompressed') {
        const { skip, num, mid } = target
        arcTimeSeriesDeflate(await active.bulkGet({ mid, num, skip }))
      }
      if (e === 'bulkGuardCompressed') {
        const { guardChange, mid } = target
        arcTimeSeriesDeflate(await guard.bulkGet({ mid, num: guardChange }))
      }
      if (e === 'guardType') {
        arc(await guardType.get(target))
      }
      if (e === 'fullGuard') {
        arc(await fullGuard.get(target))
      }
      if (e === 'uptime') {
        arc(process.uptime())
      }
    }
  })

  metaMap.set(socket, {})

  socket.on('hash', hash => {
    metaMap.set(socket, { ...metaMap.get(socket), hash })
  })

  socket.on('cdn', cdn => {
    metaMap.set(socket, { ...metaMap.get(socket), cdn })
  })

  io.clients((error, clients) => {
    if (error) {
      console.error(error)
    }
    const now = Date.now()
    if (now - lastOnlineUpdate > 1000) {
      lastOnlineUpdate = now
      io.emit('online', clients.length)
    }
  })

  console.log('a user connected')
  handler('new')
  handler('vupMacroCompressed')
  handler('vtbMacroCompressed')
  handler('vtbMacroWeekCompressed')
  handler('guardMacroCompressed')
  handler('info')
  handler('bulkActiveCompressed') // Deprecated
  handler('bulkActiveSomeCompressed') // Deprecated
  handler('bulkActiveRangeCompressed')
  handler('bulkGuardCompressed')
  handler('guardType')
  handler('fullGuard')
  handler('uptime')
  socket.on('join', room => {
    if (['state'].includes(room)) {
      socket.join(room)
    }
  })
  socket.on('disconnect', () => {
    io.clients((error, clients) => {
      if (error) {
        console.error(error)
      }
      const now = Date.now()
      if (now - lastOnlineUpdate > 1000) {
        lastOnlineUpdate = now
        io.emit('online', clients.length)
      }
    })
    console.log('user disconnected')
  })
  socket.emit('log', `ID: ${socket.id}`)
  const vtbs = await vdb.getPure()
  socket.emit('vtbs', vtbs)
  socket.emit('info', infoArray())

  socket.emit('worm', wormResult())

  for (let i = 0; i < PARALLEL; i++) {
    socket.emit('spiderUpdate', await site.get({ mid: 'spider', num: i }))
  }
  socket.emit('status', { PARALLEL, INTERVAL });
  ['spiderLeft', 'spiderDuration', 'spiderTime'].forEach(async key => socket.emit(key, await status.get(key)))
}

/*
Socket

**************************************
**************************************
NEW WS REQUEST FORMAT

ENTRYPOINT: new
 - PASS: deflate
 - PASS: arrayMinimizer

fullInfo: [{...info, vdb}]
guardMacroK(week): [...guardMacroK]

/// dev
devHashRank: [...[hash, number]]

**************************************
**************************************

// Client Request
vupMacroCompressed: -> deflate([{vupMacro}])
vtbMacroCompressed: -> deflate([{vtbMacro}])
vtbMacroWeekCompressed: -> deflate([{vtbMacro}])
guardMacroCompressed: -> deflate([{guardMacro}])

info: mid -> {info}
bulkActiveCompressed: { recordNum, mid } - > deflate([active]) // Deprecated
bulkActiveSomeCompressed: { recordNum, mid } -> deflate([active]) // Deprecated
bulkActiveRangeCompressed: { mid, skip, num } - > deflate([active])
bulkGuardCompressed: { guardNum, mid } -> deflate([guard])

guardType: mid -> [n,n,n]

fullGuard: all/some/number/[mid] -> ?/Any

uptime: -> Number

join: state -> room: state

// Server Push
online: Number

danmaku: {nickname, danmaku}

vtbs: [vtb]

info: cut([info])

log: String

status: {}

spiderLeft: Number
spiderDuration: Number
spiderTime: Number

hawk: {day: [...jieba], h: [...jieba]}

worm: [...wormArray]

// Room:
vupMacro => vupMacro: {macro}
vtbMacro => vtbMacro: {macro}
guardMacro => guardMacro: {macro}

guardMacroK => guardMacroK: {macro}
guardMacroWeekK => guardMacroWeekK: {macro}

mid => detailInfo: {mid, {data}}
mid => detailActive: {mid, {data}}
mid => detailLive: {mid, {data}}
mid => detailGuard: {mid, {data}}

stateLog => log

 */
