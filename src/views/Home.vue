<template>
<el-container>
  <el-main class="mainContainer">
    <el-row class="mainPage" :class="pageClass">
      <el-col :span="8" class="littlePage">
        <el-row type="flex" justify="space-around">
          <el-col :xs="24" :sm="20" :md="16" :lg="13" :xl="12" v-loading="!vtbs.length">
            <transition-group name="flip-list">
              <card :livePage="false" v-for="vtb in rank.follower" :vtb="vtb" hover :key="vtb.mid" class="card"></card>
            </transition-group>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="8" class="littlePage">
        <el-row type="flex" justify="space-around">
          <el-col :xs="24" :sm="20" :md="16" :lg="13" :xl="12" v-loading="!vtbs.length">
            <transition-group name="flip-list">
              <card :livePage="true" v-for="vtb in rank.live" :vtb="vtb" hover :key="vtb.mid" class="card"></card>
            </transition-group>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="8" class="littlePage">
        <el-row type="flex" justify="space-around">
          <el-col :xs="24" :sm="20" :md="16" :lg="13" :xl="12" v-loading="!vtbs.length">
            <transition-group name="flip-list">
              <card :livePage="false" v-for="vtb in rank.rise" :vtb="vtb" hover :key="vtb.mid" class="card"></card>
            </transition-group>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </el-main>
</el-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import card from '@/components/card'

export default {
  name: 'home',
  data() {
    return {
      show: 32,
    }
  },
  components: {
    card,
  },
  methods: {},
  mounted() {
    this.$nextTick(function() {
      document.onscroll = () => {
        if (document.body.clientHeight - window.scrollY - window.innerHeight < (document.body.clientHeight / this.show * 20) && this.vtbs.length) {
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
  computed: { ...mapState(['vtbs', 'wormArray']),
    ...mapGetters(['followerRank', 'liveRank', 'riseRank']),
    rank: function() {
      let max = Math.min(this.vtbs.length, this.show)
      if (this.$route.path.includes('live')) {
        max = this.show
      }
      return {
        follower: this.followerRank.filter((info, index) => index < max),
        live: this.liveRank.filter((info, index) => index < max),
        rise: this.riseRank.filter((info, index) => index < max),
      }
    },
    pageClass() {
      if (this.$route.path.includes('live')) {
        return 'livePage'
      }
      if (this.$route.path.includes('rise')) {
        return 'risePage'
      }
      return 'followerPage'
    },
    allDisplay() {
      return this.show >= this.vtbs.length + this.wormArray.length
    },
  },
}
</script>

<style scoped>
.mainPage {
  width: 300%;
  position: relative;
  transition: right 0.4s ease 0s;
}

.followerPage {
  right: 0%;
}

.livePage {
  right: 100%;
}

.risePage {
  right: 200%;
}

.littlePage {
  padding: 20px;
}

.mainContainer {
  overflow-x: hidden;
  padding: 0;
}

.flip-list-move {
  transition: transform 0.5s;
}

.card {
  margin-bottom: 32px;
}
</style>
