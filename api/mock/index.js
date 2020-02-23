// process.env.VERBOSE = 'true'
process.env.URL = 'ws://127.0.0.1:9013'

require('./Cluster-center/index')
require('./DDatHome-nodejs/index')
require('../../state-center/index')
require('./bilibili-vtuber-live-danmaku-relay')
