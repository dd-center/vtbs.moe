const io = require('socket.io-client')
const socket = io('http://0.0.0.0:9200?name=vtbs.moe')

socket.on('connect', () => {
  socket.emit('join', 'all')
})

const get = ({ name, key }) => new Promise(resolve => {
  socket.emit('state', { name, key }, resolve)
})

const getPending = () => get({ name: 'cluster', key: 'pending' })

module.exports = { getPending, socket }
