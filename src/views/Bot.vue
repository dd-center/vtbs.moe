<template>
<div class="box">
  <div v-for="(txt, index) in text" :class="!index? 'big' : !(index-1)? 'middle' : '' ">
    {{txt}}
  </div>
</div>
</template>

<script>
import ky from 'ky'

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const num = {
  matsuri: 834327334
}

export default {
  props: ['n'],
  data() {
    return {
      text: []
    }
  },
  async mounted() {
    for (;;) {
      document.head.innerHTML += `<style>
      .el-loading-mask {
        display: none;
      }

      header {
        display: none;
      }

      .el-notification {
        display: none;
      }
      </style>`

      let start = Date.now()
      let txt = await (await ky.get(`https://api.vtb.wiki/webapi/message/${this.m}/history?filter=【&text=true&ts=${Date.now()}`)).text()
      this.text = txt
        .split('\n')
        .filter((_, index) => index < 256)
        .reverse()
      await wait(1000 - Date.now() + start)
    }
  },
  computed: {
    m() {
      return num[this.n] || this.n
    }
  }
}
</script>

<style scoped>
.box {
  margin: 8px;
}

.big {
  font-size: 32px;
}

.middle {
  font-size: 24px;
}
</style>
