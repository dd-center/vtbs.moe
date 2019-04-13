<template>
<div>
  <h1>关于</h1>
  <a href="https://github.com/simon300000/vtb.simon3k.moe/"><img alt="GitHub stars" src="https://img.shields.io/github/stars/simon300000/vtb.simon3k.moe.svg?style=social"></a>
  <h1>logs:</h1>
  <el-timeline>
    <el-timeline-item v-for="(log, index) in [...logs].reverse()" :key="index" :timestamp="log.time">
      {{log.data}}
    </el-timeline-item>
  </el-timeline>
</div>
</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: mapState(['logs'])
}
</script>

<style scoped>
pre {}
</style>
