const spider = require('./spider')

const ant = require('./ant')

const http = require('http')
const Server = require('socket.io')

const { vd, vdSocket, falcon, hawk, vdb, wiki } = require('./interface')

const snake = require('./snake')
const { worm, wormResult } = require('./worm')
const parrot = require('./parrot')({ wiki, vdb })

const { connect } = require('./socket')
const httpAPI = require('./http')

const { init } = require('./database')

const PARALLEL = 5
const INTERVAL = 1000 * 60 * 5

;
(async () => {
  let { site, num, info, active, live, guard, macro, fullGuard, guardType } = await init()
  const io = new Server({ serveClient: false })
  vdb.bind(io)
  parrot.start({ io })
  const server = http.createServer(httpAPI({ vdb, info, fullGuard, active, live, num, macro }))
  io.attach(server)
  vd.attach(server)
  spider({ PARALLEL, INTERVAL, vdb, db: { site, info, active, guard, guardType }, io, worm, parrot })
  snake({ vdSocket, io, info })
  hawk({ io })
  setTimeout(() => {
    ant({ vdb, macro, num, info, fullGuard, guardType, INTERVAL, io })
  }, 1000 * 60 * 4)
  io.on('connection', connect({ io, vdb, macro, site, num, info, active, falcon, guard, fullGuard, guardType, PARALLEL, INTERVAL, wormResult }))
  server.listen(8001)
})()
