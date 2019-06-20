<template>
<el-container>
  <el-main>
    <el-row>
      <el-col :xs="24" :span="12">
        <h1>关于</h1>
        <p>🍉 按照关注数排列<br>
          直播势：直播中的按照人气排列，靠前，其他按照舰队排列<br>
          宏观经济：bilibili 虚拟世界宏观走势<br>
          数据每 5 分钟更新一次<br>
          直播势的直播状态和人气每 15-30 秒更新一次<br>
          宏观中视频势每 6 小时更新一次<br>
          宏观中词云每分钟更新一次<br>
          风云榜，24小时更新一次 <br>
          名单查漏补缺: 新建 issue <a href="https://github.com/bilibili-dd-center/vtbs.moe/issues/new?labels=&template=--vtb-vup.md&title=VTB补" target="_blank">https://github.com/bilibili-dd-center/vtbs.moe/issues/new</a><br>
          或者邮件: simon3000@163.com
          <br>
          日增的数据是过去24小时粉丝数变化，并不是昨天一天的变化
        </p>
        <a href="https://github.com/bilibili-dd-center/vtbs.moe/" target="_blank"><img alt="GitHub stars" src="https://img.shields.io/github/stars/bilibili-dd-center/vtbs.moe.svg?style=social"></a> <br>
        <a href="https://github.com/bilibili-dd-center/vtbs.moe/" target="_blank">github:bilibili-dd-center/vtbs.moe</a>
        <br>
        <br>
        其他有趣的项目: <a href="https://bilibili-dd-center.github.io">bilibili-dd-center.github.io</a>
        <br><br>
        <el-button round @click="push('→_→！')" size="mini">测试Local Notification</el-button>
        <br>
      </el-col>
      <el-col :xs="24" :span="12">
        <h1>api.vtbs.moe</h1>
        <a href="https://github.com/bilibili-dd-center/vtbs.moe#open-api">Open API Documents</a>
        <h1>服务器数据：</h1>
        <p v-loading="!spiders">Spiders: {{spiders}}</p>
        <p v-loading="!interval">Interval: {{interval}} ms</p>
        <p v-loading="!upMoment">Uptime: {{upMoment}}</p>
        <p v-loading="!number">共收录VTB/VUP: {{number}} 个</p>
        <p v-if="online">目前在线: {{online}}</p>
        <el-row>
          <el-col :span="8" :xs="12">
            <h4>Spider: <small>({{spiderLeft}}/{{number}})</small></h4>
            <el-progress type="circle" :percentage="spiderProgress" :status="spiderProgress === 100 ? 'success' : undefined"></el-progress>
          </el-col>
          <el-col :span="8" :xs="12">
            <h4>Parrot: <small>({{parrotNow}}/{{number}})</small></h4>
            <el-progress type="circle" :percentage="parrotProgress" :status="parrotProgress === 100 ? 'success' : undefined"></el-progress>
          </el-col>
        </el-row>
        <div v-for="{time, spiderId, duration} in spiderUpdate" :key="`spider_${spiderId}`">
          <h4>Spiders {{spiderId}}</h4>
          <p>上次更新: {{time | parseTime}} <br>
            目前负载: {{duration | load(interval)}}</p>
        </div>
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
import { get } from '@/socket'
import Push from 'push.js'

export default {
  data() {
    return {
      uptime: undefined,
    }
  },
  computed: { ...mapState(['logs', 'status', 'spiderUpdate', 'online', 'vtbs', 'parrotNow', 'spiderLeft']),
    spiders: function() {
      return this.status.PARALLEL
    },
    interval: function() {
      return this.status.INTERVAL
    },
    number: function() {
      return this.vtbs && this.vtbs.length
    },
    parrotProgress() {
      return Math.round(this.parrotNow / (this.number || 1) * 100)
    },
    spiderProgress() {
      return 100 - Math.round(this.spiderLeft / (this.number || 1) * 100)
    },
    upMoment() {
      if (this.uptime) {
        let duration = moment.duration(this.uptime, 's')
        let result = []
        let d = Math.floor(duration.asDays())
        let h = duration.hours()
        let m = duration.minutes()
        let s = duration.seconds()
        if (d) {
          result.push(`${d} 天`)
        }
        if (h) {
          result.push(`${h} 时`)
        }
        if (m) {
          result.push(`${m} 分`)
        }
        if (s) {
          result.push(`${s} 秒`)
        }
        return result.join(' ')
      } else {
        return undefined
      }
    },
  },
  async mounted() {
    this.uptime = await get('uptime')
  },
  methods: { push: w => Push.create(w) },
  filters: {
    parseTime: function(time = 0) {
      let timeNow = moment(time)
      return `${timeNow.hours()}:${timeNow.minute()}`
    },
    load: function(duration, interval) {
      return `${Math.round(duration / interval * 1000) / 10}%`
    },
  },
}
</script>

<style scoped>
.el-main {
  word-wrap: break-word;
}
</style>
