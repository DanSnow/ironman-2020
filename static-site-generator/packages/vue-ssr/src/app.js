import Vue from 'vue'
import App from './App.vue'
import store from './store'
import { router } from './router'

export function createApp() {
  const app = new Vue({
    store,
    router,
    render: (h) => h(App),
  })
  return { app, store, router }
}
