/* eslint-disable camelcase */
import * as vdb from './interface/vdb.js'
import { biliAPI } from './interface/biliapi.js'
import { waitStatePending } from './interface/state.js'
import { emit, to, infoArray, updateInfoArrayMap, deleteOldInfoArray } from './interface/io.js'
import { info as infoDB, roomidMap, active as activeDB, guard as guardDB, guardType as guardTypeDB, status as statusDB, queue as queueDB } from './database.js'
import { worm } from './worm.js'

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

const dayCache = new Map()
const getDayCache = mid => dayCache.get(mid) || {}
const setDayCache = (mid, object) => {
  dayCache.set(mid, object)
  setTimeout(() => {
    if (dayCache.get(mid) === object) {
      dayCache.delete(mid)
    }
  }, 1000 * 60 * 60 * (20 + Math.random() * 4))
}
const CACHE_KEYS = ['mid', 'uname', 'video', 'roomid', 'sign', 'notice', 'face', 'topPhoto']

const coreFetch = async ({ vtb }) => {
  const { mid } = vtb
  const basic = { ...getDayCache(mid), ...vtb }
  const updateDayCache = !dayCache.has(mid)

  const object = await biliAPI(basic, ['mid', 'uname', 'video', 'roomid', 'sign', 'notice', 'follower', 'face', 'topPhoto'])

  if (updateDayCache) {
    setDayCache(mid, Object.fromEntries(CACHE_KEYS.map(k => [k, object[k]])))
  }

  const { roomid } = object
  const { liveStartTime, title, guardNum } = roomid ? await biliAPI({ roomid, mid }, ['liveStartTime', 'title', 'guardNum']) : { liveStartTime: 0, title: '', guardNum: 0 }

  return { ...object, liveStartTime, title, guardNum }
}

const core = ({ INTERVAL, log }, retry = 0) => async vtb => {
  const time = Date.now()

  const object = await coreFetch({ vtb }).catch(console.error)
  if (!object) {
    if (retry > 5) {
      log(`SKIP RETRY: ${vtb.mid}`)
      return vtb.mid
    } else {
      await wait(2000)
      await waitStatePending(512)
      log(`RETRY: ${vtb.mid}`)
      return core({ INTERVAL, log }, retry + 1)(vtb)
    }
  }

  const { mid, uname, video, roomid, sign, notice, follower, archiveView = 0, guardNum, title, face, topPhoto, bot, uuid, liveStartTime } = object

  let info = await infoDB.get(mid)
  if (!info) {
    info = {}
  }
  let { recordNum = 0, guardChange = 0, online = 0 } = info

  const currentActive = await activeDB.get({ mid, num: recordNum })
  if (notable({ object, time, currentActive })) {
    recordNum++
    to(mid).emit(['detailActive', { mid, data: { archiveView, follower, time } }])
    await activeDB.put({ mid, num: recordNum, value: { archiveView, follower, time } })
  }

  let { lastLive = {} } = info

  const liveStatus = !!online
  if (liveStatus) {
    lastLive = { online, time }
  }

  if (guardNum !== info.guardNum) {
    guardChange++
    to(mid).emit(['detailGuard', { mid, data: { guardNum, time } }])
    await guardDB.put({ mid, num: guardChange, value: { guardNum, time } })
  }

  const dayNum = 1000 * 60 * 60 * 24 / INTERVAL
  const dayBackSkip = Math.max(recordNum - dayNum, 0)
  const totalRecordNum = Math.min(dayNum, recordNum)
  const actives = await activeDB.bulkGet({ mid, num: totalRecordNum, skip: dayBackSkip })
  const oldTime = time - 1000 * 60 * 60 * 24
  const todayActives = actives.filter(active => active.time > oldTime)
  todayActives.push({ time: time - 1, follower })
  const oldActives = actives.filter(active => active.time <= oldTime)
  if (oldActives.length) {
    const { time: olderTime, follower: olderFollower } = [...oldActives].reverse()[0]
    const { time: newTime, follower: newFollower } = [...todayActives].reverse()[0]
    const averageFollower = (newFollower - olderFollower) * ((oldTime - olderTime) / (newTime - olderTime)) + olderFollower
    todayActives.unshift({ time: oldTime, follower: averageFollower })
  }
  const timeDifference = time - todayActives[0].time
  const followerChange = follower - todayActives[0].follower
  const rise = Math.round(followerChange * 1000 * 60 * 60 * 24 / timeDifference)

  const guardType = await guardTypeDB.get(mid)

  const newInfo = { mid, uuid, uname, video, roomid, sign, notice, face, rise, topPhoto, archiveView, follower, liveStatus, recordNum, guardNum, lastLive, guardChange, guardType, online, title, bot, time, liveStartTime }

  to(mid).emit(['detailInfo', { mid, data: newInfo }])
  await infoDB.put(mid, newInfo)
  if (roomid) {
    await roomidMap.put(roomid, mid)
  }
  updateInfoArrayMap(mid, newInfo)

  log(`UPDATED: ${mid} - ${uname}`)
  return mid
}


