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
  routes: [{
    path: '/',
    alias: ['/live', '/rise'],
    name: 'home',
    component: Home,
  }, {
    path: '/macro',
    name: 'macro',
    // component: Macro
    component: () =>
      import(/* webpackChunkName: "macro" */ './views/Macro.vue'),
  }, {
    path: '/dd/',
    name: 'dd',
    component: DD,
  }, {
    path: '/detail/',
    name: 'detail',
    component: List,
  }, {
    path: '/detail/:mid',
    component: () =>
      import(/* webpackChunkName: "detail" */ './views/Detail.vue'),
    props: true,
  }, {
    path: '/badge/:mid',
    component: Badge,
    props: true,
  }, {
    path: '/bot/:n',
    component: () =>
      import(/* webpackChunkName: "detail" */ './views/Bot.vue'),
    props: true,
  }, {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: About,
  }],
})
