exports.connect = ({ io, site, macro, num, info, active, live, guard, vtbs, fullGuard, guardType, PARALLEL, INTERVAL }) => async socket => {
  const handler = e => async (target, arc) => {
    if (typeof arc === 'function') {
      if (e === 'live') {
        arc(await live.get(target))
      }
      if (e === 'liveBulk') {
        arc(await Promise.all([...target].map(e => live.get(e))))
      }
      if (e === 'vupMacro') {
        socket.join('vupMacro', async () => {
          let macroNum = await num.get('vupMacroNum')
          arc(await macro.bulkGet({ mid: 'vup', num: macroNum }))
        })
      }
      if (e === 'vtbMacro') {
        socket.join('vtbMacro', async () => {
          let macroNum = await num.get('vtbMacroNum')
          arc(await macro.bulkGet({ mid: 'vtb', num: macroNum }))
        })
      }
      if (e === 'guardMacro') {
        socket.join('guardMacro', async () => {
          let macroNum = await num.get('guardMacroNum')
          arc(await macro.bulkGet({ mid: 'guard', num: macroNum }))
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
      if (e === 'bulkLive') {
        let { liveNum, mid } = target
        arc(await live.bulkGet({ mid, num: liveNum }))
      }
      if (e === 'bulkGuard') {
        let { guardChange, mid } = target
        arc(await guard.bulkGet({ mid, num: guardChange }))
      }
      if (e === 'guardType') {
        arc(await guardType.get(target))
      }
      if (e === 'fullGuard') {
        arc(await fullGuard.get(target))
      }
    }
  }

  io.clients((error, clients) => {
    if (error) {
      console.error(error)
    }
    io.emit('online', clients.length)
  })

  console.log('a user connected')
  socket.on('live', handler('live'))
  socket.on('liveBulk', handler('liveBulk'))
  socket.on('vupMacro', handler('vupMacro'))
  socket.on('vtbMacro', handler('vtbMacro'))
  socket.on('guardMacro', handler('guardMacro'))
  socket.on('info', handler('info'))
  socket.on('bulkActive', handler('bulkActive'))
  socket.on('bulkLive', handler('bulkLive'))
  socket.on('bulkGuard', handler('bulkGuard'))
  socket.on('guardType', handler('guardType'))
  socket.on('fullGuard', handler('fullGuard'))
  socket.emit('log', `ID: ${socket.id}`)
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

  for (let i = 0; i < PARALLEL; i++) {
    socket.emit('spiderUpdate', await site.get({ mid: 'spider', num: i }))
  }
  socket.emit('status', { PARALLEL, INTERVAL })
}

/*
Socket

// Client Request
live: mid -> {time, online}

liveBulk: [mid] -> [{time, online}]

vupMacro: -> [{vupMacro}]
vtbMacro: -> [{vtbMacro}]
guardMacro: -> [{guardMacro}]

info: mid -> {info}
bulkActive: { recordNum, mid } -> [active]
bulkLive: { liveNum, mid } -> [live]
bulkGuard: { guardNum, mid } -> [guard]

guardType: mid -> [n,n,n]

fullGuard: all/some/number/[mid] -> ?/Any

// Server Push
online: Number

vtbs: [vtb]

info: [info]

log: String

status: {}

spiderUpdate: {spiderId, time, duration}

// Room:
vupMacro => vupMacro: {macro}
vtbMacro => vtbMacro: {macro}
guardMacro => guardMacro: {macro}

mid => detailInfo: {mid, {data}}
mid => detailActive: {mid, {data}}
mid => detailLive: {mid, {data}}
mid => detailGuard: {mid, {data}}

 */
