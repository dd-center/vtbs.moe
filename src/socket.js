import io from 'socket.io-client'
import { inflate } from 'pako'

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

export const ws = ['https://api.vtbs.moe', 'https://api.tokyo.vtbs.moe', 'https://vtbs.musedash.moe']

if (!ws.includes(localStorage.ws)) {
  localStorage.ws = ws[0]
}

export const socket = io(process.env.NODE_ENV === 'development' ? 'http://localhost:8001' : localStorage.ws)
// export const socket = io(localStorage.ws)

export const ping = ws => new Promise(resolve => {
  const pingSocket = io(ws, { forceNew: true })
  pingSocket.on('connect', async () => {
    let pings = []
    await wait(500)
    await new Promise(resolve => pingSocket.emit('uptime', undefined, resolve))
    for (let i = 0; i < 5; i++) {
      await wait(500)
      let time = Date.now()
      await new Promise(resolve => pingSocket.emit('uptime', undefined, resolve))
      pings.push(Date.now() - time)
    }
    let average = Math.round(pings.reduce((a, b) => a + b) / pings.length)
    resolve([...pings, `Avg. ${average}`].join(', '))
    pingSocket.close()
  })
})

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
const passDeflate = async (...target) => await newGet('deflate', ...target) 
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
