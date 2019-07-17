module.exports = ({ vdSocket, io, info }) => {
  let updatePending = []
  vdSocket.on('LIVE', async ({ mid, roomid }) => {
    let currentInfo = await info.get(mid)
    currentInfo = { ...currentInfo, liveStatus: 1 }
    await info.put(mid, currentInfo)
    updatePending.push(mid)
    io.to(mid).emit('detailInfo', { mid, data: currentInfo })
  })
  vdSocket.on('PREPARING', async ({ mid, roomid }) => {
    let currentInfo = await info.get(mid)
    currentInfo = { ...currentInfo, liveStatus: 0, online: 0 }
    await info.put(mid, currentInfo)
    updatePending.push(mid)
    io.to(mid).emit('detailInfo', { mid, data: currentInfo })
  })
  vdSocket.on('ROUND', async ({ mid, roomid }) => {
    let currentInfo = await info.get(mid)
    currentInfo = { ...currentInfo, liveStatus: 0, online: 0 }
    await info.put(mid, currentInfo)
    updatePending.push(mid)
    io.to(mid).emit('detailInfo', { mid, data: currentInfo })
  })
  vdSocket.on('online', async ({ online, mid }) => {
    if (online > 1) {
      let currentInfo = info.get(mid)
      currentInfo = { ...await currentInfo, online }
      await info.put(mid, currentInfo)
      updatePending.push(mid)
      io.to(mid).emit('detailInfo', { mid, data: currentInfo })
    }
    io.to(mid).emit('detailLive', { mid, data: { online, time: Date.now() } })
  })
  setInterval(async () => {
    if (updatePending.length) {
      io.emit('info', await Promise.all(updatePending.map(mid => info.get(mid))))
      io.emit('log', `Snake: Refresh ${updatePending.length}`)
      console.log(`Snake: Refresh ${updatePending.length}`)
      updatePending = []
    }
  }, 1000 * 15)
}
