<template>
<div id="app">
  <el-container>
    <el-header>
      <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="routerSelect">
        <el-menu-item index="/">🍉</el-menu-item>
        <el-menu-item index="/about">关于</el-menu-item>
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
    return {}
  },
  computed: {
    activeIndex: function() {
      return this.$route.path
    }
  },
  methods: {
    routerSelect(index) {
      this.$router.push(index)
    }
  }
}
</script>

<style>
* {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}
</style>
