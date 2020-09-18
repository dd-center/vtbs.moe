import biliAPI from 'bili-api'
import got from './cluster.js'

// eslint-disable-next-line promise/param-names
const wait = ms => new Promise((_resolve, reject) => setTimeout(reject, ms, 'timeout'))
export const race = (object, targets, options = {}, timeout = 1000 * 180) => Promise.race([biliAPI(object, targets, { got, ...options }), wait(timeout)])
