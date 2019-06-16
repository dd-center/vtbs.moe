const { join } = require('path')

const falconGet = require('./falcon')

const Server = require('socket.io')
const io = new Server(9011, { serveClient: false })

const nodejieba = require('nodejieba')

nodejieba.load({
  userDict: join(__dirname, 'dictionary/userdict.txt'),
})

setInterval(async () => {
  const [danmakuHour, danmakuDay] = await Promise.all([falconGet('lastHour'), falconGet('lastDay')])
  let analyzed = {
    h: nodejieba.extract(danmakuHour.join('\n'), 256),
    day: nodejieba.extract(danmakuDay.join('\n'), 256),
  }
  io.emit('analyze', analyzed)
  console.log(`Analyze ${danmakuHour.length}, ${danmakuDay.length}`)
}, 1000 * 60)

console.log('Hawk is here')
