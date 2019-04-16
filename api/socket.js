exports.connect = ({ io, info, active, live, vtbs, face }) => async socket => {
  const handler = e => async (target, arc) => {
    if (typeof arc === 'function') {
      // if (e === 'face') {
      //   arc((await face.get(target)).data)
      // }
      if (e === 'live') {
        arc(await live.get(target))
      }
    }
  }

  console.log('a user connected')
  // socket.on('face', handler('face'))
  socket.on('live', handler('live'))
  socket.emit('log', `ID: ${socket.id}`)
  socket.emit('vtbs', vtbs)
  socket.on('disconnect', () => {
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
}

/*
Socket

// Client Request
live: mid -> {time, online}

// Server Push
vtbs: [vtb]

info: [info]

log: String

 */
