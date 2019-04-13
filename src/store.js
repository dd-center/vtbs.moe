import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const info = {
  state: {},
  mutations: {
    SOCKET_info(state, data) {
      state[data.mid] = data
    }
  }
}

export default new Vuex.Store({
  modules: {
    info
  },
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
