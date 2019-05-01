import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import List from './views/List.vue'
// import Macro from './views/Macro.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [{
    path: '/',
    alias: '/live',
    name: 'home',
    component: Home,
  }, {
    path: '/macro',
    name: 'macro',
    // component: Macro
    component: () =>
      import(/* webpackChunkName: "macro" */ './views/Macro.vue'),
  }, {
    path: '/detail/',
    name: 'detail',
    component: List,
  // }, {
  //   path: '/detail/:mid',
  //   name: 'detail',
  //   // component: Macro
  //   component: () =>
  //     import(/* webpackChunkName: "macro" */ './views/About.vue'),
  //   props: true,
  }, {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ './views/About.vue'),
  }],
})
