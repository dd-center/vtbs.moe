<template>
<el-container>
  <el-main v-loading="!vtbs.length">
    <el-row>
      <el-col>
        <el-input v-model="search" placeholder="搜索"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <el-table :data="searchList" stripe>
          <el-table-column prop="mid" label="mid">
          </el-table-column>
          <el-table-column prop="uname" label="名字">
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </el-main>
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
      let searchArray = this.search.split(' ')
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

</style>
