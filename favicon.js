const favicons = require('favicons')
const fs = require('fs')

favicons('favicon.png', {
  appName: 'vtb.simon3k.moe',
  icons: {
    appleStartup: { background: '#e3d6b9' },
    coast: false,
    yandex: false
  }
}, (error, response) => {
  if (error) {
    console.log(error.message)
    return
  }
  for (let i = 0; i < response.images.length; i++) {
    let name = response.images[i].name
    let contents = response.images[i].contents
    if (name === 'favicon.ico') {
      fs.writeFileSync(`public/${name}`, contents)
    } else {
      fs.writeFileSync(`public/img/icons/${name}`, contents)
    }
  }
})
