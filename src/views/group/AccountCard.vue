<template>
  <div class="acc-card">
    <div class="rank-badge" v-if="rank">
      {{ rank }}
    </div>
    <div class="acc-head">
      <img :src="face" class="acc-face" referrerpolicy="no-referrer" @click="goSpace">
      <div class="acc-id">
        <div class="acc-name" :title="uname">{{ uname || mid }}</div>
        <div class="acc-sign" :title="sign">{{ sign || '暂无签名' }}</div>
      </div>
    </div>
    <div class="acc-metrics">
      <div class="m m-follow">
        <i class="el-icon-star-on m-icon"></i>
        <span class="m-label">粉丝</span>
        <span class="m-val">{{ num(follower) }}</span>
      </div>
      <div class="m m-guard">
        <i class="el-icon-location-outline m-icon"></i>
        <span class="m-label">舰团</span>
        <span class="m-val">{{ num(guardNum) }}</span>
      </div>
    </div>
    <div class="acc-links">
      <a :href="spaceUrl" target="_blank" rel="noopener">空间</a>
      <a v-if="roomid" :href="liveUrl" target="_blank" rel="noopener">直播间</a>
    </div>
  </div>
</template>

<script>
import { num } from './data'

export default {
  name: 'AccountCard',
  props: {
    account: { type: Object, required: true },
    rank: { type: [Number, String], default: 0 },
  },
  computed: {
    mid() { return this.account.mid },
    uname() { return this.account.uname },
    sign() { return (this.account.sign || '').trim() },
    face() {
      const f = this.account.face || ''
      if (f && !f.includes('@')) return f + '@256w_256h'
      return f
    },
    follower() { return this.account.follower },
    guardNum() { return this.account.guardNum },
    roomid() { return this.account.roomid },
    spaceUrl() { return 'https://space.bilibili.com/' + this.mid },
    liveUrl() { return 'https://live.bilibili.com/' + this.roomid },
  },
  methods: {
    num,
    goSpace() {
      window.open(this.spaceUrl, '_blank')
    },
  },
}
</script>

<style scoped>
.acc-card {
  position: relative;
  border: 1px solid #e3e8ee;
  border-radius: 8px;
  background: #fff;
  padding: 14px;
  height: 100%;
  transition: box-shadow .2s, transform .2s;
}
.acc-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, .1);
  transform: translateY(-2px);
}
.rank-badge {
  position: absolute;
  top: -10px;
  left: -10px;
  min-width: 30px;
  height: 30px;
  padding: 0 6px;
  border-radius: 8px;
  background: #409eff;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(64, 158, 255, .4);
}
.acc-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.acc-face {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  flex: 0 0 64px;
  object-fit: cover;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,.12);
}
.acc-id {
  flex: 1;
  min-width: 0;
}
.acc-name {
  font-size: 16px;
  font-weight: 700;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.acc-sign {
  margin-top: 4px;
  font-size: 12px;
  color: #888;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}
.acc-metrics {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
}
.m {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
}
.m-icon { font-size: 16px; }
.m-label {
  font-size: 12px;
  color: #999;
}
.m-val {
  font-weight: 700;
  margin-left: auto;
  font-size: 16px;
}
.m-follow .m-icon,
.m-follow .m-val { color: #f78fb3; }
.m-guard .m-icon,
.m-guard .m-val { color: #e8a33d; }
.acc-links {
  display: flex;
  gap: 14px;
  margin-top: 10px;
  justify-content: center;
}
.acc-links a {
  font-size: 13px;
  color: #409eff;
}
</style>
