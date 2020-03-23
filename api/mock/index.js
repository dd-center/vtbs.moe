import './Cluster-center/index.js'
import '../../state-center/index.js'
import './bilibili-vtuber-live-danmaku-relay/index.js'

import '../index.js'

process.env.MOCK = true
process.env.URL = 'ws://127.0.0.1:9013'

import('./DDatHome-nodejs/index.js')
