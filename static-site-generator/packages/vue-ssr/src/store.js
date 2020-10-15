import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

export default new Vuex.Store({
  state: () => ({
    message: '',
  }),
  mutations: {
    SET_MESSAGE(state, message) {
      state.message = message
    },
  },
})
