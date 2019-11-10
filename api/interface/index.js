const { vd, vdSocket } = require('./vd')
const hawk = require('./hawk')
const vdb = require('./vdb')
const { got } = require('./cluster')
const biliAPI = require('./biliapi')(got)
const { getPending: stateGetPending, socket: stateSocket } = require('./state')

module.exports = { vd, vdSocket, hawk, vdb, biliAPI, stateGetPending, stateSocket }
