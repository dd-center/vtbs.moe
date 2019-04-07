const fs = require('fs-extra')

exports.init = async () => {
  await fs.ensureDir('./db')
}
