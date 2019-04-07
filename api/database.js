const level = require('level')
const fs = require('fs-extra')

class LevelDatabase {
  constructor({ name }) {
    this.db = level(`db/${name}`, { valueEncoding: 'json' })
  }
  put(key, value) {
    return this.db.put(key, value)
  }
  get(key) {
    return this.db.get(key).catch(() => undefined)
  }
}

exports.init = async () => {
  await fs.ensureDir('./db')
  let sign = new LevelDatabase({ name: 'sign' })
}
