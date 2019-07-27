import io from 'socket.io-client'
import { inflate } from 'pako'

export const socket = io(process.env.NODE_ENV === 'development' ? 'http://localhost:8001' : 'https://api.vtbs.moe')
// export const socket = io('https://api.vtbs.moe')

export const get = (e, target) => new Promise(resolve => socket.emit(e, target, resolve))

export const getDeflate = async (e, target) => {
  let result = await get(e, target)
  result = JSON.parse(new TextDecoder().decode(inflate(result)))
  return result
}

export const getDeflateTimeSeries = async (e, target) => {
  let result = await getDeflate(e, target)
  const { keys, value } = result
  result = value.map(array => Object.assign(...keys.map((key, index) => ({
    [key]: array[index],
  }))))
  return result
}
