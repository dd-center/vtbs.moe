const biliAPI = require('bili-api')
const got = require('got')

let oneHours = 1000 * 60 * 60

const notable = ({ info, object, time }) => {
  if (!info.recordNum) {
    return true
  }
  if (time - info.time > oneHours) {
    return true
  }
  if (Math.abs(info.archiveView - object.archiveView) * 1000 > info.archiveView) {
    return true
  }
  if (Math.abs(info.follower - object.follower) * 1000 > info.follower) {
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
      this.io.emit('log', `${vtb.mid}: START`)
      let time = (new Date()).getTime()
      let object = await biliAPI(vtb, ['mid', 'uname', 'roomid', 'sign', 'notice', 'follower', 'archiveView', 'guardNum', 'liveStatus', 'online', 'face', 'areaRank'])
      let { mid, uname, roomid, sign, notice, follower, archiveView, guardNum, liveStatus, online, face, areaRank } = object

      let info = await this.db.info.get(mid)
      if (!info) {
        info = {}
      }
      let { recordNum = 0, liveNum = 0, guardChange = 0 } = info

      if (notable({ info, object, time })) {
        this.io.emit('log', `${mid}: NOTABLE`)
        recordNum++
        await this.db.active.put({ mid, num: recordNum, value: { archiveView, follower, time } })
      }

      if (liveStatus) {
        this.io.emit('log', `${mid}: LIVE`)
        liveNum++
        await this.db.live.put({ mid, num: liveNum, value: { online, time } })
      }

      if (guardNum !== info.guardNum || areaRank !== info.areaRank) {
        this.io.emit('log', `${mid}: GUARD/RANK UPDATE`)
        guardChange++
        await this.db.guard.put({ mid, num: guardChange, value: { guardNum, areaRank, time } })
      }

      await this.db.info.put(mid, { mid, uname, roomid, sign, notice, face, archiveView, follower, liveStatus, recordNum, guardNum, liveNum, guardChange, areaRank, online, time })
      this.io.emit('info', { mid, uname, roomid, sign, notice, face, archiveView, follower, liveStatus, recordNum, guardNum, liveNum, guardChange, areaRank, online, time })

      let faceImage = await got(face, { encoding: null })
      await this.db.face.put(mid, faceImage.body.toString('base64'))

      this.io.emit('log', `${mid}: UPDATED ${uname}`)
      console.log(`UPDATED: ${uname}`)
      await this.wait(1000 * 1)
    }
  }
}

exports.Spider = Spider
