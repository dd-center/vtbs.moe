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
        <el-tag class="tag" v-for="tag in tags" :type="tag.type" size="mini" :title="tag.title" :key="`${tag.name}_${dd.mid}`">{{tag.name}}</el-tag>
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
    strict: false,
  },
  {
    name: '夏吹',
    title: '夏色吹雪贴贴',
    demand: [336731767, 332704117],
    type: 'success',
    strict: false,
  },
  {
    name: '夏紫',
    title: '夏色诗音贴贴',
    demand: [336731767, 389857640],
    type: 'success',
    strict: false,
  },
  {
    name: '夏心',
    title: '夏心贴贴',
    demand: [336731767, 339567211],
    type: 'success',
    strict: false,
  },
  {
    name: '夏空',
    title: '夏色梅露贴贴',
    demand: [336731767, 389856447],
    type: 'success',
    strict: false,
  },
  {
    name: '夏夸',
    title: '夏色啊夸',
    demand: [336731767, 375504219],
    type: 'success',
    strict: false,
  },
  {
    name: '夏色Mio',
    title: '夏色Mio',
    demand: [336731767, 389862071],
    type: 'success',
    strict: false,
  },
  {
    name: '信tama',
    title: '信tama贴贴',
    demand: [80387576, 12362451],
    type: 'success',
    strict: false,
  },
  {
    name: '夏皆',
    title: '夏色皆守',
    demand: [336731767, 395814787],
    type: 'success',
    strict: false,
  },  
  {
    name: 'Fubumio',
    title: 'Fubumio贴贴',
    demand: [332704117, 389862071],
    type: 'success',
    strict: false,
  },
  {
    name: 'Aquayame',
    title: 'aquayame',
    demand: [375504219, 389858027],
    type: 'success',
    strict: false,
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
    tags() {
      let vtbs = this.vtbs.flat()
      let type = ddTypes.filter(({ strict, demand }) => {
        if (strict) {
          if (vtbs.length !== demand.length) {
            return false
          }
        }
        return !demand.find(uid => !vtbs.includes(uid))
      })
      if (!type.length) {
        if (vtbs.length === 1) {
          type.push({ type: 'warning', name: '单推' })
        } else {
          type.push({ name: 'DD' })
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

.tag{
  margin-left: 2px;
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
