import io from 'socket.io-client'

const socket = io('http://localhost:8001')
// const socket = io('https://api.vtb.simon3k.moe')

socket.on('connect', () => {
  console.log('connect')
  socket.emit('test', 'wow', console.log)
})
