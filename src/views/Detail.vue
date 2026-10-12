<template>
<el-container>
  <!-- <el-aside class="hidden-sm-and-down" v-if="aside">
  </el-aside>
  <div class="hidden-sm-and-down aside" v-if="aside">
    <list></list>
  </div>
  <el-button icon="el-icon-close" size="mini" type="danger" circle class="hidden-sm-and-down sideButtonClose" @click="aside=!aside" v-if="aside"></el-button>
  <el-button icon="el-icon-search" circle size="mini" class="hidden-sm-and-down sideButton" @click="aside=!aside" v-if="!aside"></el-button> -->
  <el-main v-loading="!topPhoto">
    <img :src="topPhoto" alt="topPhoto" class="topPhoto" v-if="topPhoto">

    <el-row type="flex" justify="space-around">
      <el-col :span="aside ? 24 : 21" class="container">

        <el-row v-if="topPhoto">
          <el-col :span="6" :xs="24" :xl="4">
            <el-card class="box-card center" shadow="hover">
              <div slot="header">
                <h2>{{uname}}</h2>
                <a :href="`https://live.bilibili.com/${roomid}`" v-if="liveStatus" target="_blank">
                  <el-tag size="medium">直播中</el-tag>
                </a>
              </div>
              <div v-loading="!face">
                <img :src="face.replace('http:','https:')" class="face" v-if="face">
                <img src="@/assets/face.jpg" class="face" v-else>
              </div>
              <el-divider></el-divider>
              个人空间:
              <br>
              <a :href="`https://space.bilibili.com/${mid}`" target="_blank">
                {{`https://space.bilibili.com/${mid}`}}
              </a>
              <template v-if="roomid">
                <el-divider></el-divider>
                直播间:
                <br>
                <a :href="`https://live.bilibili.com/${roomid}`" target="_blank">
                  {{`https://live.bilibili.com/${roomid}`}}
                </a>
              </template>
            </el-card>
          </el-col>
          <el-col :span="6" :xs="12" :xl="4">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                关注
              </div>
              <div class="center">
                <span class="el-icon-star-on big"></span>
                <h3>{{follower | parseNumber}}</h3>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6" :xs="12" :xl="4">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                视频
              </div>
              <div class="center">
                <span class="el-icon-picture-outline-round big"></span>
                <h3>{{video | parseNumber}}</h3>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12" :xs="24" :xl="8">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                签名
              </div>
              <p>
                {{sign}}
              </p>
            </el-card>
          </el-col>
          <el-col :span="6" :xs="12" :xl="4">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                24小时粉丝变化
              </div>
              <div class="center">
                <span v-if="rise >= 0" class="big el-icon-caret-top"></span>
                <span v-else class="big el-icon-caret-bottom"></span>
                <h3 v-if="rise > 0" class="more">+{{rise | parseNumber}}</h3>
                <h3 v-if="rise < 0" class="less">{{rise | parseNumber}}</h3>
                <h3 v-if="rise === 0">{{rise | parseNumber}}</h3>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-divider><i class="el-icon-s-data"></i></el-divider>
        <el-row v-if="topPhoto">
          <el-col :span="6" :xs="12" :xl="4" v-if="guardNum">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                舰团
              </div>
              <div class="center">
                <span class="el-icon-location-outline big"></span>
                <h3>{{guardNum | parseNumber}}</h3>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6" :xs="12" :xl="4" v-if="guardNum">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                关注/舰团 比
              </div>
              <div class="center">
                <span class="big el-icon-star-on">/<span class="el-icon-location-outline" /></span>
                <h3>≈ {{Math.round(follower/guardNum) | parseNumber}}</h3>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6" :xs="12" :xl="4" v-if="roomid">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                直播间 <el-checkbox v-model="DD" title="开播提示"></el-checkbox>
                <a :href="`https://live.bilibili.com/${roomid}`" v-if="liveStatus" target="_blank" class="right">
                  <el-tag size="medium">人气 {{online}}</el-tag>
                </a>
              </div>
              <div class="center">
                <h3>{{title}}</h3>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6" :xs="12" :xl="4" v-if="liveNum" v-loading="weekLive === undefined">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                本周直播
              </div>
              <div class="center" v-if="weekLive === '🐟'">
                <span style="font-size: 72px;">🐟</span>
                <h3>没播</h3>
              </div>
              <div class="center" v-else>
                <span class="big el-icon-d-caret"></span>
                <h3>{{weekLive}}</h3>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6" :xs="12" :xl="4" v-if="liveNum" v-loading="!averageLive">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                周均直播
              </div>
              <div class="center">
                <span class="big el-icon-d-caret"></span>
                <h3>{{averageLive}}</h3>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6" :xs="12" :xl="4">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                Zeroroku <small>by Jannchie见齐</small>
              </div>
              <div class="center">
                <a :href="`https://zeroroku.com/bilibili/author/${mid}`" target="_blank">
                  <img src="@/assets/biliob-frontend/public/img/icons/android-chrome-192x192.png" alt="Zeroroku" width="72">
                  {{`https://zeroroku.com/bilibili/author/${mid}`}}
                </a>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-divider><i class="el-icon-s-data"></i></el-divider>
        <el-row>
          <el-col :span="maxGuardNum?12:24" :xs="24">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                <span class="el-icon-star-on"></span> 关注历史 <span class="el-icon-star-on"></span>
              </div>
              <time-series-chart :rows="hourFollowerChange" :settings="activeLine" :extend="activeExtend" :data-zoom="dataZoomWeek" :extent="activeExtent" :loaded-ranges="activeLoaded" :loading="loadingActive" @window="activeWindowChange" v-loading="!hourFollowerChange.length"></time-series-chart>
            </el-card>
          </el-col>
          <el-col :span="12" :xs="24" v-if="maxGuardNum">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                舰团变化
              </div>
              <time-series-chart :rows="guardFilter" :settings="guardLine" :extend="guardExtend" :data-zoom="dataZoomMonth" v-loading="!guard.length"></time-series-chart>
            </el-card>
          </el-col>
        </el-row>
        <el-divider><i class="el-icon-s-data"></i></el-divider>
        <el-row>
          <el-col :span="24">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                过去一周
              </div>
              <el-table :data="pastWeek" stripe>
                <el-table-column label="日期">
                  <template slot-scope="scope">
                    <span v-if="scope.row.date">{{scope.row.date}}</span>
                    <span v-else style="font-size:16px;">日平均</span>
                  </template>
                </el-table-column>
                <el-table-column label="关注增量">
                  <template slot-scope="scope">
                    <span v-if="scope.row.followerChange>0" class="more">+{{scope.row.followerChange | parseNumber}}</span>
                    <span v-if="scope.row.followerChange<0" class="less">{{scope.row.followerChange | parseNumber}}</span>
                    <span v-if="scope.row.followerChange==0">{{scope.row.followerChange | parseNumber}}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="follower" label="总关注">
                </el-table-column>
                <el-table-column label="日播放">
                  <template slot-scope="scope">
                    <span v-if="scope.row.archiveViewChange>0" class="more">+{{scope.row.archiveViewChange | parseNumber}}</span>
                    <span v-if="scope.row.archiveViewChange<0" class="less">{{scope.row.archiveViewChange | parseNumber}}</span>
                    <span v-if="scope.row.archiveViewChange==0">{{scope.row.archiveViewChange | parseNumber}}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="archiveView" label="总播放">
                </el-table-column>
                <el-table-column label="舰团变化" v-if="maxGuardNum">
                  <template slot-scope="scope">
                    <span v-if="scope.row.guardNumChange>0" class="more">+{{scope.row.guardNumChange | parseNumber}}</span>
                    <span v-if="scope.row.guardNumChange<0" class="less">{{scope.row.guardNumChange | parseNumber}}</span>
                    <span v-if="scope.row.guardNumChange==0">{{scope.row.guardNumChange | parseNumber}}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="guardNum" label="舰团" v-if="maxGuardNum">
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
        <template v-if="roomid">
          <el-divider><i class="el-icon-s-fold"></i></el-divider>
          <el-row>
            <el-col :span="24">
              <el-card class="box-card" shadow="hover">
                <div slot="header">
                  <span style="font-size:20px;">直播间弹幕: <a href="https://bilichat.3shain.com" target="_blank">BILICHAT</a></span> by 3Shain
                </div>
                <iframe :src="`/BiliChat/index.html?pure=true&room=${roomid}`" width="100%" height="400px" frameborder="0"></iframe>
              </el-card>
            </el-col>
          </el-row>
        </template>
        <el-divider><i class="el-icon-s-data"></i></el-divider>
        <el-row v-if="topPhoto">
          <el-col :span="8" :xs="24">
            <el-table :data="parsed" stripe :show-header="false">
              <el-table-column prop="name">
              </el-table-column>
              <el-table-column>
                <template slot-scope="scope">
                  <template v-if="typeof scope.row.value === 'number'">
                    <span>{{scope.row.value | parseNumber}}</span>
                    <span class="right" v-if="scope.row.value>=10000">({{scope.row.value | parseNumberOld}})</span>
                  </template>
                  <template v-if="typeof scope.row.value === 'string'">
                    <span>{{scope.row.value}}</span>
                  </template>
                  <template v-if="scope.row.space">
                    <a :href="`https://space.bilibili.com/${scope.row.space}`" target="_blank">
                      {{scope.row.space}}
                    </a>
                  </template>
                  <template v-if="scope.row.room">
                    <template v-if="scope.row.room==='无'">
                      无
                    </template>
                    <a :href="`https://live.bilibili.com/${scope.row.room}`" target="_blank" v-else>
                      {{scope.row.room}}
                    </a>
                  </template>
                  <template v-if="typeof scope.row.liveStatus !== 'undefined'">
                    <a :href="`https://live.bilibili.com/${roomid}`" v-if="scope.row.liveStatus" target="_blank">
                      <el-tag size="small">直播中</el-tag>
                    </a>
                    <template v-else>
                      {{scope.row.moment}}
                    </template>
                  </template>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
          <el-col :span="16" :xs="24">
            JSON数据:
            <tree-view :data="info" :options="{maxDepth: 2, rootObjectKey: 'info'}"></tree-view>
          </el-col>
        </el-row>

      </el-col>
    </el-row>

  </el-main>
