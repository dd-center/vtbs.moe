/* eslint no-undef: 0 */

console.log('vtbs.moe 超级 ServiceWorker 参上！')

workbox.precaching.precacheAndRoute(self.__precacheManifest, {})
