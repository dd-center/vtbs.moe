import Vue from 'vue'
import Vuex from 'vuex'
import level from 'level'

import { get } from '@/socket'

Vue.use(Vuex)

let db = level('db', { valueEncoding: 'json' })

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
    },
    loadFace(state, { mid, face }) {
      state.face = { ...state.face, [mid]: face }
    },
    SOCKET_log(state, data) {
      state.logs.push({ time: (new Date()).toLocaleString(), data })
      if (state.logs.length > 256) {
        state.logs.shift()
      }
    }
  },
  actions: {
    async SOCKET_info({ commit, state }, data) {
      let mid = data.mid
      if (!state.face[mid]) {
        let time = (new Date()).getTime()
        let face = await db.get(`face_${mid}`).catch(() => undefined)
        if (face && time - face.time < 1000 * 60 * 60 * 3) {
          commit('loadFace', { mid, face: face.data })
        } else {
          face = `data:image/png;base64,${await get('face', mid)}`
          commit('loadFace', { mid, face })
          await db.put(`face_${mid}`, { time, data: face })
        }
      }
    }
  }
})