</el-container>
</template>

<script>
import Vue from 'vue'
// import { mapState, mapGetters } from 'vuex'
import moment from 'moment'
import TreeView from 'vue-json-tree-view'
import Push from 'push.js'
import ky from 'ky'

import TimeSeriesChart from '@/components/TimeSeriesChart.vue'
import { ActiveHistory, withGaps } from '@/charts/activeHistory'

import { get, getDeflateTimeSeries } from '@/socket'

import { activeAnalyzer } from '@/worker'

Vue.use(TreeView)

export default {
  props: ['mid'],
  data: function() {
    // Follower-history loader state; not reactive (see the mid watcher).
    this.activeGeneration = 0
    this.history = null
    this.analyzed = new Map()
    this.activeWindow = null
    this.activeLoop = null
    this.activeWindowTimer = null
    this.activeRefresh = 0
    this.dataZoomWeek = [{
      type: 'slider',
      startValue: (new Date()).getTime() - 1000 * 60 * 60 * 24 * 7,
    }]
    this.dataZoomMonth = [{
      type: 'slider',
      startValue: (new Date()).getTime() - 1000 * 60 * 60 * 24 * 30,
    }]
    this.activeLine = {
      dimension: ['time'],
      metrics: ['follower', 'change'],
      labelMap: {
        follower: '关注',
        change: '增量',
      },
      yAxisName: ['关注', '每小时增量'],
      scale: [true],
      xAxisType: 'time',
      axisSite: { right: ['change'] },
      bars: ['change'],
    }
    this.activeExtend = {
      'series.0.symbol': 'none',
      'series.1.symbol': 'none',
    }
    this.liveLine = {
      dimension: ['time'],
      metrics: ['online', 'gold'],
      labelMap: {
        online: '人气',
        gold: '金瓜子',
      },
      yAxisName: ['人气', '每分钟金瓜子'],
      xAxisType: 'time',
      axisSite: { right: ['gold'] },
    }
    this.liveExtend = {
      'series.0.symbol': 'none',
      'series.0.sampling': 'max',
    }
    this.guardLine = {
      dimension: ['time'],
      metrics: ['guardNum'],
      labelMap: {
        guardNum: '舰团',
      },
      scale: [true],
      yAxisName: ['舰团'],
      xAxisType: 'time',
    }
    this.guardExtend = {
      'series.0.symbol': 'none',
      'series.0.step': 'end',
      'series.0.smooth': false,
    }
    return {
      aside: false,
      active: [],
      activeRows: [],
      activeExtent: null,
      activeLoaded: null,
      activeWithFollowerChange: [],
      info: {},
      rawLive: [],
      guard: [],
      loadingLive: false,
      loadingActive: false,
      DD: !!JSON.parse(localStorage.getItem(this.mid)),
      fullLive: false,
      liveDisplayTime: undefined,
      liveDisplayZoom: {
        type: 'slider',
        startValue: 0,
        endValue: 0,
      },
      liveDisplayInfo: {},
      liveDisplayDanmaku: [],
      liveDisplayDanmakuNumber: 0,
      liveDisplayDanmakuByPerson: {},
      liveDisplayCoinGift: [],
      liveDisplayCoinGiftCost: 0,
      liveDisplaySilverGift: [],
      liveDisplaySilverGiftCost: 0,
      liveDisplayGiftByType: {},
      liveDisplayGiftByPerson: {}
    }
  },
  beforeDestroy() {
    this.activeGeneration++
    this.history = null
    clearTimeout(this.activeWindowTimer)
    this.liveDisplayTime = Date.now()
  },
  watch: {
    mid: {
      immediate: true,
      async handler() {
        const generation = ++this.activeGeneration
        this.history = null
        this.analyzed = new Map()
        this.active = []
        this.activeRows = []
        this.activeExtent = null
        this.activeLoaded = null
        this.info = {}
        this.guard = []
        let info = await get('info', this.mid)
        if (generation !== this.activeGeneration) return
        this.info = info
        let { recordNum, guardChange, mid } = info

        if (guardChange > 0) {
          getDeflateTimeSeries('bulkGuardCompressed', { guardChange, mid }).then(guard => {
            if (generation === this.activeGeneration) this.guard = guard
          })
        }

        this.DD = !!JSON.parse(localStorage.getItem(this.mid))

        if (!recordNum) return
        // Newest records first so the chart appears quickly; the earliest
        // record fixes the full extent for the range selector, and the rest
        // loads in chunks as the selected window needs it.
        const skip = Math.max(0, recordNum - 500)
        const [latest, earliest] = await Promise.all([
          getDeflateTimeSeries('bulkActiveRangeCompressed', { mid, skip, num: recordNum - skip }),
          skip ? getDeflateTimeSeries('bulkActiveRangeCompressed', { mid, skip: 0, num: 1 }) : [],
        ])
        if (generation !== this.activeGeneration || !latest.length) return
        this.history = new ActiveHistory(recordNum)
        this.history.add(skip + 1, latest)
        this.history.add(1, earliest)
        this.activeExtent = { min: (earliest[0] || latest[0]).time, max: latest[latest.length - 1].time }
        await this.refreshActive(generation)
        this.ensureActive(generation)
      },
    },
    DD: function(newValue) {
      localStorage.setItem(this.mid, JSON.stringify(newValue))
      Push.create(`${this.uname} 直播提示 (${newValue ? '开启' : '关闭'})`, { timeout: 2000 })
    },
    active(newValue) {
      // this.followerChangeWorker.postMessage(newValue)
    },
  },
  sockets: {
    async connect() {
      if (!this.history) return
      const generation = this.activeGeneration
      let info = await get('info', this.mid)
      if (generation !== this.activeGeneration) return
      this.info = info
      let { guardChange, mid, recordNum } = info
      // Pick up records missed while disconnected if the window shows them.
      this.history.total = Math.max(this.history.total, recordNum)
      this.ensureActive(generation)
      if (guardChange > 0) {
        this.guard = await getDeflateTimeSeries('bulkGuardCompressed', { guardChange, mid })
      }
    },
    detailInfo: function({ mid, data }) {
      if (mid === Number(this.mid)) {
        this.info = data
      }
    },
    async detailActive({ mid, data }) {
      if (mid === Number(this.mid) && this.history && this.history.append(data)) {
        await this.refreshActive(this.activeGeneration)
      }
    },
    detailGuard: function({ mid, data }) {
      if (mid === Number(this.mid)) {
        this.guard.push(data)
      }
    },
  },
  computed: {
    pastWeek: function() {
      let active = [...this.active]
      let guard = [...this.guard]
      if (!active.length) {
        return []
      }

      let days = []
      let guardDays = []

      for (let i = guard.length - 1; i >= 0 && guardDays.length < 8; i--) {
        let currentDate = moment(guard[i].time).format('M-D')
        let nextDate
        if (guard[i + 1]) {
          nextDate = moment(guard[i + 1].time).format('M-D')
        }
        if (currentDate !== nextDate) {
          guardDays.push({ date: currentDate, time: guard[i].time, guardNum: guard[i].guardNum })
        }
      }
      guardDays.push({ time: 0, guardNum: this.guardNum })

      for (let i = active.length - 1; i >= 0 && days.length < 8; i--) {
        let currentDate = moment(active[i].time).format('M-D')
        let lastDate = (days[days.length - 1] || {}).date
        let guardNum = 0
        for (let j = 0; j < guardDays.length; j++) {
          if (!guardNum) {
            if (guardDays[j].date === currentDate) {
              guardNum = guardDays[j].guardNum
            } else if (guardDays[j].time < active[i].time) {
              guardNum = guardDays[j].guardNum
            }
          }
        }
        if (currentDate !== lastDate) {
          days.push({
            date: currentDate,
            follower: active[i].follower,
            archiveView: active[i].archiveView,
            guardNum,
          })
        }
      }

      let pastWeek = []
      for (let i = 1; i < days.length; i++) {
        pastWeek.push({
          ...days[i - 1],
          followerChange: days[i - 1].follower - days[i].follower,
          archiveViewChange: days[i - 1].archiveView - days[i].archiveView,
          guardNumChange: days[i - 1].guardNum - days[i].guardNum,
        })
      }

      let followerChangeSum = 0
      let archiveViewChangeSum = 0
      let guardNumChangeSum = 0
      for (let { followerChange, archiveViewChange, guardNumChange } of pastWeek) {
        followerChangeSum += followerChange
        archiveViewChangeSum += archiveViewChange
        guardNumChangeSum += guardNumChange
      }

      pastWeek.push({
        followerChange: Math.round(followerChangeSum / pastWeek.length),
        archiveViewChange: Math.round(archiveViewChangeSum / pastWeek.length),
        guardNumChange: Math.round(guardNumChangeSum / pastWeek.length),
        follower: '-',
        guardNum: '-',
        archiveView: '-',
      })
      return pastWeek
        .map(w => ({ ...w, follower: w.follower.toLocaleString(), guardNum: w.guardNum.toLocaleString(), archiveView: w.archiveView.toLocaleString() }))
    },
    maxGuardNum: function() {
      let max = this.guardNum
      for (let i = 0; i < this.guard.length; i++) {
        if (this.guard[i].guardNum > max) {
          max = this.guard[i].guardNum
        }
      }
      return max
    },
    hourFollowerChange: function() {
      return this.activeRows
    },
    guardFilter() {
      return this.guard
        .map(({ guardNum, time }, index) => {
          if (guardNum === 0) {
            let previous = this.guard[index - 1]
            let next = this.guard[index + 1]
            if (!previous || (previous.guardNum !== 0 && next && next.guardNum !== 0 && next.time - time < 1000 * 60 * 5 * 2)) {
              return undefined
            }
          }
          return { guardNum, time }
        })
        .filter(Boolean)
    },
    averageLive: function() {
      if (!this.info.averageLive) {
        return undefined
      }
      let duration = moment.duration(this.info.averageLive, 'ms')
      let result = []
      let d = Math.floor(duration.asDays())
      let h = duration.hours()
      let m = duration.minutes()
      if (d) {
        result.push(`${d} 天`)
      }
      if (h) {
        result.push(`${h} 小时`)
      }
      if (m) {
        result.push(`${m} 分钟`)
      }
      if (!result.length) {
        result.push('一分钟不到')
      }
      return result.join(' ')
    },
    weekLive() {
      if (this.info.weekLive === undefined) {
        return undefined
      }
      if (this.info.weekLive === 0) {
        return '🐟'
      }
      let duration = moment.duration(this.info.weekLive, 'ms')
      let result = []
      let d = Math.floor(duration.asDays())
      let h = duration.hours()
      let m = duration.minutes()
      if (d) {
        result.push(`${d} 天`)
      }
      if (h) {
        result.push(`${h} 小时`)
      }
      if (m) {
        result.push(`${m} 分钟`)
      }
      return result.join(' ')
    },
    liveDisplayDanmakuByPersonRank() {
      return Object.values(this.liveDisplayDanmakuByPerson)
        .sort((a, b) => b.number - a.number)
        .filter((_, index) => index < 5)
    },
    liveDisplayDanmakuByPersonNumber() {
      return Object.keys(this.liveDisplayDanmakuByPerson).length
    },
    liveDisplayGiftByPersonRank() {
      return Object.values(this.liveDisplayGiftByPerson)
        .sort((a, b) => b.coin - a.coin)
        .filter((_, index) => index < 5)
    },
    liveDisplayGiftByPersonNumber() {
      return Object.keys(this.liveDisplayGiftByPerson).length
    },
    face: function() {
      return this.info.face
    },
    roomid: function() {
      return this.info.roomid
    },
    uname: function() {
      return this.info.uname || this.mid
    },
    sign: function() {
      return this.info.sign || this.mid
    },
    topPhoto: function() {
      const url = this.info.topPhoto
      if (!url) return url
      if (/^\/?bfs\//.test(url)) {
        return `https://i0.hdslb.com/${url.replace(/^\//, '')}`
      }
      return url.startsWith('//') ? `https:${url}` : url.replace(/^http:/, 'https:')
    },
    video: function() {
      return this.info.video
    },
    archiveView: function() {
      return this.info.archiveView
    },
    notice: function() {
      return this.info.notice
    },
    liveStatus: function() {
      return this.info.liveStatus
    },
    follower: function() {
      return this.info.follower
    },
    guardNum: function() {
      return this.info.guardNum
    },
    liveNum: function() {
      return this.info.liveNum
    },
    lastLiveTime() {
      return this.info.lastLive.time
    },
    rise() {
      return this.info.rise
    },
    recordNum() {
      return this.info.recordNum
    },
    online: function() {
      return this.info.online
    },
    title: function() {
      return this.info.title
    },
    time: function() {
      return this.info.time
    },
    guardChange: function() {
      return this.info.guardChange
    },
    parsed: function() {
      return [
        { name: '名字', value: this.uname },
        { name: '关注', value: this.follower },
        { name: '空间', space: String(this.mid) },
        { name: '直播间', room: String(this.roomid || '无') },
        { name: '签名', value: this.sign },
        { name: '视频数', value: this.video },
        { name: '直播标题', value: this.title },
        { name: '舰团', value: this.guardNum },
        {
          name: '直播状态',
          liveStatus: this.liveStatus,
          past: this.lastLiveTime,
          moment: (typeof this.lastLiveTime === 'number') ? moment(this.lastLiveTime).fromNow() : '不知道→_→',
        },
        { name: '公告', value: this.notice },
        { name: '直播时长', value: `${Math.round(this.liveNum / 12)} 时` },
        { name: '人气', value: this.online },
        { name: '上次更新', value: moment(this.time).fromNow() },
      ]
    },
    uuid() {
      return this.info.uuid
    },
  },
  components: {
    TimeSeriesChart,
  },
  methods: {
    durationFormatter({ duration }) {
      duration = moment.duration(duration, 'seconds')
      let result = []
      let h = Math.floor(duration.asHours())
      let m = duration.minutes()
      if (h) {
        result.push(`${h} 小时`)
      }
      if (m) {
        result.push(`${m} 分钟`)
      }
      if (!result.length) {
        result.push('一分钟不到')
      }
      return result.join(' ')
    },
    timeFormatter({ beginTime }) {
      return moment(beginTime * 1000).format('M月D日 H:mm')
    },
    activeWindowChange(window) {
      this.activeWindow = window
      clearTimeout(this.activeWindowTimer)
      this.activeWindowTimer = setTimeout(() => this.ensureActive(this.activeGeneration), 300)
    },
    // Fetch whatever the selected window still lacks, newest chunk first,
    // re-planning after each chunk since it sharpens the time→record estimate.
    async ensureActive(generation) {
      if (!this.history || !this.activeWindow || this.activeLoop === generation) return
      if (!this.history.plan(this.activeWindow.min, this.activeWindow.max).length) return
      this.activeLoop = generation
      this.loadingActive = true
      try {
        while (generation === this.activeGeneration && this.activeWindow) {
          const [next] = this.history.plan(this.activeWindow.min, this.activeWindow.max, 1000)
          if (!next || !await this.loadActiveSlice(generation, next.skip, next.num)) break
        }
      } finally {
        if (this.activeLoop === generation) {
          this.activeLoop = null
          this.loadingActive = false
        }
      }
    },
    async loadActiveSlice(generation, skip, num) {
      const records = await getDeflateTimeSeries('bulkActiveRangeCompressed', { mid: this.mid, skip, num })
      if (generation !== this.activeGeneration || !records.length) return false
      this.history.add(skip + 1, records)
      await this.refreshActive(generation)
      return true
    },
    async refreshActive(generation) {
      const refresh = ++this.activeRefresh
      const cache = new Map()
      const slices = await Promise.all(this.history.segments.map(({ from, records }) => {
        const key = `${from}:${records.length}`
        const analyzed = this.analyzed.get(key) || activeAnalyzer(records)
        cache.set(key, analyzed)
        return analyzed
      }))
      // A later refresh (live record, newer chunk) may have finished first.
      if (generation !== this.activeGeneration || refresh !== this.activeRefresh) return
      this.analyzed = cache
      // The weekly table reads the newest contiguous stretch only.
      this.active = slices[slices.length - 1] || []
      this.activeRows = withGaps(slices)
      this.activeLoaded = this.history.ranges()
    },
  },
}
</script>

<style scoped>
.flip-list-move {
  transition: transform 0.5s;
}

.flip-list-enter {
  opacity: 0;
}

.flip-list-enter-active {
  transition: opacity 0.5s;
}

.flip-list-leave {
  display: none;
}

.flip-list-leave-active {
  display: none;
}

.topPhoto {
  width: 100%;
  margin-top: 1px;
}

.el-main {
  padding: 0px;
}

.right {
  float: right;
  color: gray;
}

.el-col {
  padding: 12px;
}

.aside {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1;
  height: 85%;
  position: fixed;
  overflow-y: auto;
  top: 80px;
  left: 20px;
}

.sideButton {
  position: fixed;
  top: 100px;
  left: 40px;
  z-index: 2;
}

.sideButtonClose {
  position: fixed;
  z-index: 2;
  top: 70px;
  left: 10px;
}

.face {
  width: 60%;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
}

.center {
  text-align: center;
  word-wrap: break-word;
}

.right {
  text-align: right;
}

.big {
  font-size: 42px;
}

.more {
  color: #00da3c;
}

.less {
  color: #ec0000;
}

@media only screen and (max-width: 991px) {
  .container {
    width: 100%;
  }
}
</style>
