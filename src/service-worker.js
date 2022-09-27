import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute, setDefaultHandler, setCatchHandler } from 'workbox-routing'
import { StaleWhileRevalidate, NetworkOnly, CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

console.log('vtbs.moe 超级 ServiceWorker！')

setDefaultHandler(
  new StaleWhileRevalidate()
)

precacheAndRoute(self.__WB_MANIFEST)

registerRoute(({ url }) => url.pathname.includes('socket.io'), new NetworkOnly())

registerRoute(
  /https:\/\/www\.google-analytics\.com/,
  new NetworkOnly()
)

registerRoute(
  /https:\/\/i[0123].hdslb.com/,
  new CacheFirst({
    cacheName: 'face',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 2333,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
)

setCatchHandler(({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/')
  }
  return Response.error()
})
