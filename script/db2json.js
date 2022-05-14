import { writeFile, mkdir } from 'fs/promises'
import level from 'level'

const db = level(`./db`, { valueEncoding: 'json' })

let json = {}

let i = 1
let file = 0

await mkdir('./dbjson')

db.createReadStream()
  .on('data', ({ key, value }) => {
    i++;
    json[key] = value
    if (i % 1000000 === 0) {
      writeFile(`dbjson/db${file}.json`, JSON.stringify(json))
      file++
      json = {}
      console.log(file)
    }
  })
  .on('error', err => {
    console.log('Oh my!', err)
  })
  .on('close', () => {
    console.log('Stream closed')
  })
  .on('end', async () => {
    json.vtbsdbfilecount = file
    await writeFile('dbjson/db.json', JSON.stringify(json))
    console.log('Stream ended')
  })
