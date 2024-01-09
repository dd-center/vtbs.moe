<template>
  <d :dd="source"></d>
</template>

<script>
import d from '@/components/d'
  export default {
    name: 'dVirtualItem',
    components: {d},
    props: {
      source: {
        type: Object,
        default () {
          return {}
        }
      }
    }
  }
</script>