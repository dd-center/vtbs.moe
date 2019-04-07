const { init } = require('./database')

const vtbs = require('./vtbs')

;
(async () => {
  let { site, info, active, live } = await init()
})()
