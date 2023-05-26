import biliAPI from 'bili-api'
import got from './cluster.js'

let salt: string

const updateSalt = async () => {
  const { salt: saltResult } = await biliAPI({}, ['salt'])
  salt = saltResult
}

await updateSalt()

setTimeout(() => {
  setInterval(updateSalt, 1000 * 60 * 60 * 1)
}, 1000 * 60 * Math.random());

// eslint-disable-next-line promise/param-names
const wait = (ms: number) => new Promise((_resolve, reject) => setTimeout(reject, ms, 'timeout'))
const race = (object: any, targets: string[], options = {}, timeout = 1000 * 180) => Promise.race([biliAPI(object, targets, { got, salt, ...options }), wait(timeout)])
export { race as biliAPI }
