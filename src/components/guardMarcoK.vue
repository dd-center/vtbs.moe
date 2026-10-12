<template>
<el-row>
  <el-col :xs="24" :span="12" v-loading="!guardMacroK.length">
    <h1>舰团日K:</h1>
    <time-series-chart :rows="guardMacroK" :settings="guardK" type="candle"></time-series-chart>
  </el-col>
  <el-col :xs="24" :span="12" v-loading="!guardMacroWeekK.length">
    <h1>舰团周K:</h1>
    <time-series-chart :rows="guardMacroWeekK" :settings="guardWeekK" type="candle"></time-series-chart>
  </el-col>
</el-row>
</template>

<script>
import { getMacroK, getMacroWeekK } from '@/socket'
import TimeSeriesChart from '@/components/TimeSeriesChart.vue'

export default {
  components: { TimeSeriesChart },
  async mounted() {
    this.guardMacroK = await getMacroK()
    this.guardMacroWeekK = await getMacroWeekK()
  },
  sockets: {
    async connect() {
      this.guardMacroK = await getMacroK()
      this.guardMacroWeekK = await getMacroWeekK()
    },
    guardMacroK(macro) {
      const { time } = this.guardMacroK[this.guardMacroK.length - 1] || {}
      if (macro.time === time) {
        this.guardMacroK.pop()
      }
      this.guardMacroK.push(macro)
    },
    guardMacroWeekK(macro) {
      const { weekNum } = this.guardMacroWeekK[this.guardMacroWeekK.length - 1] || {}
      if (macro.weekNum === weekNum) {
        this.guardMacroWeekK.pop()
      }
      this.guardMacroWeekK.push(macro)
    },
  },
  data() {
    this.guardK = {
      labelMap: {
        open: '开盘',
        close: '收盘',
        lowest: '最低',
        highest: '最高',
      },
      upColor: '#e34948',
      downColor: '#1a9e6b',
      showMA: true,
      // MA: [3],
      dimension: 'time',
      metrics: ['open', 'close', 'lowest', 'highest'],
      showDataZoom: true,
    }
    this.guardWeekK = {
      labelMap: {
        open: '开盘',
        close: '收盘',
        lowest: '最低',
        highest: '最高',
        日K: '周K',
      },
      legendName: {
        日K: '周K',
      },
      upColor: '#e34948',
      downColor: '#1a9e6b',
      dimension: 'time',
      metrics: ['open', 'close', 'lowest', 'highest'],
    }
    return {
      guardMacroK: [],
      guardMacroWeekK: [],
    }
  },
}
</script>

<style>

</style>
