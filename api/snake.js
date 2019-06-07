module.exports = ({ vdSocket, io, info }) => {
  let infoArray = []
  vdSocket.on('LIVE', async ({ mid, roomid }) => {
    let currentInfo = await info.get(mid)
    currentInfo = { ...currentInfo, liveStatus: 1 }
    await info.put(mid, currentInfo)
    infoArray.push(currentInfo)
    io.to(mid).emit('detailInfo', { mid, data: currentInfo })
  })
  vdSocket.on('PREPARING', async ({ mid, roomid }) => {
    let currentInfo = await info.get(mid)
    currentInfo = { ...currentInfo, liveStatus: 0 }
    await info.put(mid, currentInfo)
    infoArray.push(currentInfo)
    io.to(mid).emit('detailInfo', { mid, data: currentInfo })
  })
  vdSocket.on('ROUND', async ({ mid, roomid }) => {
    let currentInfo = await info.get(mid)
    currentInfo = { ...currentInfo, liveStatus: 0 }
    await info.put(mid, currentInfo)
    infoArray.push(currentInfo)
    io.to(mid).emit('detailInfo', { mid, data: currentInfo })
  })
  vdSocket.on('online', async ({ online, mid }) => {
    if (online > 1) {
      let currentInfo = info.get(mid)
      currentInfo = { ...await currentInfo, online }
      await info.put(mid, currentInfo)
      infoArray.push(currentInfo)
      io.to(mid).emit('detailInfo', { mid, data: currentInfo })
    }
  })
  setInterval(() => {
    if (infoArray.length) {
      io.emit('info', infoArray)
      io.emit('log', `Snake: Refresh ${infoArray.length}`)
      console.log(`Snake: Refresh ${infoArray.length}`)
      infoArray = []
    }
  }, 1000 * 15)
}
