<template>
<el-col :span="8" :xl="6" :xs="12" class="dd">
  <el-row>
    <el-col class="center">
      <img :src="face" class="face">
    </el-col>
  </el-row>
  <el-row class="name">
    <el-col class="center">
      <span>
        <el-tag size="mini" v-if="isDD">DD</el-tag>
        <el-tag type="warning" size="mini" v-else>单推</el-tag>
        {{uname}}
      </span>
    </el-col>
  </el-row>
  <template v-for="i in [0,1,2]">
    <el-row v-for="vtb in vtbs[i]" class="vtb">
      <el-col :span="10" :xs="7">
        <div :class="`guard guard-${i} right`"></div>
      </el-col>
      <el-col :span="14" :xs="17">
        <div>{{name(vtb)}}</div>
      </el-col>
    </el-row>
  </template>
</el-col>
</template>

<script>
export default {
  components: {},
  props: {
    dd: Object,
  },
  computed: {
    face: function() {
      if (this.dd.face.includes('noface')) {
        return this.dd.face
      }
      return `${this.dd.face}@96w_96h`
    },
    uname: function() {
      return this.dd.uname
    },
    isDD: function() {
      return this.vtbs[0].length + this.vtbs[1].length + this.vtbs[2].length - 1
    },
    vtbs: function() {
      return this.dd.dd
    },
  },
  methods: {
    name: function(mid) {
      let vtb = this.$store.state.info[mid]
      if (vtb) {
        return vtb.uname
      }
      return mid
    },
  },
}
</script>

<style scoped>
.face {
  width: 96px;
  border-radius: 100px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
}

.center {
  text-align: center;
}

.name {
  font-size: 18px;
  margin-top: 2px;
  margin-bottom: 8px;
}

.vtb {
  margin-bottom: 3px;
}

.right {
  float: right;
}

.guard {
  background-size: cover;
  width: 24px;
  height: 24px;
}

.guard-0 {
  background-image: url('../assets/0.png');
}

.guard-1 {
  background-image: url('../assets/1.png');
}

.guard-2 {
  background-image: url('../assets/2.png');
}

.dd {
  margin-bottom: 16px;
}
</style>
