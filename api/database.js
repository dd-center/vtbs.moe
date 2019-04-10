const level = require('level')
const fs = require('fs-extra')

class LevelDatabase {
  constructor({ name }) {
    this.db = level(`db/${name}`, { valueEncoding: 'json' })
  }
  put(key, value) {
    return this.db.put(key, value)
  }
  get(key) {
    return this.db.get(key).catch(() => undefined)
  }
}

class ArrayDatabase extends LevelDatabase {
  constructor({ name }) {
    super({ name })
  }
}

exports.init = async () => {
  await fs.ensureDir('./db')
  let site = new LevelDatabase({ name: 'site' })

  let info = new LevelDatabase({ name: 'info' })
  let active = new ArrayDatabase({ name: 'active' })
  let live = new ArrayDatabase({ name: 'live' })
  return { site, info, active, live }
}

/*
数据库
site: 站点信息

info
mid: {mid, uname, roomid, sign, notice, recordNum, liveNum}

active
mid_recordNum: {archiveView, follower}

live
mid_liveNum: {guard, online}

all: time: timestamp
 */
