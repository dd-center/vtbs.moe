<template>
<el-container>
  <el-main>
    <h1>虚拟世界宏观经济走势</h1>
    <el-row>
      <el-col :xs="24" :span="12" v-loading="!vtbMacro.length">
        <h1>直播势:</h1>
        <ve-line :data="{rows:vtbMacro}" :settings="vtb" :extend="vtbExtend" :data-zoom="dataZoomDay" :not-set-unchange="['dataZoom']"></ve-line>
      </el-col>
      <el-col :xs="24" :span="12" v-loading="!guardMacro.length">
        <h1>虚拟世界舰团:</h1>
        <ve-line :data="{rows:guardMacro}" :settings="guard" :data-zoom="dataZoomWeek" :not-set-unchange="['dataZoom']"></ve-line>
      </el-col>
    </el-row>
    <el-row>
      <el-col :xs="24" :span="12" v-loading="!vupMacro.length">
        <h1>视频势:</h1>
        <ve-line :data="{rows:vupMacro}" :settings="vup" :data-zoom="dataZoomWeek" :not-set-unchange="['dataZoom']"></ve-line>
      </el-col>
      <el-col :xs="24" :span="12" v-loading="!vupMacro.length">
        <h1>虚拟世界外汇储备:</h1>
        <ve-line :data="{rows:vupMacro}" :settings="reserve" :data-zoom="dataZoomWeek" :not-set-unchange="['dataZoom']"></ve-line>
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
import 'echarts/lib/component/dataZoom'

Vue.component(VeLine.name, VeLine)

export default {
  async mounted() {
    if (!this.vupMacro.length) {
      get('vupMacro')
        .then(vup => this.updateMacro({ vup }))
    }
    if (!this.vtbMacro.length) {
      get('vtbMacro')
        .then(vtb => this.updateMacro({ vtb }))
    }
    if (!this.guardMacro.length) {
      get('guardMacro')
        .then(guard => this.updateMacro({ guard }))
    }
  },
  methods: mapMutations(['updateMacro']),
  computed: mapState(['vupMacro', 'vtbMacro', 'guardMacro']),
  data: function() {
    this.dataZoomDay = [{
      type: 'slider',
      startValue: (new Date()).getTime() - 1000 * 60 * 60 * 24
      // end: 100
    }]
    this.dataZoomWeek = [{
      type: 'slider',
      startValue: (new Date()).getTime() - 1000 * 60 * 60 * 24 * 7
      // end: 100
    }]
    this.vup = {
      dimension: ['time'],
      metrics: ['video', 'archiveView'],
      labelMap: {
        video: '视频数',
        archiveView: '总观看'
      },
      yAxisName: ['视频数', '总观看'],
      xAxisType: 'time',
      scale: [true, true],
      axisSite: { right: ['archiveView'] }
    }
    this.vtb = {
      dimension: ['time'],
      metrics: ['liveStatus', 'online'],
      labelMap: {
        liveStatus: '直播中',
        online: '总人气'
      },
      yAxisName: ['直播中', '总人气'],
      xAxisType: 'time',
      axisSite: { right: ['online'] }
    }
    this.vtbExtend = {
      'series.0.step': 'end',
      'series.0.smooth': false,
      series: { sampling: 'average' }
    }
    this.guard = {
      dimension: ['time'],
      metrics: ['guardNum'],
      labelMap: {
        guardNum: '舰团'
      },
      yAxisName: ['舰长+提督+总督'],
      scale: [true],
      xAxisType: 'time'
    }
    this.reserve = {
      dimension: ['time'],
      metrics: ['coins'],
      labelMap: {
        coins: '总硬币'
      },
      yAxisName: ['硬币'],
      xAxisType: 'time',
      scale: [true]
    }
    return {}
  }
}
</script>

<style scoped>
</style>
