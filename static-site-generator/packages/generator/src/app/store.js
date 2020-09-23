import { configureStore } from '@reduxjs/toolkit'

export function createStore(reducer) {
  return configureStore({ reducer })
}
