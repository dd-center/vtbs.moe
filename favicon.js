const favicons = require('favicons')
const { writeFile } = require('fs').promises

favicons('favicon.png', {
  appName: 'vtbs.moe',
  icons: {
    appleStartup: { background: '#fff' },
    coast: false,
    yandex: false,
  },
}, (error, response) => {
  if (error) {
    console.log(error.message)
    return
  }
  response.images
    .map(({ name, contents }) => ({ name, contents }))
    .forEach(async ({ name, contents }) => {
      const path = name === 'favicon.ico' ? `public/${name}` : `public/img/icons/${name}`
      await writeFile(path, contents)
      console.log(path)
    })
})
