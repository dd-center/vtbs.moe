const { getPending: stateGetPending, socket: stateSocket, hawkEmitter } = require('./state')
const { vd, vdSocket } = require('./vd')
const hawk = require('./hawk')(hawkEmitter)
const vdb = require('./vdb')
const { got } = require('./cluster')
const biliAPI = require('./biliapi')(got)

module.exports = { vd, vdSocket, hawk, vdb, biliAPI, stateGetPending, stateSocket }
