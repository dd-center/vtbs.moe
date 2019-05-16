const biliAPI = require('bili-api')

const race = (...args) => new Promise(resolve => {
  let timeout = setTimeout(() => {
    console.log('TIMEOUT')
    resolve(undefined)
  }, 1000 * 15)
  biliAPI(...args)
    .then(data => {
      clearTimeout(timeout)
      resolve(data)
    })
})

let oneHours = 1000 * 60 * 60

const notable = ({ object, time, currentActive }) => {
  if (!currentActive) {
    return true
  }
  if (time - currentActive.time > 3 * oneHours) {
    return true
  }
  if (Math.abs(object.follower - currentActive.follower) > 10) {
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
      await this.db.site.put({ mid: 'spider', num: this.spiderId, value: update })

      let endTime = (new Date()).getTime()
      this.log(`WAIT: ${this.INTERVAL - (endTime - startTime)}`)
      await this.wait(this.INTERVAL - (endTime - startTime))
    }
  }
  async round() {
    for (let i = this.spiderId; i < this.vtbs.length; i += this.PARALLEL) {
      let vtb = this.vtbs[i]
      let time = (new Date()).getTime()
      let object = await race(vtb, ['mid', 'uname', 'video', 'roomid', 'sign', 'notice', 'follower', 'archiveView', 'guardNum', 'liveStatus', 'online', 'title', 'face', 'topPhoto', 'areaRank'], { wait: 300 }).catch(() => undefined)
      if (!object) {
        i -= this.PARALLEL
        this.log(`RETRY: ${vtb.mid}`)
        await this.wait(1000 * 5)
        continue
      }
      let { mid, uname, video, roomid, sign, notice, follower, archiveView, guardNum, liveStatus, online, title, face, topPhoto, areaRank } = object

      let info = await this.db.info.get(mid)
      if (!info) {
        info = {}
      }
      let { recordNum = 0, liveNum = 0, guardChange = 0 } = info

      let currentActive = await this.db.active.get({ mid, num: recordNum })
      if (notable({ object, time, currentActive })) {
        recordNum++
        this.io.to(mid).emit('detailActive', { mid, data: { archiveView, follower, time } })
        await this.db.active.put({ mid, num: recordNum, value: { archiveView, follower, time } })
      }

      if (liveStatus) {
        liveNum++
        this.io.to(mid).emit('detailLive', { mid, data: { online, time } })
        await this.db.live.put({ mid, num: liveNum, value: { online, time } })
      }

      if (guardNum !== info.guardNum || areaRank !== info.areaRank) {
        guardChange++
        this.io.to(mid).emit('detailGuard', { mid, data: { guardNum, areaRank, time } })
        await this.db.guard.put({ mid, num: guardChange, value: { guardNum, areaRank, time } })
      }

      let dayNum = 1000 * 60 * 60 * 24 / this.INTERVAL
      let dayBackSkip = Math.max(recordNum - dayNum, 0)
      let totalRecordNum = Math.min(dayNum, recordNum)
      let actives = await this.db.active.bulkGet({ mid, num: totalRecordNum, skip: dayBackSkip })
      let todayActives = actives.filter(active => active.time > time - 1000 * 60 * 60 * 24)
      let timeDifference = time - todayActives[0].time
      let followerChange = follower - todayActives[0].follower
      let rise = Math.round(followerChange * 1000 * 60 * 60 * 24 / timeDifference)

      let guardType = await this.db.guardType.get(mid)

      this.io.to(mid).emit('detailInfo', { mid, data: { mid, uname, video, roomid, sign, notice, face, rise, topPhoto, archiveView, follower, liveStatus, recordNum, guardNum, liveNum, guardChange, guardType, areaRank, online, title, time } })
      await this.db.info.put(mid, { mid, uname, video, roomid, sign, notice, face, rise, topPhoto, archiveView, follower, liveStatus, recordNum, guardNum, liveNum, guardChange, guardType, areaRank, online, title, time })
      this.infoArray.push({ mid, uname, video, roomid, sign, notice, face, rise, topPhoto, archiveView, follower, liveStatus, recordNum, guardNum, liveNum, guardChange, guardType, areaRank, online, title, time })

      this.log(`UPDATED: ${mid} - ${uname}`)
      await this.wait(1000 * 1)
    }
  }
}

exports.Spider = Spider
