const biliAPI = require('bili-api')

// eslint-disable-next-line promise/param-names
const wait = ms => new Promise((_resolve, reject) => setTimeout(reject, ms, 'timeout'))
const race = (args, timeout = 1000 * 15) => Promise.race([biliAPI(...args), wait(timeout)])

module.exports = race
