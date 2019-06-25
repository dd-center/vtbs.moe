<template>
<div>
  <el-row>
    <el-col :span="6" :xl="4" :xs="12" v-loading="!face">
      <div class="discover" v-if="hover && !worm">
        <router-link :to="`/detail/${mid}`">
          <span class="el-icon-discover discoverButton"></span>
        </router-link>
      </div>
      <img :src="`${face.replace('http:','https:')}@256h_256w`" class="face" v-if="face">
      <img src="@/assets/face.jpg" class="face" v-else>
    </el-col>
    <el-col :span="12" class="hidden-sm-and-up">
      <badge :status="status" v-if="info"></badge>
    </el-col>
    <el-col :span="12" :xl="14" :xs="24" v-loading="!info">
      <h3>
        <a :href="`https://live.bilibili.com/${roomid}`" v-if="liveStatus" target="_blank">
          <el-tag size="small">直播中</el-tag>
        </a>
        <a :href="`https://live.bilibili.com/${roomid}`" v-else-if="roomid && livePage" target="_blank">
          <el-tag size="small" type="info">没播</el-tag>
        </a>
        {{uname}}
        <el-tooltip effect="dark" v-if="worm" content="如何扩充名单: 关于" placement="top-start">
          <router-link to="about">
            <el-tag size="small" type="info">未收录</el-tag>
          </router-link>
        </el-tooltip>
        <a :href="`https://space.bilibili.com/${mid}`" target="_blank" class="space">
          <el-tag size="small" type="info">{{mid}}</el-tag>
        </a>
      </h3>
      <span v-if="liveStatus" class="el-icon-ship">{{title}}</span>
      <p>{{sign}}</p>
    </el-col>
    <el-col :span="6" class="hidden-xs-only" v-loading="!info.uname">
      <badge :status="status" v-if="info.uname"></badge>
    </el-col>
  </el-row>
  <div class="hidden-sm-and-up">
    <el-divider></el-divider>
  </div>
</div>
</template>

<script>
import badge from '@/components/badge'
import moment from 'moment'

export default {
  components: {
    badge,
  },
  props: {
    vtb: Object,
    hover: Boolean,
  },
  computed: {
    info: function() {
      return this.$store.state.info[this.mid] || this.vtb
    },
    face: function() {
      return this.$store.state.face[this.mid]
    },
    mid: function() {
      return this.vtb.mid
    },
    roomid: function() {
      return this.info.roomid
    },
    uname: function() {
      return this.info.uname || this.note[0]
    },
    note: function() {
      return this.vtb.note
    },
    sign: function() {
      return this.info.sign || this.mid
    },
    lastLive() {
      return this.info.lastLive || {}
    },
    livePage() {
      return this.$route.path.includes('live')
    },
    worm() {
      return this.info.worm
    },
    status: function() {
      let object = {
        follower: this.info.follower,
      }
      if (!this.worm) {
        object.rise = this.info.rise
      }
      if (this.livePage) {
        if (this.info.guardNum) {
          object.guardNum = this.info.guardNum
        }
      } else {
        object.archiveView = this.info.archiveView
      }
      if (this.liveStatus) {
        object.online = this.info.online
      } else if (this.lastLive.time) {
        object.pastLive = moment(this.lastLive.time).fromNow()
      }
      return object
    },
    liveStatus: function() {
      return this.info.liveStatus
    },
    title: function() {
      return this.info.title
    },
  },
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

.space {
  float: right;
}

.discover {
  position: absolute;
  width: 120px;
  height: 120px;
}

.discoverButton {
  font-size: 120px;
  opacity: 0;
  color: #409EFF;
  transition-property: opacity;
  transition-duration: 0.5s;
}

.discoverButton:hover {
  font-size: 120px;
  opacity: 0.4;
}
</style>
