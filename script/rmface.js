const level = require('level')
const vtbs = require('../api/vtbs')

let db = level(`./db`, { valueEncoding: 'json' });

(async () => {
  for (let i = 0; i < vtbs.length; i++) {
    let { mid } = vtbs[i]
    await db.del(`face_${mid}`)
  }
})()
