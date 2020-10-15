<template>
  <div id="root">
    <div>
      <router-link to="/">home</router-link>
      <router-link to="/page">page</router-link>
    </div>
    <div>msg from server: {{ message }}</div>
    <router-view />
  </div>
</template>

<script>
import ky from 'ky-universal'

export default {
  data: () => ({ num: 0 }),

  async serverPrefetch() {
    const data = await ky.get('http://localhost:3000/api/foo').json()
    this.$store.commit('SET_MESSAGE', data.message)
  },

  computed: {
    message() {
      return this.$store.state.message
    },
  },
}
</script>
