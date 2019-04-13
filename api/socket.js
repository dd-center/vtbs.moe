exports.connect = ({ io, info, active, live, vtbs }) => async socket => {
  const handler = async (target, arc) => {
    if (typeof arc !== 'function') {
      arc = () => {}
    }
  }

  console.log('a user connected')
  socket.on('get', handler)
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
