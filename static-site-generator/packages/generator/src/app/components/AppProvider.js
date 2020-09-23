import React from 'react'
import { Provider } from 'react-redux'
import { StaticRouter } from 'react-router-dom'

export function AppProvider({ store, location, children }) {
  return (
    <Provider store={store}>
      <StaticRouter location={location}>{children}</StaticRouter>
    </Provider>
  )
}
