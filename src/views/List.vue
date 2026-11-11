<template>
<div class="list-page">
  <div class="toolbar">
    <div class="view-switch">
      <button class="view-option" :class="{ active: view === 'group' }" @click="setView('group')">
        社团<span v-if="directory" class="count">{{directory.groups.length}}</span>
      </button>
      <button class="view-option" :class="{ active: view === 'account' }" @click="setView('account')">
        所有账号<span v-if="directory" class="count">{{directory.accounts.length}}</span>
      </button>
    </div>
    <input class="input search" v-model="search" type="text" :placeholder="view === 'group' ? '搜索社团 / 成员 / UID / 直播间' : '搜索名称 / UID / 直播间'">
  </div>

  <progress class="progress is-small" max="100" v-if="!directory && !error"></progress>
  <div class="error" v-else-if="error">
    数据加载失败：{{error}}
    <button class="button is-small" @click="load">重试</button>
  </div>

  <template v-else-if="view === 'group'">
    <div class="subbar">
      <sort-bar :options="groupSortable" :value="sortValue" @input="setSort"></sort-bar>
      <span class="summary">{{groupList.length}} 个社团</span>
    </div>
    <div class="grid groups">
      <group-card v-for="(group, index) in groupList" :key="group.uuid" :group="group" :rank="index + 1" :highlight="sort.key"></group-card>
    </div>
    <div v-if="!groupList.length" class="empty">没有匹配的社团</div>
  </template>

  <template v-else>
    <div class="subbar">
      <select class="group-select" :value="groupFilter" @change="setGroupFilter($event.target.value)">
        <option value="">全部社团</option>
        <option value="other">无社团</option>
        <option v-for="group in groupOptions" :key="group.uuid" :value="group.uuid">{{group.name}}</option>
      </select>
      <span class="summary">{{accountList.length}} 个账号</span>
      <button class="button is-small export" @click="exportCSV">
        <span class="el-icon-download"></span>&nbsp;导出 CSV
      </button>
    </div>
    <div class="table-container panel">
      <table class="table is-fullwidth is-hoverable">
        <thead>
          <tr>
            <th class="rank">#</th>
            <th>账号</th>
            <th>社团</th>
            <th v-for="(text, key) in accountSortable" :key="key" class="sortable" :class="{ active: sort.key === key, numeric: key !== 'time' }" @click="setSort(nextSort(key))">
              {{text}}<span v-if="sort.key === key" :class="sort.order > 0 ? 'el-icon-sort-down' : 'el-icon-sort-up'"></span>
            </th>
            <th>直播间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(account, index) in visibleAccounts" :key="account.mid">
            <td class="rank">{{index + 1}}</td>
            <td>
              <router-link :to="`/detail/${account.mid}`" class="account">
                <img v-if="account.face" :src="faceUrl(account.face, 64)" class="face" loading="lazy" alt="">
                <span>{{account.uname || account.mid}}</span>
              </router-link>
              <span v-if="account.liveStatus" class="tag is-link is-small">直播中</span>
            </td>
            <td>
              <router-link v-if="account.group" :to="`/detail/group/${account.group}`" class="group-link">{{directory.groupTable[account.group].name}}</router-link>
            </td>
            <td class="numeric">{{account.follower | parseNumber}}</td>
            <td class="numeric" :class="{ more: account.rise > 0, less: account.rise < 0 }">{{account.rise > 0 ? '+' : ''}}{{account.rise | parseNumber}}</td>
            <td class="numeric">{{account.guardNum | parseNumber}}</td>
            <td class="numeric">{{account.archiveView | parseNumber}}</td>
            <td class="numeric">{{account.video | parseNumber}}</td>
            <td class="time">{{formatTime(account.time)}}</td>
            <td>
              <a v-if="account.roomid" :href="`https://live.bilibili.com/${account.roomid}`" target="_blank">{{account.roomid}}</a>
              <span v-else class="muted">无</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!accountList.length" class="empty">没有匹配的账号</div>
    </div>
    <div v-if="visibleAccounts.length < accountList.length" class="more-row">
      <button class="button" @click="limit += PAGE">显示更多（还有 {{accountList.length - visibleAccounts.length}} 个）</button>
    </div>
  </template>
</div>
</template>

<script>
import moment from 'moment'
import GroupCard from './group/GroupCard.vue'
import SortBar from './group/SortBar.vue'
import { loadDirectory, faceUrl, parseSort, sortBy, matchSearch, downloadCSV } from './group/data'

const PAGE = 100

let lastSearchUpdate = 0

