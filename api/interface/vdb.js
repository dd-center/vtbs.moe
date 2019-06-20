const got = require('got')

let vtbs
let io

const update = async () => {
  let { body } = (await got('http://vdb.vtbs.moe/json/vtbs.moe.json', { json: true }).catch(() => ({})))
  if (body) {
    console.log('vdb update')
    if (vtbs && vtbs.length !== body.length) {
      io.emit('vtbs', body)
      io.emit('log', 'vdb Change')
      console.log('vdb Change')
    }
    vtbs = body
    return body
  } else {
    console.error('vdb error')
    return update()
  }
}

const get = async () => {
  if (vtbs) {
    return vtbs
  } else {
    return update()
  }
}

const bind = server => {
  io = server
}

module.exports = {
  update,
  get,
  bind,
}
