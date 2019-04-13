module.exports = {
  apps: [{
    name: 'api.vtb',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false
  }]
}
