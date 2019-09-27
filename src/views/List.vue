<template>
<div class="center">
  <input class="input search" v-model="search" type="text" placeholder="模糊搜索">
  <list :search='search'></list>
</div>
</template>

<script>
import List from '@/components/list'

export default {
  data: () => {
    return {
      search: '',
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
