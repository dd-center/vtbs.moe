const ioClient = require('socket.io-client')
const socketMonster = ioClient('http://0.0.0.0:9002')

const get = api => (...args) => new Promise(resolve => socketMonster.emit(api, args, resolve))

const rooms = get('rooms')
const records = roomid => get('records')(roomid)
const roomsRecords = get('roomsRecords')
const read = (roomid, date, getUname = false) => get('read')(roomid, date, getUname)

module.exports = {
  rooms,
  records,
  roomsRecords,
  read,
}
