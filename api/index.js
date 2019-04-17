const { Spider } = require('./spider')
const vtbs = require('./vtbs')

const Server = require('socket.io')
const io = new Server(8001, { serveClient: false, path: '/' })
const { connect } = require('./socket')

const { init } = require('./database')

const PARALLEL = 3
const INTERVAL = 1000 * 60 * 5

;
(async () => {
  // let { site, info, active, live } = await init()
  let { site, info, active, live, guard, face } = await init()
  for (const spiderId of Array(PARALLEL).fill().map((current, index) => index)) {
    let spider = new Spider({ db: { site, info, active, live, guard, face }, vtbs, spiderId, io, PARALLEL, INTERVAL })
    spider.start()
  }
  io.on('connection', connect({ io, vtbs, site, info, active, live, guard, face, PARALLEL, INTERVAL }))
})()
