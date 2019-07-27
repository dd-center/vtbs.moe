import io from 'socket.io-client'
import { inflate } from 'pako'
import isArrayBuffer from 'is-array-buffer'

export const socket = io(process.env.NODE_ENV === 'development' ? 'http://localhost:8001' : 'https://api.vtbs.moe')
// export const socket = io('https://api.vtbs.moe')

export const get = async (e, target) => {
  let result = await new Promise(resolve => socket.emit(e, target, resolve))
  if (isArrayBuffer(result)) {
    result = JSON.parse(new TextDecoder().decode(inflate(result)))
  }
  if (result.timeSeries) {
    const { keys, value } = result
    result = value.map(array => Object.assign(...keys.map((key, index) => ({
      [key]: array[index],
    }))))
  }
  return result
}
