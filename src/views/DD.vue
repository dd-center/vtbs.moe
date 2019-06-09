<template>
<el-container v-loading="!rank.length">
  <el-main>
    <el-row>
      <d :dd="dd" v-for="dd in rankLimit" :key="dd.mid"></d>
    </el-row>
    <el-row v-if="!all && allDisplay">
      <el-col style="text-align: center;">
        <p>想要看完整列表? 可能会卡哦</p>
        <el-button type="danger" @click="loadAll" :loading="loading">看!</el-button>
        <p v-loading="!lastUpdate">上次更新: {{lastUpdate}}</p>
      </el-col>
    </el-row>
  </el-main>
</el-container>
</template>

<script>
import { get } from '@/socket'
import d from '@/components/d'

import moment from 'moment'

export default {
  data: function() {
    return {
      dds: {},
      all: false,
      loading: false,
      time: undefined,
      show: 64,
    }
  },
  async created() {
    if (!Object.keys(this.dds).length) {
      this.time = await get('fullGuard', 'time')
      this.dds = await get('fullGuard', 'some')
    }
  },
  mounted() {
    this.$nextTick(function() {
      document.onscroll = () => {
        if (document.body.clientHeight - window.scrollY - window.innerHeight < (document.body.clientHeight / this.show * 64) && this.rank.length) {
          if (!this.allDisplay) {
            this.show += 32
          }
        }
      }
    })
  },
  destroyed() {
    document.onscroll = null
  },
  computed: {
    rank: function() {
      let dds = { ...this.dds }
      return Object.keys(dds)
        .map(mid => dds[mid])
        .map(dd => ({ ...dd, power: dd.dd[0].length * 100 + dd.dd[1].length * 10 + dd.dd[2].length }))
        .sort((a, b) => b.power - a.power)
    },
    rankLimit() {
      return this.rank.filter((g, index) => index < this.show)
    },
    lastUpdate() {
      if (this.time) {
        return moment(this.time).format('M月D日 H:M')
      }
      return undefined
    },
    allDisplay() {
      return this.show >= this.rank.length
    },
  },
  methods: {
    loadAll: async function() {
      this.loading = true
      this.dds = await get('fullGuard', 'all')
      this.all = true
      this.show = Infinity
    },
  },
  components: {
    d,
  },
}
</script>

<style scoped>
.flip-list-move {
  transition: transform 0.5s;
}

.card {
  margin-bottom: 32px;
}
</style>
