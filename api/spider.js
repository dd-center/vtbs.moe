const biliAPI = require('bili-api')

const race = (...args) => Promise.race([biliAPI(...args), wait(1000 * 15)])

let oneHours = 1000 * 60 * 60

const notable = ({ object, time, currentActive }) => {
  if (!currentActive) {
    return true
  }
  if (time - currentActive.time > 3 * oneHours) {
    return true
  }
  if (Math.abs(object.follower - currentActive.follower) > 35) {
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

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const round = async ({ pending, spiderId, io, db, INTERVAL }) => {
  const log = log => (output => {
    console.log(output)
    io.emit('log', output)
  })(`spider ${spiderId}: ${log}`)

  let infoArray = []
  let startTime = Date.now()

  for (;;) {
    let vtb = pending.shift()
    let time = Date.now()
    if (vtb) {
      let object = await race(vtb, ['mid', 'uname', 'video', 'roomid', 'sign', 'notice', 'follower', 'archiveView', 'guardNum', 'liveStatus', 'online', 'title', 'face', 'topPhoto', 'areaRank'], { wait: 300 }).catch(() => undefined)
      if (!object) {
        pending.push(vtb)
        log(`RETRY PENDING: ${vtb.mid}`)
        await wait(1500 + time - Date.now())
        continue
      }
      let { mid, uname, video, roomid, sign, notice, follower, archiveView, guardNum, liveStatus, online, title, face, topPhoto, areaRank } = object

      let info = await db.info.get(mid)
      if (!info) {
        info = {}
      }
      let { recordNum = 0, liveNum = 0, guardChange = 0 } = info
      let { lastLive = (await db.live.get({ mid, num: liveNum })) || {} } = info

      let currentActive = await db.active.get({ mid, num: recordNum })
      if (notable({ object, time, currentActive })) {
        recordNum++
        io.to(mid).emit('detailActive', { mid, data: { archiveView, follower, time } })
        await db.active.put({ mid, num: recordNum, value: { archiveView, follower, time } })
      }

      if (liveStatus) {
        liveNum++
        io.to(mid).emit('detailLive', { mid, data: { online, time } })
        lastLive = { online, time }
        await db.live.put({ mid, num: liveNum, value: { online, time } })
      }

      let averageLive = 0
      let weekLive = 0
      if (liveNum) {
        let allLive = await db.live.bulkGet({ mid, num: liveNum })
        let firstLive = allLive[0]
        averageLive = (1000 * 60 * 5 * liveNum) * 1000 * 60 * 60 * 24 * 7 / (time - firstLive.time)

        let thisWeek = allLive.filter((live) => live.time > time - 1000 * 60 * 60 * 24 * 7)
        weekLive = thisWeek.length * 1000 * 60 * 5
      }

      if (guardNum !== info.guardNum) {
        guardChange++
        io.to(mid).emit('detailGuard', { mid, data: { guardNum, time } })
        await db.guard.put({ mid, num: guardChange, value: { guardNum, time } })
      }

      let dayNum = 1000 * 60 * 60 * 24 / INTERVAL
      let dayBackSkip = Math.max(recordNum - dayNum, 0)
      let totalRecordNum = Math.min(dayNum, recordNum)
      let actives = await db.active.bulkGet({ mid, num: totalRecordNum, skip: dayBackSkip })
      let todayActives = actives.filter(active => active.time > time - 1000 * 60 * 60 * 24)
      let timeDifference = time - todayActives[0].time
      let followerChange = follower - todayActives[0].follower
      let rise = Math.round(followerChange * 1000 * 60 * 60 * 24 / timeDifference)

      let guardType = await db.guardType.get(mid)

      let newInfo = { mid, uname, video, roomid, sign, notice, face, rise, topPhoto, archiveView, follower, liveStatus, recordNum, guardNum, liveNum, lastLive, averageLive, weekLive, guardChange, guardType, areaRank, online, title, time }

      io.to(mid).emit('detailInfo', { mid, data: newInfo })
      await db.info.put(mid, newInfo)
      infoArray.push(newInfo)

      log(`UPDATED: ${mid} - ${uname}`)
      await wait(1500 + time - Date.now())
    } else {
      let update = { time, spiderId: spiderId, duration: time - startTime }
      io.emit('spiderUpdate', update)
      await db.site.put({ mid: 'spider', num: spiderId, value: update })
      return infoArray
    }
  }
}

module.exports = async ({ PARALLEL, INTERVAL, vtbs, db, io }) => {
  let lastUpdate = Date.now()
  setInterval(() => {
    // Auto restart when spider are dead
    if (Date.now() - lastUpdate > INTERVAL * 2) {
      console.log(`Spider, NOT OK`)
      process.exit()
    } else {
      console.log(`Spider, OK`)
    }
  }, 1000 * 60 * 2)
  for (;;) {
    let startTime = Date.now()
    let pending = [...vtbs]

    let spiders = Array(PARALLEL).fill().map((c, spiderId) => round({ pending, spiderId, io, db, INTERVAL }))
    let infoArray = [].concat(...await Promise.all(spiders))
    io.emit('info', infoArray)

    let endTime = Date.now()
    lastUpdate = endTime
    console.log(`WAIT: ${INTERVAL - (endTime - startTime)}`)
    await wait(INTERVAL - (endTime - startTime))
  }
}
