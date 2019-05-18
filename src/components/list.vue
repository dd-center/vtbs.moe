<template>
<el-container>
  <el-scrollbar class="scrollbarContain">
    <el-main v-loading="!vtbs.length">
      <el-table :data="searchList" stripe>
        <el-table-column prop="mid" label="mid">
        </el-table-column>
        <el-table-column prop="uname" label="名字">
        </el-table-column>
        <el-table-column align="right">
          <template slot="header" slot-scope="scope">
            <el-input v-model="search" placeholder="模糊搜索"></el-input>
          </template>
          <template slot-scope="scope">
            <router-link :to="`/detail/${scope.row.mid}`">
              <el-button size="mini">Inspect</el-button>
            </router-link>
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
  data: () => ({ search: '' }),
  computed: { ...mapState(['vtbs', 'info']),
    list: function() {
      let list = []
      for (let i = 0; i < this.vtbs.length; i++) {
        let { mid, note } = this.vtbs[i]
        let { uname } = this.info[mid] || {}
        list.push({ mid, note, uname })
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
