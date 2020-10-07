import React, { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { StaticRouter } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { Helmet } from 'react-helmet'
import { MDXProvider } from '@mdx-js/react'
import importCwd from 'import-cwd'

const { Layout } = importCwd('./src/layouts/default')

const components = {
  wrapper: (props) => <Layout {...props} />,
}

export function AppProvider({ client, store, location, children, title }) {
  return (
    <MDXProvider components={components}>
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
    </MDXProvider>
  )
}
