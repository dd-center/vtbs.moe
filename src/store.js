import Vue from 'vue'
import Vuex from 'vuex'

import { get } from '@/socket'

Vue.use(Vuex)

const rank = target => state => [...state.vtbs].sort((a, b) => {
  if (!state.info[a.mid] && !state.info[b.mid]) {
    return 0
  }
  if (!state.info[a.mid]) {
    return 1
  }
  if (!state.info[b.mid]) {
    return -1
  }
  return target(state, a, b)
})

export default new Vuex.Store({
  state: {
    vtbs: [],
    info: {},
    face: {},
    pastLive: {},
    logs: []
  },
  getters: {
    followerRank: rank((state, a, b) => state.info[b.mid]['follower'] - state.info[a.mid]['follower']),
    liveRank: rank((state, a, b) => 100000000000 * (state.info[b.mid].liveStatus * state.info[b.mid].online - state.info[a.mid].liveStatus * state.info[a.mid].online) + 1000000 * (state.info[b.mid]['guardNum'] - state.info[a.mid]['guardNum']) + state.info[b.mid]['follower'] - state.info[a.mid]['follower'])
  },
  mutations: {
    SOCKET_vtbs(state, data) {
      state.vtbs = [...data]
    },
    SOCKET_info(state, data) {
      state.info = { ...state.info, [data.mid]: data }
      if (!state.face[data.mid]) {
        state.face = { ...state.face, [data.mid]: `https://api.vtb.simon3k.moe/face/${data.mid}.jpg` }
      }
    },
    loadPastLive(state, { mid, time }) {
      state.pastLive = { ...state.pastLive, [mid]: time }
    },
    SOCKET_log(state, data) {
      state.logs.push({ time: (new Date()).toLocaleString(), data })
      if (state.logs.length > 256) {
        state.logs.shift()
      }
    }
  },
  actions: {
    async SOCKET_info({ commit, state, dispatch }, { mid, liveNum }) {
      if (liveNum) {
        dispatch('updatePastLive', { mid, liveNum })
      }
    },
    async updatePastLive({ commit }, { mid, liveNum }) {
      let { time } = await get('live', { mid, num: liveNum })
      commit('loadPastLive', { mid, time })
    }
  }
})
