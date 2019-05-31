const Koa = require('koa')
const Router = require('koa-router')

const LRU = require('lru-cache')

const cache = new LRU({
  maxAge: 1000 * 5,
  max: 100,
})

module.exports = ({ vtbs, info, fullGuard }) => {
  const app = new Koa()
  const v1 = new Router({ prefix: '/v1' })

  v1.get('/vtbs', ctx => {
    ctx.body = vtbs
  })

  v1.get('/info', async ctx => {
    ctx.body = (await Promise.all(vtbs.map(({ mid }) => info.get(mid)))).filter(info => info)
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

  app.use(async (ctx, next) => {
    let hit = cache.get(ctx.url)
    if (hit) {
      ctx.body = hit
    } else {
      await next()
      cache.set(ctx.url, ctx.body)
    }
  })

  app.use(v1.routes())

  return app.callback()
}
