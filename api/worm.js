const biliAPI = require('bili-api')
const got = require('got')

const race = (...args) => Promise.race([biliAPI(...args), wait(1000 * 15)])

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

let wormArray = []

const round = async ({ pending, wormId, io }) => {
  const log = log => (output => {
    console.log(output)
    io.emit('log', output)
  })(`worm ${wormId}: ${log}`)

  let infoArray = []

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
      let { mid, uname, video, roomid, sign, notice, face, topPhoto, archiveView, follower, liveStatus, guardNum, areaRank, online, title } = object
      infoArray.push({ mid, uname, video, roomid, sign, notice, face, topPhoto, archiveView, follower, liveStatus, guardNum, areaRank, online, title, time, worm: true })

      log(`UPDATED: ${mid} - ${uname}`)
      await wait(1500 + time - Date.now())
    } else {
      return infoArray
    }
  }
}

const wormResult = () => wormArray

const worm = async ({ PARALLEL, vtbs, io }) => {
  let mids = vtbs.map(({ mid }) => mid)
  let pending = (await got('https://api.live.bilibili.com/room/v3/area/getRoomList?area_id=199&sort_type=income&page=1&page_size=99', { json: true })).body.data.list
    .map(({ roomid, uid, uname, online, face, title }) => ({ roomid, mid: uid, uname, online, face, title }))
    .filter(({ mid }) => !mids.includes(mid))

  let worms = Array(PARALLEL).fill().map((c, wormId) => round({ pending, wormId, io }))
  wormArray = [].concat(...await Promise.all(worms))
  return wormArray
}

module.exports = { worm, wormResult }
