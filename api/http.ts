import { Duplex } from 'stream'
import { once } from 'events'

import Koa from 'koa'
import Router from '@koa/router'

import LRU from 'lru-cache'

import { roomidMap } from './database.js'
import * as vdb from './interface/vdb.js'

import cdn from '../cdn.js'

const cache = new LRU({
  maxAge: 1000 * 5,
  max: 100,
})

const alloc32UIntBuffer = (number: number) => {
  const buffer = Buffer.alloc(4)
  buffer.writeUInt32BE(number)
  return buffer
}

const alloc64UIntBuffer = (number: bigint) => {
  const buffer = Buffer.alloc(8)
  buffer.writeBigUInt64BE(number)
  return buffer
}

class BufferStream extends Duplex {
  readReady = false
  currentChunk: Buffer = undefined
  currentCallback: Function

  constructor() {
    super({ autoDestroy: true })
    this.on('drain', () => this.emit('d'))
    this.on('drainW', () => this.emit('d'))
  }

  getCurrentChunk() {
    const chunk = this.currentChunk
    this.currentChunk = undefined
    this.currentCallback()
    if (this.writableHighWaterMark > this.writableLength) {
      this.emit('drainW')
    }
    return chunk
  }

  start() {
    if (this.readReady && this.currentChunk !== undefined) {
      this.readReady = this.push(this.getCurrentChunk())
    }
  }

  _write(chunk: Buffer, _: string, callback: Function) {
    this.currentChunk = chunk
    this.currentCallback = callback
    this.start()
  }
  _read() {
    this.readReady = true
    this.start()
  }
  _final(callback: Function) {
    this.currentChunk = null
    this.currentCallback = callback
    this.start()
  }
}

