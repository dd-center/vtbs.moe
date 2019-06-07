const ioClient = require('socket.io-client')

let vdSocket = ioClient('http://0.0.0.0:9003')

module.exports = vdSocket
