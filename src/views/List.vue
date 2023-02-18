<template>
<div class="center">
  <input class="input search" v-model="search" type="text" placeholder="搜索">
  <list :search='realSearch'></list>
</div>
</template>

<script>
import List from '@/components/list'

let lastSearchUpdate = 0

export default {
  data: () => {
    return {
      search: ''
    }
  },
  computed: {
    realSearch() {
      return this.$route.query.search || ''
    }
  },
  watch: {
    search() {
      if(this.search === this.realSearch) return
      const now = Date.now()
      lastSearchUpdate = now
      setTimeout(() => {
        if (now === lastSearchUpdate) {
          this.$router.push({ query: { 
              ...this.$route.query,
            search: this.search || undefined,
           } })
        }
      }, 1000)
    }
  },
  mounted() {
    this.search = this.realSearch
  },
  components: {
    List,
  },
}
</script>

<style scoped>
.search {
  margin: 20px;
  width: 80%;
}

.center {
  text-align: center;
}
</style>
