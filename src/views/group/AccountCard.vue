<template>
<router-link :to="`/detail/${account.mid}`" class="account-card">
  <div class="head">
    <img v-if="face" :src="face" class="face" loading="lazy" alt="">
    <div v-else class="face"></div>
    <div class="identity">
      <div class="name-row">
        <span v-if="rank" class="rank">#{{rank}}</span>
        <span class="uname" :title="account.uname">{{account.uname || account.mid}}</span>
        <span v-if="account.liveStatus" class="tag is-link is-small live" title="打开直播间" @click.prevent.stop="openLive">直播中</span>
      </div>
      <div class="sign" :title="account.sign">{{account.sign || '这个人很懒，什么都没有写'}}</div>
    </div>
  </div>
  <div class="stats">
    <div v-for="(text, key) in stats" :key="key" class="stat" :class="{ highlight: key === highlight }">
      <span class="stat-label">{{text}}</span>
      <span class="stat-value" :class="key === 'rise' && riseClass">{{key === 'rise' && account.rise > 0 ? '+' : ''}}{{account[key] | parseNumber}}</span>
    </div>
  </div>
</router-link>
</template>

<script>
import { faceUrl } from './data'

export default {
  props: {
    account: Object,
    rank: Number,
    highlight: String,
  },
  data() {
    this.stats = {
      follower: '关注',
      rise: '日增',
      guardNum: '舰团',
      archiveView: '播放',
      video: '视频',
    }
    return {}
  },
  computed: {
    face() {
      return faceUrl(this.account.face)
    },
    riseClass() {
      if (this.account.rise > 0) {
        return 'more'
      }
      if (this.account.rise < 0) {
        return 'less'
      }
      return ''
    },
  },
  methods: {
    openLive() {
      window.open(`https://live.bilibili.com/${this.account.roomid}`, '_blank')
    },
  },
}
</script>

<style scoped>
.account-card {
  display: block;
  height: 100%;
  padding: 14px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  color: inherit;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.account-card:hover {
  border-color: #c6e2ff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.head {
  display: flex;
  gap: 12px;
}

.face {
  flex: 0 0 52px;
  width: 52px;
  height: 52px;
  border-radius: 5px;
  background: #f2f3f5;
  object-fit: cover;
}

.identity {
  min-width: 0;
  flex: 1;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rank {
  color: #909399;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.uname {
  font-weight: 600;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.live {
  flex-shrink: 0;
  height: 1.6em;
}

.sign {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}

.stats {
  display: grid;
  grid-template-columns: repeat(5, auto);
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f2f3f5;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-label {
  color: #909399;
  font-size: 12px;
}

.stat-value {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.stat.highlight .stat-value {
  font-weight: 600;
}

.stat.highlight .stat-value:not(.more):not(.less) {
  color: #409eff;
}

.more {
  color: #00b33c;
}

.less {
  color: #ec0000;
}
</style>
