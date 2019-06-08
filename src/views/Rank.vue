<template>
<el-container>
  <el-main>
    <el-row type="flex" justify="space-around">
      <el-col :xs="24" :sm="20" :md="16" :lg="13" :xl="12" v-loading="!vtbs.length">
        <rank :list="rankLimit"></rank>
      </el-col>
    </el-row>
  </el-main>
</el-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import rank from '@/components/rank'

export default {
  name: 'ranks',
  data() {
    return {
      show: 32,
    }
  },
  components: {
    rank,
  },
  mounted() {
    this.$nextTick(function() {
      document.onscroll = () => {
        if (document.body.clientHeight - window.scrollY - window.innerHeight < document.body.clientHeight / 3 && this.vtbs.length) {
          if (!this.allDisplay) {
            this.show += 15
          } else {
            document.onscroll = null
          }
        }
      }
    })
  },
  destroyed() {
    document.onscroll = null
  },
  computed: { ...mapState(['vtbs']),
    ...mapGetters(['followerRank', 'liveRank', 'riseRank']),
    fullRank() {
      if (this.$route.path.includes('live')) {
        return this.liveRank
      }
      if (this.$route.path.includes('rise')) {
        return this.riseRank
      }
      return this.followerRank
    },
    rankLimit: function() {
      return this.fullRank
        .filter((info, index) => index < this.show)
    },
    allDisplay() {
      return this.show >= this.vtbs.length
    },
  },
}
</script>

<style scoped>

</style>
