const oneHours = 1000 * 60 * 60
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const notable = ({ object, time, currentActive }) => {
  if (!currentActive) {
    return true
  }
  if (time - currentActive.time > 6 * oneHours) {
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

const core = ({ io, db, INTERVAL, parrot, biliAPI, log }) => async vtb => {
  let time = Date.now()

  let object = await biliAPI(vtb, ['mid', 'uname', 'video', 'roomid', 'sign', 'notice', 'follower', 'archiveView', 'guardNum', 'liveStatus', 'title', 'face', 'topPhoto', 'areaRank']).catch(console.error)
  if (!object) {
    log(`RETRY: ${vtb.mid}`)
    return core({ io, db, INTERVAL, parrot, biliAPI, log })(vtb)
  }

  let { mid, uname, video, roomid, sign, notice, follower, archiveView, guardNum, liveStatus, title, face, topPhoto, areaRank, bot, uuid } = object

  let averageLive = 0
  let weekLive = 0

  let liveHistory = await parrot.getLiveHistory(uuid)

  let liveNum = liveHistory.LiveTime / (60 * 5)

  if (liveHistory.Lives.length) {
    averageLive = liveHistory.LiveTime * 1000 * (1000 * 60 * 60 * 24 * 7) / (time - liveHistory.Lives[0].BeginTime * 1000)
  }

  liveHistory.Lives
    .map(({ BeginTime, EndTime }) => ({ BeginTime: BeginTime * 1000, EndTime: EndTime * 1000 }))
    .forEach(({ BeginTime, EndTime }) => {
      if (BeginTime > (time - 1000 * 60 * 60 * 24 * 7)) {
        weekLive += EndTime - BeginTime
      } else if (EndTime > (time - 1000 * 60 * 60 * 24 * 7)) {
        weekLive += EndTime - (time - 1000 * 60 * 60 * 24 * 7)
      }
    })

  let info = await db.info.get(mid)
  if (!info) {
    info = {}
  }
  let { recordNum = 0, guardChange = 0, online = 0 } = info

  let currentActive = await db.active.get({ mid, num: recordNum })
  if (notable({ object, time, currentActive })) {
    recordNum++
    io.to(mid).emit('detailActive', { mid, data: { archiveView, follower, time } })
    await db.active.put({ mid, num: recordNum, value: { archiveView, follower, time } })
  }

  let { lastLive = {} } = info

  if (liveStatus) {
    lastLive = { online, time }
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

  const newInfo = { mid, uuid, uname, video, roomid, sign, notice, face, rise, topPhoto, archiveView, follower, liveStatus, recordNum, guardNum, liveNum, lastLive, averageLive, weekLive, guardChange, guardType, areaRank, online, title, bot, time }

  io.to(mid).emit('detailInfo', { mid, data: newInfo })
  await db.info.put(mid, newInfo)

  log(`UPDATED: ${mid} - ${uname}`)
  return mid
}

module.exports = async ({ PARALLEL, INTERVAL, vdb, db, io, worm, parrot, biliAPI, infoFilter, stateGetPending }) => {
  const log = log => (output => {
    console.log(output)
    io.emit('log', output)
  })(`spider: ${log}`)

  let lastUpdate = Date.now()
  setInterval(() => {
    if (Date.now() - lastUpdate > INTERVAL * 2) {
      console.error(`Spider, NOT OK`)
    }
  }, 1000 * 60 * 5)
  for (;;) {
    let startTime = Date.now()
    let pending = [...(await vdb.get())]

    const spiders = await Promise.all(await pending.reduce(async (p, vtb) => {
      const mids = [...await p]
      while ((await stateGetPending()) > 32) {
        await wait(1000)
      }
      return [...mids, core({ io, db, INTERVAL, parrot, biliAPI, log })(vtb)]
    }, []))
    const infoArray = spiders
      .map(mid => db.info.get(mid))
      .map(infoFilter)
    io.emit('info', infoArray)

    worm({ PARALLEL, vtbs: await vdb.get(), io, biliAPI })
      .then(wormArray => io.emit('worm', wormArray))

    let endTime = Date.now()
    lastUpdate = endTime
    console.log(`WAIT: ${INTERVAL - (endTime - startTime)}`)
    await wait(INTERVAL - (endTime - startTime))
  }
}
