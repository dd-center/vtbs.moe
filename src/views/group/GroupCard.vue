<template>
<router-link :to="`/detail/group/${group.uuid}`" class="group-card">
  <div class="head">
    <img v-if="face" :src="face" class="face" loading="lazy" alt="">
    <div v-else class="face placeholder">{{group.name.slice(0, 1)}}</div>
    <div class="identity">
      <div class="name-row">
        <span class="rank">#{{rank}}</span>
        <span class="name" :title="group.name">{{group.name}}</span>
      </div>
      <div class="meta">
        {{group.vtuberCount}} 位成员 · {{group.accountCount}} 个账号
        <span v-if="group.liveNum" class="live">· {{group.liveNum}} 直播中</span>
      </div>
    </div>
  </div>
  <div class="members">
    <img v-for="member in topFaces" :key="member.mid" :src="member.face" class="member-face" loading="lazy" alt="">
    <span v-if="group.accountCount > topFaces.length" class="more-members">+{{group.accountCount - topFaces.length}}</span>
  </div>
  <div class="stats">
    <div v-for="(text, key) in stats" :key="key" class="stat" :class="{ highlight: key === highlight }">
      <span class="stat-label">{{text}}</span>
      <span class="stat-value" :class="key === 'rise' && riseClass">{{key === 'rise' && group.rise > 0 ? '+' : ''}}{{group[key] | parseNumber}}</span>
    </div>
  </div>
</router-link>
</template>

<script>
import { faceUrl } from './data'

export default {
  props: {
    group: Object,
    rank: Number,
    highlight: String,
  },
  computed: {
    stats() {
      // 按播放/视频排序时，用排序项替换中间的日增
      const middle = { archiveView: '总播放', video: '总视频' }[this.highlight]
      if (middle) {
        return { follower: '总关注', [this.highlight]: middle, guardNum: '总舰团' }
      }
      return { follower: '总关注', rise: '日增', guardNum: '总舰团' }
    },
    face() {
      return faceUrl(this.group.face)
    },
    topFaces() {
      return this.group.topFaces
        .filter(({ face }) => face)
        .map(({ mid, face }) => ({ mid, face: faceUrl(face, 64) }))
    },
    riseClass() {
      if (this.group.rise > 0) {
        return 'more'
      }
      if (this.group.rise < 0) {
        return 'less'
      }
      return ''
    },
  },
}
</script>

<style scoped>
.group-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  padding: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  color: inherit;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.group-card:hover {
  border-color: #c6e2ff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.face {
  flex: 0 0 56px;
  width: 56px;
  height: 56px;
  border-radius: 6px;
  object-fit: cover;
  background: #f2f3f5;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 22px;
  font-weight: 600;
}

.identity {
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.rank {
  color: #909399;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.name {
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.meta {
  margin-top: 2px;
  color: #909399;
  font-size: 12px;
}

.meta .live {
  color: #3273dc;
}

.members {
  display: flex;
  align-items: center;
  height: 28px;
}

.member-face {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #fff;
  margin-right: -8px;
  object-fit: cover;
  background: #f2f3f5;
}

.more-members {
  margin-left: 14px;
  color: #909399;
  font-size: 12px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  font-size: 15px;
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
