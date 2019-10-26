const { deflate } = require('zlib')
const { promisify } = require('util')
const deflateAsync = promisify(deflate)

const wsRouter = ({ info, vdb }) => ([key, ...rest], map = []) => {
  if (map.includes(key)) {
    return undefined
  }
  const handler = wsRouter({ info, vdb })
  const handlerTable = new Proxy({
    vdbTable: () => vdb.getVdbTable(),
    fullInfo: async () => {
      const vtbs = await vdb.get()
      const infoArray = (await Promise.all(vtbs.map(({ mid }) => mid).map(mid => info.get(mid))))
        .filter(Boolean)
      return infoArray
    },
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

const infoFilter = ({ mid, uuid, uname, roomid, sign, face, rise, archiveView, follower, liveStatus, guardNum, lastLive, guardType, online, title }) => ({ mid, uuid, uname, roomid, sign, face, rise, archiveView, follower, liveStatus, guardNum, lastLive, guardType, online, title })

exports.infoFilter = infoFilter

exports.connect = ({ io, site, macro, num, info, active, guard, vdb, fullGuard, guardType, PARALLEL, INTERVAL, wormResult }) => async socket => {
  const newHandler = wsRouter({ info, vdb })
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
          let macroNum = await num.get('vupMacroNum')
          arcTimeSeriesDeflate(await macro.bulkGet({ mid: 'vup', num: macroNum }))
        })
      }
      if (e === 'vtbMacroCompressed') {
        socket.join('vtbMacro', async () => {
          let macroNum = await num.get('vtbMacroNum')
          arcTimeSeriesDeflate(await macro.bulkGet({ mid: 'vtb', num: macroNum }))
        })
      }
      if (e === 'vtbMacroWeekCompressed') {
        socket.join('vtbMacro', async () => {
          let macroNum = await num.get('vtbMacroNum')
          let skip = macroNum - 24 * 60 * 7 / 5
          arcTimeSeriesDeflate(await macro.bulkGet({ mid: 'vtb', num: Math.min(24 * 60 * 7 / 5, macroNum), skip: Math.max(0, skip) }))
        })
      }
      if (e === 'guardMacroCompressed') {
        socket.join('guardMacro', async () => {
          let macroNum = await num.get('guardMacroNum')
          arcTimeSeriesDeflate(await macro.bulkGet({ mid: 'guard', num: macroNum }))
        })
      }
      if (e === 'info') {
        socket.join(target, async () => {
          arc(await info.get(target))
        })
      }
      if (e === 'bulkActiveCompressed') {
        let { recordNum, mid } = target
        let result = await active.bulkGet({ mid, num: recordNum })
        arcTimeSeriesDeflate(result)
      }
      if (e === 'bulkActiveSomeCompressed') {
        let { recordNum, mid } = target
        let skip = recordNum - 512
        arcTimeSeriesDeflate(await active.bulkGet({ mid, num: Math.min(512, recordNum), skip: Math.max(0, skip) }))
      }
      if (e === 'bulkActiveRangeCompressed') {
        const { skip, num, mid } = target
        arcTimeSeriesDeflate(await active.bulkGet({ mid, num, skip }))
      }
      if (e === 'bulkGuardCompressed') {
        let { guardChange, mid } = target
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

  io.clients((error, clients) => {
    if (error) {
      console.error(error)
    }
    io.emit('online', clients.length)
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
  socket.emit('log', `ID: ${socket.id}`)
  let vtbs = await vdb.get()
  socket.emit('vtbs', vtbs)
  socket.on('disconnect', () => {
    io.clients((error, clients) => {
      if (error) {
        console.error(error)
      }
      io.emit('online', clients.length)
    })
    console.log('user disconnected')
  })
  const infoArray = (await Promise.all(vtbs.map(({ mid }) => mid).map(mid => info.get(mid))))
    .filter(Boolean)
    .map(infoFilter)

  socket.emit('info', infoArray)

  socket.emit('worm', wormResult())

  for (let i = 0; i < PARALLEL; i++) {
    socket.emit('spiderUpdate', await site.get({ mid: 'spider', num: i }))
  }
  socket.emit('status', { PARALLEL, INTERVAL })
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

// Server Push
online: Number

vtbs: [vtb]

info: cut([info])

log: String

status: {}

spiderUpdate: {spiderId, time, duration}

hawk: {day: [...jieba], h: [...jieba]}

worm: [...wormArray]

// Room:
vupMacro => vupMacro: {macro}
vtbMacro => vtbMacro: {macro}
guardMacro => guardMacro: {macro}

mid => detailInfo: {mid, {data}}
mid => detailActive: {mid, {data}}
mid => detailLive: {mid, {data}}
mid => detailGuard: {mid, {data}}

 */
