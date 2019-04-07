const { init } = require('./database')

;
(async () => {
  let { site, info, active, live } = await init()
})()
