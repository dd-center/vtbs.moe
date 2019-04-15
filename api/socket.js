exports.connect = ({ io, info, active, live, vtbs, face }) => async socket => {
  const handler = e => async (target, arc) => {
    if (typeof arc === 'function') {
      if (e === 'face') {
        arc((await face.get(target)).data)
      }
      if (e === 'live') {
        arc(await live.get(target))
      }
    }
  }

  console.log('a user connected')
  socket.on('face', handler('face'))
  socket.on('live', handler('live'))
  socket.emit('log', `ID: ${socket.id}`)
  socket.emit('vtbs', vtbs)
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
  for (let i = 0; i < vtbs.length; i++) {
    let vtb = vtbs[i]
    let vtbInfo = await info.get(vtb.mid)
    if (vtbInfo) {
      socket.emit('info', vtbInfo)
    }
  }
}
