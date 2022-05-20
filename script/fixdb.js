import levelup from 'levelup'
import leveldown from 'leveldown'
import encode from 'encoding-down'

import * as regular from '../api/database.js'

const infos = {}
const maxRecordNum = {}
const maxGuardChange = {}

await new Promise(resolve => {
  regular.db.createReadStream()
    .on('data', ({ key, value }) => {
      if (key.startsWith('active_')) {
        const [mid, str] = key.replace('active_', '').split('_')
        const num = Number(str)
        if (!maxRecordNum[mid] || num > maxRecordNum[mid]) {
          maxRecordNum[mid] = num
        }
      } else if (key.startsWith('guard_')) {
        const [mid, str] = key.replace('guard_', '').split('_')
        const num = Number(str)
        if (!maxGuardChange[mid] || num > maxGuardChange[mid]) {
          maxGuardChange[mid] = num
        }
      } else if (key.startsWith('info_')) {
        infos[key.replace('info_', '')] = value
      }
    })
    .on('error', err => {
      console.log('Oh my!', err)
    })
    .on('close', () => {
      console.log('Stream closed')
    })
    .on('end', async () => {
      console.log('Stream ended')
      resolve()
    })
})

console.log('info collect')
const toUpdate = new Set()

Object.entries(infos)
  .forEach(async ([mid, info]) => {
    const { recordNum = undefined, guardChange = undefined } = info
    if (recordNum !== maxRecordNum[mid]) {
      if (recordNum === undefined || recordNum < maxRecordNum[mid]) {
        toUpdate.add(mid)
        infos[mid].recordNum = maxRecordNum[mid]
      }
    }
    if (guardChange !== maxGuardChange[mid]) {
      if (guardChange === undefined || guardChange < maxGuardChange[mid]) {
        toUpdate.add(mid)
        infos[mid].guardChange = maxGuardChange[mid]
      }
    }
  })

const old = levelup(encode(leveldown('./old-db'), { valueEncoding: 'json' }))

let batch = regular.db.batch()

await new Promise(resolve => {
  old.createReadStream()
    .on('data', ({ key, value }) => {
      if (key.startsWith('active_')) {
        const [mid] = key.replace('active_', '').split('_')
        if (toUpdate.has(mid)) {
          batch = batch.put(key, value)
        }
      } else if (key.startsWith('guard_')) {
        const [mid] = key.replace('guard_', '').split('_')
        if (toUpdate.has(mid)) {
          batch = batch.put(key, value)
        }
      }
    })
    .on('error', err => {
      console.log('Oh my!', err)
    })
    .on('close', () => {
      console.log('Stream closed')
    })
    .on('end', async () => {
      console.log('Stream ended')
      resolve()
    })
})

console.log('done update db')
const rewrites = [...toUpdate]
rewrites.forEach(mid => {
  batch = batch.put(`info_${mid}`, infos[mid])
})
console.log('done update info')

await batch.write()

console.log('done')
