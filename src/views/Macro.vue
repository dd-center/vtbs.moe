<template>
<el-container>
  <el-main>
    <h1>VTB</h1>
    <el-row v-loading="!macro.length">
      <el-col :xs="24" :span="12">
        <h1>视频势:</h1>
        <ve-line :data="{rows:macro}" :settings="vup" :data-zoom="dataZoom"></ve-line>
      </el-col>
      <el-col :xs="24" :span="12">
        <h1>直播势:</h1>
        <ve-line :data="{rows:macro}" :settings="vtb" :data-zoom="dataZoom"></ve-line>
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
    let macros = await get('macro')
    this.insertMacro(macros)
  },
  methods: mapMutations(['insertMacro']),
  computed: mapState(['macro']),
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
      xAxisType: 'time',
      axisSite: { right: ['online'] }
    }
    return {}
  }
}
</script>

<style scoped>
</style>
