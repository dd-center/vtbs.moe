import { waitStatePending } from './interface/state.js'
import { biliAPI } from './interface/biliapi.js'
import { emit } from './interface/io.js'

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

let wormArray = []

const round = async ({ vtb }, retry = 0) => {
  const log = log => (output => {
    console.log(output)
    emit(['log', output])
  })(`worm: ${log}`)

  const time = Date.now()
  const object = await biliAPI(vtb, ['mid', 'uname', 'roomid', 'sign', 'notice', 'follower', 'guardNum', 'liveStatus', 'online', 'title', 'face', 'topPhoto']).catch(console.error)
  if (!object) {
    if (retry > 5) {
      log(`SKIP W. RETRY: ${vtb.mid}`)
      return undefined
    } else {
      log(`RETRY W. PENDING: ${vtb.mid}`)
      await waitStatePending(512)
      return round({ vtb }, retry + 1)
    }
  }

  const { mid, uname, video = 0, roomid, sign, notice, face, topPhoto, archiveView = 0, follower, liveStatus, guardNum, online, title } = object
  const info = { mid, uname, video, roomid, sign, notice, face, topPhoto, archiveView, follower, liveStatus, guardNum, online, title, time, worm: true }
  log(`UPDATED: ${mid} - ${uname}`)

  return info
}

export const wormResult = () => wormArray

export const worm = async ({ vtbs }) => {
  const mids = vtbs.map(({ mid }) => mid)
  return Promise.all(await (await fetch('https://api.live.bilibili.com/room/v3/area/getRoomList?parent_area_id=9&sort_type=online&page=1&page_size=99').then(w => w.json())).data.list
    .map(({ roomid, uid, uname, online, face, title }) => ({ roomid, mid: uid, uname, online, face, title }))
    .filter(({ mid }) => !mids.includes(mid))
    .filter((_, index) => {
      if (process.env.MOCK) {
        return index < 5
      } else {
        return true
      }
    })
    .reduce(async (p, vtb) => {
      const wormArray = [...await p]
      await waitStatePending()
      return [...wormArray, round({ vtb })]
    }, []))
}
