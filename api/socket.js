exports.connect = ({ io, info, active, live, vtbs, face }) => async socket => {
  const handler = e => async (target, arc) => {
    if (typeof arc === 'function') {
      if (e === 'face') {
        arc(await face.get(target))
      }
    }
  }

  console.log('a user connected')
  socket.on('face', handler('face'))
  socket.emit('log', 'Connected')
  socket.emit('vtbs', vtbs)
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
  for (let i = 0; i < vtbs.length; i++) {
    let vtb = vtbs[i]
    socket.emit('info', await info.get(vtb.mid))
  }
}
