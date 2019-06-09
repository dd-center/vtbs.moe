<template>
<transition-group name="flip-list">
  <card v-for="vtb in list" :vtb="vtb" :mini="mini" hover :key="vtb.mid" class="card"></card>
</transition-group>
</template>

<script>
import card from '@/components/card'
export default {
  props: ['list', 'mini'],
  components: {
    card,
  },
}
</script>

<style scoped>
.flip-list-move {
  transition: transform 0.5s;
}

.card {
  margin-bottom: 32px;
}
</style>
