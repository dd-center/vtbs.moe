const { join } = require('path')

const vdSocket = require('./vd')

const Server = require('socket.io')
const io = new Server(9011, { serveClient: false })

const nodejieba = require('nodejieba')

nodejieba.load({
  userDict: join(__dirname, 'dictionary/userdict.txt'),
})

let danmaku = []
let analyzed = []

vdSocket.on('danmaku', ({ message }) => {
  danmaku.push(message)
  setTimeout(() => {
    danmaku.shift()
  }, 1000 * 60 * 60 * 24)
})

setInterval(() => {
  analyzed = nodejieba.extract(danmaku.join('\n'), 64)
  console.log(`Analyze ${danmaku.length}`)
}, 1000 * 60)

console.log('Hawk is here')
