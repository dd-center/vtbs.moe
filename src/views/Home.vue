<template>
<div class="column is-gapless gap">
  <input class="input search is-rounded vtb-search" v-model="search" type="text" placeholder="查找主播~">
  <div class="columns">
    <div class="column vtb-column"></div>
    <div class="column is-full-mobile is-11-tablet is-10-desktop is-three-fifths-widescreen is-7-fullhd">
      <p v-if="cacheAge">数据缓存于: <span class="tag is-rounded is-info smallMargin">{{cacheAge}}</span></p>
      <progress class="progress" max="100" v-if="!currentVtbs.length"></progress>
      <transition-group name="flip-list">
        <card v-for="vtb in rankLimit" :vtb="vtb" hover :key="vtb.mid" class="card"></card>
      </transition-group>
    </div>
    <div class="column"></div>
  </div>
</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import card from '@/components/card'
import moment from 'moment'

export default {
  name: 'home',
  data() {
    return {
      show: 32,
      search: ''
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
  computed: {
    ...mapState(['currentVtbs', 'cachedTime']),
    ...mapGetters(['vtbs', 'followerRank', 'liveRank', 'riseRank']),
    cacheAge() {
      if (!this.currentVtbs.length && this.cachedTime) {
        return moment(this.cachedTime).fromNow()
      } else {
        return false
      }
    },
    rank: function() {
      if (this.$route.path.includes('live')) {
        return this.liveRank
      }
      if (this.$route.path.includes('rise')) {
        return this.riseRank
      }
      if (this.$route.path.includes('drop')) {
        return [...this.riseRank].reverse()
      }
      return this.followerRank
    },
    preRank: function(){
      // 临时变量, 存储将要展示的主播列表
      let temRank = this.rank;
      if(this.search){
        temRank = temRank.filter(i=>{
          if(this.$store.getters.info[i.mid]?.uname?.includes(this.search))
            return true;
        })
      }
      return temRank
    },
    rankLimit: function() {
      return this.preRank
        .filter((info, index) => index < this.show)
    },
    allDisplay() {
      return this.show >= this.vtbs.length
    },
  },
}
</script>

<style scoped>

.vtb-search{
  right: 10px;
  bottom: 10px;
  box-shadow: inset 0 0.0625em 1em rgba(10, 10, 10, 0.05);
  outline: none;
  /* border: none; */
  width: 260px;
  position: fixed;
  z-index: 99;
  backdrop-filter: blur(6px) grayscale(50%);
  background-color: rgba(255, 255, 255, 0.3);
}
.vtb-search:focus{
  box-shadow: inset 0 0.0625em 1em rgba(10, 10, 10, 0.05);
}
.vtb-column{
  padding: 25px;
}
.smallMargin {
  margin-bottom: 6px;
}

.flip-list-move {
  transition: transform 0.5s;
}

.flip-list-enter {
  opacity: 0;
}

.flip-list-enter-active {
  transition: opacity 0.5s;
}

.flip-list-leave {
  display: none;
}

.flip-list-leave-active {
  display: none;
}

.card {
  margin-bottom: 32px;
}

.gap {
  padding: 16px;
  padding-left: 32px;
  padding-right: 32px;
}
</style>
