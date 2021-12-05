import { join } from 'path'
import nodejieba from 'nodejieba'
import CState from 'state-center'
import socket from './vd.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const { load, extract } = nodejieba

const cState = new CState({ name: 'hawk' })
const analyzePublisher = cState.publish('analyze')

load({
  userDict: join(__dirname, 'dictionary/userdict.txt'),
})

const danmaku: string[] = []
const danmaku1h: string[] = []

const filter = (message: string) => {
  if (message.includes('点歌')) {
    return false
  }
  if (message.includes('角色')) {
    return false
  }
  if (message.includes('整理')) {
    return false
  }
  if (message.includes('辣条')) {
    return false
  }
  if (!message.replace(/8/g, '').length) {
    return false
  }
  if (!message.replace(/6/g, '').length) {
    return false
  }
  if (!message.replace(/h/g, '').length) {
    return false
  }
  if (message.replace(/3/g, '') === '2') {
    return false
  }
  return true
}

const store = (message: string) => {
  if (typeof message !== 'string') {
    console.error(message)
  } else {
    danmaku.push(message)
    danmaku1h.push(message)
    setTimeout(() => danmaku.shift(), 1000 * 60 * 60 * 24)
    setTimeout(() => danmaku1h.shift(), 1000 * 60 * 60)
  }
}

socket.on('danmaku', ({ message, roomid }: any) => {
  if (roomid !== 21987615 && filter(message)) {
    store(message)
  }
})

setInterval(() => {
  const analyzed = {
    day: extract(danmaku.join('\n'), 256),
    h: extract(danmaku1h.join('\n'), 256),
  }
  analyzePublisher(analyzed)
  // io.emit('analyze', analyzed)
  console.log(`Analyze (${new Date().toLocaleString()}) ${danmaku1h.length}, ${danmaku.length}`)
}, 1000 * 60)

console.log('Hawk is here')
