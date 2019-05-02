<template>
<div>
  <div class="box">
    <list></list>
  </div>
</div>
</template>

<script>
import List from '@/components/list'

export default {
  components: {
    List,
  },
}
</script>

<style scoped>
.box {
  margin: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>