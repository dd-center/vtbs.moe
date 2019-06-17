<template>
  <div class="locale-changer">
      <h2>语言</h2>
    <el-select v-model="$i18n.locale" placeholder="zh-CN">
      <el-option v-for="lang in langs" :key="lang.value" :label="lang.label" :value="lang.value"></el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  name: 'locale-changer',
  data () {
    return { langs: [
      {
        value: 'zh-CN',
        label: '中文'
      },
      {
        value: 'en-US',
        label: 'English'
      }
    ] }
  }
}
</script>