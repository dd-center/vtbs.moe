<template>
<el-container>
  <el-aside class="hidden-sm-and-down" v-if="aside">
  </el-aside>
  <div class="hidden-sm-and-down aside" v-if="aside">
    <list></list>
  </div>
  <el-button icon="el-icon-close" size="mini" type="danger" circle class="hidden-sm-and-down sideButtonClose" @click="aside=!aside" v-if="aside"></el-button>
  <el-button icon="el-icon-search" circle size="mini" class="hidden-sm-and-down sideButton" @click="aside=!aside" v-if="!aside"></el-button>
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
              <a :href="`http://space.bilibili.com/${mid}`" target="_blank">
                {{`http://space.bilibili.com/${mid}`}}
              </a>
              <template v-if="roomid">
                <el-divider></el-divider>
                直播间:
                <br>
                <a :href="`https://live.bilibili.com/${roomid}`" target="_blank" v-if="roomid">
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
                <h3>{{follower | locale}}</h3>
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
                <h3>{{archiveView | locale}}</h3>
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
                <h3>{{video | locale}}</h3>
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
          <el-col :span="6" :xs="12" :xl="4" v-if="guardNum">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                舰团
              </div>
              <div class="center">
                <span class="el-icon-location-outline big"></span>
                <h3>{{guardNum | locale}}</h3>
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
                <h3>≈ {{Math.round(follower/guardNum) | locale}}</h3>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6" :xs="12" :xl="4" v-if="roomid">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                直播间
              </div>
              <div class="center">
                <a :href="`https://live.bilibili.com/${roomid}`" v-if="liveStatus" target="_blank">
                  <el-tag size="medium">直播中</el-tag>
                </a>
                <h3>{{title}}</h3>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6" :xs="12" :xl="4" v-if="liveNum" v-loading="!averageLive">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                平均每周直播
              </div>
              <div class="center">
                <span class="big el-icon-d-caret"></span>
                <h3>{{averageLive}}</h3>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-divider><i class="el-icon-s-data"></i></el-divider>
        <el-row>
          <el-col :span="24">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                <span class="el-icon-star-on"></span> 关注历史 <span class="el-icon-star-on"></span>
              </div>
              <ve-line :data="{rows:hourFollowerChange}" :settings="activeLine" :extend="activeExtend" :data-zoom="dataZoomWeek" :not-set-unchange="['dataZoom']" v-loading="!hourFollowerChange.length"></ve-line>
            </el-card>
          </el-col>
          <el-col :span="maxGuardNum?12:24" :xs="24" v-if="liveNum">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                直播·人气 <el-button size="mini" @click="loadFullLive" v-if="!fullLive" :loading="loading" title="载入完整" class="right">(一周)</el-button>
              </div>
              <ve-line :data="{rows:live}" :settings="liveLine" :extend="liveExtend" :data-zoom="dataZoomDay" :not-set-unchange="['dataZoom']" v-loading="!live.length"></ve-line>
            </el-card>
          </el-col>
          <el-col :span="12" :xs="24" v-if="maxGuardNum">
            <el-card class="box-card" shadow="hover">
              <div slot="header">
                舰团
              </div>
              <ve-line :data="{rows:guard}" :settings="guardLine" :extend="guardExtend" :data-zoom="dataZoomWeek" :not-set-unchange="['dataZoom']" v-loading="!guard.length"></ve-line>
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
                    <span v-if="scope.row.followerChange>0" class="more">+{{scope.row.followerChange | locale}}</span>
                    <span v-if="scope.row.followerChange<0" class="less">{{scope.row.followerChange | locale}}</span>
                    <span v-if="scope.row.followerChange==0">{{scope.row.followerChange | locale}}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="follower" label="总关注">
                </el-table-column>
                <el-table-column label="日播放">
                  <template slot-scope="scope">
                    <span v-if="scope.row.archiveViewChange>0" class="more">+{{scope.row.archiveViewChange | locale}}</span>
                    <span v-if="scope.row.archiveViewChange<0" class="less">{{scope.row.archiveViewChange | locale}}</span>
                    <span v-if="scope.row.archiveViewChange==0">{{scope.row.archiveViewChange | locale}}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="archiveView" label="总播放">
                </el-table-column>
                <el-table-column label="舰团变化" v-if="maxGuardNum">
                  <template slot-scope="scope">
                    <span v-if="scope.row.guardNumChange>0" class="more">+{{scope.row.guardNumChange | locale}}</span>
                    <span v-if="scope.row.guardNumChange<0" class="less">{{scope.row.guardNumChange | locale}}</span>
                    <span v-if="scope.row.guardNumChange==0">{{scope.row.guardNumChange | locale}}</span>
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
                  <span style="font-size:20px;">直播间弹幕: <a href="https://bilichat.3shain.com">BILICHAT</a></span> by <a href="https://3shain.com">3Shain</a>
                </div>
                <iframe :src="`/BiliChat/docs/?pure=true&room=${roomid}`" width="100%" height="400px" frameborder="0"></iframe>
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
                    <span>{{scope.row.value.toLocaleString()}}</span>
                    <span class="right" v-if="scope.row.value>=10000">({{scope.row.value | parseNumberOld}})</span>
                  </template>
                  <template v-if="typeof scope.row.value === 'string'">
                    <span>{{scope.row.value}}</span>
                  </template>
                  <template v-if="scope.row.space">
                    <a :href="`http://space.bilibili.com/${scope.row.space}`" target="_blank">
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
                    <template v-else-if="typeof scope.row.past === 'number'">
                      {{scope.row.moment}}
                    </template>
                    <template v-else>
                      不知道→_→
                    </template>
                  </template>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
          <el-col :span="16" :xs="24">
            JSON数据:
            <pre>
          {{info}}
        </pre>
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
import List from '@/components/list'

