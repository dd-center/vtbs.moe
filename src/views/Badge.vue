<template>
  <el-container v-loading="!vtb">
    <el-main>
      <el-row type="flex" justify="space-around">
        <el-col :xs="24" :sm="20" :md="16" :lg="13" :xl="12">
          <card v-if="vtb" :vtb="vtb"></card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import card from '@/components/card'

export default {
  props: ['mid'],
  components: {
    card,
  },
  computed: {
    vtb() {
      return this.$store.state.vtbs.find(({ mid }) => mid === Number(this.mid))
    },
  },
}
</script>
