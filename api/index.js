import spider from './spider.js'

import ant from './ant.js'

import http from 'http'

import { vd, hawk, vdb, stateSocket, io } from './interface/index.js'

import snake from './snake.js'

import { connect } from './socket.js'
import httpAPI from './http.js'

const PARALLEL = 16
const INTERVAL = 1000 * 60 * 5

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
io.on('connection', connect({ PARALLEL, INTERVAL }))
server.listen(8001)
