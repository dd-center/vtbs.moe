import Vue from 'vue'
import Vuex from 'vuex'
import router from './router'
import cache from './cache'

Vue.use(Vuex)

const rank = target => (state, getters) => [...getters.validVtbs].sort((a, b) => {
  if (!getters.info[a.mid] && !getters.info[b.mid]) {
    return 0
  }
  if (!getters.info[a.mid]) {
    return 1
  }
  if (!getters.info[b.mid]) {
    return -1
  }
  return target(state, getters.info[a.mid], getters.info[b.mid])
})

const x = new Vuex.Store({
  state: {
    online: 0,
    currentVtbs: [],
    cachedVtbs: [],
    currentInfo: {},
    cachedInfo: {},
    cachedTime: 0,
    status: {},
    logs: [],
    currentFace: {},
    cachedFace: {},
    vupMacro: [],
    vtbMacro: [],
    guardMacro: [],
    hawk: { day: [], h: [] },
    wormArray: [],
    spiderLeft: 0,
    spiderDuration: undefined,
    spiderTime: 0,
  },
  getters: {
    vtbs(state) {
      return state.currentVtbs.length ? state.currentVtbs : state.cachedVtbs
    },
    validVtbs(_, getters) {
      return getters.vtbs.filter(vtb => getters.info[vtb.mid])
    },
    info(state) {
      return Object.keys(state.currentInfo).length ? state.currentInfo : state.cachedInfo
    },
    face(state) {
      return Object.keys(state.currentFace).length ? state.currentFace : state.cachedFace
    },
    followerRank: rank((state, a, b) => b.follower - a.follower),
    riseRank: rank((state, a, b) => b.rise - a.rise),
    guardRank: rank((state, a, b) => b.guardNum - a.guardNum),
    liveRank(state, getters) {
      return getters.vtbs
        .map(({ mid }) => getters.info[mid] || { mid })
        .concat(state.wormArray)
        .sort((a, b) => {
          if (!a.uname && !b.uname) {
            return 0
          }
          if (!a.uname) {
            return 1
          }
          if (!b.uname) {
            return -1
          }
          const liveDifference = b.liveStatus * b.online - a.liveStatus * a.online
          const guardDifference = (b.guardType ? 100 * b.guardType[0] + 10 * b.guardType[1] + b.guardType[2] : b.guardNum) - (a.guardType ? 100 * a.guardType[0] + 10 * a.guardType[1] + a.guardType[2] : a.guardNum)
          const roomDifference = (b.roomid ? 1 : 0) - (a.roomid ? 1 : 0)
          const liveStatus = (b.liveStatus ? 1 : 0) - (a.liveStatus ? 1 : 0)
          return 100000000000 * (liveDifference + roomDifference + liveStatus) + 1000000 * guardDifference + b.follower - a.follower
        })
    },
  },
  mutations: {
    SOCKET_vtbs(state, data) {
      cache.put('vdb', data)
      state.currentVtbs = [...data]
    },
    loadCache(state, { vdb, info, time, face }) {
      if (vdb) {
        state.cachedVtbs = vdb
      }
      if (time) {
        state.cachedTime = time
      }
      if (info) {
        state.cachedInfo = info
      }
      if (face) {
        state.cachedFace = face
      }
    },
    async SOCKET_info(state, data) {
      let info = { ...state.currentInfo }
      let face = { ...state.currentFace }
      for (let i = 0; i < data.length; i++) {
        let { mid } = data[i]
        info[mid] = data[i]
        if (!face[mid]) {
          face[mid] = data[i].face
        }
      }
      state.currentInfo = { ...info }
      state.currentFace = { ...face }
      const cacheTime = await cache.get('time').catch(() => 0)
      if (Date.now() - cacheTime > 1000 * 60 * 10) {
        await cache.put('time', Date.now())
        await cache.put('info', state.currentInfo)
        await cache.put('face', state.currentFace)
      }
    },
    SOCKET_log(state, data) {
      state.logs.push({ time: (new Date()).toLocaleString(), data, key: `${Date.now()}${Math.random()}` })
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
    SOCKET_hawk(state, data) {
      state.hawk = data
    },
    SOCKET_worm(state, data) {
      let face = { ...state.currentFace }
      for (let i = 0; i < data.length; i++) {
        let { mid } = data[i]
        if (!face[mid]) {
          face[mid] = data[i].face
        }
      }
      state.currentFace = { ...face }
      state.wormArray = data
    },
    SOCKET_spiderLeft(state, data) {
      state.spiderLeft = data
    },
    SOCKET_spiderDuration(state, data) {
      state.spiderDuration = data
    },
    SOCKET_spiderTime(state, data) {
      state.spiderTime = data
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
  },
  actions: {},
})

window.x = x

Promise.all([
  cache.get('vdb').catch(() => undefined),
  cache.get('info').catch(() => undefined),
  cache.get('time').catch(() => undefined),
  cache.get('face').catch(() => undefined),
]).then(([vdb, info, time, face]) => x.commit('loadCache', { vdb, info, time, face }))

export default x
