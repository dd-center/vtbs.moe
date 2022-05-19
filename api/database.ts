import levelup, { LevelUp } from 'levelup'
import leveldown from 'leveldown'
import encode from 'encoding-down'
import sub from 'subleveldown'

class LevelDatabase {
  name: string
  db: LevelUp

  constructor({ name, db }: { name: string, db: LevelUp }) {
    this.name = name
    this.db = db
  }
  put(key: any, value: any) {
    return this.db.put(`${this.name}_${key}`, value)
  }
  get(key: any) {
    return this.db.get(`${this.name}_${key}`).catch(() => undefined)
  }
}

class SubLevelDatabase<K = any, V = any> {
  db: LevelUp

  constructor({ name, db }: { name: string, db: LevelUp }) {
    this.db = sub<K, V>(db, name, { valueEncoding: 'json' })
  }
  put(key: K, value: V) {
    return this.db.put(key, value)
  }
  get(key: K): Promise<V | undefined> {
    return this.db.get(key).catch(() => undefined)
  }
}

class ArrayDatabase extends LevelDatabase {
  constructor({ name, db }: { name: string, db: LevelUp }) {
    super({ name, db })
  }
  put({ mid = 0, num = 0, value }: { num: number, mid: any, value: any }) {
    return super.put(`${mid}_${num}`, value)
  }
  get({ mid = 0, num = 0 }: { num: number, mid: any }) {
    return super.get(`${mid}_${num}`)
  }
  bulkGet({ mid = 0, num = 1, skip = 0 }: { mid: any, num?: number, skip?: number }) {
    let bulk = Array(num)
    for (let i = 0; i < bulk.length; i++) {
      bulk[i] = this.get({ mid, num: i + 1 + skip })
    }
    return Promise.all(bulk)
  }
}

let db = levelup(encode(leveldown('./db'), { valueEncoding: 'json' }))
export const site = new ArrayDatabase({ name: 'site', db })
export const num = new LevelDatabase({ name: 'num', db })

export const status = new SubLevelDatabase<string, number>({ name: 'status', db })
export const roomidMap = new SubLevelDatabase<number, number>({ name: 'roomidMap', db })

export const info = new LevelDatabase({ name: 'info', db })
export const active = new ArrayDatabase({ name: 'active', db })
export const live = new ArrayDatabase({ name: 'live', db }) // DEPRECATED
export const guard = new ArrayDatabase({ name: 'guard', db })

export const fullGuard = new LevelDatabase({ name: 'fullGuard', db })
export const guardType = new LevelDatabase({ name: 'guardType', db })
export const macro = new ArrayDatabase({ name: 'macro', db })

/*
数据库
site
spider_spiderid: {spiderId, time, duration}

num
vupMacroNum: Number
vtbMacroNum: Number
guardMacroNum: Number
guardMacroKNum: Number
guardMacroKLocationNum: Number
guardMacroWeekKNum: Number

status
spiderLeft: Number
spiderDuration: Number
spiderTime: Number
lastGuardUpdate: Number

roomidMap
roomid: mid

info
mid: {mid, uuid, uname, video, roomid, sign, notice, face, rise, topPhoto, archiveView, follower, liveStatus, recordNum, guardNum, lastLive, guardChange, guardType, online, title, bot, time, liveStartTime}
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
guardMacroK_guardMacroKNum: {time: String, open, close, lowest, highest}
guardMacroWeekK_guardMacroWeekKNum: {time: String, weekNum, open, close, lowest, highest}

all: time: timestamp

Increase index:
  recordNum
  liveNum // DEPRECATED, calculated
  guardChange
  vupMacroNum
  vtbMacroNum
  guardMacroNum
 */
