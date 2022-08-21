import { BrowserLevel } from 'browser-level'

const url = new URL(location.href)

export default (() => {
  if (url.searchParams.get('noCache')) {
    const get = () => Promise.reject(new Error('no Cache'))
    const put = () => undefined

    return { put, get }
  } else {
    const cache = new BrowserLevel('cache', { valueEncoding: 'json' })

    const put = (...params) => cache.put(...params)
    const get = (...params) => cache.get(...params)

    return { put, get }
  }
})()
