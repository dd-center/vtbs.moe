<template>
<div>
  <input type="text" v-model="name">
  <input type="button" value="Submit" @click="clickButton">
  <input type="button" value="Clear" @click="clear">
  <ul>
    <li v-for="n in rnames">{{n}}</li>
  </ul>
</div>
</template>

<script>
export default {
  data: function() {
    return {
      names: [],
      name: ''
    }
  },
  sockets: {
    push: function(data) {
      this.names.push(data)
    }
  },
  computed: {
    rnames: function() {
      return [...this.names].reverse()
    }
  },
  methods: {
    clickButton: function() {
      this.$socket.emit('push', this.name)
    },
    clear: function() {
      this.names = []
    }
  }
}
</script>

<style scoped>

</style>
