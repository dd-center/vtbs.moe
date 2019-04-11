import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueSocketIO from 'vue-socket.io'
import './registerServiceWorker'

import './plugins/element.js'

Vue.config.productionTip = false

Vue.use(new VueSocketIO({
  debug: process.env.NODE_ENV === 'development',
  connection: process.env.NODE_ENV === 'development' ? 'http://localhost:8001' : 'https://api.vtb.simon3k.moe',
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  }
}))

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
