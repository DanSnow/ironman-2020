import React, { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Helmet } from 'react-helmet'

export function AppProvider({ title, store, children }) {
  return (
    <Provider store={store}>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <StrictMode>
        <BrowserRouter>{children}</BrowserRouter>
      </StrictMode>
    </Provider>
  )
}
