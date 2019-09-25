const ioClient = require('socket.io-client')
const clusterSocket = ioClient('http://0.0.0.0:9012')

clusterSocket.on('connect', () => console.log('hello Clusters'))

const asyncEmit = (name, target) => new Promise(resolve => {
  clusterSocket.emit(name, target, resolve)
})

const got = ({ url }) => asyncEmit('http', url)

module.exports = { got }
