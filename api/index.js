const { Spider } = require('./spider')
const vtbs = require('./vtbs')

const ant = require('./ant')

const Server = require('socket.io')
const io = new Server(8001, { serveClient: false, path: '/' })
const { connect } = require('./socket')

const { init } = require('./database')

const PARALLEL = 3
const INTERVAL = 1000 * 60 * 5

;
(async () => {
  // let { site, info, active, live } = await init()
  let { site, num, info, active, live, guard, macro } = await init()
  for (const spiderId of Array(PARALLEL).fill().map((current, index) => index)) {
    let spider = new Spider({ db: { site, info, active, live, guard }, vtbs, spiderId, io, PARALLEL, INTERVAL })
    spider.start()
    setInterval(() => {
      // Auto restart when spider are dead
      if ((new Date()).getTime() - spider.endTime > INTERVAL * 1.5) {
        console.log(`Spider ${spiderId}, NOT OK`)
        process.exit()
      } else {
        console.log(`Spider ${spiderId}, OK`)
      }
    }, 1000 * 60 * 2)
  }
  ant({ vtbs, macro, num, info, INTERVAL })
  io.on('connection', connect({ io, vtbs, site, info, active, live, guard, PARALLEL, INTERVAL }))
})()
