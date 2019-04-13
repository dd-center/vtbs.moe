import io from 'socket.io-client'

export const socket = io(process.env.NODE_ENV === 'development' ? 'http://localhost:8001' : 'https://api.vtb.simon3k.moe')

export const get = async (e, target) => new Promise(resolve => {
  socket.emit(e, target, resolve)
})
