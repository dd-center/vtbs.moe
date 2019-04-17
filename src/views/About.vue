<template>
<el-container>
  <el-main>
    <el-row>
      <el-col :xs="24" :span="12">
        <h1>关于</h1>
        <p>🍉 按照关注数排列<br>
          直播势：直播中的按照人气排列，靠前，其他按照舰队排列<br>
          数据每5分钟更新一次<br>
          头像每3天更新一次
        </p>
        <a href="https://github.com/simon300000/vtb.simon3k.moe/"><img alt="GitHub stars" src="https://img.shields.io/github/stars/simon300000/vtb.simon3k.moe.svg?style=social"></a>
      </el-col>
      <el-col :xs="24" :span="12">
        <h1>服务器统计数据：</h1>
        <p>Spiders: {{spiders}}</p>
        <p>Interval: {{interval}} ms</p>
        <p v-for="(time, index) in spiderUpdate" :key="`spider_${index}`">
          Spiders {{index}}: {{time | parseTime}}
        </p>
        <h1>logs:</h1>
        <el-timeline>
          <el-timeline-item v-for="(log, index) in [...logs].reverse()" :key="index" :timestamp="log.time">
            {{log.data}}
          </el-timeline-item>
        </el-timeline>
      </el-col>
    </el-row>
  </el-main>
</el-container>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'

export default {
  computed: { ...mapState(['logs', 'status', 'spiderUpdate']),
    spiders: function() {
      return this.status.PARALLEL
    },
    interval: function() {
      return this.status.INTERVAL
    }
  },
  filters: {
    parseTime: function(time = 0) {
      let timeNow = moment(time)
      return `${timeNow.hours()}:${timeNow.minute()}`
    }
  }
}
</script>

<style scoped>
pre {}
</style>
