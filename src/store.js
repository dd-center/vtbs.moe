import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    vtbs: []
  },
  mutations: {
    SOCKET_vtbs(state, data) {
      state.vtbs = [...data]
    }
  },
  actions: {
    SOCKET_log({ commit }, data) {
      console.log(data)
    }
  }
})
