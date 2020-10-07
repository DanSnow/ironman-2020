import React, { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { MDXProvider } from '@mdx-js/react'

let client

export function AppProvider({ title, store, children, Layout }) {
  if (!client) {
    client = window.client = new ApolloClient({
      cache: new InMemoryCache().restore(window.__APOLLO_STATE__),
    })
  }

  const components = {
    wrapper: (props) => <Layout {...props} />,
  }

  return (
    <MDXProvider components={components}>
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
    </MDXProvider>
  )
}
