import Vue from 'vue'
import Vuex from 'vuex'

import { get } from '@/socket'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    vtbs: [],
    info: {},
    face: {}
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
    },
    loadFace(state, { mid, face }) {
      state.face = { ...state.face, [mid]: face }
    }
  },
  actions: {
    SOCKET_log({ commit }, data) {
      console.log(data)
    },
    async SOCKET_vtbs({ commit }, data) {
      for (let i = 0; i < data.length; i++) {
        let mid = data[i].mid
        let face = `data:image/png;base64,${await get('face', mid)}`
        commit('loadFace', { mid, face })
      }
    }
  }
})
