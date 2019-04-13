exports.connect = ({ io, info, active, live, vtbs }) => socket => {
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
}
