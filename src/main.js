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

import Element from 'element-ui'
import VueI18n from 'vue-i18n'


Vue.use(VueI18n)
const i18n = new VueI18n({
    locale: 'zh-CN',
    messages: {
        'zh-CN': require('./i18n/cn'),
        'en-US': require('./i18n/en')
    }
})

moment.locale('zh-cn')

Vue.use(Element, {
    i18n: (key, value) => i18n.t(key, value)
})

Vue.config.productionTip = false

if (process.env.NODE_ENV === 'production') {
    Vue.use(VueAnalytics, {
        id: 'UA-123973162-4',
        router,
    })
}

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
            return 0
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
    i18n,
    render: h => h(App),
}).$mount('#app')