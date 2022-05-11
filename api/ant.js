import { guardMacroK } from './unit/index.js'
import { waitStatePending } from './interface/index.js'
import { status } from './database.js'

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const vup = async ({ vdb, macro, info, num, INTERVAL, log, io }) => {
  await wait(INTERVAL - ((new Date()).getTime() - ((await macro.get({ mid: 'vup', num: (await num.get('vupMacroNum') || 0) })) || { time: 0 }).time))
  for (;;) {
    const startTime = (new Date()).getTime()

    let macroNum = (await num.get('vupMacroNum') || 0)
    macroNum++

    const sum = {
      video: 0,
      archiveView: 0,
      time: startTime,
    }

    const vtbs = await vdb.getPure()

    for (let i = 0; i < vtbs.length; i++) {
      const { video = 0, archiveView = 0 } = (await info.get(vtbs[i].mid) || {})
      sum.video += video
      sum.archiveView += archiveView
    }

    await macro.put({ mid: 'vup', num: macroNum, value: sum })
    await num.put('vupMacroNum', macroNum)
    io.to('vupMacro').emit('vupMacro', sum)
    log('VUP Macroeconomics Update')
    const endTime = (new Date()).getTime()
    await wait(INTERVAL - (endTime - startTime))
  }
}

const vtb = async ({ vdb, macro, info, num, INTERVAL, log, io }) => {
  for (;;) {
    const startTime = (new Date()).getTime()

    let macroNum = (await num.get('vtbMacroNum') || 0)
    macroNum++

    const sum = {
      liveStatus: 0,
      online: 0,
      time: startTime,
    }

    const vtbs = await vdb.getPure()

    for (let i = 0; i < vtbs.length; i++) {
      const { liveStatus = 0, online = 0 } = (await info.get(vtbs[i].mid) || {})
      sum.liveStatus += liveStatus
      sum.online += online
    }

    if (!sum.liveStatus) {
      const currentVTBMacro = (await macro.get({ mid: 'vtb', num: macroNum - 1 })) || {}
      if (currentVTBMacro.liveStatus === 0) {
        const beforeVTBMacro = (await macro.get({ mid: 'vtb', num: macroNum - 2 })) || {}
        if (beforeVTBMacro.liveStatus === 0) {
          macroNum--
        }
      }
    }

    await macro.put({ mid: 'vtb', num: macroNum, value: sum })
    await num.put('vtbMacroNum', macroNum)
    io.to('vtbMacro').emit('vtbMacro', sum)
    log('VTB Macroeconomics Update')
    const endTime = (new Date()).getTime()
    await wait(INTERVAL - (endTime - startTime))
  }
}

const guard = async ({ vdb, macro, info, num, INTERVAL, log, io }) => {
  for (;;) {
    const startTime = (new Date()).getTime()
    const pause = wait(INTERVAL)

    let macroNum = (await num.get('guardMacroNum') || 0)
    macroNum++

    const sum = {
      guardNum: 0,
      time: startTime,
    }

    const vtbs = await vdb.getPure()

    for (let i = 0; i < vtbs.length; i++) {
      const { guardNum = 0 } = (await info.get(vtbs[i].mid) || {})
      sum.guardNum += guardNum
    }

    const currentGuardMacro = (await macro.get({ mid: 'guard', num: macroNum - 1 })) || {}
    if (currentGuardMacro.guardNum === sum.guardNum) {
      const beforeGuardMacro = (await macro.get({ mid: 'guard', num: macroNum - 2 })) || {}
      if (beforeGuardMacro.guardNum === sum.guardNum) {
        macroNum--
      }
    }

    await macro.put({ mid: 'guard', num: macroNum, value: sum })
    await num.put('guardMacroNum', macroNum)
    await guardMacroK(macroNum)
    io.to('guardMacro').emit('guardMacro', sum)
    log('Guard Macroeconomics Update')
    await pause
  }
}

const dd = async ({ vdb, INTERVAL, fullGuard, guardType, log, biliAPI }) => {
  const core = (mid, tries = 0) => biliAPI({ mid }, ['guards', 'guardLevel'], 1000 * 60 * 30).catch(async e => {
    console.error(e)
    if (tries < 2) {
      log(`Guard RETRY: ${mid}`)
      await waitStatePending(384)
      return core(mid, tries + 1)
    } else {
      log(`Guard FAIL: ${mid}`)
      return { guardLevel: undefined }
    }
  })
  while (true) {
    const lastGuardUpdate = await status.get('guardMacroNum') || 0
    const now = Date.now()
    const nextUpdate = lastGuardUpdate + INTERVAL
    const waitTime = nextUpdate - now
    if (waitTime > 0) {
      log(`Guard Wait ${waitTime}`)
      await wait(nextUpdate - now)
    }

    const vtbs = (await vdb.getPure())
    const mids = vtbs.map(({ mid }) => mid)

    await mids
      .reduce(([last = { core: Promise.resolve() }, ...rest], mid) => {
        return [{ mid, core: last.core.then(() => waitStatePending(384)).then(() => core(mid)) }, last.mid && last, ...rest]
      }, [])
      .filter(Boolean)
      .reverse()
      .reduce(async (p, object, i) => {
        await p
        const { mid, core } = object
        const { guards, guardLevel } = await core
        if (guardLevel) {
          await guardType.put(mid, guardLevel)
          await fullGuard.put(mid, guards.map(o => ({ mid: o.uid, uname: o.username, face: o.face, level: o.guard_level - 1 })))
          log(`Guard: ${i + 1}/${vtbs.length}`)
        }
      }, Promise.resolve(233))

    const all = {}
    for (let i = 0; i < vtbs.length; i++) {
      const { mid } = vtbs[i]
      const guards = (await fullGuard.get(mid) || [])
      for (let j = 0; j < guards.length; j++) {
        const guard = guards[j]
        const { level } = guard
        if (!all[guard.mid]) {
          const { uname, face } = guard
          all[guard.mid] = { uname, face, mid: guard.mid, dd: [[], [], []] }
        }
        all[guard.mid].dd[level].push(mid)
      }
    }
    await fullGuard.put('all', all)
    await fullGuard.put('some', Object.fromEntries(Object.entries(all).filter(([_mid, { dd }]) => dd[0].length * 100 + dd[1].length * 10 + dd[2].length > 1)))
    await fullGuard.put('tietie', Object.fromEntries(Object.entries(all)
      .filter(([mid]) => mids.includes(Number(mid)))
      .map(([mid, { dd }]) => [mid, dd.map(ddg => ddg.filter(mid => mids.includes(mid)))]),
    ))
    await fullGuard.put('time', (new Date()).getTime())
    await fullGuard.put('number', Object.keys(all).length)
    log(`Guard: Count ${Object.keys(all).length}`)

    await status.put('guardMacroNum', Date.now())
  }
}

export default ({ vdb, macro, info, num, fullGuard, guardType, INTERVAL, io, biliAPI }) => {
  const log = log => {
    console.log(log)
    io.emit('log', log)
  }
  vup({ vdb, macro, info, num, INTERVAL: 1000 * 60 * 60 * 24, log, io })
  vtb({ vdb, macro, info, num, INTERVAL, log, io })
  guard({ vdb, macro, info, num, INTERVAL, log, io })
  dd({ vdb, INTERVAL: 1000 * 60 * 60 * 24, fullGuard, guardType, log, biliAPI })
}
