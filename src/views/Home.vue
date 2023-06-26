<template>
<div class="column is-gapless gap">
  <input class="input search is-rounded vtb-search" v-model="search" type="text" placeholder="查找主播~">
  <div class="columns">
    <div class="column vtb-column"></div>
    <div class="column is-full-mobile is-11-tablet is-10-desktop is-three-fifths-widescreen is-7-fullhd" :style="{height: sumHeight}" ref="container">
      <p v-if="cacheAge">数据缓存于: <span class="tag is-rounded is-info smallMargin">{{cacheAge}}</span></p>
      <progress class="progress" max="100" v-if="!currentVtbs.length"></progress>
      <card v-if="mountCard" :vtb="mountCard" hover class="aboveTop" ref="mountCard"></card>
      <transition-group name="flip-list">
        <card v-for="{vtb, h} in rankLimit" :vtb="vtb" hover :key="vtb.mid" class="card" :style="{top: h, width: unitWidth}"></card>
      </transition-group>
    </div>
    <div class="column"></div>
  </div>
</div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import card from '@/components/card'
import moment from 'moment'

const SHOW = 16

const threshold = Array(2000).fill(0).map((_, i) => 1 / 2000 * i)

export default {
  name: 'home',

  methods: {
    ...mapActions([
      'fetchSecretList',
    ]),
  },

  data() {
    return {
      show: 32,
      search: '',
      intersectionObserver: undefined,
      resizeObserver: undefined,
      unitHeight: 172,
      unitWidth: undefined,
      ratio: 0,
    }
  },
  components: {
    card,
  },
  watch: {
    mountCard: {
      immediate: true,
      async handler() {
        await this.$nextTick()
        if (this.$refs.mountCard) {
          this.resizeObserver.observe(this.$refs.mountCard.$el)
        }
      },
    },
    secretPage: {
      immediate: true,
      async handler() {
        if (this.secretPage) {
          await this.fetchSecretList()
        }
      }
    }
  },
  computed: {
    ...mapState(['currentVtbs', 'cachedTime']),
    ...mapGetters(['vtbs', 'followerRank', 'liveRank', 'riseRank', 'guardRank', 'secretRank']),
    baseHeight() {
      if (this.cacheAge) {
        return 57 + 86
      }
      return 57
    },
    mountCard() {
      return this.preRank[0]
    },
    sumHeight() {
      return `${this.preRank.length * this.unitHeight}px`
    },
    skip() {
      const total = this.preRank.length
      return Math.max(0, Math.min(total - SHOW, Math.floor(this.ratio * total)))
    },
    cacheAge() {
      if (!this.currentVtbs.length && this.cachedTime) {
        return moment(this.cachedTime).fromNow()
      } else {
        return false
      }
    },
    secretPage() {
      return this.$route.path.includes('secret')
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
      if (this.$route.path.includes('guard')) {
        return this.guardRank
      }
      if (this.$route.path.includes('secret')) {
        return this.secretRank
      }
      return this.followerRank
    },
    preRank() {
      const keys = this.search.toLowerCase().split(' ').filter(Boolean)
      if (keys.length) {
        return this.rank.filter(i => keys.every(key => ((this.$store.getters.info[i.mid] || {}).uname || []).toLowerCase().includes(key)))
      }
      return this.rank
    },
    rankLimit: function() {
      return this.preRank
        .slice(this.skip, this.skip + SHOW)
        .map((vtb, i) => ({ vtb, h: `${(i + this.skip) * this.unitHeight + this.baseHeight}px` }))
    },
  },
  created() {
    this.resizeObserver = new ResizeObserver(([{ contentRect: { height, width } }]) => {
      this.unitHeight = height
      this.unitWidth = `${width}px`
    })
    this.intersectionObserver = new IntersectionObserver(([{ intersectionRatio }]) => {
      this.ratio = intersectionRatio
    }, {
      rootMargin: '999999px 0px -150% 0px',
      root: null,
      threshold,
    })
  },
  mounted() {
    this.intersectionObserver.observe(this.$refs.container)
  },
  destroyed() {
    this.resizeObserver.disconnect()
    this.intersectionObserver.disconnect()
  },
}
</script>

<style scoped>
.vtb-search {
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

.vtb-search:focus {
  box-shadow: inset 0 0.0625em 1em rgba(10, 10, 10, 0.05);
}

.vtb-column {
  padding: 25px;
}

.smallMargin {
  margin-bottom: 6px;
}

.flip-list-move {
  transition: transform 0.5s;
}

.card {
  position: absolute;
}

.aboveTop {
  z-index: -20;
  opacity: 0;
}

.gap {
  padding: 16px;
  padding-left: 32px;
  padding-right: 32px;
}
</style>
