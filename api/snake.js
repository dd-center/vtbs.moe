import { vdSocket } from './interface/vd.js'
import { to, emit } from './interface/io.js'

import { info } from './database.js'

const TEN_MINUTES = 10 * 60 * 1000

const wasOnline = new Map()

const online = (id, liveStatus) => {
  wasOffline.delete(id)
  const now = Date.now()
  const data = { liveStatus, now }

  wasOnline.set(id, data)
  setTimeout(() => {
    if (wasOnline.get(id) === data) {
      wasOnline.delete(id)
    }
  }, TEN_MINUTES)
}

const onlineStatus = id => wasOnline.has(id) && wasOnline.get(id).liveStatus

export default () => {
  let updatePending = new Set()
  vdSocket.on('LIVE', async ({ mid, roomid }) => {
    online(mid, 1)
    let currentInfo = await info.get(mid)
    currentInfo = { ...currentInfo, liveStatus: 1 }
    await info.put(mid, currentInfo)
    updatePending.add(mid)
    to(mid).emit(['detailInfo', { mid, data: currentInfo }])
  })
  vdSocket.on('PREPARING', async ({ mid, roomid }) => {
    online(mid, 0)
    let currentInfo = await info.get(mid)
    currentInfo = { ...currentInfo, liveStatus: 0, online: 0 }
    await info.put(mid, currentInfo)
    updatePending.add(mid)
    to(mid).emit(['detailInfo', { mid, data: currentInfo }])
  })
  vdSocket.on('ROUND', async ({ mid, roomid }) => {
    online(mid, 0)
    let currentInfo = await info.get(mid)
    currentInfo = { ...currentInfo, liveStatus: 0, online: 0 }
    await info.put(mid, currentInfo)
    updatePending.add(mid)
    to(mid).emit(['detailInfo', { mid, data: currentInfo }])
  })
  vdSocket.on('online', async ({ online, mid }) => {
    let currentInfo = await info.get(mid)
    const liveStatus = onlineStatus(mid)
    if (online === 1) {
      if (liveStatus === 1) {
        currentInfo = { ...currentInfo, liveStatus, online }
      } else {
        currentInfo = { ...currentInfo, liveStatus: 0, online: 0 }
      }
    } else {
      if (liveStatus === 0) {
        currentInfo = { ...currentInfo, liveStatus, online: 0 }
      } else {
        currentInfo = { ...currentInfo, online }
      }
    }
    await info.put(mid, currentInfo)
    if (online > 1) {
      updatePending.add(mid)
      to(mid).emit(['detailInfo', { mid, data: currentInfo }])
    }
    to(mid).emit(['detailLive', { mid, data: { online, time: Date.now() } }])
  })
  vdSocket.on('title', async ({ mid, title }) => {
    let currentInfo = await info.get(mid)
    let { liveStatus } = currentInfo
    currentInfo = { ...currentInfo, title }
    if (liveStatus) {
      updatePending.add(mid)
    }
    await info.put(mid, currentInfo)
  })
  setInterval(async () => {
    if (updatePending.size) {
      emit(['info', await Promise.all([...updatePending].map(mid => info.get(mid)))])
      emit(['log', `Snake: Refresh ${updatePending.size}`])
      console.log(`Snake: Refresh ${updatePending.size}`)
      updatePending = new Set()
    }
  }, 1000 * 15)
}
