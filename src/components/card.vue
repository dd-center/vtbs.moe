<template>
<el-container v-loading="!info">
  <el-main>
    {{info}}
  </el-main>
</el-container>
</template>

<script>
export default {
  components: {},
  props: {
    vtb: Object
  },
  computed: {
    info: function() {
      return this.$store.state.info[this.vtb.mid]
    }
  }
}
</script>
