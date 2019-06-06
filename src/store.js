import Vue from 'vue'
import Vuex from 'vuex'

// import { get } from '@/socket'

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
  return target(state, state.info[a.mid], state.info[b.mid])
})

export default new Vuex.Store({
  state: {
    online: 0,
    vtbs: [],
    info: {},
    status: {},
    spiderUpdate: [],
    logs: [],
    face: {},
    vupMacro: [],
    vtbMacro: [],
    guardMacro: [],
    showAll: false,
  },
  getters: {
    followerRank: rank((state, a, b) => b.follower - a.follower),
    riseRank: rank((state, a, b) => b.rise - a.rise),
    liveRank: rank((state, a, b) => {
      let liveDifference = b.liveStatus * b.online - a.liveStatus * a.online
      let guardDifference = (b.guardType ? 100 * b.guardType[0] + 10 * b.guardType[1] + b.guardType[2] : b.guardNum) - (a.guardType ? 100 * a.guardType[0] + 10 * a.guardType[1] + a.guardType[2] : a.guardNum)
      let roomDifference = (b.roomid ? 1 : 0) - (a.roomid ? 1 : 0)
      return 100000000000 * (liveDifference + roomDifference) + 1000000 * guardDifference + b.follower - a.follower
    }),
  },
  mutations: {
    SOCKET_vtbs(state, data) {
      state.vtbs = [...data]
    },
    SOCKET_info(state, data) {
      let info = { ...state.info }
      let face = { ...state.face }
      for (let i = 0; i < data.length; i++) {
        let { mid } = data[i]
        info[mid] = data[i]
        if (!face[mid]) {
          face[mid] = data[i].face
        }
      }
      state.info = { ...info }
      state.face = { ...face }
    },
    SOCKET_log(state, data) {
      state.logs.push({ time: (new Date()).toLocaleString(), data })
      if (state.logs.length > 1024) {
        state.logs.shift()
      }
    },
    SOCKET_status(state, data) {
      state.status = { ...state.status, ...data }
    },
    SOCKET_online(state, data) {
      state.online = data
    },
    SOCKET_spiderUpdate(state, data) {
      let { spiderId } = data
      let spiderUpdate = [...state.spiderUpdate]
      spiderUpdate[spiderId] = data
      state.spiderUpdate = spiderUpdate
    },
    SOCKET_vupMacro(state, data) {
      if (state.vupMacro.length) {
        state.vupMacro.push(data)
      }
    },
    SOCKET_vtbMacro(state, data) {
      if (state.vtbMacro.length) {
        state.vtbMacro.push(data)
      }
    },
    SOCKET_guardMacro(state, data) {
      if (state.guardMacro.length) {
        state.guardMacro.push(data)
      }
    },
    updateMacro(state, { vup, vtb, guard }) {
      if (vup) {
        state.vupMacro = [...vup]
      }
      if (vtb) {
        state.vtbMacro = [...vtb]
      }
      if (guard) {
        state.guardMacro = [...guard]
      }
    },
    enableShowAll(state) {
      state.showAll = true
    },
  },
  actions: {},
})
