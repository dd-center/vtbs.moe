exports.connect = ({ io, site, macro, num, info, active, live, vtbs, PARALLEL, INTERVAL }) => async socket => {
  const handler = e => async (target, arc) => {
    if (typeof arc === 'function') {
      if (e === 'live') {
        arc(await live.get(target))
      }
      if (e === 'liveBulk') {
        arc(await Promise.all([...target].map(e => live.get(e))))
      }
      if (e === 'macro') {
        let macroNum = await num.get('macroNum')
        arc(await macro.bulkGet({ mid: 'record', num: macroNum }))
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
  socket.on('macro', handler('macro'))
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

macro: -> [{macro}]

// Server Push
online: Number

vtbs: [vtb]

info: [info]

log: String

status: {}

spiderUpdate: {spiderId, time, duration}

// macro: {macro}

 */
