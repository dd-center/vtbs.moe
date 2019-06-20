const got = require('got')

const liveHistory = async uuid => {
  let history = (await got(`https://api.vtb.wiki/v2/bilibili/live/${uuid}/history`, { json: true }).catch(() => ({}))).body
  if (!history) {
    return undefined
  }
  if (!history.Lives) {
    history.Lives = []
  }
  return history
}

module.exports = { liveHistory }
