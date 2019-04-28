<template>
<div id="app">
  <el-container v-loading.fullscreen.lock="fullscreenLoading" element-loading-text="连接服务器...">
    <el-header>
      <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" :router="true">
        <el-menu-item index="/">🍉</el-menu-item>
        <el-menu-item index="/live">直播势<span class="el-icon-d-caret"></span></el-menu-item>
        <el-menu-item index="/macro">VTB宏观经济<span class="el-icon-zoom-in"></span></el-menu-item>
        <el-menu-item index="/about">关于<span class="el-icon-document"></span></el-menu-item>
      </el-menu>
    </el-header>
    <router-view>
    </router-view>
  </el-container>
</div>
</template>

<script>
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
  },
  methods: {},
}
</script>

<style>
* {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}
</style>
