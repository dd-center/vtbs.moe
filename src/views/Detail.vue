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
    <img :src="topPhoto.replace('http:','https:')" alt="topPhoto" class="topPhoto" v-if="topPhoto">

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
                播放
              </div>
              <div class="center">
                <span class="el-icon-caret-right big"></span>
                <h3>{{archiveView | parseNumber}}</h3>
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
                24小时粉丝增量
              </div>
              <div class="center">
                <span class="big el-icon-caret-top"></span>
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
          <el-col :span="6" :xs="12" :xl="4" v-if="liveNum" v-loading="!liveHistory">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                共直播
              </div>
              <div class="center">
                <span class="big el-icon-time"></span>
                <h3>{{liveTime}}</h3>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6" :xs="12" :xl="4">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                BiliOB 观察者 <small>by Jannchie见齐</small>
              </div>
              <div class="center">
                <a :href="`https://www.biliob.com/author/${mid}`" target="_blank">
                  <img src="@/assets/biliob-frontend/public/img/icons/android-chrome-192x192.png" alt="BiliOB" width="72">
                  {{`https://www.biliob.com/author/${mid}`}}
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
                <el-button size="mini" @click="loadMoreActive" v-if="activeSkip" :loading="loadingActive" title="显示更多" class="right">(一部分)</el-button>
              </div>
              <ve-line :data="{rows:hourFollowerChange}" :settings="activeLine" :extend="activeExtend" :data-zoom="dataZoomWeek" :not-set-unchange="unchange" v-loading="!hourFollowerChange.length"></ve-line>
            </el-card>
          </el-col>
          <el-col :span="12" :xs="24" v-if="maxGuardNum">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                舰团变化
              </div>
              <ve-line :data="{rows:guardFilter}" :settings="guardLine" :extend="guardExtend" :data-zoom="dataZoomMonth" :not-set-unchange="['dataZoom']" v-loading="!guard.length"></ve-line>
            </el-card>
          </el-col>
        </el-row>
        <template v-if="roomid">
          <el-divider>直播记录</el-divider>
          <el-row>
            <el-col>
              <el-table :data="liveHistoryParse" height="320" border style="width: 100%" v-loading="!liveHistory" :default-sort="{prop: 'beginTime', order: 'descending'}" empty-text="无直播记录">
                <el-table-column prop="beginTime" label="时间" sortable :formatter="timeFormatter">
                </el-table-column>
                <el-table-column prop="duration" label="时长" sortable :formatter="durationFormatter">
                </el-table-column>
                <el-table-column prop="title" label="标题">
                </el-table-column>
                <el-table-column prop="online" label="最高人气" sortable>
                  <template slot-scope="scope">
                    <el-button icon="el-icon-search" circle @click="showLive(scope.row)" size="small"></el-button>
                    {{scope.row.online | parseNumber}}
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
          <el-row type="flex" justify="space-around">
            <el-col :span="23">
              <el-progress :percentage="liveDisplayInfo.progress"></el-progress>
            </el-col>
          </el-row>
          <template v-if="liveDisplayTime">
            <el-row>
              <el-col>
                <el-card class="box-card" shadow="hover">
                  <ve-line :data="{rows:rawLive}" :settings="liveLine" :extend="liveExtend" :data-zoom="[liveDisplayZoom]" :not-set-unchange="['dataZoom']" v-loading="!rawLive.length"></ve-line>
                </el-card>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8" :xs="24">
                <el-card class="box-card" shadow="hover">
                  <h3 class="center">弹幕榜</h3>
                  <transition-group name="flip-list">
                    <el-row v-for="person in liveDisplayDanmakuByPersonRank" :key="`danmaku_${person.name}`">
                      <el-col :span="12">
                        <span class="right">{{person.name}}</span>
                      </el-col>
                      <el-col :span="12">
                        {{person.number | parseNumber}}
                      </el-col>
                    </el-row>
                  </transition-group>
                </el-card>
              </el-col>
              <el-col :span="8" :xs="24">
                <el-card class="box-card" shadow="hover">
                  <h3 class="center">礼物榜</h3>
                  <transition-group name="flip-list">
                    <el-row v-for="person in liveDisplayGiftByPersonRank" :key="`gift_${person.name}`">
                      <el-col :span="12">
                        <span class="right">{{person.name}}</span>
                      </el-col>
                      <el-col :span="12">
                        {{person.coin | parseNumber}}
                      </el-col>
                    </el-row>
                  </transition-group>
                </el-card>
              </el-col>
              <el-col :span="8" :xs="24">
                <el-card class="box-card" shadow="hover">
                  <h3 class="center">总计</h3>
                  <p>弹幕数: {{liveDisplayDanmakuNumber | parseNumber}}</p>
                  <p>发言人数: {{liveDisplayDanmakuByPersonNumber | parseNumber}}</p>
                  <p>金瓜子: {{liveDisplayCoinGiftCost | parseNumber}} <small class="right">(~{{Math.round(liveDisplayCoinGiftCost/1000)}}元)</small></p>
                  <p>银瓜子: {{liveDisplaySilverGiftCost | parseNumber}}</p>
                </el-card>
              </el-col>
            </el-row>
          </template>
        </template>
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
                  <span style="font-size:20px;">直播间弹幕: <a href="https://bilichat.3shain.com">BILICHAT</a></span> by 3Shain
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

