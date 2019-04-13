<template>
<el-container>
  <el-main>
    <el-row type="flex" justify="space-around">
      <el-col :xs="24" :sm="16" :md="12" :lg="8" :xl="7" v-loading="!vtbs.length">
        <card v-for="vtb in vtbs" :vtb="vtb" :key="vtb.mid"></card>
      </el-col>
    </el-row>
  </el-main>
</el-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import card from '@/components/card'

export default {
  name: 'home',
  components: {
    card
  },
  computed: { ...mapState(['vtbs']),
    ...mapGetters(['followerRank'])
  }
}
</script>
