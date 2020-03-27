<template>
<el-row>
  <el-col :xs="24" :span="12" v-loading="!guardMacroK.length">
    <h1>舰团日K:</h1>
    <ve-candle :data="{rows:guardMacroK}" :settings="guardK" :not-set-unchange="['dataZoom']"></ve-candle>
  </el-col>
  <el-col :xs="24" :span="12" v-loading="!guardMacroWeekK.length">
    <h1>舰团周K:</h1>
    <ve-candle :data="{rows:guardMacroWeekK}" :settings="guardWeekK" :not-set-unchange="['dataZoom']"></ve-candle>
  </el-col>
</el-row>
</template>

<script>
import { getMacroK, getMacroWeekK } from '@/socket'

export default {
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
      upColor: '#ec0000',
      downColor: '#00da3c',
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
      upColor: '#ec0000',
      downColor: '#00da3c',
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
