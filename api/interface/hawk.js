import { io } from './io.js'
import { hawkEmitter } from './state.js'

export const hawk = () => {
  let analyzed = { day: [], h: [] }
  hawkEmitter.on('analyze', data => {
    analyzed = data
    io.emit('hawk', analyzed)
    io.emit('log', 'Hawk Update')
  })
  io.on('connection', socket => socket.emit('hawk', analyzed))
}