import VeLine from 'v-charts/lib/line.common'

import 'echarts/lib/component/dataZoom'

import { get } from '@/socket'

Vue.component(VeLine.name, VeLine)

export default {
  props: ['mid'],
  data: function() {
    this.dataZoomDay = [{
      type: 'slider',
      startValue: (new Date()).getTime() - 1000 * 60 * 60 * 24,
    }]
    this.dataZoomWeek = [{
      type: 'slider',
      startValue: (new Date()).getTime() - 1000 * 60 * 60 * 24 * 7,
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
    }
    this.liveLine = {
      dimension: ['time'],
      metrics: ['online'],
      labelMap: {
        online: '人气',
      },
      yAxisName: ['人气'],
      xAxisType: 'time',
    }
    this.liveExtend = {
      'series.0.symbol': 'none',
      'series.0.smoothMonotone': 'x',
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
      'series.0.smoothMonotone': 'x',
    }
    return {
      aside: false,
      active: [],
      info: {},
      rawLive: [],
      guard: [],
      loading: false,
    }
  },
  watch: {
    mid: {
      immediate: true,
      handler: async function() {
        this.active = []
        this.info = {}
        this.rawLive = []
        this.guard = []
        let info = await get('info', this.mid)
        this.info = info
        let { recordNum, liveNum, guardChange, mid } = info
        let active = await get('bulkActive', { recordNum, mid })
        this.active = active
        if (liveNum) {
          let live = await get('bulkLiveWeek', { liveNum, mid })
          this.rawLive = live
        }
        if (guardChange > 0) {
          let guard = await get('bulkGuard', { guardChange, mid })
          this.guard = guard
        }
      },
    },
  },
  sockets: {
    async connect() {
      let info = await get('info', this.mid)
      this.info = info
      let { recordNum, liveNum, guardChange, mid } = info
      this.active = await get('bulkActive', { recordNum, mid })
      if (liveNum) {
        if (this.fullLive) {
          this.rawLive = await get('bulkLive', { liveNum, mid })
        } else {
          this.rawLive = await get('bulkLiveWeek', { liveNum, mid })
        }
      }
      if (guardChange > 0) {
        this.guard = await get('bulkGuard', { guardChange, mid })
      }
    },
    detailInfo: function({ mid, data }) {
      if (mid === Number(this.mid)) {
        this.info = data
      }
    },
    detailActive: function({ mid, data }) {
      if (mid === Number(this.mid)) {
        this.active.push(data)
      }
    },
    detailLive: function({ mid, data }) {
      if (mid === Number(this.mid)) {
        this.rawLive.push(data)
      }
    },
    detailGuard: function({ mid, data }) {
      if (mid === Number(this.mid)) {
        this.guard.push(data)
      }
    },
  },
  computed: {
    live: function() {
      let rawLive = [...this.rawLive]
      let live = []
      for (let i = 0; i < rawLive.length; i++) {
        let before = rawLive[i - 1] || {}
        let current = rawLive[i]
        let after = rawLive[i + 1] || {}
        if (current.time - before.time > 1000 * 60 * 5 * 1.5) {
          live.push({ time: current.time - 1000 * 60 * 5, online: 0 })
        }
        live.push(current)
        if (after.time - current.time > 1000 * 60 * 5 * 1.5) {
          live.push({ time: current.time + 1000 * 60 * 5, online: 0 })
        }
      }
      if (live.length && (new Date()).getTime() - live[live.length - 1].time > 1000 * 60 * 5 * 1.5) {
        live.push({ time: live[live.length - 1].time + 1000 * 60 * 5, online: 0 })
        live.push({ time: (new Date()).getTime(), online: 0 })
      }
      return live
    },
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
      })
      return pastWeek
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
      if (this.active.length < 2) {
        return this.active
      }
      const hourAgo = (time, index) => {
        for (let i = index; i > 0; i--) {
          if (time - this.active[i].time > 1000 * 60 * 60) {
            return this.active[i]
          }
        }
        return this.active[0]
      }
      return this.active
        .map(({ follower, time }, i) => i && ({
          time,
          follower,
          change: Math.round((follower - hourAgo(time, i).follower) * 1000 * 60 * 60 / (time - hourAgo(time, i).time)),
        }))
        .filter(e => e)
    },
    averageLive: function() {
      if (!this.rawLive.length) {
        return undefined
      }
      let time = new Date().getTime()
      let duration = moment.duration((1000 * 60 * 5 * this.liveNum) * 1000 * 60 * 60 * 24 * 7 / (time - this.rawLive[0].time), 'ms')
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
      // return moment.duration(this.liveNum * 5, 'minutes').humanize()
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
          past: this.$store.state.pastLive[this.mid],
          moment: (typeof this.$store.state.pastLive[this.mid] === 'number') ? moment(this.$store.state.pastLive[this.mid]).fromNow() : '从未',
        },
        { name: '公告', value: this.notice },
        { name: '直播时长', value: `${Math.round(this.liveNum / 12)} 时` },
        { name: '直播总排名', value: this.areaRank },
        { name: '人气', value: this.online },
        { name: '上次更新', value: moment(this.time).fromNow() },
      ]
    },
    fullLive() {
      return this.rawLive.length >= this.liveNum
    },
  },
  components: {
    List,
  },
  filters: {
    locale: v => v.toLocaleString(),
  },
  methods: {
    async loadFullLive() {
      this.loading = true
      let live = await get('bulkLive', { liveNum: this.liveNum, mid: this.mid })
      this.rawLive = live
    },
  },
}
</script>

<style scoped>
pre {
  background-color: rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  white-space: pre-line;
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