export default {
  components: {
    GroupCard,
    SortBar,
  },
  data() {
    this.PAGE = PAGE
    this.groupSortable = {
      follower: '总关注',
      rise: '日增',
      guardNum: '总舰团',
      archiveView: '总播放',
      video: '总视频',
      accountCount: '账号数',
      liveNum: '直播中',
    }
    this.accountSortable = {
      follower: '关注',
      rise: '日增',
      guardNum: '舰团',
      archiveView: '播放量',
      video: '视频数',
      time: '上次更新',
    }
    return {
      directory: undefined,
      error: undefined,
      search: '',
      limit: PAGE,
    }
  },
  computed: {
    query() {
      return this.$route.query
    },
    realSearch() {
      return this.query.search || ''
    },
    view() {
      if (this.query.view) {
        return this.query.view === 'account' ? 'account' : 'group'
      }
      // 旧版链接（带 group 筛选）指向账号表
      return this.query.group ? 'account' : 'group'
    },
    sortable() {
      return this.view === 'group' ? this.groupSortable : this.accountSortable
    },
    sortValue() {
      const { key } = parseSort(this.query.sort)
      return this.sortable[key] ? this.query.sort : 'follower'
    },
    sort() {
      return parseSort(this.sortValue)
    },
    groupFilterKeys() {
      try {
        const keys = JSON.parse(this.query.group || '[]')
        return Array.isArray(keys) ? keys : []
      } catch (e) {
        return []
      }
    },
    groupFilter() {
      return this.groupFilterKeys.length === 1 ? this.groupFilterKeys[0] : ''
    },
    groupOptions() {
      return sortBy(this.directory.groups, { key: 'follower', order: 1 })
    },
    groupList() {
      const groups = this.directory.groups
        .filter(group => matchSearch(this.realSearch, group.name, group.uuid) ||
          [...group.own, ...group.members].some(account => this.matchAccount(account)))
      return sortBy(groups, this.sort)
    },
    accountList() {
      const filter = this.groupFilterKeys
      const accounts = this.directory.accounts
        .filter(({ group }) => !filter.length || filter.includes(group || 'other'))
        .filter(account => this.matchAccount(account))
      return sortBy(accounts, this.sort)
    },
    visibleAccounts() {
      return this.accountList.slice(0, this.limit)
    },
  },
  watch: {
    search() {
      if (this.search === this.realSearch) return
      const now = Date.now()
      lastSearchUpdate = now
      setTimeout(() => {
        if (now === lastSearchUpdate) {
          this.updateQuery({ search: this.search || undefined })
        }
      }, 500)
    },
    realSearch() {
      this.search = this.realSearch
    },
    query() {
      this.limit = PAGE
    },
  },
  mounted() {
    this.search = this.realSearch
    this.load()
  },
  methods: {
    faceUrl,
    async load() {
      this.error = undefined
      try {
        this.directory = await loadDirectory()
      } catch (e) {
        console.error(e)
        this.error = e.message || String(e)
      }
    },
    updateQuery(query) {
      this.$router.push({ query: { ...this.$route.query, ...query } })
    },
    setView(view) {
      if (view === this.view) return
      const { key } = parseSort(this.query.sort)
      const sortable = view === 'group' ? this.groupSortable : this.accountSortable
      this.updateQuery({
        view: view === 'group' ? undefined : view,
        sort: sortable[key] ? this.query.sort : undefined,
        group: undefined,
      })
    },
    setSort(sort) {
      this.updateQuery({ sort: sort === 'follower' ? undefined : sort })
    },
    nextSort(key) {
      if (this.sort.key !== key) return key
      return this.sort.order > 0 ? `!${key}` : key
    },
    setGroupFilter(group) {
      this.updateQuery({ view: 'account', group: group ? JSON.stringify([group]) : undefined })
    },
    matchAccount({ uname, name, mid, roomid }) {
      return matchSearch(this.realSearch, uname, name, mid, roomid)
    },
    formatTime(time) {
      return time ? new Date(time).toLocaleString() : ''
    },
    exportCSV() {
      const { groupTable } = this.directory
      const header = ['账号名称', '社团', '关注', '日增', '舰团', '播放量', '视频数', '空间id', '直播间id', '上次更新']
      const rows = this.accountList.map(account => [
        account.uname,
        account.group ? groupTable[account.group].name : '',
        account.follower,
        account.rise,
        account.guardNum,
        account.archiveView,
        account.video,
        account.mid,
        account.roomid || '',
        account.time ? new Date(account.time).toLocaleString() : '',
      ])
      downloadCSV(`vtbs.moe_${moment().format('YYYY-MM-DD')}.csv`, header, rows)
    },
  },
}
</script>

<style scoped>
.list-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 20px 48px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.view-switch {
  display: inline-flex;
  padding: 3px;
  background: #f2f3f5;
  border-radius: 6px;
}

.view-option {
  border: none;
  background: none;
  border-radius: 4px;
  padding: 6px 14px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
}

.view-option.active {
  background: #fff;
  color: #303133;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.count {
  margin-left: 6px;
  color: #909399;
  font-weight: normal;
  font-size: 12px;
}

.search {
  flex: 1;
  min-width: 200px;
  max-width: 420px;
}

.subbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.summary {
  margin-left: auto;
  color: #909399;
  font-size: 13px;
}

.export {
  margin-left: 0;
}

.grid {
  display: grid;
  gap: 16px;
}

.groups {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.empty {
  padding: 40px;
  text-align: center;
  color: #909399;
}

.panel {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  margin-bottom: 16px;
}

.group-select {
  -webkit-appearance: none;
  appearance: none;
  height: 30px;
  min-width: 140px;
  max-width: 220px;
  padding: 0 28px 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 15px;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23909399' stroke-width='1.5'/%3E%3C/svg%3E") no-repeat right 11px center / 10px 6px;
  color: #606266;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.group-select:hover {
  border-color: #c0c4cc;
}

.group-select:focus {
  border-color: #409eff;
}

.error {
  padding: 16px 20px;
  border-radius: 6px;
  background: #fef0f0;
  color: #f56c6c;
}

.table th {
  white-space: nowrap;
  font-weight: 600;
  font-size: 13px;
  color: #606266;
}

.table td {
  vertical-align: middle;
  font-size: 14px;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover,
.sortable.active {
  color: #409eff !important;
}

.numeric {
  text-align: right !important;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.rank {
  width: 1px;
  color: #909399;
  font-variant-numeric: tabular-nums;
}

.account {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-right: 6px;
}

.face {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  object-fit: cover;
}

.group-link {
  color: #606266;
  font-size: 13px;
}

.group-link:hover {
  color: #409eff;
}

.time,
.muted {
  color: #909399;
  font-size: 13px;
  white-space: nowrap;
}

.more {
  color: #00b33c;
}

.less {
  color: #ec0000;
}

.more-row {
  text-align: center;
}
</style>
