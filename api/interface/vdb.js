const got = require('got')

let vdb
let vdbTable
let vtbs
let io

const update = async () => {
  const body = await got('https://vdb.vtbs.moe/json/list.json').json().catch(console.error)
  if (body) {
    console.log('vdb update')
    vdb = body
    vdbTable = Object.fromEntries(body.vtbs.map(v => [v.uuid, v]))
    const moe = Object.values(Object.fromEntries(body.vtbs.flatMap(({ accounts, uuid }) => accounts
      .filter(({ platform }) => platform === 'bilibili')
      .map(({ id }) => {
        return [id, {
          mid: Number(id),
          uuid,
        }]
      }))))
    if (vtbs && vtbs.length !== moe.length) {
      if (io) {
        io.emit('vtbs', moe)
        io.emit('log', 'vdb Change')
      }
      console.log('vdb Change')
    }
    vtbs = moe
    return { moe, vdb, vdbTable }
  } else {
    console.error('vdb error')
    return update()
  }
}

const get = async () => {
  if (vtbs) {
    return vtbs
  } else {
    return (await update()).moe
  }
}

const getVdbTable = async () => {
  if (vdbTable) {
    return vdbTable
  } else {
    return (await update()).vdbTable
  }
}

setInterval(update, 1000 * 60)

const bind = server => {
  io = server
}

module.exports = {
  update,
  get,
  bind,
  getVdbTable,
}
