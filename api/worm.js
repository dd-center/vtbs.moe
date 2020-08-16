import got from 'got'

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

let wormArray = []

const round = async ({ pending, wormId, io, PARALLEL, biliAPI }) => {
  const log = log => (output => {
    console.log(output)
    io.emit('log', output)
  })(`worm ${wormId}: ${log}`)

  const infoArray = []

  for (;;) {
    const vtb = pending.shift()
    const time = Date.now()
    if (vtb) {
      const object = await biliAPI(vtb, ['mid', 'uname', 'roomid', 'sign', 'notice', 'follower', 'guardNum', 'liveStatus', 'online', 'title', 'face', 'topPhoto', 'areaRank']).catch(console.error)
      if (!object) {
        pending.push(vtb)
        log(`RETRY PENDING: ${vtb.mid}`)
        await wait(1500 + time - Date.now())
        continue
      }
      const { mid, uname, video = 0, roomid, sign, notice, face, topPhoto, archiveView = 0, follower, liveStatus, guardNum, areaRank, online, title } = object
      infoArray.push({ mid, uname, video, roomid, sign, notice, face, topPhoto, archiveView, follower, liveStatus, guardNum, areaRank, online, title, time, worm: true })

      log(`UPDATED: ${mid} - ${uname}`)
      await wait(500 * PARALLEL + time - Date.now())
    } else {
      return infoArray
    }
  }
}

export const wormResult = () => wormArray

export const worm = async ({ PARALLEL, vtbs, io, biliAPI }) => {
  const mids = vtbs.map(({ mid }) => mid)
  const pending = (await got('https://api.live.bilibili.com/room/v3/area/getRoomList?area_id=199&sort_type=income&page=1&page_size=99').json()).data.list
    .map(({ roomid, uid, uname, online, face, title }) => ({ roomid, mid: uid, uname, online, face, title }))
    .filter(({ mid }) => !mids.includes(mid))
    .filter((_, index) => {
      if (process.env.MOCK) {
        return index < 5
      } else {
        return true
      }
    })

  const worms = Array(PARALLEL).fill().map((_c, wormId) => round({ pending, wormId, io, PARALLEL, biliAPI }))
  wormArray = [].concat(...await Promise.all(worms))
  return wormArray
}
