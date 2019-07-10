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
        <el-tag :type="tag.type" size="mini" :title="tag.title">{{tag.name}}</el-tag>
        <router-link :to="`/detail/${dd.mid}`" v-if="isVTB" class="detail" title="这是一名本站收录的VTB/VUP">
          {{uname}}
          <el-tag type="danger" size="mini" v-if="isVTB">V</el-tag>
        </router-link>
        <template v-else>
          {{uname}}
        </template>
      </span>
    </el-col>
  </el-row>
  <template v-for="i in [0,1,2]">
    <el-row v-for="vtb in vtbs[i]" class="vtb" :key="`${dd.mid}_${vtb}`">
      <el-col :span="10" :xs="7">
        <div :class="`guard guard-${i} right`"></div>
      </el-col>
      <el-col :span="14" :xs="17">
        <router-link :to="`/detail/${vtb}`" class="detail" title="打开详细页">
          {{name(vtb)}}
        </router-link>
      </el-col>
    </el-row>
  </template>
</el-col>
</template>

<script>
const ddTypes = [
  {
    name: 'Meaqua',
    title: 'Meaqua贴贴',
    demand: [349991143, 375504219],
    type: 'success',
    strict: true,
  },
]

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
    tag() {
      let vtbs = this.vtbs.flat()
      let type = ddTypes.find(({ strict, demand }) => {
        if (strict) {
          if (vtbs.length !== demand.length) {
            return false
          }
        }
        return !demand.find(uid => !vtbs.includes(uid))
      })
      if (!type) {
        if (vtbs.length === 1) {
          type = { type: 'warning', name: '单推' }
        } else {
          type = { name: 'DD' }
        }
      }
      return type
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
    isMeaQua: function() {
      let d = [].concat(...this.vtbs)
      return d.length === 2 && d.includes(349991143) && d.includes(375504219)
    },
    isVTB: function() {
      return Object.keys(this.$store.state.info).includes(String(this.dd.mid))
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
  height: 96px;
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

.detail {
  color: black;
  text-decoration: none;
}

.detail:hover {
  text-decoration: underline;
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
