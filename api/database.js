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
  put({ mid = 0, num = 0, value }) {
    return super.put(`${mid}_${num}`, value)
  }
  get({ mid = 0, num = 0 }) {
    return super.get(`${mid}_${num}`)
  }
  bulkGet({ mid = 0, num = 1, skip = 0 }) {
    let bulk = Array(num)
    for (let i = 0; i < bulk.length; i++) {
      bulk[i] = this.get({ mid, num: i + 1 + skip })
    }
    return Promise.all(bulk)
  }
}

exports.init = async () => {
  await fs.ensureDir('./db')
  let db = level(`./db`, { valueEncoding: 'json' })
  let site = new ArrayDatabase({ name: 'site', db })
  let num = new LevelDatabase({ name: 'num', db })

  let info = new LevelDatabase({ name: 'info', db })
  let active = new ArrayDatabase({ name: 'active', db })
  let live = new ArrayDatabase({ name: 'live', db })
  let guard = new ArrayDatabase({ name: 'guard', db })

  let fullGuard = new LevelDatabase({ name: 'fullGuard', db })
  let guardType = new LevelDatabase({ name: 'guardType', db })
  let macro = new ArrayDatabase({ name: 'macro', db })
  return { site, num, info, active, live, guard, macro, fullGuard, guardType }
}

/*
数据库
site
spider_spiderid: {spiderId, time, duration}

num
vupMacroNum: Number
vtbMacroNum: Number
guardMacroNum: Number

info
mid: {mid, uname, video, roomid, sign, notice, face, rise, topPhoto, archiveView, follower, liveStatus, recordNum, guardNum, liveNum, guardChange, areaRank, online, title, time}

active
mid_recordNum: {archiveView, follower, time}

live
mid_liveNum: {online, time}

guard
mid_guardChange: {guardNum, areaRank, time}

fullGuard
mid: [...guards]
all: {[mid]: {uname, face, mid, dd:[[],[],[]]}}
some: {[mid]: {uname, face, mid, dd:[[],[],[]]}} guard>1
time: time
number: num

guardType
mid: [n,n,n]

macro
vup_vupMacroNum: {video, archiveView}

vtb_vtbMacroNum: {liveStatus, online}

guard_guardMacroNum: {guardNum}

all: time: timestamp

Increase index:
  recordNum
  liveNum
  guardChange
  vupMacroNum
  vtbMacroNum
  guardMacroNum
 */
