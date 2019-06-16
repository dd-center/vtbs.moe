const ioClient = require('socket.io-client')

let falconSocket = ioClient('http://0.0.0.0:9009')

const falconGet = (e, target) => new Promise(resolve => falconSocket.emit(e, target, resolve))

module.exports = falconGet
