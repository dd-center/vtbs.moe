const ioClient = require('socket.io-client')
const hawkSocket = ioClient('http://0.0.0.0:9011')

let analyzed = { day: [], h: [] }

module.exports = ({ io }) => {
  hawkSocket.on('analyze', data => {
    analyzed = data
    io.emit('hawk', analyzed)
    io.emit('log', 'Hawk Update')
  })
  io.on('connection', socket => socket.emit('hawk', analyzed))
}
