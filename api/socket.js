exports.connect = ({ io, site, macro, num, info, active, live, vtbs, PARALLEL, INTERVAL }) => async socket => {
  const handler = e => async (target, arc) => {
    if (typeof arc === 'function') {
      if (e === 'live') {
        arc(await live.get(target))
      }
      if (e === 'liveBulk') {
        arc(await Promise.all([...target].map(e => live.get(e))))
      }
      if (e === 'vupMacro') {
        let macroNum = await num.get('vupMacroNum')
        arc(await macro.bulkGet({ mid: 'vup', num: macroNum }))
      }
      if (e === 'vtbMacro') {
        let macroNum = await num.get('vtbMacroNum')
        arc(await macro.bulkGet({ mid: 'vtb', num: macroNum }))
      }
      if (e === 'guardMacro') {
        let macroNum = await num.get('guardMacroNum')
        arc(await macro.bulkGet({ mid: 'guard', num: macroNum }))
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

// Server Push
online: Number

vtbs: [vtb]

info: [info]

log: String

status: {}

spiderUpdate: {spiderId, time, duration}

vupMacro: {macro}
vtbMacro: {macro}
guardMacro: {macro}

 */
