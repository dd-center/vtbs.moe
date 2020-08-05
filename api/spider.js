import { roomidMap } from './database.js'

const oneHours = 1000 * 60 * 60
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const notable = ({ object, time, currentActive }) => {
  if (!currentActive) {
    return true
  }
  if (time - currentActive.time > 32 * oneHours) {
    return true
  }
  if (Math.abs(object.follower - currentActive.follower) > 35) {
    return true
  }
  if (Math.abs(currentActive.follower - object.follower) * 1000 > currentActive.follower) {
    return true
  }
  return false
}

const coreFetch = async ({ vtb, biliAPI }) => {
  const object = await biliAPI(vtb, ['mid', 'uname', 'video', 'roomid', 'sign', 'notice', 'follower', 'guardNum', 'liveStatus', 'title', 'face', 'topPhoto', 'areaRank'])
  const { roomid } = object
  const { liveStartTime } = roomid ? await biliAPI({ roomid }, ['liveStartTime']) : { liveStartTime: 0 }
  return { ...object, liveStartTime }
}

const core = ({ io, db, INTERVAL, biliAPI, log, stateGetPending }, retry = 0) => async vtb => {
  const time = Date.now()

  const object = await coreFetch({ vtb, biliAPI }).catch(console.error)
  if (!object) {
    if (retry > 5) {
      log(`SKIP RETRY: ${vtb.mid}`)
      return vtb.mid
    } else {
      while (await stateGetPending() > 512) {
        await wait(500)
      }
      log(`RETRY: ${vtb.mid}`)
      return core({ io, db, INTERVAL, biliAPI, log, stateGetPending }, retry + 1)(vtb)
    }
  }

  const { mid, uname, video, roomid, sign, notice, follower, archiveView = 0, guardNum, liveStatus, title, face, topPhoto, areaRank, bot, uuid, liveStartTime } = object

  let info = await db.info.get(mid)
  if (!info) {
    info = {}
  }
  let { recordNum = 0, guardChange = 0, online = 0 } = info

  const currentActive = await db.active.get({ mid, num: recordNum })
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

  const dayNum = 1000 * 60 * 60 * 24 / INTERVAL
  const dayBackSkip = Math.max(recordNum - dayNum, 0)
  const totalRecordNum = Math.min(dayNum, recordNum)
  const actives = await db.active.bulkGet({ mid, num: totalRecordNum, skip: dayBackSkip })
  const todayActives = actives.filter(active => active.time > time - 1000 * 60 * 60 * 24)
  todayActives.push({ time: time - 1, follower })
  const timeDifference = time - todayActives[0].time
  const followerChange = follower - todayActives[0].follower
  const rise = Math.round(followerChange * 1000 * 60 * 60 * 24 / timeDifference)

  const guardType = await db.guardType.get(mid)

  const newInfo = { mid, uuid, uname, video, roomid, sign, notice, face, rise, topPhoto, archiveView, follower, liveStatus, recordNum, guardNum, lastLive, guardChange, guardType, areaRank, online, title, bot, time, liveStartTime }

  io.to(mid).emit('detailInfo', { mid, data: newInfo })
  await db.info.put(mid, newInfo)
  if (roomid) {
    await roomidMap.put(roomid, mid)
  }

  log(`UPDATED: ${mid} - ${uname}`)
  return mid
}

export default async ({ PARALLEL, INTERVAL, vdb, db, io, worm, biliAPI, infoFilter, stateGetPending }) => {
  const log = log => (output => {
    console.log(output)
    io.emit('log', output)
  })(`spider: ${log}`)

  let lastUpdate = Date.now()
  setInterval(() => {
    if (Date.now() - lastUpdate > INTERVAL * 2) {
      console.error('Spider, NOT OK')
    }
  }, 1000 * 60 * 5)
  while (true) {
    const startTime = Date.now()
    const pending = [...(await vdb.get())]

    let spiderLeft = pending.length
    io.emit('spiderLeft', spiderLeft)
    db.status.put('spiderLeft', spiderLeft)

    const spiders = await Promise.all(await pending.reduce(async (p, vtb) => {
      const mids = [...await p]
      while (await stateGetPending() > 256) {
        await wait(233)
      }
      return [...mids, core({ io, db, INTERVAL, biliAPI, log, stateGetPending })(vtb).then(mid => {
        spiderLeft--
        io.emit('spiderLeft', spiderLeft)
        db.status.put('spiderLeft', spiderLeft)
        return mid
      })]
    }, []))
    const infoArray = (await Promise.all(spiders.map(mid => db.info.get(mid))))
      .map(infoFilter)
    io.emit('info', infoArray)

    worm({ PARALLEL, vtbs: await vdb.get(), io, biliAPI })
      .then(wormArray => io.emit('worm', wormArray))

    const endTime = Date.now()
    lastUpdate = endTime
    io.emit('spiderDuration', endTime - startTime)
    db.status.put('spiderDuration', endTime - startTime)
    io.emit('spiderTime', endTime)
    db.status.put('spiderTime', endTime)
    console.log(`WAIT: ${INTERVAL - (endTime - startTime)}`)
    await wait(INTERVAL - (endTime - startTime))
  }
}
