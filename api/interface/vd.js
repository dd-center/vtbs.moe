import { Server } from 'socket.io'
import ioClient from 'socket.io-client'

const io = new Server({ serveClient: false, path: '/vds', allowEIO3: true })

export const vdSocket = ioClient('http://0.0.0.0:9003')

vdSocket.on('danmaku', ({ message, roomid, mid, uname, timestamp }) => io.to('all').to(roomid).emit('danmaku', { message, roomid, mid, uname, timestamp }))

io.on('connection', socket => {
  socket.on('join', (data, arc) => {
    socket.join(data)
    if (typeof arc === 'function') {
      arc('ARC')
    }
  })
  socket.on('leave', (data, arc) => {
    socket.leave(data)
    if (typeof arc === 'function') {
      arc('ARC')
    }
  })
})

export const vd = io
