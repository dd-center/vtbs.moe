const { Spider } = require('./spider')
const vtbs = require('./vtbs')

const ant = require('./ant')

const http = require('http')
const Server = require('socket.io')

const ioInternal = new Server(9001, { serveClient: false, path: '/' })
const internal = require('./internal')
// TODO: useless?

const { connect } = require('./socket')
const httpAPI = require('./http')

const { init } = require('./database')

const PARALLEL = 3
const INTERVAL = 1000 * 60 * 5

;
(async () => {
  let { site, num, info, active, live, guard, macro, fullGuard, guardType } = await init()
  const io = new Server({ serveClient: false })
  const server = http.createServer(httpAPI({ vtbs, info, fullGuard }))
  io.attach(server)
  for (const spiderId of Array(PARALLEL).fill().map((current, index) => index)) {
    let spider = new Spider({ db: { site, info, active, live, guard, guardType }, vtbs, spiderId, io, PARALLEL, INTERVAL })
    spider.start()
    setInterval(() => {
      // Auto restart when spider are dead
      if ((new Date()).getTime() - spider.endTime > INTERVAL * 2) {
        console.log(`Spider ${spiderId}, NOT OK`)
        process.exit()
      } else {
        console.log(`Spider ${spiderId}, OK`)
      }
    }, 1000 * 60 * 2)
  }
  setTimeout(() => {
    ant({ vtbs, macro, num, info, fullGuard, guardType, INTERVAL, io })
  }, 1000 * 60 * 4)
  io.on('connection', connect({ io, vtbs, macro, site, num, info, active, live, guard, fullGuard, guardType, PARALLEL, INTERVAL }))
  ioInternal.on('connection', internal({ vtbs }))
  server.listen(8001)
})()
