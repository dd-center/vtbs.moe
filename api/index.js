const biliAPI = require('bili-api')
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
    // let startTime = (new Date()).getTime()
    for (let i = this.spiderId; i < this.vtbs.length; i += this.PARALLEL) {
      let vtb = this.vtbs[i]
      let object = await biliAPI(vtb, ['mid', 'uname', 'roomid', 'sign', 'notice', 'follower', 'archiveView', 'guardNum', 'liveStatus', 'online'])
      console.log(vtb.note, object.uname)
    }
  }
}

;
(async () => {
  let db = await init()
  for (const spiderId of Array(PARALLEL).fill().map((current, index) => index)) {
    let spider = new Spider({ db, vtbs, spiderId, PARALLEL, INTERVAL })
    spider.start()
  }
})()
