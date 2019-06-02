<template>
<el-container>
  <el-scrollbar class="scrollbarContain">
    <el-main v-loading="!vtbs.length">
      <el-table :data="searchList" stripe>
        <el-table-column>
          <template slot-scope="scope">
            <router-link :to="`/detail/${scope.row.mid}`">
              <el-button size="mini">详细</el-button>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="uname" label="名字">
        </el-table-column>
        <el-table-column prop="follower" label="关注">
        </el-table-column>
        <el-table-column prop="rise" label="日增">
        </el-table-column>
        <el-table-column prop="archiveView" label="播放量">
        </el-table-column>
        <el-table-column prop="video" label="视频数">
        </el-table-column>
        <el-table-column prop="guardNum" label="舰团">
        </el-table-column>
        <el-table-column prop="mid" label="空间id">
          <template slot-scope="scope">
            <a :href="`https://space.bilibili.com/${scope.row.mid}`" target="_blank" class="space">
              <el-tag size="small" type="info">{{scope.row.mid}}</el-tag>
            </a>
          </template>
        </el-table-column>
        <el-table-column prop="roomid" label="直播间id">
          <template slot-scope="scope">
            <a :href="`https://live.bilibili.com/${scope.row.roomid}`" v-if="scope.row.roomid" target="_blank" class="space">
              <el-tag size="small" type="info">{{scope.row.roomid}}</el-tag>
            </a>
          </template>
        </el-table-column>

      </el-table>
    </el-main>
  </el-scrollbar>
</el-container>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: ['search'],
  computed: { ...mapState(['vtbs', 'info']),
    list() {
      return this.vtbs.map(({ mid, note }) => {
        let { uname, video, roomid, follower, guardNum, rise, archiveView } = this.info[mid] || {}
        return ({ mid, note, uname, video, roomid, follower, guardNum, rise, archiveView })
      })
    },
    searchList: function() {
      let searchArray = (this.search || '').replace(/ /g, '').split('')
      let result = this.list
        .map(object => ({ ...object, index: 0, string: `${object.uname}${object.note.join('')}` }))
      searchArray.forEach(key => {
        result = result
          .map(object => ({ ...object, index: object.string.indexOf(key, object.index) + 1 }))
          .filter(({ index }) => index)
      })
      return result
    },
  },
}
</script>

<style scoped>
.el-main {
  padding: 0;
  padding-top: 1px;
  z-index: -1;
}

.scrollbarContain {
  width: 100%;
}
</style>
