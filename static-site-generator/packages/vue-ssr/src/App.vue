<template>
  <div id="root">
    <div>{{ num }}</div>
    <div>
      <button @click="num += 1">+</button>
      <button @click="num -= 1">-</button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  data: () => ({ num: 0 }),
}
</script>
