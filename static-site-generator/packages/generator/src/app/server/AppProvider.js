import React, { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { StaticRouter } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { Helmet } from 'react-helmet'

export function AppProvider({ client, store, location, children, title }) {
  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <StrictMode>
          <StaticRouter location={location}>{children}</StaticRouter>
        </StrictMode>
      </Provider>
    </ApolloProvider>
  )
}
