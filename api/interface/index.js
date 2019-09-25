const { vd, vdSocket } = require('./vd')
const hawk = require('./hawk')
const vdb = require('./vdb')
const wiki = require('./api.vtb.wiki')
const { got } = require('./cluster')
const biliAPI = require('./biliapi')(got)

module.exports = { vd, vdSocket, hawk, vdb, wiki, biliAPI }
