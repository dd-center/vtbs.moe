<template>
  <div class="group-card" @click="goDetail">
    <span class="rank-badge">{{ rank }}</span>
    <div class="top">
      <img class="face" :src="group.avatar" referrerpolicy="no-referrer" alt="">
      <div class="gname" :title="group.displayName">{{ group.displayName }}</div>
    </div>
    <div class="metrics">
      <div class="metric">
        <span class="label"><i class="el-icon-star-on star"></i> 总粉丝</span>
        <span class="value fans">{{ num(group.followers) }}</span>
      </div>
      <div class="metric">
        <span class="label"><i class="el-icon-location-outline shield"></i> 总舰团</span>
        <span class="value guard">{{ num(group.guards) }}</span>
      </div>
    </div>
    <div class="foot">
      <span>{{ group.members.length }} 位成员</span>
      <span>{{ group.ownAccounts.length + group.members.length }} 个账号</span>
    </div>
  </div>
</template>

<script>
import { num } from './data'

export default {
  props: {
    group: { type: Object, required: true },
    rank: { type: Number, default: 0 },
  },
  data() {
    return { num }
  },
  methods: {
    goDetail() {
      this.$router.push('/detail/group/' + this.group.uuid)
    },
  },
}
</script>

<style scoped>
.group-card {
  position: relative;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: box-shadow .2s, transform .1s;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.group-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, .12);
  transform: translateY(-2px);
}
.rank-badge {
  position: absolute;
  top: -8px;
  left: -8px;
  min-width: 28px;
  height: 28px;
  padding: 0 7px;
  border-radius: 6px;
  background: #409eff;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  line-height: 28px;
  text-align: center;
}
.top { display: flex; align-items: center; gap: 12px; }
.face {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
  background: #f0f0f0;
  flex-shrink: 0;
}
.gname {
  font-size: 17px;
  font-weight: 700;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.metrics { display: flex; justify-content: space-between; gap: 10px; }
.metric { display: flex; flex-direction: column; gap: 4px; }
.label { font-size: 12px; color: #909399; }
.label .star { color: #f48fb1; font-style: normal; }
.label .shield { color: #e6a23c; font-style: normal; }
.value { font-size: 19px; font-weight: 700; }
.value.fans { color: #f48fb1; }
.value.guard { color: #e6a23c; }
.foot {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  border-top: 1px solid #f0f2f5;
  padding-top: 10px;
}
</style>
