<template>
<div class="sort-bar">
  <span class="sort-label">排序</span>
  <button v-for="(text, key) in options" :key="key" class="sort-option" :class="{ active: current.key === key }" @click="select(key)">
    {{text}}
    <span v-if="current.key === key" :class="current.order > 0 ? 'el-icon-sort-down' : 'el-icon-sort-up'"></span>
  </button>
</div>
</template>

<script>
import { parseSort } from './data'

export default {
  props: {
    options: Object,
    value: String,
  },
  computed: {
    current() {
      return parseSort(this.value)
    },
  },
  methods: {
    select(key) {
      if (this.current.key === key) {
        this.$emit('input', this.current.order > 0 ? `!${key}` : key)
      } else {
        this.$emit('input', key)
      }
    },
  },
}
</script>

<style scoped>
.sort-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.sort-label {
  color: #909399;
  font-size: 13px;
  margin-right: 4px;
}

.sort-option {
  border: 1px solid transparent;
  background: none;
  border-radius: 14px;
  padding: 3px 10px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  line-height: 1.5;
}

.sort-option:hover {
  color: #409eff;
}

.sort-option.active {
  color: #409eff;
  border-color: #b3d8ff;
  background: #ecf5ff;
}
</style>
