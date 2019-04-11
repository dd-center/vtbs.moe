exports.connect = ({ io, info, active, live }) => socket => {
  console.log('a user connected')
  socket.on('test', (data, arc) => {
    console.log('test', data)
    arc(2333)
  })
  socket.emit('log', 'hi')
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
}
