const { deflate } = require('zlib')
const { promisify } = require('util')
const deflateAsync = promisify(deflate)

exports.connect = ({ io, site, macro, num, info, active, guard, vdb, fullGuard, guardType, PARALLEL, INTERVAL, wormResult }) => async socket => {
  const handler = e => socket.on(e, async (target, arc) => {
    const arcDeflate = async data => arc(await deflateAsync(JSON.stringify(data)))
    const arcTimeSeriesDeflate = data => {
      const keys = Object.keys(data[0] || {})
      const value = data.map(object => keys.map(key => object[key]))
      return arcDeflate({ value, keys, timeSeries: true })
    }

    if (typeof arc === 'function') {
      if (e === 'vupMacro') {
        socket.join('vupMacro', async () => {
          let macroNum = await num.get('vupMacroNum')
          arc(await macro.bulkGet({ mid: 'vup', num: macroNum }))
        })
      }
      if (e === 'vupMacroCompressed') {
        socket.join('vupMacro', async () => {
          let macroNum = await num.get('vupMacroNum')
          arcTimeSeriesDeflate(await macro.bulkGet({ mid: 'vup', num: macroNum }))
        })
      }
      if (e === 'vtbMacro') {
        socket.join('vtbMacro', async () => {
          let macroNum = await num.get('vtbMacroNum')
          arc(await macro.bulkGet({ mid: 'vtb', num: macroNum }))
        })
      }
      if (e === 'vtbMacroCompressed') {
        socket.join('vtbMacro', async () => {
          let macroNum = await num.get('vtbMacroNum')
          arcTimeSeriesDeflate(await macro.bulkGet({ mid: 'vtb', num: macroNum }))
        })
      }
      if (e === 'vtbMacroWeek') {
        socket.join('vtbMacro', async () => {
          let macroNum = await num.get('vtbMacroNum')
          let skip = macroNum - 24 * 60 * 7 / 5
          arc(await macro.bulkGet({ mid: 'vtb', num: Math.min(24 * 60 * 7 / 5, macroNum), skip: Math.max(0, skip) }))
        })
      }
      if (e === 'vtbMacroWeekCompressed') {
        socket.join('vtbMacro', async () => {
          let macroNum = await num.get('vtbMacroNum')
          let skip = macroNum - 24 * 60 * 7 / 5
          arcTimeSeriesDeflate(await macro.bulkGet({ mid: 'vtb', num: Math.min(24 * 60 * 7 / 5, macroNum), skip: Math.max(0, skip) }))
        })
      }
      if (e === 'guardMacro') {
        socket.join('guardMacro', async () => {
          let macroNum = await num.get('guardMacroNum')
          arc(await macro.bulkGet({ mid: 'guard', num: macroNum }))
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
      if (e === 'bulkActive') {
        let { recordNum, mid } = target
        arc(await active.bulkGet({ mid, num: recordNum }))
      }
      if (e === 'bulkActiveCompressed') {
        let { recordNum, mid } = target
        let result = await active.bulkGet({ mid, num: recordNum })
        arcTimeSeriesDeflate(result)
      }
      if (e === 'bulkActiveSome') {
        let { recordNum, mid } = target
        let skip = recordNum - 512
        arc(await active.bulkGet({ mid, num: Math.min(512, recordNum), skip: Math.max(0, skip) }))
      }
      if (e === 'bulkActiveSomeCompressed') {
        let { recordNum, mid } = target
        let skip = recordNum - 512
        arcTimeSeriesDeflate(await active.bulkGet({ mid, num: Math.min(512, recordNum), skip: Math.max(0, skip) }))
      }
      if (e === 'bulkGuard') {
        let { guardChange, mid } = target
        arc(await guard.bulkGet({ mid, num: guardChange }))
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
  handler('vupMacro') // Deprecated
  handler('vupMacroCompressed')
  handler('vtbMacro') // Deprecated
  handler('vtbMacroCompressed')
  handler('vtbMacroWeek') // Deprecated
  handler('vtbMacroWeekCompressed')
  handler('guardMacro') // Deprecated
  handler('guardMacroCompressed')
  handler('info')
  handler('bulkActive') // Deprecated
  handler('bulkActiveCompressed')
  handler('bulkActiveSome') // Deprecated
  handler('bulkActiveSomeCompressed')
  handler('bulkGuard') // Deprecated
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
  let infoArray = []
  for (let i = 0; i < vtbs.length; i++) {
    let { mid } = vtbs[i]
    let vtbInfo = await info.get(mid)
    if (vtbInfo) {
      infoArray.push(vtbInfo)
    }
  }
  socket.emit('info', infoArray)

  socket.emit('worm', wormResult())

  for (let i = 0; i < PARALLEL; i++) {
    socket.emit('spiderUpdate', await site.get({ mid: 'spider', num: i }))
  }
  socket.emit('status', { PARALLEL, INTERVAL })
}

/*
Socket

// Client Request
vupMacro: -> [{vupMacro}] // Deprecated
vupMacroCompressed: -> deflate([{vupMacro}])
vtbMacro: -> [{vtbMacro}] // Deprecated
vtbMacroCompressed: -> deflate([{vtbMacro}])
vtbMacroWeek: -> [{vtbMacro}] // Deprecated
vtbMacroWeekCompressed: -> deflate([{vtbMacro}])
guardMacro: -> [{guardMacro}] // Deprecated
guardMacroCompressed: -> deflate([{guardMacro}])

info: mid -> {info}
bulkActive: { recordNum, mid } -> [active] // Deprecated
bulkActiveCompressed: { recordNum, mid } - > deflate([active])
bulkActiveSome: { recordNum, mid } -> [active] // Deprecated
bulkActiveSomeCompressed: { recordNum, mid } -> deflate([active])
bulkGuard: { guardNum, mid } -> [guard] // Deprecated
bulkGuardCompressed: { guardNum, mid } -> deflate([guard])

guardType: mid -> [n,n,n]

fullGuard: all/some/number/[mid] -> ?/Any

uptime: -> Number

// Server Push
online: Number

vtbs: [vtb]

info: [info]

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
