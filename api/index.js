const biliAPI = require('bili-api')

const Server = require('socket.io')
const io = new Server(8001, { serveClient: false, path: '/' })

const { init } = require('./database')

const vtbs = require('./vtbs')

const PARALLEL = 3
const INTERVAL = 1000 * 60 * 5

class Spider {
  constructor({ db, vtbs, spiderId, PARALLEL, INTERVAL }) {
    this.db = db
    this.vtbs = vtbs
    this.spiderId = spiderId
    this.PARALLEL = PARALLEL
    this.INTERVAL = INTERVAL
  }
  wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
  async start() {
    for (;;) {
      let startTime = (new Date()).getTime()
      await this.round()
      let endTime = (new Date()).getTime()
      await this.wait(this.INTERVAL - (endTime - startTime))
    }
  }
  async round() {
    for (let i = this.spiderId; i < this.vtbs.length; i += this.PARALLEL) {
      let vtb = this.vtbs[i]
      let time = (new Date()).getTime()
      let object = await biliAPI(vtb, ['mid', 'uname', 'roomid', 'sign', 'notice', 'follower', 'archiveView', 'guardNum', 'liveStatus', 'online', 'face'])
      let { mid, uname, roomid, sign, notice, follower, archiveView, guardNum, liveStatus, online, face } = object

      let info = await this.db.info.get(mid)
      if (!info) {
        info = {}
      }
      let { recordNum = 0, liveNum = 0 } = info

      recordNum++
      await this.db.active.put({ mid, num: recordNum, value: { archiveView, follower, time } })

      if (liveStatus) {
        liveNum++
        await this.db.active.put({ mid, num: liveNum, value: { guardNum, online, time } })
      }

      await this.db.info.put(mid, { mid, uname, roomid, sign, notice, face, recordNum, liveNum, time })

      console.log(vtb.note, object.uname)
    }
  }
}

;
(async () => {
  // let { site, info, active, live } = await init()
  let { info, active, live } = await init()
  for (const spiderId of Array(PARALLEL).fill().map((current, index) => index)) {
    let spider = new Spider({ db: { info, active, live }, vtbs, spiderId, PARALLEL, INTERVAL })
    spider.start()
  }
  io.on('connection', socket => {
    console.log('a user connected')
    socket.on('test', (data, back) => {
      console.log('test', data)
      back(233)
    })
    socket.on('disconnect', () => {
      console.log('user disconnected')
    })
  })
})()
