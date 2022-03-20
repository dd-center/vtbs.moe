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
          <h4 class="title is-4"><b><u><i>(新)</i></u></b> DD@Browser</h4>
          <h4 class="subtitle is-4">在浏览器DD!!</h4>
          <p>现在 <a href="https://greasyfork.org/scripts/403819-dd-browser/code/DD@Browser.user.js" target="_blank" rel="noopener noreferrer">安装</a> DD@Browser, 帮助vtbs.moe持续运行<br>
            分布式信息获取浏览器插件DD@Browser<br>
            <br>
            GreasyFork: <a href="https://greasyfork.org/zh-CN/scripts/403819-dd-browser" target="_blank" rel="noopener noreferrer">https://greasyfork.org/zh-CN/scripts/403819-dd-browser</a><br>
            <br>
            <a href="https://github.com/dd-center/DDatBrowser/" target="_blank" rel="noopener noreferrer">github:dd-center/DDatBrowser</a><br>
            <a href="https://github.com/dd-center/DDatBrowser/" target="_blank" rel="noopener noreferrer"><img alt="GitHub stars" src="https://img.shields.io/github/stars/dd-center/DDatBrowser.svg?style=social"></a>
          </p>
          <hr>
          <h4 class="title is-4">submit.vtbs.moe</h4>
          <h4 class="subtitle is-4">名单查漏补缺!</h4>
          <p>
            提交新的虚拟主播，修改已有的虚拟主播:<br>
            <a href="https://submit.vtbs.moe" target="_blank" rel="noopener noreferrer">https://submit.vtbs.moe</a><br>
            <br>
            <a href="https://github.com/dd-center/submit.vtbs.moe/" target="_blank" rel="noopener noreferrer">github:dd-center/submit.vtbs.moe</a><br>
            <a href="https://github.com/dd-center/submit.vtbs.moe/" target="_blank" rel="noopener noreferrer"><img alt="GitHub stars" src="https://img.shields.io/github/stars/dd-center/submit.vtbs.moe.svg?style=social"></a>
          </p>
          <hr>
          <h4 class="title is-4">DD@Electron</h4>
          <h4 class="subtitle is-4">分布式DD!</h4>
          <p>现在下载DD@Electron, 帮助vtbs.moe持续运行<br>
            开源软件, 无广告无病毒<br>
            分布式信息获取DD@Electron<br>
            Windows: <a href="https://dd.center/api/latest/ddatelectron/windows" target="_blank" rel="noopener noreferrer">https://dd.center/api/latest/ddatelectron/windows</a><br>
            macOS: <a href="https://dd.center/api/latest/ddatelectron/mac" target="_blank" rel="noopener noreferrer">https://dd.center/api/latest/ddatelectron/mac</a><br>
            Github Release: <a href="https://github.com/dd-center/DDatElectron/releases/latest" target="_blank" rel="noopener noreferrer">https://github.com/dd-center/DDatElectron/releases/latest</a><br>
            <br>
            <a href="https://github.com/dd-center/ddatelectron/" target="_blank" rel="noopener noreferrer">github:dd-center/ddatelectron</a><br>
            <a href="https://github.com/dd-center/ddatelectron/" target="_blank" rel="noopener noreferrer"><img alt="GitHub stars" src="https://img.shields.io/github/stars/dd-center/ddatelectron.svg?style=social"></a>
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
            名单查漏补缺: <a href="https://submit.vtbs.moe" target="_blank" rel="noopener noreferrer">https://submit.vtbs.moe</a><br>
            或者邮件: simon3000@163.com
            <br>
            急上升的数据是过去24小时粉丝数变化，并不是昨天一天的变化
          </p>
          <hr>
          <a href="https://github.com/dd-center/vtbs.moe/" target="_blank" rel="noopener noreferrer"><img alt="GitHub stars" src="https://img.shields.io/github/stars/dd-center/vtbs.moe.svg?style=social"></a> <br>
          <a href="https://github.com/dd-center/vtbs.moe/" target="_blank" rel="noopener noreferrer">github:dd-center/vtbs.moe</a>
          <br>
          <br>
          <!-- 其他有趣的项目: <a href="https://dd-center.github.io">dd-center.github.io</a> -->
          <!-- <br><br> -->
          <a class="button is-rounded" @click="push('→_→！')">测试Local Notification</a>
          <br>
          <hr>
          <h4 class="title is-4">设置 (刷新网页生效)</h4>
          <h5 class="title is-5">弹幕</h5>
          <label class="checkbox">
            <input type="checkbox" v-model="hideDanmaku">
            隐藏网页弹幕
          </label>
          <hr>
          <h5 class="title is-5">CDN网络({{wss.length}})</h5>
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
          <hr>
           <p>友情链接 <a href="https://xuehusang.cn/ " target="_blank">雪狐冰屋</a></p>
        </div>
        <div class="column">
          <h3 class="title">api.vtbs.moe</h3>
          <a href="https://github.com/dd-center/vtbs.moe#open-api" target="_blank" rel="noopener noreferrer">Open API Documents</a>
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
          <p v-for="(log) in [...logs].reverse()" :key="log.key">
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
import { get, socket, ws, ping, saveWsCDN } from '@/socket'
import Push from 'push.js'

export default {
  data() {
    this.currentWs = `https://${socket.io.engine.hostname}`
    this.wss = ws
    return {
      uptime: undefined,
      pingResult: {},
      hideDanmaku: !!localStorage.disableDanmaku,
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
        const duration = moment.duration(this.uptime, 's')
        const result = []
        const d = Math.floor(duration.asDays())
        const h = duration.hours()
        const m = duration.minutes()
        const s = duration.seconds()
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
  watch: {
    hideDanmaku() {
      if (this.hideDanmaku) {
        localStorage.disableDanmaku = 'true'
      } else {
        localStorage.removeItem('disableDanmaku')
      }
    },
  },
  methods: {
    push: w => Push.create(w),
    chooseWs(ws) {
      saveWsCDN(ws)
    },
    async pingWs(ws) {
      this.pingResult = { ...this.pingResult, [ws]: 'Ping...' }
      const result = await ping(ws)
      this.pingResult = { ...this.pingResult, [ws]: result }
    },
  },
  filters: {
    parseTime: function(time = 0) {
      const timeNow = moment(time)
      return `${timeNow.hours()}:${timeNow.minute()}`
    },
    load: function(duration, interval) {
      return `${Math.round(duration / interval * 1000) / 10}%`
    },
  },
}
</script>
