<template>
<div id="app" v-loading.fullscreen.lock="fullscreenLoading" element-loading-text="连接服务器...">
  <div class="tabs">
    <ul>
      <router-link to="/" tag="li" exact-active-class="is-active"><a>🍉</a></router-link>
      <router-link to="/live" tag="li" exact-active-class="is-active"><a>直播势<span class="el-icon-d-caret"></span></a></router-link>
      <router-link to="/rise" tag="li" exact-active-class="is-active"><a>急上升<span class="el-icon-top"></span></a></router-link>
      <router-link to="/detail" tag="li" exact-active-class="is-active"><a>详细<span class="el-icon-discover"></span></a></router-link>
      <router-link to="/dd" tag="li" exact-active-class="is-active"><a>DD风云榜<span class="el-icon-s-promotion"></span></a></router-link>
      <router-link to="/macro" tag="li" exact-active-class="is-active"><a>VTB宏观<span class="el-icon-zoom-in"></span></a></router-link>
      <router-link to="/about" tag="li" exact-active-class="is-active"><a>关于<span class="el-icon-document"></span></a></router-link>
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
