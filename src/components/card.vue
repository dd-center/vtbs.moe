<template>
<el-container v-loading="!info">
  <el-main>
    <el-row>
      <el-col :span="6" v-loading="!face">
        <img :src="face" class="face" v-if="face">
        <img src="@/assets/face.jpg" class="face" v-else>
      </el-col>
      <el-col :span="12">
      </el-col>
      <el-col :span="6">
      </el-col>
    </el-row>
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
    },
    face: function() {
      return this.$store.state.face[this.vtb.mid]
    }
  }
}
</script>

<style scoped>
.face {
  width: 120px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
}
</style>
