<template>
<el-container>
  <el-main>
    <el-row>
      <el-col>
        <ve-wordcloud class="cloud" v-loading="!hTitle.length" :settings="{ sizeMax: 64, sizeMin: 12 }" :data="{ columns: ['word', 'weight'], rows: hTitle }" :extend="wordCloudExtend">
        </ve-wordcloud>
      </el-col>
    </el-row>
    <el-row type="flex" justify="center">
      <el-col :sm="10" :md="8" :lg="6" :xl="4" :xs="14">
        <el-card class="box-card" shadow="hover" v-loading="!liveRank">
          <p>直播中: {{liveCount}}</p>
          <p>舰团: {{guardCount}}</p>
        </el-card>
      </el-col>
    </el-row>
    <el-row type="flex" justify="center">
      <el-col :sm="14" :md="8" :lg="8" :xl="8" :xs="24">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="center">
            <router-link to="live" class="link">
              <h2>直播势 <span class="el-icon-d-caret"></span></h2>
            </router-link>
          </div>
          <rank :list="liveRankLimit3" :mini="true"></rank>
        </el-card>
      </el-col>
      <el-col :sm="14" :md="8" :lg="8" :xl="8" :xs="24" class="hidden-sm-and-down">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="center">
            <router-link to="rise" class="link">
              <h2>急上升 <span class="el-icon-top"></span></h2>
            </router-link>
          </div>
          <rank :list="riseRankLimit3" :mini="true"></rank>
        </el-card>
      </el-col>
    </el-row>
    <el-row type="flex" justify="center" class="hidden-md-and-up">
      <el-col :sm="14" :xs="24">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="center">
            <router-link to="rise" class="link">
              <h2>急上升 <span class="el-icon-top"></span></h2>
            </router-link>
          </div>
          <rank :list="riseRankLimit3" :mini="true"></rank>
        </el-card>
      </el-col>
    </el-row>
  </el-main>
</el-container>
</template>

<script>
import Vue from 'vue'
import { mapState, mapGetters } from 'vuex'

import rank from '@/components/rank'
import VeWordCloud from 'v-charts/lib/wordcloud.common'

Vue.component(VeWordCloud.name, VeWordCloud)

export default {
  name: 'home',
  data() {
    this.wordCloudExtend = {
      'series.0.width': '100%',
      'series.0.height': '100%',
      'series.0.tooltip.show': false,
      'series.0.rotationRange': [-45, 45],
      'series.0.rotationStep': 1,
    }
    return {}
  },
  components: {
    rank,
  },
  methods: {},
  computed: {
    ...mapState(['hawk', 'info']),
    ...mapGetters(['followerRank', 'liveRank', 'riseRank']),
    followerRankLimit3() {
      return this.followerRank
        .filter((info, index) => index < 3)
    },
    liveRankLimit3() {
      return this.liveRank
        .filter((info, index) => index < 3)
    },
    riseRankLimit3() {
      return this.riseRank
        .filter((info, index) => index < 3)
    },
    liveCount() {
      return this.liveRank
        .filter(({ mid }) => this.info[mid].liveStatus)
        .length
    },
    guardCount() {
      return this.liveRank.length && this.liveRank
        .map(({ mid }) => this.info[mid].guardNum)
        .reduce((a, b) => a + b)
    },
    hTitle() {
      if (!this.hawk.h.length) {
        return []
      }
      let h = this.hawk.h
      let max = Math.max(...h.map(({ weight }) => weight))
      return [{ word: 'VTBs in bilibili!', weight: max * 1.5 }, { word: 'vtbs.moe', weight: max * 1.3 }].concat(...h)
    },
  },
}
</script>

<style scoped>
h1 {
  margin: 0px;
  font-size: 32px;
  font-family: Optima;
  color: #409EFF;
}

h2 {
  margin: 0;
}

.box-card {
  margin: 20px;
}

.center {
  text-align: center;
}

.link {
  text-decoration: none;
  color: #303133;
}
</style>
