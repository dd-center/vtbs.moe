<template>
<div class="columns is-gapless">
  <div class="column is-one-third">
    <div class="columns">
      <div class="column">
        <figure class="image is-128x128">
          <img class="is-rounded face" :src="face">
        </figure>
      </div>
      <div class="column">
        <span>
          <div class="tags">
            <span :class="`tag is-${tag.type || 'info'}`" v-for="tag in tags" :title="tag.title" :key="`${tag.name}_${dd.mid}`">{{tag.name}}</span>
            <span class="tag is-danger" v-if="isVTB" title="这是一名本站收录的VTB/VUP">V</span>
          </div>
          <router-link :to="`/detail/${dd.mid}`" v-if="isVTB" class="detail" title="这是一名本站收录的VTB/VUP">
            {{uname}}
          </router-link>
          <template v-else>
            {{uname}}
          </template>
        </span>
      </div>
    </div>
  </div>
  <div class="column">
    <div class="columns">
      <div class="column" v-for="dds in vtbs" :key="`${dd.mid}_${dds.level}`">
        <router-link v-for="vtb in dds.vtbs" :to="`/detail/${vtb}`" class="detail" title="打开详细页" :key="`${dd.mid}_${vtb}`">
          <div :class="`guard guard-${dds.level}`">{{name(vtb)}}</div>
        </router-link>
      </div>
    </div>
  </div>
</div>
</template>

<script>
const ddTypes = [{
  name: 'Meaqua',
  title: 'Meaqua贴贴',
  demand: [349991143, 375504219],
  type: 'success',
  strict: false,
}, {
  name: 'MeAlice',
  title: 'MeAlice',
  demand: [349991143, 434565011],
  type: 'success',
  strict: false,
}, {
  name: '夏吹',
  title: '夏色吹雪贴贴',
  demand: [336731767, 332704117],
  type: 'success',
  strict: false,
}, {
  name: '夏紫',
  title: '夏色诗音贴贴',
  demand: [336731767, 389857640],
  type: 'success',
  strict: false,
}, {
  name: '夏心',
  title: '夏心贴贴',
  demand: [336731767, 339567211],
  type: 'success',
  strict: false,
}, {
  name: '夏空',
  title: '夏色梅露贴贴',
  demand: [336731767, 389856447],
  type: 'success',
  strict: false,
}, {
  name: '夏夸',
  title: '夏色啊夸',
  demand: [336731767, 375504219],
  type: 'success',
  strict: false,
}, {
  name: '夏色Mio',
  title: '夏色Mio',
  demand: [336731767, 389862071],
  type: 'success',
  strict: false,
}, {
  name: '信tama',
  title: '信tama贴贴',
  demand: [80387576, 12362451],
  type: 'success',
  strict: false,
}, {
  name: '夏皆',
  title: '夏色皆守',
  demand: [336731767, 395814787],
  type: 'success',
  strict: false,
}, {
  name: 'Fubumio',
  title: 'Fubumio贴贴',
  demand: [332704117, 389862071],
  type: 'success',
  strict: false,
}, {
  name: 'Aquayame',
  title: 'Aquayame',
  demand: [375504219, 389858027],
  type: 'success',
  strict: false,
}]

export default {
  components: {},
  props: {
    dd: Object,
  },
  computed: {
    face() {
      if (this.dd.face.includes('noface')) {
        return this.dd.face
      }
      return `${this.dd.face}@256w_256h`
    },
    tags() {
      let vtbs = this.dd.dd.flat()
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
    vtbs: function() {
      return this.dd.dd
        .map((vtbs, level) => ({ vtbs, level }))
        .filter(({ vtbs }) => vtbs.length)
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
}

.guard {
  background-size: contain;
  background-repeat: no-repeat;
  padding-left: 29.3px;
  margin-bottom: 2px;
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
</style>
