<template>
<section class="hero is-fullheight">
  <p class="gap">贴贴</p>
  <div id="cy" class="hero-body" v-if="!loaded">
    <progress class="progress" max="100"></progress>
  </div>
  <tietie v-else :tieties="tieties"></tietie>
</section>
</template>

<script>
import { mapState } from 'vuex'

import { get } from '@/socket'

import tietie from '@/components/tietie'

export default {
  data: () => ({ tieties: undefined }),
  computed: {
    ...mapState(['info']),
    loaded() {
      return Object.keys(this.info).length && this.tieties
    },
  },
  async mounted() {
    this.tieties = await get('fullGuard', 'tietie')
  },
  components: {
    tietie,
  },
}
</script>

<style scoped>
.gap {
  padding: 10px;
}
</style>
