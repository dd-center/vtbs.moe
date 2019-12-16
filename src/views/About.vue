<template>
<section class="hero">
  <div class="hero-body">
    <div class="container">
      <h1 class="title is-2">
        关于
      </h1>
      <h2 class="subtitle is-3">
        vtbs.moe
      </h2>
      <div class="columns">
        <div class="column">
          <h3 class="subtitle is-4">小站要开不下去啦~</h3>
          <p>现在下载DD@Electron, 帮助vtbs.moe持续运行<br>
            开源软件, 无广告无病毒<br>
            分布式信息获取DD@Electron<br>
            Windows: <a href="https://dd.center/api/latest/ddatelectron/windows" target="_blank">https://dd.center/api/latest/ddatelectron/windows</a><br>
            macOS: <a href="https://dd.center/api/latest/ddatelectron/mac" target="_blank">https://dd.center/api/latest/ddatelectron/mac</a><br>
            Github Release: <a href="https://github.com/dd-center/DDatElectron/releases/latest" target="_blank">https://github.com/dd-center/DDatElectron/releases/latest</a><br>
            <br>
            <a href="https://github.com/dd-center/ddatelectron/" target="_blank">github:dd-center/ddatelectron</a><br>
            <a href="https://github.com/dd-center/ddatelectron/" target="_blank"><img alt="GitHub stars" src="https://img.shields.io/github/stars/dd-center/ddatelectron.svg?style=social"></a>
          </p>
          <hr>
          <p> 🍉 按照关注数排列<br>
            直播势：直播中的按照人气排列，靠前，其他按照舰队排列<br>
            宏观经济：bilibili 虚拟世界宏观走势<br>
            数据每 5 分钟更新一次<br>
            直播势的直播状态和人气每 15-30 秒更新一次<br>
            宏观中视频势每 6 小时更新一次<br>
            宏观中词云每分钟更新一次<br>
            风云榜，24小时更新一次 <br>
            名单查漏补缺: 新建 issue <a href="https://github.com/dd-center/vdb/issues/new?template=new-bilibili-vtb-vup.md&title=VTB补" target="_blank">https://github.com/dd-center/vdb/issues/new</a><br>
            或者邮件: simon3000@163.com
            <br>
            急上升的数据是过去24小时粉丝数变化，并不是昨天一天的变化
          </p>
          <hr>
          <a href="https://github.com/dd-center/vtbs.moe/" target="_blank"><img alt="GitHub stars" src="https://img.shields.io/github/stars/dd-center/vtbs.moe.svg?style=social"></a> <br>
          <a href="https://github.com/dd-center/vtbs.moe/" target="_blank">github:dd-center/vtbs.moe</a>
          <br>
          <br>
          <!-- 其他有趣的项目: <a href="https://dd-center.github.io">dd-center.github.io</a> -->
          <!-- <br><br> -->
          <a class="button is-rounded" @click="push('→_→！')">测试Local Notification</a>
          <br>
          <hr>
          <h4 class="title is-4">设置</h4>
          <h5 class="title is-5">CDN网络({{wss.length}}) (刷新网页生效)</h5>
          <p>目前: <span class="has-background-light">{{currentWs}}</span></p>
          <br>
          <div v-for="ws in wss" :key="ws">
            <span class="tag">{{ws === currentWs ? '当前' : '可用'}}</span>{{ws}}
            <a class="button is-small is-rounded" @click="chooseWs(ws)" v-if="ws !== currentWs">选择</a>
            <a class="button is-small is-rounded" @click="pingWs(ws)" v-if="!pingResult[ws]">Ping</a>
            <p v-if="pingResult[ws]">{{pingResult[ws]}}</p>
            <br>
            <br>
          </div>
        </div>
        <div class="column">
          <h3 class="title">api.vtbs.moe</h3>
          <a href="https://github.com/dd-center/vtbs.moe#open-api" target="_blank">Open API Documents</a>
          <br>
          <br>
          <h4 class="title is-4">服务器数据：</h4>
          <div v-if="interval && upMoment && number">
            <p>Spiders: {{spiders}}</p>
            <p v-loading="!interval">Interval: {{interval}} ms</p>
            <p v-loading="!upMoment">Uptime: {{upMoment}}</p>
            <p v-loading="!number">共收录VTB/VUP: {{number}} 个</p>
          </div>
          <progress v-else class="progress is-small" max="100"></progress>
          <p v-if="online">目前在线: {{online}}</p>
          <br>
          <div class="columns">
            <div class="column">
              <h5 class="title is-5">Spider: <small>({{spiderLeft}}/{{number}})</small></h5>
              <progress class="progress" max="100" :value="spiderProgress" :class="{'is-success': spiderProgress === 100}"></progress>
              <p>上次更新: {{spiderTime | parseTime}} <br>
                目前负载: {{spiderDuration | load(interval)}}</p>
            </div>
          </div>
          <br>
          <hr>
          <h1 class="title is-4">logs:</h1>
          <p v-for="(log, index) in [...logs].reverse()" :key="index">
            {{log.data}}
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
import { get, socket, ws, ping } from '@/socket'
import Push from 'push.js'

export default {
  data() {
    this.currentWs = `https://${socket.io.engine.hostname}`
    this.wss = ws
    return {
      uptime: undefined,
      pingResult: {},
    }
  },
  computed: {
    ...mapState(['logs', 'status', 'currentVtbs', 'online', 'spiderLeft', 'spiderDuration', 'spiderTime']),
    spiders: function() {
      return this.status.PARALLEL
    },
    interval: function() {
      return this.status.INTERVAL
    },
    number: function() {
      /* beautify ignore:start */
      return this.currentVtbs?.length
      /* beautify ignore:end */
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
  methods: {
    push: w => Push.create(w),
    chooseWs(ws) {
      localStorage.ws = ws
    },
    async pingWs(ws) {
      this.pingResult = { ...this.pingResult, [ws]: 'Ping...' }
      let result = await ping(ws)
      this.pingResult = { ...this.pingResult, [ws]: result }
    },
  },
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
