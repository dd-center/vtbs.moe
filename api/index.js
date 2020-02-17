const spider = require('./spider')

const ant = require('./ant')

const http = require('http')
const Server = require('socket.io')

const { vd, vdSocket, hawk, vdb, biliAPI, stateGetPending, stateSocket } = require('./interface')

const { site, num, info, active, live, guard, macro, fullGuard, guardType, status } = require('./database')

const snake = require('./snake')
const { worm, wormResult } = require('./worm')

const { connect, infoFilter } = require('./socket')
const httpAPI = require('./http')

const PARALLEL = 16
const INTERVAL = 1000 * 60 * 5

if (process.env.MOCK) {
  require('./mock')
}

const io = new Server({ serveClient: false })
stateSocket.on('log', log => io.to('state').emit('stateLog', log))
vdb.bind(io)
const server = http.createServer(httpAPI({ vdb, info, fullGuard, active, live, num, macro, guard }))
io.attach(server)
vd.attach(server)
spider({ PARALLEL, INTERVAL, vdb, db: { site, info, active, guard, guardType, status }, io, worm, biliAPI, infoFilter, stateGetPending })
snake({ vdSocket, io, info })
hawk({ io })
ant({ vdb, macro, num, info, fullGuard, guardType, INTERVAL, io, biliAPI })
io.on('connection', connect({ io, vdb, macro, site, num, info, active, guard, fullGuard, guardType, PARALLEL, INTERVAL, wormResult, status }))
server.listen(8001)
