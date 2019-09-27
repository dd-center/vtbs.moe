const biliAPI = require('bili-api')

// eslint-disable-next-line promise/param-names
const wait = ms => new Promise((_resolve, reject) => setTimeout(reject, ms, 'timeout'))
const race = got => (object, targets, options = {}, timeout = 1000 * 60) => Promise.race([biliAPI(object, targets, { got, ...options }), wait(timeout)])

module.exports = race
