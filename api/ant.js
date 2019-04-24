const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const vup = async ({ vtbs, macro, info, num, INTERVAL }) => {
  for (;;) {
    let startTime = (new Date()).getTime()

    let macroNum = (await num.get('vupMacroNum') || 0)
    macroNum++

    let sum = {
      video: 0,
      coins: 0,
      archiveView: 0,
      time: startTime
    }

    for (let i = 0; i < vtbs.length; i++) {
      let { video = 0, coins = 0, archiveView = 0 } = (await info.get(vtbs[i].mid) || {})
      sum.video += video
      sum.coins += coins
      sum.archiveView += archiveView
    }

    await macro.put({ mid: 'vup', num: macroNum, value: sum })
    await num.put('vupMacroNum', macroNum)
    console.log('VUP Macroeconomics Update')
    let endTime = (new Date()).getTime()
    await wait((INTERVAL * 12) - (endTime - startTime))
  }
}

const vtb = async ({ vtbs, macro, info, num, INTERVAL }) => {
  for (;;) {
    let startTime = (new Date()).getTime()

    let macroNum = (await num.get('vtbMacroNum') || 0)
    macroNum++

    let sum = {
      liveStatus: 0,
      online: 0,
      time: startTime
    }

    for (let i = 0; i < vtbs.length; i++) {
      let { liveStatus = 0, online = 0 } = (await info.get(vtbs[i].mid) || {})
      sum.liveStatus += liveStatus
      sum.online += online
    }

    if (!sum.liveStatus) {
      let currentVTBMacro = (await macro.get({ mid: 'vtb', num: macroNum - 1 })) || {}
      if (currentVTBMacro.liveStatus === 0) {
        let beforeVTBMacro = (await macro.get({ mid: 'vtb', num: macroNum - 2 })) || {}
        if (beforeVTBMacro.liveStatus === 0) {
          macroNum--
        }
      }
    }

    await macro.put({ mid: 'vtb', num: macroNum, value: sum })
    await num.put('vtbMacroNum', macroNum)
    console.log('VTB Macroeconomics Update')
    let endTime = (new Date()).getTime()
    await wait(INTERVAL - (endTime - startTime))
  }
}

module.exports = ({ vtbs, macro, info, num, INTERVAL }) => {
  vup({ vtbs, macro, info, num, INTERVAL })
  vtb({ vtbs, macro, info, num, INTERVAL })
}
