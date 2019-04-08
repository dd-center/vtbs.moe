import io from 'socket.io-client'

const socket = io('http://localhost:8001')

socket.on('connect', () => {
  console.log('connect')
  socket.emit('test', 'wow', console.log)
})