export default ({ info, fullGuard, active, live, num, macro, guard }: any) => {
  const app = new Koa()

  app.use(async (ctx, next) => {
    const hit = cache.get(ctx.url)
    ctx.set('Access-Control-Allow-Origin', '*')
    if (hit) {
      ctx.body = hit
    } else {
      await next()
      if (!(ctx.body instanceof BufferStream)) {
        if (ctx.path !== '/meta/timestamp') {
          cache.set(ctx.url, ctx.body)
        }
      }
    }
  })

  const v1 = new Router({ prefix: '/v1' })

  v1.get('/vtbs', async ctx => {
    ctx.body = await vdb.get()
  })

  v1.get('/info', async ctx => {
    ctx.body = (await Promise.all((await vdb.get()).map(({ mid }: { mid: number }) => info.get(mid)))).filter(Boolean)
  })

  // TODO: Doc
  v1.get('/fullInfo', async ctx => {
    const vdbTable = await vdb.getVdbTable();
    ctx.body = (await Promise.all((await vdb.get()).map(({ mid }: { mid: number }) => info.get(mid))))
      .filter(Boolean)
      .map(({ uuid, ...rest }) => ({ ...rest, uuid, vdb: vdbTable[uuid] }))
  })

  v1.get('/short', async ctx => {
    ctx.body = (await Promise.all((await vdb.get()).map(({ mid }: { mid: number }) => info.get(mid))))
      .filter(Boolean)
      .map(({ mid, uname, roomid }) => ({ mid, uname, roomid }))
  })

  v1.get('/detail/:mid', async ctx => {
    let result = await info.get(ctx.params.mid)
    if (result) {
      ctx.body = result
    }
  })

  v1.get('/guard/:target', async ctx => {
    let result = await fullGuard.get(ctx.params.target)
    if (result) {
      ctx.body = result
    }
  })

  v1.get('/living', async ctx => {
    const vdbList = await vdb.get()
    const infos = await Promise.all(vdbList.map(({ mid }: { mid: number }) => info.get(mid)))
    const livingRooms = infos
      .filter(Boolean)
      .filter(({ liveStatus }: { liveStatus: number }) => liveStatus === 1)
      .map(({ roomid }: { roomid: number }) => roomid)
    ctx.body = livingRooms
  })

  v1.get('/room/:roomid', async ctx => {
    const { roomid } = ctx.params
    const mid = await roomidMap.get(roomid)
    if (mid) {
      const { title, online, liveStartTime } = await info.get(mid)
      ctx.body = { uid: mid, roomId: roomid, title, popularity: online, live_time: liveStartTime }
    }
  })

  app.use(v1.routes())

  const v2 = new Router({ prefix: '/v2' })

  v2.get('/bulkActive/:mid', async ctx => {
    const mid = ctx.params.mid
    const { recordNum } = await info.get(mid)
    ctx.body = await active.bulkGet({ mid, num: recordNum })
  })

  v2.get('/bulkActiveSome/:mid', async ctx => {
    const mid = ctx.params.mid
    const { recordNum } = await info.get(mid)
    const skip = recordNum - 512
    ctx.body = await active.bulkGet({ mid, num: Math.min(512, recordNum), skip: Math.max(0, skip) })
  })

  v2.get('/bulkGuard/:mid', async ctx => {
    const mid = ctx.params.mid
    const { guardChange } = await info.get(mid)
    ctx.body = await guard.bulkGet({ mid, num: guardChange })
  })

  // TODO: WRITE DOC!
  v2.get('/bulkOnline', async ctx => {
    const macroNum = await num.get('vtbMacroNum')
    ctx.body = await macro.bulkGet({ mid: 'vtb', num: macroNum })
  })

  app.use(v2.routes())

  const v3 = new Router({ prefix: '/v3' })

  v3.get('/allActive', async ctx => {
    const infos = (await Promise.all([...await vdb.get()]
      .map(({ mid }) => mid)
      .map(mid => info.get(mid)))).filter(Boolean)

    ctx.body = infos
      .map(({ mid, recordNum }) => [mid, recordNum])
      .map(([mid, recordNum]) => async () => {
        const actives = await active.bulkGet({ mid, num: recordNum })

        const head = Buffer.alloc(8)
        const datas = Buffer.concat([...actives
          .flatMap(({ archiveView, follower, time }: { archiveView: number, follower: number, time: number }) => [alloc32UIntBuffer(archiveView), alloc32UIntBuffer(follower), alloc64UIntBuffer(BigInt(time))])])

        const buffer = Buffer.concat([head, datas])
        buffer.writeUInt32BE(buffer.length)
        buffer.writeUInt32BE(mid, 4)

        return buffer
      })
      .reduce<[BufferStream, Promise<boolean>]>(([stream, p], packBuilder) => [stream, p.then(async draind => {
        if (!stream.destroyed) {
          const packP = packBuilder()
          if (!draind) {
            await once(stream, 'd')
          }
          const pack = await packP
          return stream.write(pack)
        }
      })], [new BufferStream(), Promise.resolve(true)])
      .reduce((stream: BufferStream, p: Promise<boolean>) => {
        p.then(() => stream.end())
        return stream
      })
  })

  app.use(v3.routes())

  const meta = new Router({ prefix: '/meta' })

  meta.get('/ping', ctx => {
    ctx.body = 'pong'
  })

  meta.get('/timestamp', ctx => {
    ctx.body = Date.now()
  })

  meta.get('/cdn', ctx => {
    ctx.body = cdn
  })

  app.use(meta.routes())

  const endpoint = new Router({ prefix: '/endpoint' })

  const endpointSchema = {
    schemaVersion: 1,
    label: '',
    message: 'Default message',
  }

  endpoint.get('/vtbs', async ctx => {
    ctx.body = {
      ...endpointSchema,
      message: String((await vdb.get()).length),
      label: 'vtubers',
      color: 'blue',
    }
  })

  endpoint.get('/guardNum', async ctx => {
    let guardMacroNum = await num.get('guardMacroNum')
    let { guardNum } = await macro.get({ mid: 'guard', num: guardMacroNum })
    ctx.body = {
      ...endpointSchema,
      message: String(guardNum),
      label: '舰团',
      color: 'black',
    }
  })

  // endpoint.get('/guardTime', async ctx => {
  //   ctx.body = {
  //     ...endpointSchema,
  //     message: new Date(await fullGuard.get('time')).toLocaleString(),
  //     label: '舰团更新',
  //     color: 'green',
  //   }
  // })

  endpoint.get('/live', async ctx => {
    let vtbs = [...await vdb.get()]
    let liveStatusSum = (await Promise.all([...vtbs
      .map(({ mid }) => info.get(mid))
      .map(async promise => (await promise || {}).liveStatus || 0)]))
      .reduce((a, b) => a + b)
    ctx.body = {
      ...endpointSchema,
      message: String(liveStatusSum),
      label: '直播中',
      color: 'blue',
    }
  })

  endpoint.get('/onlineSum', async ctx => {
    let vtbs = [...await vdb.get()]
    let onlineSum = (await Promise.all([...vtbs
      .map(({ mid }) => info.get(mid))
      .map(async promise => (await promise || {}).online || 0)]))
      .reduce((a, b) => a + b)
    ctx.body = {
      ...endpointSchema,
      message: String(onlineSum),
      label: '总人气',
      color: 'red',
    }
  })

  endpoint.get('/guard/:mid', async ctx => {
    const mid = ctx.params.mid
    ctx.body = {
      ...endpointSchema,
      message: String((await info.get(mid) || {}).guardNum),
      label: '舰团',
    }
  })

  endpoint.get('/online/:mid', async ctx => {
    const mid = ctx.params.mid
    let online = (await info.get(mid) || {}).online || 0
    ctx.body = {
      ...endpointSchema,
      message: String(online),
      label: '人气',
      color: online ? 'blue' : 'red',
    }
  })

  app.use(endpoint.routes())

  return app.callback()
}
