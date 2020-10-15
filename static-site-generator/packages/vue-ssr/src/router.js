import Vue from 'vue'
import Router from 'vue-router'
import Counter from './Counter.vue'
import Page from './Page.vue'

const routes = [
  {
    path: '/page',
    component: Page,
  },
  {
    path: '/',
    component: Counter,
  },
]

Vue.use(Router)

export const router = new Router({ mode: 'history', routes })
