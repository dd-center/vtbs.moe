const biliAPI = require('bili-api')
const { init } = require('./database')

const vtbs = require('./vtbs')

const PARALLEL = 3
const INTERVAL = 1000

class Spider {
  constructor({ db, spiderId, PARALLEL, INTERVAL }) {
    this.db = db
    this.spiderId = spiderId
    this.PARALLEL = PARALLEL
    this.INTERVAL = INTERVAL
  }
  wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
  async start() {
    for (;;) {
      let startTime = (new Date()).getTime()
      console.log(`${this.spiderId}/${this.PARALLEL}`)
      let endTime = (new Date()).getTime()
      await this.wait(this.INTERVAL - (endTime - startTime))
    }
  }
}

;
(async () => {
  let db = await init()
  // let vtb = await biliAPI(vtbs[0], ['mid', 'uname', 'roomid', 'sign', 'notice', 'follower', 'archiveView', 'guardNum', 'liveStatus', 'online'])
  for (const spiderId of Array(PARALLEL).fill().map((current, index) => index)) {
    let spider = new Spider({ db, spiderId, PARALLEL, INTERVAL })
    spider.start()
  }
})()
