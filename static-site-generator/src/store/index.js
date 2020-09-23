import { configureStore } from '@reduxjs/toolkit'
import { articleSlice } from './slice/article'

export function createStore() {
  return configureStore({
    reducer: articleSlice.reducer,
  })
}
