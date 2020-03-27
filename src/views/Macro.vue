<template>
<el-container>
  <el-main>
    <h1>1小时直播弹幕</h1>
    <ve-wordcloud v-loading="!hawkProxyH.length" :settings="{ sizeMax: 96, sizeMin: 12 }" :data="{ columns: ['word', 'weight'], rows: hawkProxyH }" :extend="wordCloudExtend"></ve-wordcloud>
    <h1>24小时直播弹幕</h1>
    <ve-wordcloud v-loading="!hawkProxyDay.length" :settings="{ sizeMax: 96, sizeMin: 12 }" :data="{ columns: ['word', 'weight'], rows: hawkProxyDay }" :extend="wordCloudExtend"></ve-wordcloud>
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
    <guardMarcoK></guardMarcoK>
    <el-row>
      <el-col :span="24" v-loading="!vupMacro.length">
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

import { getDeflateTimeSeries } from '@/socket'

import VeLine from 'v-charts/lib/line.common'
import VeCandle from 'v-charts/lib/candle.common'
import VeWordCloud from 'v-charts/lib/wordcloud.common'
import 'echarts/lib/component/dataZoom'

import guardMarcoK from '@/components/guardMarcoK.vue'

Vue.component(VeLine.name, VeLine)
Vue.component(VeCandle.name, VeCandle)
Vue.component(VeWordCloud.name, VeWordCloud)

export default {
  components: {
    guardMarcoK,
  },
  async mounted() {
    if (!this.vupMacro.length) {
      getDeflateTimeSeries('vupMacroCompressed')
        .then(vup => this.updateMacro({ vup }))
    }
    if (!this.vtbMacro.length) {
      getDeflateTimeSeries('vtbMacroWeekCompressed')
        .then(vtb => this.updateMacro({ vtb }))
    }
    if (!this.guardMacro.length) {
      const guard = await getDeflateTimeSeries('guardMacroCompressed')
      this.updateMacro({ guard })
    }
    this.hawkUpdater = setInterval(() => {
      this.hawkProxyDay = [...this.hawk.day]
      this.hawkProxyH = [...this.hawk.h]
    }, 1000 * 60)
    this.hawkProxyDay = [...this.hawk.day]
    this.hawkProxyH = [...this.hawk.h]
  },
  destroyed: function() {
    clearInterval(this.hawkUpdater)
  },
  methods: {
    loadVtbMacroAll() {
      this.loading = true
      getDeflateTimeSeries('vtbMacroCompressed')
        .then(vtb => {
          this.fullVtb = true
          this.updateMacro({ vtb })
        })
    },
    ...mapMutations(['updateMacro']),
  },
  computed: {
    ...mapState(['vupMacro', 'vtbMacro', 'guardMacro', 'hawk']),
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
      'series.0.sampling': 'max',
      'series.1.sampling': 'max',
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
    this.wordCloudExtend = {
      'series.0.width': '100%',
      'series.0.height': '100%',
      'series.0.tooltip.show': false,
    }
    return {
      loading: false,
      hawkProxyDay: [],
      hawkProxyH: [],
      hawkUpdater: undefined,
      fullVtb: false,
    }
  },
}
</script>

<style scoped>

</style>
