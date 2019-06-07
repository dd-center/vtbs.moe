<template>
<el-container>
  <el-main>
    <el-row type="flex" justify="space-around">
      <h1>VTBs in Bilibili!</h1>
    </el-row>
    <el-row type="flex" justify="space-around">
    </el-row>
    <h2>1小时直播弹幕</h2>
    <el-row>
      <el-col>
        <ve-wordcloud v-loading="!hawk.h.length" :settings="{ sizeMax: 128, sizeMin: 12 }" :data="{ columns: ['word', 'weight'], rows: hawk.h }" :extend="wordCloudExtend"></ve-wordcloud>
      </el-col>
    </el-row>
    <h2>24小时直播弹幕</h2>
    <el-row>
      <el-col>
        <ve-wordcloud v-loading="!hawk.day.length" :settings="{ sizeMax: 128, sizeMin: 12 }" :data="{ columns: ['word', 'weight'], rows: hawk.day }" :extend="wordCloudExtend"></ve-wordcloud>
      </el-col>
    </el-row>
  </el-main>
</el-container>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'

import VeWordCloud from 'v-charts/lib/wordcloud.common'

Vue.component(VeWordCloud.name, VeWordCloud)

export default {
  name: 'home',
  data() {
    this.wordCloudExtend = {
      'series.0.width': '100%',
      'series.0.height': '100%',
      'series.0.tooltip.show': false,
    }
    return {}
  },
  components: {},
  methods: {},
  computed: mapState(['hawk']),
}
</script>

<style scoped>
h1 {
  margin: 0px;
  font-size: 32px;
  font-family: Optima;
  color: #409EFF;
}
</style>
