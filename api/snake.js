export default ({ vdSocket, io, info }) => {
  let updatePending = new Set()
  vdSocket.on('LIVE', async ({ mid, roomid }) => {
    let currentInfo = await info.get(mid)
    currentInfo = { ...currentInfo, liveStatus: 1 }
    await info.put(mid, currentInfo)
    updatePending.add(mid)
    io.to(mid).emit('detailInfo', { mid, data: currentInfo })
  })
  vdSocket.on('PREPARING', async ({ mid, roomid }) => {
    let currentInfo = await info.get(mid)
    currentInfo = { ...currentInfo, liveStatus: 0, online: 0 }
    await info.put(mid, currentInfo)
    updatePending.add(mid)
    io.to(mid).emit('detailInfo', { mid, data: currentInfo })
  })
  vdSocket.on('ROUND', async ({ mid, roomid }) => {
    let currentInfo = await info.get(mid)
    currentInfo = { ...currentInfo, liveStatus: 0, online: 0 }
    await info.put(mid, currentInfo)
    updatePending.add(mid)
    io.to(mid).emit('detailInfo', { mid, data: currentInfo })
  })
  vdSocket.on('online', async ({ online, mid }) => {
    let currentInfo = await info.get(mid)
    if (online === 1) {
      currentInfo = { ...currentInfo, liveStatus: 0, online: 0}
    } else {
      currentInfo = { ...currentInfo, online }
    }
    await info.put(mid, currentInfo)
    if (online > 1) {
      updatePending.add(mid)
      io.to(mid).emit('detailInfo', { mid, data: currentInfo })
    }
    io.to(mid).emit('detailLive', { mid, data: { online, time: Date.now() } })
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
      io.emit('info', await Promise.all([...updatePending].map(mid => info.get(mid))))
      io.emit('log', `Snake: Refresh ${updatePending.size}`)
      console.log(`Snake: Refresh ${updatePending.size}`)
      updatePending = new Set()
    }
  }, 1000 * 15)
}
