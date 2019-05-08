<template>
<div id="app">
  <el-container v-loading.fullscreen.lock="fullscreenLoading" element-loading-text="连接服务器..." class="container">
    <el-header>
      <el-menu :default-active="activeIndex" menu-trigger='click' mode="horizontal" :router="true">
        <el-menu-item index="/">🍉</el-menu-item>
        <el-menu-item index="/live">直播势<span class="el-icon-d-caret"></span></el-menu-item>
        <el-menu-item class="hidden-xs-only" index="/rise">急上升<span class="el-icon-top"></span></el-menu-item>
        <el-menu-item class="hidden-xs-only" index="/detail">详细<span class="el-icon-discover"></span></el-menu-item>
        <el-menu-item class="hidden-xs-only" index="/dd">DD风云榜<span class="el-icon-s-promotion"></span></el-menu-item>
        <el-menu-item class="hidden-xs-only" index="/macro">VTB宏观经济<span class="el-icon-zoom-in"></span></el-menu-item>
        <el-menu-item class="float-right hidden-xs-only" index="/about">关于<span class="el-icon-document"></span></el-menu-item>
        <el-submenu index="1" class="hidden-sm-and-up float-right">
          <template slot="title" index="1">{{emoji}}</template>
          <el-menu-item index="/rise">急上升<span class="el-icon-top"></span></el-menu-item>
          <el-menu-item index="/detail">详细<span class="el-icon-discover"></span></el-menu-item>
          <el-menu-item index="/dd">DD风云榜<span class="el-icon-s-promotion"></span></el-menu-item>
          <el-menu-item index="/macro">VTB宏观经济<span class="el-icon-zoom-in"></span></el-menu-item>
          <el-menu-item index="/about">关于<span class="el-icon-document"></span></el-menu-item>
        </el-submenu>
      </el-menu>
    </el-header>
    <router-view>
    </router-view>
  </el-container>
</div>
</template>

<script>
import 'element-ui/lib/theme-chalk/display.css'

let emojis = ['🍥', '⚓️', '🍡', '🍫', '🌽', '🦀', '🌶️', '🏮', '😈', '🌙', '🌲', '🦎']

export default {
  name: 'app',
  data() {
    this.emoji = emojis[Math.floor(emojis.length * Math.random())]
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

body {
  margin: 0px;
}

.float-right {
  float: right !important;
}
</style>
