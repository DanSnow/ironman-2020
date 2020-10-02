import { configureStore } from '@reduxjs/toolkit'
import { __record } from './slices/record'

export function createStore(reducer, middleware = []) {
  let preloadedState

  if (typeof window !== 'undefined') {
    preloadedState = window.__INITIAL_STATE__
  }

  return configureStore({
    reducer: {
      ...reducer,
      __record: __record.reducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middleware),
  })
}
