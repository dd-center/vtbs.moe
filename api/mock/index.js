import './Cluster-center/index.js'
import '../../state-center/index.js'

process.env.VERBOSE = true
process.env.MOCK = true
process.env.URL = 'ws://127.0.0.1:9013'
process.env.INTERVAL = '1200'
import('../index.js')
import('./DDatHome-nodejs/index.js')
