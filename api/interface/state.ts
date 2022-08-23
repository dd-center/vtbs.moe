import CState from '../../state-center/api.js'

export const cState = new CState({ name: `vtbs.moe-${Math.random()}` })

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

cState.join('all')

cState.on('connect', () => console.log('hello State'))

const clusterAsker = cState.ask('cluster')

export const getPending = () => Promise.race([clusterAsker('pending'), wait(1000)]).then(number => {
  if (typeof number === 'number') {
    return number
  } else {
    console.error('getPending timeout')
    return Infinity
  }
})

export const hawkEmitter = cState.subscribe('hawk')

export const socket = cState.socket

export const waitStatePending = async (n = 256) => {
  while (await getPending() > n) {
    await wait(233)
  }
}
