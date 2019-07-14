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
    let style = document.createElement('style')
    style.innerHTML = `
    .el-loading-mask {
        display: none;
      }

      header {
        display: none;
      }

      .el-notification {
        display: none;
      }
    `
    document.head.appendChild(style)

    for (;;) {
      let start = Date.now()
      let txt = await (await ky.get(`https://api.vtb.wiki/webapi/message/${this.m}/history?filter=【&text=true&client=Fly_snow&ts=${Date.now()}`)).text()
      txt = txt
        .split('\n')
        .filter((_, index) => index < 256)
        .reverse()

      if (this.text.join('') !== txt.join('')) {
        this.text = txt
      }
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

body{
    background-color:black

}
.box div {
    color:#ddd;
    margin-top:3px;
    font-size:14px;
}

.box div:first-of-type {
    color:#FFF;
    margin-top:3px;
    font-size:20px;

}
</style>
