const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = async ({ vtbs, macro, info, num, INTERVAL }) => {
  for (;;) {
    let startTime = (new Date()).getTime()

    let macroNum = (await num.get('macroNum') || 0)
    macroNum++

    let sum = {
      video: 0,
      coins: 0,
      archiveView: 0,
      liveStatus: 0,
      online: 0,
      time: startTime
    }

    for (let i = 0; i < vtbs.length; i++) {
      let { video = 0, coins = 0, archiveView = 0, liveStatus = 0, online = 0 } = (await info.get(vtbs[i].mid) || {})
      sum.video += video
      sum.coins += coins
      sum.archiveView += archiveView
      sum.liveStatus += liveStatus
      sum.online += online
    }

    await macro.put({ mid: 'record', num: macroNum, value: sum })
    await num.put('macroNum', macroNum)
    console.log('Macroeconomics Update')
    let endTime = (new Date()).getTime()
    await wait(INTERVAL - (endTime - startTime))
  }
}
