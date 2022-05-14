import { readFile } from 'fs/promises'
import level from 'level'

const db = level(`./db`, { valueEncoding: 'json' })

const json = JSON.parse(await readFile('./dbjson/db.json'))
const { vtbsdbfilecount, ...rest } = json

;
(async () => {
  const batch = db.batch()
  for (let key in rest) {
    batch.put(key, rest[key])
  }
  await batch.write()
  console.log('db')
})()


for (let i = 0; i < vtbsdbfilecount; i++) {
  (async () => {
    const j = JSON.parse(await readFile(`./dbjson/db${i}.json`))
    const batch = db.batch()
    for (let key in j) {
      batch.put(key, j[key])
    }
    await batch.write()
    console.log(i)
  })()
}
