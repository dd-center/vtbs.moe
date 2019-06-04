const biliAPI = require('bili-api')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const race = (...args) => new Promise((resolve, reject) => {
  setTimeout(reject, 1000 * 60 * 10)
  biliAPI(...args)
    .then(resolve)
})

const vup = async ({ vtbs, macro, info, num, INTERVAL, log, io }) => {
  await wait(INTERVAL - ((new Date()).getTime() - ((await macro.get({ mid: 'vup', num: (await num.get('vupMacroNum') || 0) })) || { time: 0 }).time))
  for (;;) {
    let startTime = (new Date()).getTime()

    let macroNum = (await num.get('vupMacroNum') || 0)
    macroNum++

    let sum = {
      video: 0,
      archiveView: 0,
      time: startTime,
    }

    for (let i = 0; i < vtbs.length; i++) {
      let { video = 0, archiveView = 0 } = (await info.get(vtbs[i].mid) || {})
      sum.video += video
      sum.archiveView += archiveView
    }

    await macro.put({ mid: 'vup', num: macroNum, value: sum })
    await num.put('vupMacroNum', macroNum)
    io.to('vupMacro').emit('vupMacro', sum)
    log('VUP Macroeconomics Update')
    let endTime = (new Date()).getTime()
    await wait(INTERVAL - (endTime - startTime))
  }
}

const vtb = async ({ vtbs, macro, info, num, INTERVAL, log, io }) => {
  for (;;) {
    let startTime = (new Date()).getTime()

    let macroNum = (await num.get('vtbMacroNum') || 0)
    macroNum++

    let sum = {
      liveStatus: 0,
      online: 0,
      time: startTime,
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
    io.to('vtbMacro').emit('vtbMacro', sum)
    log('VTB Macroeconomics Update')
    let endTime = (new Date()).getTime()
    await wait(INTERVAL - (endTime - startTime))
  }
}

const guard = async ({ vtbs, macro, info, num, INTERVAL, log, io }) => {
  for (;;) {
    let startTime = (new Date()).getTime()

    let macroNum = (await num.get('guardMacroNum') || 0)
    macroNum++

    let sum = {
      guardNum: 0,
      time: startTime,
    }

    for (let i = 0; i < vtbs.length; i++) {
      let { guardNum = 0 } = (await info.get(vtbs[i].mid) || {})
      sum.guardNum += guardNum
    }

    let currentGuardMacro = (await macro.get({ mid: 'guard', num: macroNum - 1 })) || {}
    if (currentGuardMacro.guardNum === sum.guardNum) {
      let beforeGuardMacro = (await macro.get({ mid: 'guard', num: macroNum - 2 })) || {}
      if (beforeGuardMacro.guardNum === sum.guardNum) {
        macroNum--
      }
    }

    await macro.put({ mid: 'guard', num: macroNum, value: sum })
    await num.put('guardMacroNum', macroNum)
    io.to('guardMacro').emit('guardMacro', sum)
    log('Guard Macroeconomics Update')
    let endTime = (new Date()).getTime()
    await wait(INTERVAL - (endTime - startTime))
  }
}

const dd = async ({ vtbs, INTERVAL, fullGuard, guardType, log }) => {
  for (;;) {
    let startTime = (new Date()).getTime()

    for (let i = 0; i < vtbs.length; i++) {
      let { mid } = vtbs[i]
      let object = await race({ mid }, ['guards', 'guardLevel'], { wait: 1000 }).catch(() => undefined)
      if (!object) {
        i--
        await wait(1000)
        log(`Guard RETRY: ${mid}`)
        continue
      }
      let { guards, guardLevel } = object
      await guardType.put(mid, guardLevel)
      await fullGuard.put(mid, guards.map(o => ({ mid: o.uid, uname: o.username, face: o.face, level: o.guard_level - 1 })))
      log(`Guard: ${i + 1}/${vtbs.length}`)
    }

    let all = {}
    let some = {}
    for (let i = 0; i < vtbs.length; i++) {
      let { mid } = vtbs[i]
      let guards = (await fullGuard.get(mid) || [])
      for (let j = 0; j < guards.length; j++) {
        let guard = guards[j]
        let { level } = guard
        if (!all[guard.mid]) {
          let { uname, face } = guard
          all[guard.mid] = { uname, face, mid: guard.mid, dd: [[], [], []] }
        }
        all[guard.mid].dd[level].push(mid)
        if (all[guard.mid].dd[0].length * 100 + all[guard.mid].dd[1].length * 10 + all[guard.mid].dd[2].length > 1) {
          some[guard.mid] = all[guard.mid]
        }
      }
    }
    await fullGuard.put('all', all)
    await fullGuard.put('some', some)
    await fullGuard.put('time', (new Date()).getTime())
    await fullGuard.put('number', Object.keys(all).length)
    log(`Guard: Count ${Object.keys(all).length}`)

    let endTime = (new Date()).getTime()
    await wait(INTERVAL - (endTime - startTime))
  }
}

module.exports = ({ vtbs, macro, info, num, fullGuard, guardType, INTERVAL, io }) => {
  const log = log => {
    console.log(log)
    io.emit('log', log)
  }
  vup({ vtbs, macro, info, num, INTERVAL: 1000 * 60 * 60 * 24, log, io })
  vtb({ vtbs, macro, info, num, INTERVAL, log, io })
  guard({ vtbs, macro, info, num, INTERVAL, log, io })
  dd({ vtbs, INTERVAL: 1000 * 60 * 60 * 24, fullGuard, guardType, log })
}
