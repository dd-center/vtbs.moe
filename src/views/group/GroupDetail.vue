<template>
<div class="group-page">
  <router-link to="/detail/" class="back"><span class="el-icon-arrow-left"></span> 全部社团</router-link>

  <progress class="progress is-small" max="100" v-if="!directory && !error"></progress>
  <div class="error" v-else-if="error">
    数据加载失败：{{error}}
    <button class="button is-small" @click="load">重试</button>
  </div>
  <div class="error" v-else-if="!group">
    没有找到这个社团
  </div>

  <template v-else>
    <div class="header">
      <img v-if="face" :src="face" class="face" alt="">
      <div v-else class="face placeholder">{{group.name.slice(0, 1)}}</div>
      <div class="identity">
        <h1 class="name">{{group.name}}</h1>
        <div class="meta">
          {{group.vtuberCount}} 位成员 · {{group.accountCount}} 个账号
          <span v-if="group.liveNum" class="live">· {{group.liveNum}} 直播中</span>
        </div>
      </div>
      <div class="stats">
        <div v-for="(text, key) in stats" :key="key" class="stat">
          <span class="stat-label">{{text}}</span>
          <span class="stat-value" :class="key === 'rise' && riseClass">{{key === 'rise' && group.rise > 0 ? '+' : ''}}{{group[key] | parseNumber}}</span>
        </div>
      </div>
    </div>

    <template v-if="group.own.length">
      <h2 class="section">社团账号</h2>
      <div class="grid">
        <account-card v-for="account in own" :key="account.mid" :account="account" :highlight="sort.key"></account-card>
      </div>
    </template>

    <div class="section-bar">
      <h2 class="section">成员账号 <span class="count">{{group.members.length}}</span></h2>
      <sort-bar :options="sortable" :value="sortValue" @input="setSort"></sort-bar>
    </div>
    <div class="grid">
      <account-card v-for="(account, index) in members" :key="account.mid" :account="account" :rank="index + 1" :highlight="sort.key"></account-card>
    </div>
    <div v-if="!group.members.length" class="empty">暂无成员账号</div>
  </template>
</div>
</template>

<script>
import AccountCard from './AccountCard.vue'
import SortBar from './SortBar.vue'
import { loadDirectory, faceUrl, parseSort, sortBy } from './data'

export default {
  props: {
    uuid: String,
  },
  components: {
    AccountCard,
    SortBar,
  },
  data() {
    this.stats = {
      follower: '总关注',
      rise: '日增',
      guardNum: '总舰团',
      archiveView: '总播放',
      video: '总视频',
    }
    this.sortable = {
      follower: '关注',
      rise: '日增',
      guardNum: '舰团',
      archiveView: '播放',
      video: '视频',
    }
    return {
      directory: undefined,
      error: undefined,
    }
  },
  computed: {
    group() {
      return this.directory.groupTable[this.uuid]
    },
    face() {
      return faceUrl(this.group.face, 256)
    },
    sortValue() {
      const { key } = parseSort(this.$route.query.sort)
      return this.sortable[key] ? this.$route.query.sort : 'follower'
    },
    sort() {
      return parseSort(this.sortValue)
    },
    own() {
      return sortBy(this.group.own, this.sort)
    },
    members() {
      return sortBy(this.group.members, this.sort)
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
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      this.error = undefined
      try {
        this.directory = await loadDirectory()
      } catch (e) {
        console.error(e)
        this.error = e.message || String(e)
      }
    },
    setSort(sort) {
      this.$router.push({ query: { ...this.$route.query, sort: sort === 'follower' ? undefined : sort } })
    },
  },
}
</script>

<style scoped>
.group-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 20px 48px;
}

.back {
  display: inline-block;
  margin-bottom: 12px;
  color: #606266;
  font-size: 14px;
}

.back:hover {
  color: #409eff;
}

.header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
}

.face {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  background: #f2f3f5;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 32px;
  font-weight: 600;
}

.identity {
  flex: 1;
  min-width: 200px;
}

.name {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.3;
}

.meta {
  margin-top: 4px;
  color: #909399;
  font-size: 13px;
}

.meta .live {
  color: #3273dc;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
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
  font-size: 20px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.section-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 28px 0 14px;
}

.section {
  margin: 28px 0 14px;
  font-size: 16px;
  font-weight: 600;
}

.section-bar .section {
  margin: 0;
}

.count {
  margin-left: 4px;
  color: #909399;
  font-weight: normal;
  font-size: 13px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 16px;
}

.error {
  padding: 16px 20px;
  border-radius: 6px;
  background: #fef0f0;
  color: #f56c6c;
}

.empty {
  padding: 40px;
  text-align: center;
  color: #909399;
}

.more {
  color: #00b33c;
}

.less {
  color: #ec0000;
}
</style>
