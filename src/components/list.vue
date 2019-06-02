<template>
<el-container>
  <el-scrollbar class="scrollbarContain">
    <el-main v-loading="!vtbs.length">
      <el-table :data="searchList" stripe>
        <el-table-column align="">
          <template slot="header" slot-scope="scope">
            <el-input v-model="search" placeholder="模糊搜索"></el-input>
          </template>
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
  data: () => {
    return {
      search: ''
      }
  },
  computed: { ...mapState(['vtbs', 'info']),
    list: function() {
      let list = []
      for (let i = 0; i < this.vtbs.length; i++) {
        let { mid, note } = this.vtbs[i]
        let { uname, video, roomid, follower, guardNum, rise, archiveView  } = this.info[mid] || {}
        list.push({ mid, note, uname, video, roomid, follower, guardNum, rise, archiveView })
      }
      return list
    },
    searchList: function() {
      let searchArray = this.search.split('')
      return this.list.filter(({ uname }) => {
        if (!uname) {
          return false
        }
        for (let i = 0; i < searchArray.length; i++) {
          if (!uname.includes(searchArray[i])) {
            return false
          }
        }
        return true
      })
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
