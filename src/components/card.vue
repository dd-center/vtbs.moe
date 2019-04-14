<template>
<el-container>
  <el-main>
    <el-row>
      <el-col :span="6" :xl="4" :xs="12" v-loading="!face">
        <img :src="face" class="face" v-if="face">
        <img src="@/assets/face.jpg" class="face" v-else>
      </el-col>
      <el-col :span="12" class="hidden-sm-and-up">
        <badge :status="status" v-if="info"></badge>
      </el-col>
      <el-col :span="12" :xl="14" :xs="24" v-loading="!info">
        <h1>{{uname}}</h1>
        <p>{{sign}}</p>
      </el-col>
      <el-col :span="6" class="hidden-xs-only">
        <badge :status="status" v-if="info"></badge>
      </el-col>
    </el-row>
  </el-main>
</el-container>
</template>

<script>
import badge from '@/components/badge'

import 'element-ui/lib/theme-chalk/display.css'

export default {
  components: {
    badge
  },
  props: {
    vtb: Object
  },
  computed: {
    info: function() {
      return this.$store.state.info[this.vtb.mid]
    },
    face: function() {
      return this.$store.state.face[this.vtb.mid]
    },
    uname: function() {
      return this.info ? this.info.uname : this.vtb.note
    },
    sign: function() {
      return this.info ? this.info.sign : this.vtb.mid
    },
    status: function() {
      let follower = this.info.follower
      let archiveView = this.info.archiveView
      return { follower, archiveView }
    }
  }
}
</script>

<style scoped>
.face {
  width: 120px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
}
</style>
