<template functional>
<div>
  <el-row v-for="(value, key) in props.status" :gutter="6" :key="key">
    <el-col :span="12" class="right">
      {{props.name[key]}}<span :class="props.icon[key]"></span>
    </el-col>
    <el-col :span="12">
      {{value}}
    </el-col>
  </el-row>
</div>
</template>

<script>
export default {
  props: {
    status: Object,
    name: {
      default: () => ({
        follower: '关注',
        archiveView: '播放',
        online: '人气',
        guardNum: '舰团',
        pastLive: '直播'
      })
    },
    icon: {
      default: () => ({
        follower: 'el-icon-star-on',
        archiveView: 'el-icon-caret-right',
        online: 'el-icon-d-caret',
        guardNum: 'el-icon-location-outline',
        pastLive: 'el-icon-time'
      })
    }
  }
}
</script>

<style scoped>
.right {
  text-align: right;
}
</style>
