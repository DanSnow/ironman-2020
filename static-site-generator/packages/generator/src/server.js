import React from 'react'
import express from 'express'
import serialize from 'serialize-javascript'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { ApolloServer } from 'apollo-server-express'
import { AppProvider } from './app/server/AppProvider'
import { Helmet } from 'react-helmet'
import { config } from './config'
import { getDataFromTree } from '@apollo/client/react/ssr'
import { matchPath } from 'react-router-dom'
import { noop, findFirstMap } from './utils'
import { record } from './app/middleware/record'
import { render } from 'eta'
import { createStore } from './app/store'
import { reducer } from './reducer'
import { renderRoutes } from './routes'
import { renderToString } from 'react-dom/server'
import { templatePromise } from './template'
import { __record } from './app/slices/record'

export async function configureServer(data, schema) {
  const app = express()
  config.api(app)

  const gql = new ApolloServer({ schema })
  gql.applyMiddleware({ app })
  const template = await templatePromise
  app.get('/*', async (req, res) => {
    const payload = !!req.query.payload
    const { html, actions, client, route } = await renderHTML(toLocation(req), template, data)
    const gql = route.query
      ? {
          query: route.query,
          variables: route.params,
          data: client.readQuery({ query: route.query, variables: route.params }),
        }
      : null

    if (payload) {
      res.send(
        renderPayload({
          path: req.path,
          actions,
          gql,
        })
      )
    } else {
      res.send(html)
    }
  })

  const server = app.listen(3000, () => {
    console.log('server is running at http://localhost:3000')
  })

  return server
}

async function renderHTML(location, template, { routes, notFound }) {
  const client = new ApolloClient({
    ssrMode: true,
    uri: 'http://localhost:3000/graphql',
    cache: new InMemoryCache(),
  })
  const store = createStore(reducer, [record])
  const findMatchRoute = ({ props, getInitialProps, routeProps }) => {
    const match = matchPath(location.pathname, routeProps)
    return match ? { ...match, getInitialProps, query: props.query } : undefined
  }
  const route = findFirstMap(routes, findMatchRoute) || { params: {}, getInitialProps: noop }

  await route.getInitialProps({ store, route })
  const App = (
    <AppProvider store={store} client={client} location={location} title={config.title}>
      {renderRoutes(routes, notFound)}
    </AppProvider>
  )
  await getDataFromTree(App)

  const output = renderToString(App)

  store.dispatch(__record.actions.createPage(location.pathname))

  const helmet = Helmet.renderStatic()
  const title = helmet.title.toString()
  const meta = helmet.meta.toString()
  const link = helmet.link.toString()
  const state = store.getState()
  const head = [title, meta, link].join('\n')

  return {
    html: render(template, {
      title,
      head,
      meta,
      state: JSON.stringify(state),
      apollo: JSON.stringify(client.extract()),
      link,
      output,
    }),
    actions: state.__record.pages[location.pathname],
    client,
    route,
  }
}

function renderPayload({ path, actions, gql }) {
  return `__GENERATOR_JSONP__('${path}', ${serialize(actions, { isJSON: true })}, ${serialize(gql)})`
}

function toLocation(req) {
  return { pathname: req.path }
}
