import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'
import List from './views/List.vue'
import Badge from './views/Badge.vue'
import DD from './views/DD.vue'
// import Macro from './views/Macro.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) {
      return { selector: to.hash }
    }
    if (savedPosition) {
      return savedPosition
    }
    return { x: 0, y: 0 }
  },
  routes: [{
    path: '/',
    alias: ['/live', '/rise', '/drop'],
    name: 'home',
    component: Home,
  }, {
    path: '/macro',
    name: 'macro',
    // component: Macro
    /* beautify ignore:start */
    component: () => import(/* webpackChunkName: "macro" */ './views/Macro.vue'),
    /* beautify ignore:end */
  }, {
    path: '/dd/',
    name: 'dd',
    component: DD,
  }, {
    path: '/detail/',
    name: 'detail',
    component: List,
  }, {
    path: '/tietie',
    /* beautify ignore:start */
    component: () => import(/* webpackChunkName: "tietie" */ './views/Tietie.vue'),
    /* beautify ignore:end */
  }, {
    path: '/detail/:mid',
    /* beautify ignore:start */
    component: () => import(/* webpackChunkName: "detail" */ './views/Detail.vue'),
    /* beautify ignore:end */
    props: true,
  }, {
    path: '/badge/:mid',
    component: Badge,
    props: true,
  }, {
    path: '/about',
    name: 'about',
    component: About,
  }, {
    path: '/dev',
    /* beautify ignore:start */
    component: () => import(/* webpackChunkName: "dev" */ './views/Dev.vue'),
    /* beautify ignore:end */
  }],
})
