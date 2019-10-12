import level from 'level'

const cache = level('cache', { valueEncoding: 'json' })
window.cache = cache

export default cache
