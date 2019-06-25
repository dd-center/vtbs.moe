const got = require('got')

const liveHistory = async uuid => {
  let history = (await got(`https://api.vtb.wiki/v2/bilibili/live/${uuid}/history`, { json: true, timeout: 1000 * 30 }).catch(() => ({}))).body
  if (!history) {
    return undefined
  }
  if (!history.Success) {
    history.LiveTime = 0
  }
  if (!history.Lives) {
    history.Lives = []
  }
  return history
}

module.exports = { liveHistory }
