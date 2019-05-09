import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueAnalytics from 'vue-analytics'
import VueSocketIO from 'vue-socket.io'
import './registerServiceWorker'

import './plugins/element.js'
import moment from 'moment'

import { socket } from './socket'

moment.locale('zh-cn')

Vue.config.productionTip = false

Vue.use(VueAnalytics, {
  id: 'UA-123973162-3',
  router,
})

Vue.use(new VueSocketIO({
  debug: process.env.NODE_ENV === 'development',
  // debug: false,
  connection: socket,
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_',
  },
}))

Vue.mixin({
  filters: {
    parseNumber: value => {
      if (value) {
        return value.toLocaleString()
      }
    },
    parseNumberOld: value => {
      if (value >= 1000000) {
        return `${Math.round(value / 10000)} 万`
      }
      if (value >= 10000) {
        return `${Math.round(value / 1000) / 10} 万`
      }
      return value
    },
  },
})

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
