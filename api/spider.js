const biliAPI = require('bili-api')

let oneHours = 1000 * 60 * 60

const notable = ({ object, time, currentActive }) => {
  if (!currentActive) {
    return true
  }
  if (time - currentActive.time > oneHours) {
    return true
  }
  if (Math.abs(currentActive.archiveView - object.archiveView) * 1000 > currentActive.archiveView) {
    return true
  }
  if (Math.abs(currentActive.follower - object.follower) * 1000 > currentActive.follower) {
    return true
  }
  return false
}

class Spider {
  constructor({ db, vtbs, spiderId, io, PARALLEL, INTERVAL }) {
    this.db = db
    this.vtbs = vtbs
    this.spiderId = spiderId
    this.io = io
    this.PARALLEL = PARALLEL
    this.INTERVAL = INTERVAL
    this.endTime = (new Date()).getTime()
  }
  wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
  log(log) {
    (output => {
      console.log(output)
      this.io.emit('log', output)
    })(`spider ${this.spiderId}: ${log}`)
  }
  async start() {
    for (;;) {
      let startTime = (new Date()).getTime()
      this.infoArray = []
      await this.round()
      this.io.emit('info', this.infoArray)

      let time = (new Date()).getTime()
      this.endTime = time
      let update = { time, spiderId: this.spiderId, duration: time - startTime }
      this.io.emit('spiderUpdate', update)
      await this.db.site.put(`spider_${this.spiderId}`, update)

      let endTime = (new Date()).getTime()
      this.log(`WAIT: ${this.INTERVAL - (endTime - startTime)}`)
      await this.wait(this.INTERVAL - (endTime - startTime))
    }
  }
  async round() {
    for (let i = this.spiderId; i < this.vtbs.length; i += this.PARALLEL) {
      let vtb = this.vtbs[i]
      let time = (new Date()).getTime()
      let object = await biliAPI(vtb, ['mid', 'uname', 'roomid', 'sign', 'notice', 'follower', 'archiveView', 'guardNum', 'liveStatus', 'online', 'face', 'areaRank']).catch(() => undefined)
      if (!object) {
        i -= this.PARALLEL
        this.log(`RETRY: ${vtb.mid}`)
        continue
      }
      let { mid, uname, roomid, sign, notice, follower, archiveView, guardNum, liveStatus, online, face, areaRank } = object

      let info = await this.db.info.get(mid)
      if (!info) {
        info = {}
      }
      let { recordNum = 0, liveNum = 0, guardChange = 0 } = info

      let currentActive = await this.db.active.get({ mid, num: recordNum })
      if (notable({ object, time, currentActive })) {
        recordNum++
        await this.db.active.put({ mid, num: recordNum, value: { archiveView, follower, time } })
      }

      if (liveStatus) {
        liveNum++
        await this.db.live.put({ mid, num: liveNum, value: { online, time } })
      }

      if (guardNum !== info.guardNum || areaRank !== info.areaRank) {
        guardChange++
        await this.db.guard.put({ mid, num: guardChange, value: { guardNum, areaRank, time } })
      }

      await this.db.info.put(mid, { mid, uname, roomid, sign, notice, face, archiveView, follower, liveStatus, recordNum, guardNum, liveNum, guardChange, areaRank, online, time })
      this.infoArray.push({ mid, uname, roomid, sign, notice, face, archiveView, follower, liveStatus, recordNum, guardNum, liveNum, guardChange, areaRank, online, time })

      this.log(`UPDATED: ${mid} - ${uname}`)
      await this.wait(1000 * 1)
    }
  }
}

exports.Spider = Spider
