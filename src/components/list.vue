<template>
<div>
  <progress class="progress is-small" max="100" v-if="!vtbs.length"></progress>
  <div class="table-container" v-else>
    <table class="table is-fullwidth is-striped is-hoverable">
      <thead>
        <tr>
          <th></th>
          <th v-for="(name, key) in sortable" :key="key"><a @click="sort(key)">{{name}}</a></th>
          <th>空间id</th>
          <th>直播间id</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="vtb in searchList" :key="vtb.mid">
          <td>
            <router-link :to="`detail/${vtb.mid}`">{{vtb.uname}}</router-link>
          </td>
          <td v-for="(_, key) in sortable" :key="`${vtb.mid}_${key}`">{{vtb[key]}}</td>
          <td><a :href="`https://space.bilibili.com/${vtb.mid}`">{{vtb.mid}}</a></td>
          <td v-if="vtb.roomid"><a :href="`https://live.bilibili.com/${vtb.roomid}`">{{vtb.roomid}}</a></td>
          <td v-else>无</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: ['search'],
  data() {
    this.sortable = {
      follower: '关注',
      rise: '日增',
      archiveView: '播放量',
      video: '视频数',
      guardNum: '舰团',
    }
    return {
      sortBy: undefined,
      order: 1,
    }
  },
  methods: {
    sort(key) {
      if (this.sortBy !== key) {
        this.sortBy = key
        this.order = 1
      } else if (this.order === 1) {
        this.order = -1
      } else {
        this.sortBy = undefined
      }
    },
  },
  computed: {
    ...mapState(['vtbs', 'info']),
    list() {
      return this.vtbs.map(({ mid, note }) => {
        let { uname, video, roomid, follower, guardNum, rise, archiveView } = this.info[mid] || {}
        return ({ mid, note, uname, video, roomid, follower, guardNum, rise, archiveView })
      })
    },
    searchList() {
      let searchArray = (this.search || '').toLowerCase().replace(/ /g, '').split('')
      let result = this.list
        .map(object => ({ ...object, index: 0, string: `${object.uname}${object.note.join('')}`.toLowerCase() }))
      searchArray.forEach(key => {
        result = result
          .map(object => ({ ...object, index: object.string.indexOf(key, object.index) + 1 }))
          .filter(({ index }) => index)
      })
      if (this.sortBy) {
        return result.sort(({
          [this.sortBy]: a,
        }, {
          [this.sortBy]: b,
        }) => (b - a) * this.order)
      } else {
        return result
      }
    },
  },
}
</script>
