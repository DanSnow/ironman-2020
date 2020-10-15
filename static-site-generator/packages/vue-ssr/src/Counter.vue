<template>
  <div>
    <div>{{ num }}</div>
    <div>
      <button @click="num += 1">+</button>
      <button @click="num -= 1">-</button>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({ num: 0 }),
}
</script>
