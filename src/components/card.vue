<template>
<el-row>
  <el-col :span="6" :xl="4" :xs="12" v-loading="!face">
    <img :src="face" class="face">
  </el-col>
  <el-col :span="12" class="hidden-sm-and-up">
    <badge :status="status" v-if="info"></badge>
  </el-col>
  <el-col :span="12" :xl="14" :xs="24" v-loading="!info">
    <el-row type="flex" justify="space-between">
      <el-col :span="12">
        <h3>
          <a :href="`http://live.bilibili.com/${roomid}`" v-if="liveStatus" target="_blank">
            <el-tag size="mini">直播中</el-tag>
          </a>
          {{uname}}
        </h3>
      </el-col>
      <el-col :span="7">
        <a :href="`https://space.bilibili.com/${mid}`" target="_blank">
          <el-button type="primary" icon="el-icon-document" size="mini">空间</el-button>
        </a>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <p>{{sign}}</p>
      </el-col>
    </el-row>
  </el-col>
  <el-col :span="6" class="hidden-xs-only">
    <badge :status="status" v-if="info"></badge>
  </el-col>
</el-row>
</template>

<script>
import badge from '@/components/badge'
import moment from 'moment'

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
      return `https://api.vtb.simon3k.moe/face/${this.mid}.jpg`
    },
    mid: function() {
      return this.vtb.mid
    },
    roomid: function() {
      return this.info && this.info.roomid
    },
    uname: function() {
      return this.info ? this.info.uname : this.vtb.note
    },
    sign: function() {
      return this.info ? this.info.sign : this.vtb.mid
    },
    status: function() {
      let object = {}
      object.follower = this.info.follower
      object.archiveView = this.info.archiveView
      if (this.$route.path.includes('live')) {
        object.guardNum = this.info.guardNum
      }
      if (this.liveStatus) {
        object.online = this.info.online
      } else if (this.$store.state.pastLive[this.vtb.mid]) {
        if (typeof this.$store.state.pastLive[this.vtb.mid] === 'number') {
          object.pastLive = moment(this.$store.state.pastLive[this.vtb.mid]).fromNow()
        }
      }
      return object
    },
    liveStatus: function() {
      return this.info ? this.info.liveStatus : false
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

h3 {
  margin: 0;
}
</style>
