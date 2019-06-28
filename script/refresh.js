const vdb = require('../api/interface/vdb')
const got = require('got')
vdb
  .get()
  .then(async list => {
    for (let i = 0; i < list.length; i++) {
      const { uuid } = list[i]
      console.log((await got(`https://api.vtb.wiki/webapi/vtuber/refresh?uid=${uuid}`)).body)
      console.log(i)
    }
    console.log(list.length)
    process.exit()
  })
