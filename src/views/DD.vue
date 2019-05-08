<template>
<el-container v-loading="!rank.length">
  <el-main>
    <el-row>
      <d :dd="dd" v-for="dd in rank" :key="dd.mid"></d>
    </el-row>
    <el-row v-if="!all">
      <el-col style="text-align: center;">
        <p>想要看完整列表? 可能会卡哦</p>
        <el-button type="danger" @click="loadAll" :loading="loading">看!</el-button>
      </el-col>
    </el-row>
  </el-main>
</el-container>
</template>

<script>
import { get } from '@/socket'
import d from '@/components/d'

export default {
  data: function() {
    return {
      dds: {},
      all: false,
      loading: false,
    }
  },
  async created() {
    if (!Object.keys(this.dds).length) {
      this.dds = await get('fullGuard', 'some')
    }
  },
  computed: {
    rank: function() {
      let dds = { ...this.dds }
      return Object.keys(dds)
        .filter(key => key !== 'time')
        .map(mid => dds[mid])
        .map(dd => ({ ...dd, power: dd.dd[0].length * 100 + dd.dd[1].length * 10 + dd.dd[2].length }))
        .sort((a, b) => b.power - a.power)
    },
  },
  methods: {
    loadAll: async function() {
      this.loading = true
      this.dds = await get('fullGuard', 'all')
      this.all = true
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
