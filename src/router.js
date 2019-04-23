import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Quize from './views/Quize.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [{
    path: '/',
    alias: '/live',
    name: 'home',
    component: Home
  }, {
    path: '/quiz',
    component: Quize
  }, {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ './views/About.vue')
  }]
})
