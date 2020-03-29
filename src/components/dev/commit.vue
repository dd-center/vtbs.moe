<template>
<div>
  <h4 class="title is-4">Commit</h4>
  <table class="table is-striped  is-hoverable">
    <tbody>
      <tr v-for="[hash, number] in versions" :key="hash">
        <td>{{number}}</td>
        <td>{{hash}}</td>
      </tr>
    </tbody>
  </table>
</div>
</template>

<script>
import { hashRank } from '@/dev'
export default {
  async mounted() {
    this.versions = await hashRank()
  },
  data() {
    return {
      versions: [
        ['loading...', 0],
      ],
    }
  },
}
</script>

<style>

</style>
