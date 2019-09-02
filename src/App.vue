<template>
<div id="app" class="has-text-black" v-loading.fullscreen.lock="fullscreenLoading" element-loading-text="连接服务器...">
  <div class="tabs">
    <ul>
      <router-link v-for="([text, icon], url) in links" :key="`menu_${url}`" :to="url" tag="li" exact-active-class="is-active"><a class="bigger">{{text}}<span v-if="icon" :class="`el-icon-${icon}`"></span></a></router-link>
    </ul>
  </div>
  <router-view>
  </router-view>
</div>
</template>

<script>
import 'element-ui/lib/theme-chalk/display.css'

export default {
  name: 'app',
  data() {
    this.links = {
      '/': ['🍉'],
      '/live': ['直播势', 'd-caret'],
      '/rise': ['急上升', 'top'],
      '/drop': ['(急下降)'],
      '/detail': ['详细', 'discover'],
      '/dd': ['DD风云榜', 's-promotion'],
      '/macro': ['VTB宏观', 'zoom-in'],
      '/about': ['关于', 'document'],
    }
    return {
      fullscreenLoading: true,
    }
  },
  sockets: {
    connect: function() {
      this.fullscreenLoading = !this.$socket.connected
      setTimeout(() => {
        this.fullscreenLoading = !this.$socket.connected
      }, 1000)
    },
    disconnect: function() {
      this.fullscreenLoading = !this.$socket.connected
      setTimeout(() => {
        this.fullscreenLoading = !this.$socket.connected
      }, 1000)
    },
  },
  computed: {
    activeIndex: function() {
      return this.$route.path
    },
    badgeView() {
      return this.$route.path.includes('badge')
    },
  },
  methods: {},
}
</script>

<style>
/* * {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
} */

.tabs {
  padding: 8px 20px;
}
</style>
