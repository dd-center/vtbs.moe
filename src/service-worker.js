/* eslint no-undef: 0 */

console.log('vtbs.moe 超级 ServiceWorker 参上！')

workbox.routing.setDefaultHandler(
  new workbox.strategies.StaleWhileRevalidate()
)

workbox.precaching.precacheAndRoute(self.__precacheManifest, {})

workbox.routing.registerRoute(
  /https:\/\/api\.vtbs\.moe/,
  new workbox.strategies.NetworkOnly()
)

workbox.routing.setCatchHandler(({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/')
  }
  return Response.error()
})