export default async ({ INTERVAL }) => {
  const log = log => (output => {
    console.log(output)
    emit(['log', output])
  })(`spider: ${log}`)

  let lastUpdate = Date.now()
  setInterval(() => {
    if (Date.now() - lastUpdate > INTERVAL * 2) {
      console.error('Spider, NOT OK')
    }
  }, 1000 * 60 * 5)
  const requeue = async () => {
    const now = Date.now()
    const vtbs = await vdb.get()
    const mids = vtbs.map(({ mid }) => mid)
    const info = (await Promise.all(mids.map((mid) => infoDB.get(mid)))).filter(Boolean)
    const follower_rank = info
      .sort((a, b) => (b.follower - a.follower))
      .slice(0, 100)
    const rise_rank = info
      .sort((a, b) => (b.rise - a.rise))
      .slice(0, 100)
    const guard_rank = info
      .sort((a, b) => (b.guardNum - a.guardNum))
      .slice(0, 100)
    const total_rank = new Set(follower_rank.concat(rise_rank).concat(guard_rank))
    await queueDB.put("1", JSON.stringify([...total_rank].map(({ mid, uuid }) => { return { "mid": mid, "uuid": uuid } })))

    let nolive = info.filter(({ lastLive: { time } = { time: 0 } }) => ((now - time) > 2592000000 && (now - time) < 7776000000))
    nolive = new Set(nolive.filter((x) => !total_rank.has(x)))
    await queueDB.put("3", JSON.stringify([...nolive].map(({ mid, uuid }) => { return { "mid": mid, "uuid": uuid } })))

    let frozen = info.filter(({ lastLive: { time } = { time: 0 } }) => ((now - time) > 7776000000))
    frozen = new Set(frozen.filter((x) => !total_rank.has(x)))
    await queueDB.put("4", JSON.stringify([...frozen].map(({ mid, uuid }) => { return { "mid": mid, "uuid": uuid } })))

    const normal = info.filter((x) => !total_rank.has(x)).filter((x) => !nolive.has(x)).filter((x) => !frozen.has(x))
    await queueDB.put("2", JSON.stringify(normal.map(({ mid, uuid }) => { return { "mid": mid, "uuid": uuid } })))
  }
  await requeue()
  setInterval(requeue, 1000 * 60 * 60 * 24)
  while (true) {
    const startTime = Date.now()
    if (await statusDB.get("queueCounter") === undefined) {
      await statusDB.put("queueCounter", 1)
    }
    let queues = ["1"]
    const queueCounter = await statusDB.get("queueCounter")
    if (queueCounter % 7 === 0) queues.push("2")
    if (queueCounter % 23 === 0) queues.push("3")
    if (queueCounter === 100) {
      queues.push("4")
      await statusDB.put("queueCounter", 1)
    } else {
      await statusDB.put("queueCounter", queueCounter + 1)
    }
    const pending = (await Promise.all(queues.map(async q => {
      let queue = await queueDB.get(q)
      return JSON.parse(queue)
    }))).flat()
    pending.push(...(await Promise.all((await vdb.get()).map(async ({ mid, uuid }) => ({ mid, uuid, info: await infoDB.get(mid) })))).filter(({ info }) => !info))
    let spiderLeft = pending.length
    emit(['spiderLeft', spiderLeft])
    await statusDB.put('spiderLeft', spiderLeft)

    await Promise.all(await pending.reduce(async (p, vtb) => {
      const mids = [...await p]
      await waitStatePending()
      return [...mids, core({ INTERVAL, log })(vtb).then(mid => {
        spiderLeft--
        emit(['spiderLeft', spiderLeft])
        statusDB.put('spiderLeft', spiderLeft)
        return mid
      })]
    }, []))
    await deleteOldInfoArray()
    emit(['info', infoArray()])

    worm({ vtbs: await vdb.get() })
      .then(wormArray => emit(['worm', wormArray]))

    const endTime = Date.now()
    lastUpdate = endTime
    emit(['spiderDuration', endTime - startTime])
    statusDB.put('spiderDuration', endTime - startTime)
    emit(['spiderTime', endTime])
    statusDB.put('spiderTime', endTime)
    console.log(`WAIT: ${INTERVAL - (endTime - startTime)}`)
    await wait(INTERVAL - (endTime - startTime))
  }
}
