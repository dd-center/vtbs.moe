const level = require('level')
const sub = require('subleveldown')
const LRU = require('lru-cache')

const cache = new LRU({
  max: 100000,
})

class LevelDatabase {
  constructor({ name, db }) {
    this.name = name
    this.db = db
  }
  put(key, value) {
    cache.set(`${this.name}_${key}`, value)
    return this.db.put(`${this.name}_${key}`, value)
  }
  async get(key) {
    let value = cache.get(`${this.name}_${key}`)
    if (!value) {
      value = await this.db.get(`${this.name}_${key}`).catch(() => undefined)
      cache.set(`${this.name}_${key}`, value)
    }
    return value
  }
}

class SubLevelDatabase {
  constructor({ name, db }) {
    this.db = sub(db, name, { valueEncoding: 'json' })
  }
  put(key, value) {
    return this.db.put(key, value)
  }
  get(key) {
    return this.db.get(key).catch(() => undefined)
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

let db = level(`./db`, { valueEncoding: 'json' })
let site = new ArrayDatabase({ name: 'site', db })
let num = new LevelDatabase({ name: 'num', db })

const status = new SubLevelDatabase({ name: 'status', db })

let info = new LevelDatabase({ name: 'info', db })
let active = new ArrayDatabase({ name: 'active', db })
let live = new ArrayDatabase({ name: 'live', db }) // DEPRECATED
let guard = new ArrayDatabase({ name: 'guard', db })

let fullGuard = new LevelDatabase({ name: 'fullGuard', db })
let guardType = new LevelDatabase({ name: 'guardType', db })
let macro = new ArrayDatabase({ name: 'macro', db })

let parrotCache = new LevelDatabase({ name: 'parrot', db })

module.exports = { site, num, info, active, live, guard, macro, fullGuard, guardType, parrotCache, status }

/*
数据库
site
spider_spiderid: {spiderId, time, duration}

num
vupMacroNum: Number
vtbMacroNum: Number
guardMacroNum: Number

status
spiderLeft: Number
spiderDuration: Number
spiderTime: Number

info
mid: {mid, uuid, uname, video, roomid, sign, notice, face, rise, topPhoto, archiveView, follower, liveStatus, recordNum, guardNum, liveNum, lastLive, averageLive, weekLive, guardChange, guardType, areaRank, online, title, bot, time}
DEPRECATED: liveNum

active
mid_recordNum: {archiveView, follower, time}

live // DEPRECATED
mid_liveNum: {online, time} // DEPRECATED

guard
mid_guardChange: {guardNum, time}

fullGuard
mid: [...guards]
all: {[mid]: {uname, face, mid, dd:[[],[],[]]}}
some: {[mid]: {uname, face, mid, dd:[[],[],[]]}} guard>1
tietie: {[mid]: [[],[],[]]}
time: time
number: num

guardType
mid: [n,n,n]

macro
vup_vupMacroNum: {video, archiveView}

vtb_vtbMacroNum: {liveStatus, online}

guard_guardMacroNum: {guardNum}

all: time: timestamp

parrotCache
id: liveHistory

Increase index:
  recordNum
  liveNum // DEPRECATED, calculated
  guardChange
  vupMacroNum
  vtbMacroNum
  guardMacroNum
 */
