import biliAPI from 'bili-api'
import got from './cluster.js'


// eslint-disable-next-line promise/param-names
const wait = (ms: number) => new Promise((_resolve, reject) => setTimeout(reject, ms, 'timeout'))
const race = (object: any, targets: string[], options = {}, timeout = 1000 * 180) => Promise.race([biliAPI(object, targets, { got, ...options }), wait(timeout)])
export { race as biliAPI }
