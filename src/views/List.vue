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
      search: '',
      realSearch: '',
    }
  },
  watch: {
    search() {
      const now = Date.now()
      lastSearchUpdate = now
      setTimeout(() => {
        if (now === lastSearchUpdate) {
          this.realSearch = this.search
        }
      }, 1000)
    }
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
