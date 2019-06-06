const Server = require('socket.io')
const ioClient = require('socket.io-client')

const io = new Server({ serveClient: false, path: '/vds' })

let vdSocket = ioClient('http://0.0.0.0:9003')

vdSocket.on('danmaku', ({ message, roomid, mid }) => io.to('all').to(roomid).emit('danmaku', { message, roomid, mid }))

io.on('connection', socket => {
  socket.on('join', (data, arc) => {
    socket.join(data, () => {
      if (typeof arc === 'function') {
        arc('ARC')
      }
    })
  })
  socket.on('leave', (data, arc) => {
    socket.leave(data, () => {
      if (typeof arc === 'function') {
        arc('ARC')
      }
    })
  })
})

module.exports = io
