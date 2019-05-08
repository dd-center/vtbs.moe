<template>
<el-container v-loading="!rank.length">
  <el-main>
    <el-row>
      <d :dd="dd" v-for="dd in rank" :key="dd.mid"></d>
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
