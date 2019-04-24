<template>
<el-container>
  <el-main>
    <h1>VTB</h1>
    <el-row>
      <el-col :xs="24" :span="12" v-loading="!vupMacro.length">
        <h1>视频势:</h1>
        <ve-line :data="{rows:vupMacro}" :settings="vup" :data-zoom="dataZoom"></ve-line>
      </el-col>
      <el-col :xs="24" :span="12" v-loading="!vtbMacro.length">
        <h1>直播势:</h1>
        <ve-line :data="{rows:vtbMacro}" :settings="vtb" :data-zoom="dataZoom"></ve-line>
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
      let vup = await get('vupMacro')
      let vtb = await get('vtbMacro')
      this.updateMacro({ vup, vtb })
    }
  },
  methods: mapMutations(['updateMacro']),
  computed: mapState(['vupMacro', 'vtbMacro']),
  data: function() {
    this.dataZoom = [{
      type: 'slider',
      start: 50,
      end: 100
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
    return {}
  }
}
</script>

<style scoped>
</style>
