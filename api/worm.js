const got = require('got')

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

let wormArray = []

const round = async ({ pending, wormId, io, PARALLEL, biliAPI }) => {
  const log = log => (output => {
    console.log(output)
    io.emit('log', output)
  })(`worm ${wormId}: ${log}`)

  let infoArray = []

  for (;;) {
    let vtb = pending.shift()
    let time = Date.now()
    if (vtb) {
      let object = await biliAPI([vtb, ['mid', 'uname', 'video', 'roomid', 'sign', 'notice', 'follower', 'archiveView', 'guardNum', 'liveStatus', 'online', 'title', 'face', 'topPhoto', 'areaRank'], { wait: 300 }]).catch(console.error)
      if (!object) {
        pending.push(vtb)
        log(`RETRY PENDING: ${vtb.mid}`)
        await wait(1500 + time - Date.now())
        continue
      }
      let { mid, uname, video, roomid, sign, notice, face, topPhoto, archiveView, follower, liveStatus, guardNum, areaRank, online, title } = object
      infoArray.push({ mid, uname, video, roomid, sign, notice, face, topPhoto, archiveView, follower, liveStatus, guardNum, areaRank, online, title, time, worm: true })

      log(`UPDATED: ${mid} - ${uname}`)
      await wait(500 * PARALLEL + time - Date.now())
    } else {
      return infoArray
    }
  }
}

const wormResult = () => wormArray

const worm = async ({ PARALLEL, vtbs, io, biliAPI }) => {
  let mids = vtbs.map(({ mid }) => mid)
  let pending = (await got('https://api.live.bilibili.com/room/v3/area/getRoomList?area_id=199&sort_type=income&page=1&page_size=99', { json: true })).body.data.list
    .map(({ roomid, uid, uname, online, face, title }) => ({ roomid, mid: uid, uname, online, face, title }))
    .filter(({ mid }) => !mids.includes(mid))

  let worms = Array(PARALLEL).fill().map((_c, wormId) => round({ pending, wormId, io, PARALLEL, biliAPI }))
  wormArray = [].concat(...await Promise.all(worms))
  return wormArray
}

module.exports = { worm, wormResult }