import VeLine from 'v-charts/lib/line.common'

import 'echarts/lib/component/dataZoom'

import { get, getDeflateTimeSeries } from '@/socket'

import { activeAnalyzer } from '@/worker'

Vue.use(TreeView)

export default {
  props: ['mid'],
  data: function() {
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
      activeWithFollowerChange: [],
      activeSkip: undefined,
      info: {},
      rawLive: [],
      guard: [],
      loadingLive: false,
      loadingActive: false,
      unchange: [],
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
      liveDisplayGiftByPerson: {},
      liveHistory: undefined,
    }
  },
  beforeDestroy() {
    this.liveDisplayTime = Date.now()
  },
  watch: {
    mid: {
      immediate: true,
      async handler() {
        this.active = []
        this.info = {}
        this.guard = []
        let info = await get('info', this.mid)
        this.info = info
        let { recordNum, guardChange, mid, uuid } = info

        if (guardChange > 0) {
          let guard = await getDeflateTimeSeries('bulkGuardCompressed', { guardChange, mid })
          this.guard = guard
        }

        this.DD = !!JSON.parse(localStorage.getItem(this.mid))

        this.activeSkip = recordNum
        let active = []
        /* beautify ignore:start */
        for (; this.activeSkip && 7 * 24 * 60 * 60 * 1000 > ((active[active.length - 1]?.time || 0) - (active[0]?.time || 0));) {
          this.activeSkip = Math.max(0, this.activeSkip - 500)
          active = [...await getDeflateTimeSeries('bulkActiveRangeCompressed', { num: recordNum - active.length - this.activeSkip, skip: this.activeSkip, mid }), ...active]
        }
        /* beautify ignore:end */
        this.active = await activeAnalyzer(active)
        this.unchange = ['dataZoom']

        let liveHistory = await ky(`https://api.vtb.wiki/v2/bilibili/live/${uuid}/history`).json().catch(() => ({}))
        if (!liveHistory.Success) {
          liveHistory.LiveTime = 0
        }
        if (!liveHistory.Lives) {
          liveHistory.Lives = []
        }
        this.liveHistory = liveHistory
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
      let info = await get('info', this.mid)
      this.info = info
      let { guardChange, mid, recordNum } = info
      let active = await getDeflateTimeSeries('bulkActiveRangeCompressed', { mid, skip: this.activeSkip, num: recordNum - this.activeSkip })
      this.active = await activeAnalyzer(active)
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
      if (mid === Number(this.mid)) {
        this.active = await activeAnalyzer([...this.active, data])
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
      return this.active
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
    liveTime() {
      if (!this.liveHistory) {
        return undefined
      }
      let duration = moment.duration(this.liveHistory.LiveTime || 0, 'seconds')
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
    liveHistoryParse() {
      let { Lives = [] } = this.liveHistory || {}
      return Lives.map(({ Title, MaxPopularity, BeginTime, EndTime, Id }) => ({ beginTime: BeginTime, endTime: EndTime, title: Title, online: MaxPopularity, duration: EndTime - BeginTime, id: Id }))
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
      return this.info.topPhoto
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
    areaRank: function() {
      return this.info.areaRank
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
        { name: '总播放', value: this.archiveView },
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
        { name: '直播总排名', value: this.areaRank },
        { name: '人气', value: this.online },
        { name: '上次更新', value: moment(this.time).fromNow() },
      ]
    },
    uuid() {
      return this.info.uuid
    },
  },
  components: {
    VeLine,
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
    async showLive({ beginTime, endTime, title, id }) {
      this.rawLive = []
      this.liveDisplayDanmaku = []
      this.liveDisplayDanmakuNumber = 0
      this.liveDisplayDanmakuByPerson = {}
      this.liveDisplayCoinGift = []
      this.liveDisplaySilverGift = []
      this.liveDisplayGiftByType = {}
      this.liveDisplayGiftByPerson = {}
      this.liveDisplayCoinGiftCost = 0
      this.liveDisplaySilverGiftCost = 0
      let beginTimeBuffer = beginTime - 60 * 5
      let endTimeBuffer = endTime + 60 * 5
      let giftCache = []

      this.liveDisplayZoom = {
        type: 'slider',
        startValue: beginTimeBuffer * 1000,
        endValue: endTimeBuffer * 1000,
      }
      this.liveDisplayInfo = { beginTime, endTime, title, id, progress: 0 }

      let timeNow = Date.now()
      this.liveDisplayTime = timeNow

      this.rawLive.push({ online: 0, gold: 0, time: beginTimeBuffer * 1000 })
      for (let time = beginTimeBuffer; time < endTimeBuffer;) {
        let { Comments, Gifts } = await ky(`https://api.vtb.wiki/v2/bilibili/${this.uuid}/danmaku?time=${time}`, { retry: 3 }).json().catch(() => ({}))
        if (timeNow !== this.liveDisplayTime) {
          break
        }
        let mergeEvent = (Comments || []).concat(Gifts || [])
          .sort((a, b) => a.PublishTime - b.PublishTime)
        if (!mergeEvent.length) {
          this.liveDisplayInfo.progress = 100
          break
        }
        time = mergeEvent[mergeEvent.length - 1].PublishTime + 1
        this.liveDisplayInfo.progress = Math.min(100, (1000 - Math.round(((endTimeBuffer - time) / (endTimeBuffer - beginTimeBuffer)) * 1000)) / 10)
        mergeEvent
          .filter(({ PublishTime }) => PublishTime < endTimeBuffer)
          .forEach(({ Popularity, PublishTime, AuthorId, AuthorName, GiftName, CostType, GiftCount, CostAmount, Content }) => {
            let { online, time } = this.rawLive[this.rawLive.length - 1] || {}
            if (online !== Popularity && time !== PublishTime * 1000) {
              if (giftCache.length < 1) {
                giftCache.push({ gold: 0, time: 0 })
              }
              if (giftCache.length < 2) {
                giftCache.push({ gold: 0, time: giftCache[0].time + 60 })
              }
              let timeDifference = PublishTime * 1000 - this.rawLive[this.rawLive.length - 1].time
              let { gold } = giftCache.reduce((a, b) => ({ gold: a.gold + b.gold }))
              giftCache = []
              this.rawLive.push({ online: Popularity, time: PublishTime * 1000, gold: Math.min(gold, gold * 60 * 1000 / timeDifference) })
            }
            if (!GiftName) {
              if (!this.liveDisplayDanmakuByPerson[AuthorId]) {
                this.liveDisplayDanmakuByPerson[AuthorId] = { number: 0 }
              }
              this.liveDisplayDanmakuByPerson[AuthorId].name = AuthorName
              this.liveDisplayDanmakuByPerson[AuthorId].number++
              this.liveDisplayDanmakuNumber++
              // this.liveDisplayDanmaku.push({ name: AuthorName, content: Content })
            } else {
              if (!this.liveDisplayGiftByPerson[AuthorId]) {
                this.liveDisplayGiftByPerson[AuthorId] = { coin: 0, silver: 0 }
              }
              if (!this.liveDisplayGiftByType[GiftName]) {
                this.liveDisplayGiftByType[GiftName] = { coin: 0, silver: 0, count: 0 }
              }
              this.liveDisplayGiftByPerson[AuthorId].name = AuthorName
              this.liveDisplayGiftByType[GiftName].count += GiftCount
              if (CostType === 'gold') {
                this.liveDisplayGiftByPerson[AuthorId].coin += CostAmount
                this.liveDisplayGiftByType[GiftName].coin += CostAmount
                // this.liveDisplayCoinGift.push({ name: AuthorName, cost: CostAmount, count: GiftCount })
                this.liveDisplayCoinGiftCost += CostAmount
                giftCache.push({ time: PublishTime, gold: CostAmount })
              } else {
                this.liveDisplayGiftByPerson[AuthorId].silver += CostAmount
                this.liveDisplayGiftByType[GiftName].silver += CostAmount
                // this.liveDisplaySilverGift.push({ name: AuthorName, cost: CostAmount, count: GiftCount })
                this.liveDisplaySilverGiftCost += CostAmount
              }
            }
          })
        this.liveDisplayDanmakuByPerson = { ...this.liveDisplayDanmakuByPerson }
        this.liveDisplayGiftByPerson = { ...this.liveDisplayGiftByPerson }
      }
      if (giftCache.length < 1) {
        giftCache.push({ gold: 0, time: 0 })
      }
      if (giftCache.length < 2) {
        giftCache.push({ gold: 0, time: giftCache[0].time + 60 })
      }
      let timeDifference = giftCache[giftCache.length - 1].time - giftCache[0].time
      let { gold } = giftCache.reduce((a, b) => ({ gold: a.gold + b.gold }))
      giftCache = []
      this.rawLive.push({ online: 0, time: this.rawLive[this.rawLive.length - 1].time + 1, gold: gold * 60 / timeDifference })
    },
    async loadMoreActive() {
      this.loadingActive = true
      const skip = Math.max(this.activeSkip - 1000, 0)
      const num = this.activeSkip - skip
      this.activeSkip = skip
      let active = await getDeflateTimeSeries('bulkActiveRangeCompressed', { skip, num, mid: this.mid })
      this.active = await activeAnalyzer([...active, ...this.active])
      this.loadingActive = false
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
