<template functional>
<div>
  <div class="columns is-gapless noMargin is-mobile" v-for="(value, key) in props.status" :key="key">
    <div class="column is-4 has-text-right">
      {{props.name[key]}}
    </div>
    <div class="column is-1">
      <span :class="props.icon[key]"></span>
    </div>
    <div class="column is-7">
      <template v-if="key === 'rise' && value !== 0">
        <span v-if="value > 0" class="more">+{{value | parseNumber}}</span>
        <span v-if="value < 0" class="less">{{value | parseNumber}}</span>
      </template>
      <span v-else> {{value | parseNumber}}</span>
    </div>
  </div>
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
        pastLive: '直播',
        rise: '日增',
      }),
    },
    icon: {
      default: () => ({
        follower: 'el-icon-star-on',
        archiveView: 'el-icon-caret-right',
        online: 'el-icon-d-caret',
        guardNum: 'el-icon-location-outline',
        pastLive: 'el-icon-time',
        rise: 'el-icon-caret-top',
      }),
    },
  },
}
</script>

<style scoped>
.more {
  color: #00da3c;
}

.less {
  color: #ec0000;
}

.noMargin {
  margin-bottom: 0 !important;
}
</style>
