import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    vtbs: [],
    info: {}
  },
  getters: {
    followerRank: state => {
      return [...state.vtbs].sort((a, b) => {
        if (!state.info[a.mid] || !state.info[b.mid]) {
          return 0
        }
        return state.info[b.mid].follower - state.info[a.mid].follower
      })
    }
  },
  mutations: {
    SOCKET_vtbs(state, data) {
      state.vtbs = [...data]
    },
    SOCKET_info(state, data) {
      state.info = { ...state.info, [data.mid]: data }
    }
  },
  actions: {
    SOCKET_log({ commit }, data) {
      console.log(data)
    }
  }
})
