<template>
<div>
  <progress class="progress is-small box" max="100" v-if="!list.length"></progress>
  <template v-else>
    <div v-for="type in selected" :key="type.key" class="buttons is-centered">
      <button class="button is-text" @click="filter({key: type.key, type: 'all'})">{{type.text}}</button>
      <button @click="filter({key: type.key, type: 'other'})" class="button" :class="{'is-success': !type.other}">其他</button>
      <button v-for="choice in type.choices" :key="choice.key" @click="filter({key: type.key, choice: choice.key})" class="button" :class="{'is-success': !choice.filter}">{{choice.text}}</button>
    </div>
    <div class="table-container box">
      <table class="table is-fullwidth is-striped is-hoverable">
        <thead>
          <tr>
            <th></th>
            <th v-for="(name, key) in sortable" :key="key"><a @click="sort(key)">{{name}}</a></th>
            <th>空间id</th>
            <th>直播间id</th>
            <th><a @click="sort('time')">上次更新</a></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vtb in sortList" :key="vtb.mid">
            <td>
              <router-link :to="`detail/${vtb.mid}`">{{vtb.uname}}</router-link>
            </td>
            <td v-for="(_, key) in sortable" :key="`${vtb.mid}_${key}`">{{vtb[key]}}</td>
            <td><a :href="`https://space.bilibili.com/${vtb.mid}`">{{vtb.mid}}</a></td>
            <td v-if="vtb.roomid"><a :href="`https://live.bilibili.com/${vtb.roomid}`">{{vtb.roomid}}</a></td>
            <td v-else>无</td>
            <td>{{vtb.timeString}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
</div>
</template>

<script>
import { getFullInfo, getVdbTable } from '@/socket.js'

export default {
  props: ['search'],
  data() {
    this.sortable = {
      follower: '关注',
      rise: '日增',
      archiveView: '播放量',
      video: '视频数',
      guardNum: '舰团',
    }
    return {
      types: { group: { choices: {} } },
      list: [],
      vdbTable: {},
      tables: {},
      sortBy: undefined,
      order: 1,
    }
  },
  methods: {
    sort(key) {
      if (this.sortBy !== key) {
        this.sortBy = key
        this.order = 1
      } else if (this.order === 1) {
        this.order = -1
      } else {
        this.sortBy = undefined
      }
      if (this.sortBy) {
        this.$router.push({ query: { ...this.$route.query, sort: `${this.order>0 ? '' : '!'}${this.sortBy}` } })
      } else {
        this.$router.push({ query: { ...this.$route.query, sort: undefined } })
      }
    },
    filter({ key, type, choice }) {
      if (choice) {
        this.types[key].choices[choice].filter = !this.types[key].choices[choice].filter
      } else {
        if (type === 'other') {
          this.types[key].other = !this.types[key].other
        }
        if (type === 'all') {
          const choices = Object.keys(this.types[key].choices)
          const someFiltered = [...choices.map(choice => this.types[key].choices[choice].filter), this.types[key].other]
            .some(Boolean)
          choices.forEach(choice => {
            this.types[key].choices[choice].filter = !someFiltered
          })
          this.types[key].other = !someFiltered
        }
      }
      this.types = { ...this.types }
      const result = JSON.stringify([
          ['other', { filter: this.types[key].other }], ...Object.entries(this.types[key].choices)
        ].filter(([_, { filter }]) => !filter)
        .map(([key]) => key))

      if (result.length < 768) {
        this.$router.push({
          query: {
            ...this.$route.query,
            [key]: result,
          },
        })
      } else {
        this.$router.push({
          query: {
            ...this.$route.query,
            [key]: undefined,
          },
        })
      }
    },
  },
  async mounted() {
    const list = await getFullInfo()
    const vdbTable = await getVdbTable()
    const types = this.types
    this.vdbTable = vdbTable
    this.list = list
    list.forEach(({ mid, uuid }) => {
      if (vdbTable[uuid]) {
        const { group } = vdbTable[uuid]
        if (group && !types.group.choices[group]) {
          const { name } = vdbTable[group]
          types.group.choices[group] = { text: name[name.default] }
        }
      }
    })

    this.types = types

    const query = this.$route.query

    if (query.sort) {
      const [sortBy, neg] = query.sort.split('!').reverse()
      this.sortBy = sortBy
      this.order = (neg !== undefined) ? -1 : 1
    }

    const typesClass = Object.keys(types)
    typesClass.forEach(type => {
      if (query[type]) {
        const unfiltered = JSON.parse(query[type])
        types[type].other = !unfiltered.includes('other')
        Object.keys(types[type].choices).forEach(choice => {
          types[type].choices[choice].filter = !unfiltered.includes(choice)
        })
      }
    })

    this.types = types

  },
  computed: {
    selected() {
      const text = {
        group: '社团',
      }
      return Object.entries(this.types)
        .map(([key, { choices, other }]) => ({
          key: key,
          text: text[key] || key,
          other,
          choices: Object.entries(choices)
            .map(([ck, cv]) => ({
              key: ck,
              ...cv,
            })),
        }))
    },
    searchList() {
      const searchArray = (this.search || '').toLowerCase().split(' ').filter(Boolean)
      return this.list
        .filter(({ uuid }) => {
          const vdb = this.vdbTable[uuid]
          if (vdb && this.types.group.choices[vdb.group]) {
            return !this.types.group.choices[vdb.group].filter
          } else {
            return !this.types.group.other
          }
        })
        .map(({ uname, mid, roomid, time, ...object }) => ({ ...object, mid, time, roomid, uname, timeString: new Date(time).toLocaleString(), string: `${uname}${mid}${roomid}`.toLowerCase() }))
        .filter(({ string }) => searchArray.every(search => string.includes(search)))
    },
    sortList() {
      let result = this.searchList
      if (this.sortBy) {
        return result.sort(({
          [this.sortBy]: a,
        }, {
          [this.sortBy]: b,
        }) => (b - a) * this.order)
      } else {
        return result
      }
    },
  },
}
</script>

<style scoped>
.box {
  margin: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
