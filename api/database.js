const level = require('level')
const fs = require('fs-extra')

class LevelDatabase {
  constructor({ name, db }) {
    this.name = name
    this.db = db
  }
  put(key, value) {
    return this.db.put(`${this.name}_${key}`, value)
  }
  get(key) {
    return this.db.get(`${this.name}_${key}`).catch(() => undefined)
  }
}

class ArrayDatabase extends LevelDatabase {
  constructor({ name, db }) {
    super({ name, db })
  }
  put({ mid, num, value }) {
    return super.put(`${mid}_${num}`, value)
  }
}

exports.init = async () => {
  await fs.ensureDir('./db')
  let db = level(`./db`, { valueEncoding: 'json' })
  let site = new LevelDatabase({ name: 'site', db })

  let info = new LevelDatabase({ name: 'info', db })
  let active = new ArrayDatabase({ name: 'active', db })
  let live = new ArrayDatabase({ name: 'live', db })
  return { site, info, active, live }
}

/*
数据库
site: 站点信息

info
mid: {mid, uname, roomid, sign, notice, face, recordNum, liveNum}

active
mid_recordNum: {archiveView, follower}

live
mid_liveNum: {guardNum, online}

all: time: timestamp
 */
