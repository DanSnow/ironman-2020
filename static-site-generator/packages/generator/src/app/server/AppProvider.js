import React, { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { StaticRouter } from 'react-router-dom'
import { Helmet } from 'react-helmet'

export function AppProvider({ store, location, children, title }) {
  return (
    <Provider store={store}>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <StrictMode>
        <StaticRouter location={location}>{children}</StaticRouter>
      </StrictMode>
    </Provider>
  )
}
