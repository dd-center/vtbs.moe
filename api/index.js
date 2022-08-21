import spider from './spider.js'

import ant from './ant.js'

import http from 'http'

import { vd } from './interface/vd.js'
import { hawk } from './interface/hawk.js'
import * as vdb from './interface/vdb.js'
import { socket as stateSocket } from './interface/state.js'
import { io } from './interface/io.js'

import snake from './snake.js'

import { connect } from './socket.js'
import httpAPI from './http.js'

const PARALLEL = 16
const INTERVAL = 1000 * 60 * 5

const handler = connect({ PARALLEL, INTERVAL })

stateSocket.on('log', log => io.to('state').emit('stateLog', log))
vdb.bind(io)
const server = http.createServer(httpAPI())
io.attach(server)
vd.attach(server)
console.log('starting spider')
spider({ INTERVAL })
snake()
hawk()
ant({ INTERVAL })
io.on('connection', handler)
server.listen(8001)
