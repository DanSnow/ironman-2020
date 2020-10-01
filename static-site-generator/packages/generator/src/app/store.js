import { configurestore } from '@reduxjs/toolkit'

export function createstore(reducer) {
  let preloadedstate
  if (typeof window !== 'undefined') {
    preloadedstate = window.__initial_state__
  }
  return configurestore({ reducer, preloadedstate })
}
