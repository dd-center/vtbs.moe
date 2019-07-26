const Koa = require('koa')
const Router = require('koa-router')

const LRU = require('lru-cache')

const cache = new LRU({
  maxAge: 1000 * 5,
  max: 100,
})

module.exports = ({ vdb, info, fullGuard, active, live, num, macro }) => {
  const app = new Koa()

  app.use(async (ctx, next) => {
    let hit = cache.get(ctx.url)
    if (hit) {
      ctx.body = hit
    } else {
      await next()
      cache.set(ctx.url, ctx.body)
    }
  })

  const v1 = new Router({ prefix: '/v1' })

  v1.get('/vtbs', async ctx => {
    ctx.body = await vdb.get()
  })

  v1.get('/info', async ctx => {
    ctx.body = (await Promise.all((await vdb.get()).map(({ mid }) => info.get(mid)))).filter(info => info)
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

  app.use(v2.routes())

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
