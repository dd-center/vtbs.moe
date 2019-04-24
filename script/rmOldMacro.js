const level = require('level')

let db = level(`./db`, { valueEncoding: 'json' });

(async () => {
  let macroNum = await db.get('num_macroNum')
  for (let i = 1; i <= macroNum; i++) {
    await db.del(`macro_record_${i}`)
  }
  await db.del('num_macroNum')
})()
