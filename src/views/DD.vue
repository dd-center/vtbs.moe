<template>
<div class="container padding">
  <progress v-if="!rank.length" class="progress" max="100"></progress>
  <virtual-list
    :item-style="{'margin-bottom':'24px'}"
    :data-key="'mid'"
    :data-sources="rank"
    :data-component="dComp"
    page-mode
  />
  <div v-if="!all" class="has-text-centered">
    <hr>
    <p>想要看完整列表? </p>
    <button class="button is-primary is-outlined is-rounded" @click="loadAll" :disabled="loading">看!</button>
  </div>
  <p v-if="lastUpdate">上次更新: {{lastUpdate}}</p>
</div>
</template>

<script>
import VirtualList from 'vue-virtual-scroll-list'
import { get } from '@/socket'
import d from '@/components/d'
import dVirtualItem from '@/components/dVirtualItem'

import moment from 'moment'

export default {
  data: function() {
    return {
      dds: {},
      all: false,
      loading: false,
      time: undefined,
      dComp: dVirtualItem
    }
  },
  components: {
    'virtual-list': VirtualList
  },
  async created() {
    if (!Object.keys(this.dds).length) {
      this.time = await get('fullGuard', 'time')
      this.dds = await get('fullGuard', 'some')
    }
  },
  computed: {
    rank: function() {
      let dds = { ...this.dds }
      return Object.keys(dds)
        .map(mid => dds[mid])
        .map(dd => ({ ...dd, power: dd.dd[0].length * 100 + dd.dd[1].length * 10 + dd.dd[2].length }))
        .sort((a, b) => b.power - a.power)
    },
    lastUpdate() {
      if (this.time) {
        return moment(this.time).format('M月D日 H:M')
      }
      return undefined
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
/* .flip-list-move {
  transition: transform 0.5s;
}

.card {
  margin-bottom: 32px;
} */
.padding {
  padding: 12px;
}
</style>
