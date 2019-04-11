const biliAPI = require('bili-api')

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
        await this.db.live.put({ mid, num: liveNum, value: { guardNum, online, time } })
      }

      await this.db.info.put(mid, { mid, uname, roomid, sign, notice, face, archiveView, follower, liveStatus, recordNum, guardNum, liveNum, time })

      console.log(`UPDATED: ${uname}`)
    }
  }
}

exports.Spider = Spider
