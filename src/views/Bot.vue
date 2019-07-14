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

export default {
  props: ['n'],
  data() {
    return {
      text: []
    }
  },
  async mounted() {
    for (;;) {
      let start = Date.now()
      let txt = await (await ky.get(`https://api.vtb.wiki/webapi/message/${this.n}/history?filter=【&text=true&ts=${Date.now()}`)).text()
      console.log(txt)
      this.text = txt
        .split('\n')
        .filter((_, index) => index < 100)
        .reverse()
      await wait(1000 - Date.now() + start)
    }
  }
}
</script>

<style>
.box{
  margin: 8px;
}
.big {
  font-size: 32px;
}

.middle {
  font-size: 24px;
}

.el-loading-mask {
  display: none;
}

header {
  display: none;
}
</style>
