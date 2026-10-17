<template>
  <div class="list-page" v-loading="loading" element-loading-text="加载数据中…">
    <div class="toolbar">
      <el-button :type="view === 'group' ? 'primary' : 'default'" size="small" @click="view = 'group'">
        社团 ({{ groupCount }})
      </el-button>
      <el-button :type="view === 'account' ? 'primary' : 'default'" size="small" @click="view = 'account'">
        所有账号 ({{ accountCount }})
      </el-button>

      <el-button :type="metric === 'fans' ? 'primary' : 'default'" size="small" icon="el-icon-star-on" @click="metric = 'fans'">
        总粉丝
      </el-button>
      <el-button :type="metric === 'guard' ? 'primary' : 'default'" size="small" icon="el-icon-location-outline" @click="metric = 'guard'">
        总舰团
      </el-button>

      <el-button :type="desc ? 'primary' : 'default'" size="small" @click="desc = true">降序</el-button>
      <el-button :type="!desc ? 'primary' : 'default'" size="small" @click="desc = false">升序</el-button>

      <input
        class="input search-input"
        v-model="search"
        type="text"
        placeholder="搜索名称 / UID / 直播间"
      >
    </div>

    <!-- 社团视图 -->
    <div v-if="view === 'group' && model">
      <div class="summary">
        共 <b>{{ groupCount }}</b> 个社团 · 合计总粉丝
        <b class="fans">{{ num(totalGroupFollowers) }}</b> · 合计总舰团
        <b class="guard">{{ num(totalGroupGuards) }}</b>
      </div>

      <el-row :gutter="16">
        <el-col
          :xs="24" :sm="12" :md="8" :lg="6"
          v-for="(g, idx) in filteredGroups"
          :key="g.uuid"
        >
          <group-card :group="g" :rank="idx + 1"></group-card>
        </el-col>
      </el-row>

      <div v-if="filteredGroups.length === 0" class="empty">没有匹配的社团</div>
    </div>

    <!-- 所有账号视图 -->
    <div v-if="view === 'account' && model">
      <div class="export-row">
        <el-button
          type="success"
          size="small"
          icon="el-icon-download"
          :loading="exporting"
          @click="doExport"
        >
          导出 Excel（{{ filteredAccounts.length }} 条，按当前筛选/排序）
        </el-button>
      </div>

      <div v-if="!accountsLoaded" class="placeholder">
        <p>共 <b>{{ accountCount }}</b> 个哔哩哔哩账号，渲染数据量较大，默认不加载。</p>
        <div class="placeholder-actions">
          <el-checkbox v-model="accountsLoaded">加载所有账号</el-checkbox>
          <el-button type="success" size="small" icon="el-icon-download" :loading="exporting" @click="doExport">
            导出 Excel
          </el-button>
        </div>
      </div>

      <template v-else>
        <div class="summary">
          已加载全部 <b>{{ accountCount }}</b> 个账号（当前显示
          <b>{{ visibleAccounts.length }}</b> 个）
          <el-checkbox v-model="accountsLoaded" class="unload">卸载</el-checkbox>
        </div>

        <el-row :gutter="16">
          <el-col
            :xs="24" :sm="12" :md="8" :lg="6" :xl="4"
            v-for="(r, idx) in visibleAccounts"
            :key="r.mid"
          >
            <account-card :account="r" :rank="idx + 1"></account-card>
          </el-col>
        </el-row>

        <div v-if="visibleAccounts.length < filteredAccounts.length" class="more">
          <el-button @click="loadMore">
            加载更多（剩余 {{ filteredAccounts.length - visibleAccounts.length }}）
          </el-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { loadModel, num, sortRows, exportAccounts } from './group/data'
import GroupCard from './group/GroupCard.vue'
import AccountCard from './group/AccountCard.vue'

const PAGE = 120

export default {
  components: { GroupCard, AccountCard },
  data() {
    return {
      num,
      loading: true,
      exporting: false,
      model: null,
      view: 'group',
      metric: 'fans',
      desc: true,
      search: '',
      accountsLoaded: false,
      visibleCount: PAGE,
    }
  },
  computed: {
    groupKey() {
      return this.metric === 'fans' ? 'followers' : 'guards'
    },
    accountKey() {
      return this.metric === 'fans' ? 'follower' : 'guardNum'
    },
    groupCount() {
      return this.model ? this.model.groupRows.length : 0
    },
    accountCount() {
      return this.model ? this.model.accounts.length : 0
    },
    rankedGroups() {
      return sortRows(this.model.groupRows, this.groupKey, this.desc)
    },
    rankedAccounts() {
      return sortRows(this.model.accounts, this.accountKey, this.desc)
    },
    filteredGroups() {
      const kw = this.search.trim().toLowerCase()
      if (!kw) return this.rankedGroups
      return this.rankedGroups.filter(g => this.matchGroup(g, kw))
    },
    filteredAccounts() {
      const kw = this.search.trim().toLowerCase()
      if (!kw) return this.rankedAccounts
      return this.rankedAccounts.filter(r => this.matchRecord(r, kw))
    },
    visibleAccounts() {
      return this.filteredAccounts.slice(0, this.visibleCount)
    },
    totalGroupFollowers() {
      return this.model.groupRows.reduce((a, g) => a + g.followers, 0)
    },
    totalGroupGuards() {
      return this.model.groupRows.reduce((a, g) => a + g.guards, 0)
    },
  },
  watch: {
    search() { this.visibleCount = PAGE },
    metric() { this.visibleCount = PAGE },
    desc() { this.visibleCount = PAGE },
    accountsLoaded(v) {
      if (v) this.visibleCount = PAGE
    },
  },
  created() {
    loadModel()
      .then(m => { this.model = m })
      .catch(e => { console.error(e) })
      .finally(() => { this.loading = false })
  },
  methods: {
    matchRecord(r, kw) {
      return (
        String(r.uname || '').toLowerCase().includes(kw) ||
        String(r.mid) === kw ||
        String(r.roomid || '') === kw
      )
    },
    matchGroup(g, kw) {
      if (
        String(g.displayName || '').toLowerCase().includes(kw) ||
        String(g.uuid) === kw
      ) return true
      return (
        g.ownAccounts.some(r => this.matchRecord(r, kw)) ||
        g.members.some(r => this.matchRecord(r, kw))
      )
    },
    loadMore() {
      this.visibleCount += PAGE
    },
    async doExport() {
      if (this.exporting) return
      this.exporting = true
      try {
        await exportAccounts(this.filteredAccounts)
      } catch (e) {
        console.error('导出失败', e)
        this.$message && this.$message.error('导出失败：' + e.message)
      } finally {
        this.exporting = false
      }
    },
  },
}
</script>

<style scoped>
.list-page { padding: 12px 16px 50px; }
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
}
.search-input {
  flex: 1;
  min-width: 200px;
  max-width: 360px;
}
.export-row { margin-bottom: 14px; }
.summary {
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
}
.summary .fans { color: #f48fb1; }
.summary .guard { color: #e6a23c; }
.unload { margin-left: 12px; }
.placeholder {
  border: 2px dashed #dcdfe6;
  border-radius: 10px;
  text-align: center;
  padding: 50px 20px;
  color: #606266;
}
.placeholder p { margin: 0 0 18px; }
.placeholder-actions {
  display: flex;
  gap: 18px;
  justify-content: center;
  align-items: center;
}
.el-col { margin-bottom: 16px; }
.more { text-align: center; margin-top: 10px; }
.empty { text-align: center; color: #909399; padding: 40px; }
</style>
