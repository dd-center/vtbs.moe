module.exports = ({ wiki, vdb }) => {
  let liveHistoryCache = {}
  let liveHistoryLastUpdate = 0

  const updateLiveHistory = uuid => wiki.liveHistory(uuid)

  const liveHistoryWorker = async ({ io }) => {
    for (;;) {
      let vtbs = [...await vdb.get()]
      for (let i = 0; i < vtbs.length; i++) {
        let { uuid } = vtbs[i]
        let result = await updateLiveHistory(uuid)
        if (result) {
          liveHistoryCache[uuid] = result
        }
      }
      liveHistoryLastUpdate = Date.now()
      console.log('Parrot: liveHistory UPDATED')
      io.emit('log', 'Parrot: liveHistory UPDATED')
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
