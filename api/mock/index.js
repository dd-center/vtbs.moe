/* eslint-disable import/first */
// process.env.VERBOSE = 'true'
process.env.URL = 'ws://127.0.0.1:9013'
process.env.MOCK = true

import './Cluster-center/index.js'
import './DDatHome-nodejs/index.js'
import '../../state-center/index.js'
import './bilibili-vtuber-live-danmaku-relay/index.js'

import '../index.js'
