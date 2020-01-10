const CState = require('../../state-center/api')
const cState = new CState({ name: 'vtbs.moe' })

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

cState.join('all')

cState.on('connect', () => console.log('hello State'))

const clusterAsker = cState.ask('cluster')

const getPending = () => Promise.race([clusterAsker('pending'), wait(1000)]).then(number => {
  if (typeof number === 'number') {
    return number
  } else {
    console.error('getPending timeout')
    return Infinity
  }
})

const hawkEmitter = cState.subscribe('hawk')

module.exports = { getPending, socket: cState.socket, hawkEmitter }
