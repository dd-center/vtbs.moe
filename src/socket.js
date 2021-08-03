import io from 'socket.io-client'
import { inflate } from 'pako'
import ws from '../cdn'

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const getAverage = a => Math.round(a.reduce((a, b) => a + b) / a.length)

export { default as ws } from '../cdn'

if (!ws.includes(localStorage.ws)) {
  localStorage.ws = ws[0]
}

// export const socket = io(process.env.NODE_ENV === 'development' ? 'http://localhost:8001' : localStorage.ws)
export const socket = io(localStorage.ws)

socket.on('connect', () => {
  socket.emit('hash', COMMIT_HASH)
  socket.emit('cdn', localStorage.ws)
})

export const saveWsCDN = cdn => {
  localStorage.selectedCDN = 'true'
  localStorage.ws = cdn
}

const rawPing = ws => new Promise(resolve => {
  const pingSocket = io(ws, { forceNew: true })
  let done = false
  setTimeout(() => {
    if (!done) {
      resolve([Infinity])
    }
  }, 1000 * 60)
  pingSocket.on('connect', async () => {
    const pings = []
    await wait(500)
    await new Promise(resolve => pingSocket.emit('uptime', undefined, resolve))
    for (let i = 0; i < 5; i++) {
      await wait(500)
      const time = Date.now()
      await new Promise(resolve => pingSocket.emit('uptime', undefined, resolve))
      pings.push(Date.now() - time)
    }
    resolve(pings)
    done = true
    pingSocket.close()
  })
})

const autoCDN = async () => {
  const result = await Promise.all(ws.map(rawPing))
  const average = result.map(getAverage)
  average[0] *= 1.5
  return ws[average.reduce(([ping, index], newPing, newIndex) => ping < newPing ? [ping, index] : [newPing, newIndex], [Infinity])[1]]
}

if ((localStorage.selectedCDN !== 'true' && Math.random() > 0.9)) {
  autoCDN().then(cdn => {
    localStorage.ws = cdn
  })
}

export const ping = async ws => {
  const result = await rawPing(ws)
  const average = getAverage(result)
  return [...result, `Avg. ${average}`].join(', ')
}

export const get = (e, target) => new Promise(resolve => socket.emit(e, target, resolve))

/* beautify ignore:start */
export const getDeflate = async (e, target) => get(e, target)
  |> await #
  |> inflate
  |> new TextDecoder().decode(#)
  |> JSON.parse
/* beautify ignore:end */

export const getDeflateTimeSeries = async (e, target) => {
  let result = await getDeflate(e, target)
  const { keys, value } = result
  result = value.map(array => Object.assign(...keys.map((key, index) => ({
    [key]: array[index],
  }))))
  return result
}

const newGet = (...target) => get('new', target)

/* beautify ignore:start */
export const passDeflate = async (...target) => await newGet('deflate', ...target)
  |> await #
  |> inflate
  |> new TextDecoder().decode(#)
  |> JSON.parse
/* beautify ignore:end */

const passArrayMinimizer = async (...target) => {
  const result = await passDeflate('arrayMinimizer', ...target)
  const { keys, value } = result
  return value.map(array => Object.fromEntries(keys.map((key, index) => [key, array[index]])))
}

export const getFullInfo = () => passArrayMinimizer('fullInfo')
export const getVdbTable = () => passDeflate('vdbTable')
export const getMacroK = () => passArrayMinimizer('guardMacroK', false)
export const getMacroWeekK = () => passArrayMinimizer('guardMacroK', true)
