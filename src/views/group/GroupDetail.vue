<template>
  <div class="group-detail" v-loading="loading">
    <el-button size="small" icon="el-icon-back" @click="goBack">返回</el-button>

    <div v-if="group" class="header">
      <img class="big-face" :src="group.avatar" referrerpolicy="no-referrer" alt="">
      <div class="head-info">
        <h2 class="gname">{{ group.displayName }}</h2>
        <div class="head-tags">
          <el-tag size="small" type="info">{{ group.members.length }} 位成员</el-tag>
          <el-tag size="small" type="info">{{ group.ownAccounts.length + group.members.length }} 个账号</el-tag>
        </div>
      </div>
      <div class="head-metrics">
        <div class="hm">
          <span class="label"><i class="el-icon-star-on star"></i> 总粉丝数</span>
          <span class="value fans">{{ num(group.followers) }}</span>
        </div>
        <div class="hm">
          <span class="label"><i class="el-icon-location-outline shield"></i> 总舰团数</span>
          <span class="value guard">{{ num(group.guards) }}</span>
        </div>
      </div>
    </div>

    <template v-if="group">
      <el-divider content-position="left">社团本体账号</el-divider>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" v-for="rec in rankedOwn" :key="'own'+rec.mid">
          <account-card :account="rec" :rank="0"></account-card>
        </el-col>
      </el-row>

      <el-divider content-position="left">旗下成员账号（{{ group.members.length }}）</el-divider>

      <div class="member-toolbar">
        <el-button :type="memberMetric === 'follower' ? 'primary' : 'default'" size="small" icon="el-icon-star-on" @click="memberMetric = 'follower'">粉丝</el-button>
        <el-button :type="memberMetric === 'guardNum' ? 'primary' : 'default'" size="small" icon="el-icon-location-outline" @click="memberMetric = 'guardNum'">舰团</el-button>
        <el-button :type="memberDesc ? 'primary' : 'default'" size="small" @click="memberDesc = true">降序</el-button>
        <el-button :type="!memberDesc ? 'primary' : 'default'" size="small" @click="memberDesc = false">升序</el-button>
      </div>

      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" v-for="(rec, idx) in rankedMembers" :key="'mem'+rec.mid">
          <account-card :account="rec" :rank="idx + 1"></account-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script>
import { loadModel, num, sortRows } from './data'
import AccountCard from './AccountCard.vue'

export default {
  props: {
    uuid: { type: String, required: true },
  },
  components: { AccountCard },
  data() {
    return {
      num,
      loading: true,
      model: null,
      memberMetric: 'follower',
      memberDesc: true,
    }
  },
  computed: {
    group() {
      if (!this.model) return null
      return this.model.groupRows.find(g => g.uuid === this.uuid) || null
    },
    rankedOwn() {
      if (!this.group) return []
      return sortRows(this.group.ownAccounts, this.memberMetric, true)
    },
    rankedMembers() {
      if (!this.group) return []
      return sortRows(this.group.members, this.memberMetric, this.memberDesc)
    },
  },
  created() {
    loadModel()
      .then(m => { this.model = m })
      .catch(e => { console.error(e) })
      .finally(() => { this.loading = false })
  },
  methods: {
    goBack() {
      this.$router.push('/detail/')
    },
  },
}
</script>

<style scoped>
.group-detail { padding: 10px 16px 40px; }
.header {
  display: flex;
  align-items: center;
  gap: 18px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  padding: 18px 22px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.big-face {
  width: 78px;
  height: 78px;
  border-radius: 16px;
  object-fit: cover;
  background: #f0f0f0;
}
.head-info { flex: 1; min-width: 180px; }
.gname { margin: 0 0 8px; font-size: 24px; color: #303133; }
.head-tags { display: flex; gap: 8px; }
.head-metrics { display: flex; gap: 28px; }
.hm { display: flex; flex-direction: column; gap: 6px; }
.hm .label { font-size: 13px; color: #909399; }
.hm .label .star { color: #f48fb1; font-style: normal; }
.hm .label .shield { color: #e6a23c; font-style: normal; }
.hm .value { font-size: 26px; font-weight: 700; }
.hm .value.fans { color: #f48fb1; }
.hm .value.guard { color: #e6a23c; }
.member-toolbar { display: flex; gap: 8px; margin-bottom: 16px; }
.el-col { margin-bottom: 16px; }
</style>
