import http from 'http'
import cluster from 'node:cluster'

import spider from './spider.js'

import ant from './ant.js'

import { vd } from './interface/vd.js'
import { hawk } from './interface/hawk.js'
import * as vdb from './interface/vdb.js'
import { socket as stateSocket } from './interface/state.js'
import { ioRaw } from './interface/io.js'

import snake from './snake.js'

import { connect } from './socket.js'
import httpAPI from './http.js'

const PARALLEL = 16
const INTERVAL = 1000 * 60 * 5

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

if (cluster.isPrimary) {
  console.log('starting spider')
  spider({ INTERVAL })
  ant({ INTERVAL })
  let worker = cluster.fork()
  while (true) {
    await wait(1000)
    if (worker.isDead()) {
      console.log('worker died')
      worker = cluster.fork()
    }
  }
} else {
  console.log('oh no, I am a worker')
  stateSocket.on('log', log => ioRaw.to('state').emit('stateLog', log))
  vdb.bind(ioRaw)
  const server = http.createServer(httpAPI())
  ioRaw.attach(server)
  vd.attach(server)
  snake()
  hawk(ioRaw)
  ioRaw.on('connection', connect({ PARALLEL, INTERVAL }))
  server.listen(8001)
}
