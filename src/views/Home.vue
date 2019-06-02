<template>
<el-container>
  <el-main>
    <el-row type="flex" justify="space-around">
      <el-col :xs="24" :sm="20" :md="16" :lg="13" :xl="12" v-loading="!vtbs.length">
        <transition-group name="flip-list">
          <card v-for="vtb in rankLimit" :vtb="vtb" hover :key="vtb.mid" class="card"></card>
        </transition-group>
      </el-col>
    </el-row>
    <el-row v-if="!showAll && vtbs.length">
      <el-col style="text-align: center;">
        <el-button @click="loadingShowAll" :loading="loading">显示所有</el-button>
      </el-col>
    </el-row>
  </el-main>
</el-container>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'

import card from '@/components/card'

export default {
  name: 'home',
  data() {
    return {
      loading: false,
    }
  },
  components: {
    card,
  },
  methods: {
    loadingShowAll() {
      this.loading = true
      setTimeout(() => this.enableShowAll(), 100)
    },
    ...mapMutations(['enableShowAll']),
  },
  computed: { ...mapState(['vtbs', 'showAll']),
    ...mapGetters(['followerRank', 'liveRank', 'riseRank']),
    rank: function() {
      if (this.$route.path.includes('live')) {
        return this.liveRank
      }
      if (this.$route.path.includes('rise')) {
        return this.riseRank
      }
      return this.followerRank
    },
    rankLimit: function() {
      if (this.showAll) {
        return this.rank
      } else {
        return this.rank
          .filter((info, index) => index < 64)
      }
    },
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
