<template>
<el-container>
  <el-main>
    <h1>虚拟世界宏观经济走势</h1>
    <el-row>
      <el-col :xs="24" :span="12" v-loading="!vtbMacro.length">
        <h1>直播势:</h1>
        <ve-line :data="{rows:vtbMacro}" :settings="vtb" :extend="vtbExtend" :data-zoom="dataZoomDay" :not-set-unchange="['dataZoom']"></ve-line>
        <el-button size="mini" @click="loadVtbMacroAll" v-if="!fullVtb" :loading="loading" title="载入完整">(一周)</el-button>
      </el-col>
      <el-col :xs="24" :span="12" v-loading="!guardMacro.length">
        <h1>虚拟世界舰团:</h1>
        <ve-line :data="{rows:guardMacro}" :settings="guard" :extend="guardExtend" :data-zoom="dataZoomWeek" :not-set-unchange="['dataZoom']"></ve-line>
      </el-col>
    </el-row>
    <el-row>
      <el-col :xs="24" :span="12" v-loading="!guardMacro.length">
        <h1>舰团日K:</h1>
        <ve-candle :data="{rows:guardMacroK}" :settings="guardK" :not-set-unchange="['dataZoom']"></ve-candle>
      </el-col>
      <el-col :xs="24" :span="12" v-loading="!vupMacro.length">
        <h1>视频势:</h1>
        <ve-line :data="{rows:vupMacro}" :settings="vup" :data-zoom="dataZoomWeek" :not-set-unchange="['dataZoom']"></ve-line>
      </el-col>
    </el-row>
  </el-main>
</el-container>
</template>

<script>
import Vue from 'vue'
import { mapMutations, mapState } from 'vuex'

import { get } from '@/socket'

import VeLine from 'v-charts/lib/line.common'
import VeCandle from 'v-charts/lib/candle.common'
import 'echarts/lib/component/dataZoom'

Vue.component(VeLine.name, VeLine)
Vue.component(VeCandle.name, VeCandle)

export default {
  async mounted() {
    if (!this.vupMacro.length) {
      get('vupMacro')
        .then(vup => this.updateMacro({ vup }))
    }
    if (!this.vtbMacro.length) {
      get('vtbMacroWeek')
        .then(vtb => this.updateMacro({ vtb }))
    }
    if (!this.guardMacro.length) {
      get('guardMacro')
        .then(guard => this.updateMacro({ guard }))
    }
  },
  methods: {
    loadVtbMacroAll() {
      this.loading = true
      get('vtbMacro')
        .then(vtb => {
          this.updateMacro({ vtb })
          this.fullVtb = true
        })
    },
    ...mapMutations(['updateMacro']),
  },
  computed: {
    ...mapState(['vupMacro', 'vtbMacro', 'guardMacro']),
    guardMacroK: function() {
      let guardMacro = this.guardMacro
      let rows = []

      for (let i = 0; i < guardMacro.length; i++) {
        let { time, guardNum } = guardMacro[i]
        let ISO = (new Date(time + 1000 * 60 * 60 * 8)).toISOString().slice(0, 10)
        let currentRow = rows[rows.length - 1] || {}

        if (currentRow.time !== ISO) {
          rows.push({
            time: ISO,
            open: currentRow.close !== undefined ? currentRow.close : guardNum,
            close: guardNum,
            lowest: guardNum,
          })
        } else {
          if (currentRow.lowest > guardNum) {
            rows[rows.length - 1].lowest = guardNum
          }
          rows[rows.length - 1].close = guardNum
        }
      }

      return rows
    },
    fullVtb() {
      return this.vtbMacro.length > 24 * 12 * 7
    },
  },
  data: function() {
    this.dataZoomDay = [{
      type: 'slider',
      startValue: (new Date()).getTime() - 1000 * 60 * 60 * 24,
      // end: 100
    }]
    this.dataZoomWeek = [{
      type: 'slider',
      startValue: (new Date()).getTime() - 1000 * 60 * 60 * 24 * 7,
      // end: 100
    }]
    this.vup = {
      dimension: ['time'],
      metrics: ['video', 'archiveView'],
      labelMap: {
        video: '视频数',
        archiveView: '总观看',
      },
      yAxisName: ['视频数', '总观看'],
      xAxisType: 'time',
      scale: [true, true],
      axisSite: { right: ['archiveView'] },
    }
    this.vtb = {
      dimension: ['time'],
      metrics: ['liveStatus', 'online'],
      labelMap: {
        liveStatus: '直播中',
        online: '总人气',
      },
      yAxisName: ['直播中', '总人气'],
      xAxisType: 'time',
      axisSite: { right: ['online'] },
    }
    this.vtbExtend = {
      'series.0.step': 'end',
      'series.0.smooth': false,
      'series.0.symbol': 'none',
      // 'series.1.symbol': 'none',
      series: { sampling: 'average' },
    }
    this.guard = {
      dimension: ['time'],
      metrics: ['guardNum'],
      labelMap: {
        guardNum: '舰团',
      },
      yAxisName: ['舰长+提督+总督'],
      scale: [true],
      xAxisType: 'time',
    }
    this.guardExtend = {
      'series.0.symbol': 'none',
      'series.0.smoothMonotone': 'x',
    }
    this.guardK = {
      labelMap: {
        open: '开盘',
        close: '收盘',
        lowest: '最低',
      },
      // upColor: '#ec0000',
      // downColor: '#00da3c',
      // showMA: true,
      // MA: [3],
      dimension: 'time',
      metrics: ['open', 'close', 'lowest', 'close'],
      showDataZoom: true,
    }
    return {
      loading: false,
    }
  },
}
</script>

<style scoped>

</style>
