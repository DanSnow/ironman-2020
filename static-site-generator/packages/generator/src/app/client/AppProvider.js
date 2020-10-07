import React, { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'

let client

export function AppProvider({ title, store, children }) {
  if (!client) {
    client = window.client = new ApolloClient({
      cache: new InMemoryCache().restore(window.__APOLLO_STATE__),
    })
  }

  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <StrictMode>
          <BrowserRouter>{children}</BrowserRouter>
        </StrictMode>
      </Provider>
    </ApolloProvider>
  )
}
