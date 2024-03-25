<template>
<div class="columns is-mobile is-multiline">
  <div class="column smallBottomMarginTopBottomPadding is-6-mobile is-3-tablet is-3-desktop is-3-widescreen is-3-fullhd">
    <div class="discover" v-if="hover && !worm">
      <router-link :to="`/detail/${mid}`">
        <span class="el-icon-discover discoverButton"></span>
      </router-link>
    </div>
    <figure class="image is-128x128">
      <img :src="face" class="face" v-if="face">
    </figure>
  </div>

  <div class="column is-6 is-hidden-tablet">
    <badge :status="status" v-if="info.uname"></badge>
  </div>

  <div class="content column is-12-mobile is-6-tablet is-6-desktop is-6-widescreen is-6-fullhd smallBottomMarginTopBottomPadding">
    <h4 class="is-fullwidth is-flex is-align-items-center">
      <a :href="`https://live.bilibili.com/${roomid}`" class="tag card-badge is-link" v-if="liveStatus" target="_blank">
        直播中
      </a>
      <a :href="`https://live.bilibili.com/${roomid}`" class="tag card-badge" v-else-if="roomid && livePage" target="_blank">
        没播
      </a>
      <text-highlight style="margin: 0 2px;" :keyword="search" :text="uname.toString()" />
      <!-- <router-link v-if="worm" to="about" class="tag" title="如何扩充名单: 关于">
        未收录
      </router-link> -->
      <!-- <span>
      <a :href="`https://space.bilibili.com/${mid}`" target="_blank" class="space tag ml-auto">
        {{mid}}
      </a></span> -->
    </h4>
    <h4 class="is-fullwidth is-flex is-align-items-center is-justify-content-flex-start" >
      <router-link v-if="worm" to="about" class="tag card-badge" title="如何扩充名单: 关于">
        未收录
      </router-link>
      <a :href="`https://space.bilibili.com/${mid}`" target="_blank" class="tag card-badge ml-auto">
        {{mid}}
      </a>
    </h4>
    <span v-if="liveStatus" class="el-icon-ship">{{title}}</span>
    <text-highlight :keyword="search" :text="sign.toString()" />
    <hr class="is-hidden-tablet">
  </div>

  <div class="column is-hidden-mobile is-3-mobile is-3-tablet is-3-desktop is-3-widescreen is-3-fullhd">
    <badge :status="status" v-if="info.uname"></badge>
  </div>
  <div class="column is-6 is-hidden-mobile smallMargin">
  </div>
</div>
</template>

<script>
import badge from '@/components/badge'
import textHighlight from '@/components/textHighlight'
import moment from 'moment'

export default {
  components: {
    badge,
    'text-highlight': textHighlight
  },
  props: {
    vtb: Object,
    hover: Boolean,
    search: {
      type: String,
      default: ''
    }
  },
  computed: {
    info: function() {
      return this.$store.getters.info[this.mid] || this.vtb
    },
    face: function() {
      if (!this.$store.getters.face[this.mid]) {
        return undefined
      }
      let face = this.$store.getters.face[this.mid].replace('http:', 'https:')
      if (face.includes('noface')) {
        return face
      }
      return `${face}@256h_256w`
    },
    mid: function() {
      return this.vtb.mid
    },
    roomid: function() {
      return this.info.roomid
    },
    uname: function() {
      return this.info.uname
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
    dropPage() {
      return this.$route.path.includes('drop')
    },
    livePage() {
      return this.$route.path.includes('live')
    },
    guardPage() {
      return this.$route.path.includes('guard')
    },
    secretPage() {
      return this.$route.path.includes('secret')
    },
    worm() {
      return this.info.worm
    },
    status: function() {
      const object = {
        follower: this.info.follower,
      }
      if (!this.worm) {
        if (!this.dropPage) {
          object.rise = this.info.rise
        }
      }
      if (this.dropPage) {
        object.drop = this.info.rise
      }

      if (this.livePage || this.guardPage || this.secretPage) {
        if (this.info.guardNum) {
          object.guardNum = this.info.guardNum
        }
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
    badgeView() {
      return this.$route.path.includes('badge')
    },
  },
}
</script>

<style scoped>
.face {
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}

.content h4:first-of-type{
  margin-bottom: 4px;
}
.card-badge {
  margin: 0 2px;
}

.smallBottomMarginTopBottomPadding {
  padding-top: 12px;
  padding-bottom: 0px;
  margin-bottom: 0 !important;
}

.smallMargin {
  margin-bottom: 8px;
}

.discover {
  position: absolute;
  z-index: 20;
  width: 128px;
  height: 128px;
}

.discoverButton {
  font-size: 128px;
  opacity: 0;
  color: #409eff;
  transition-property: opacity;
  transition-duration: 0.5s;
}

.discoverButton:hover {
  opacity: 0.4;
}
</style>
