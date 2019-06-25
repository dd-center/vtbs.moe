const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = ({ wiki, vdb }) => {
  let liveHistoryCache = {}
  let liveHistoryLastUpdate = 0

  const updateLiveHistory = uuid => wiki.liveHistory(uuid)

  const liveHistoryWorker = async ({ io }) => {
    for (;;) {
      let startTime = Date.now()
      let vtbs = [...await vdb.get()]
      for (let i = 0; i < vtbs.length; i++) {
        let { uuid } = vtbs[i]
        let result = await updateLiveHistory(uuid)
        if (result) {
          liveHistoryCache[uuid] = result
        }
        io.emit('parrotNow', i + 1)
      }
      liveHistoryLastUpdate = Date.now()
      console.log('Parrot: liveHistory UPDATED')
      io.emit('log', 'Parrot: liveHistory UPDATED')
      await wait(startTime + 1000 * 60 * 2 - Date.now())
    }
  }

  const start = ({ io }) => {
    liveHistoryWorker({ io })
  }

  const getLiveHistory = async uuid => {
    let result = liveHistoryCache[uuid]
    if (!result) {
      result = await updateLiveHistory(uuid)
    }
    if (!result) {
      return getLiveHistory(uuid)
    } else {
      liveHistoryCache[uuid] = result
      return result
    }
  }

  const lastUpdate = () => ({ liveHistoryLastUpdate })

  return {
    start,
    getLiveHistory,
    lastUpdate,
  }
}
