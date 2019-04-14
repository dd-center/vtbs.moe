const vtbs = require('./api/vtbs')

let check = {}

for (let i = 0; i < vtbs.length; i++) {
  if (check[vtbs[i].mid]) {
    console.log(vtbs[i].mid)
  }
  check[vtbs[i].mid] = true
}
