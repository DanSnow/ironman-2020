import { resolve } from 'path'
import express from 'express'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { matchPath } from 'react-router-dom'
import importCwd from 'import-cwd'
import importModules from 'import-modules'
import { createStore } from './app/store'
import { AppProvider } from './app/server/AppProvider'
import { buildRoutes, renderRoutes } from './routes'
import { noop, findFirstMap } from './utils'
import { constants } from 'fs'
import { access, readFile, mkdir, writeFile, copyFile } from 'fs/promises'
import serialize from 'serialize-javascript'
import { compile, render } from 'eta'
import { Helmet } from 'react-helmet'
import { codegen } from './codegen'
import { bundle } from './app/webpack'
import { record } from './app/middleware/record'
import { __record } from './app/slices/record'
import ky from 'ky-universal'
import { ApolloServer } from 'apollo-server-express'
import { loadSchema } from './schema'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { getDataFromTree } from '@apollo/client/react/ssr'
import pEach from 'p-each-series'
import { loadSource } from './sources/filesystem'
import { createNodes } from './schema'

const pkg = importCwd('./package.json')
const config = importCwd('./config.js').default
const app = express()
const defaultTitle = config.title || pkg.name || 'My Static site'
const dist = resolve(process.cwd(), 'dist')
const bundlePath = resolve(process.cwd(), '.cache/dist/bundle.js')

const slices = importModules(resolve(process.cwd(), 'src/slices'))

const reducer = createReducer(slices)

config.api(app)

const routesPromise = buildRoutes()
const templatePromise = loadTemplate()

async function main() {
  const data = await routesPromise
  codegen({
    title: defaultTitle,
    ...data,
  })
  await bundle()
  await pEach(config.sources, (options) => loadSource({ createNodes, options }))
  const gql = new ApolloServer({ schema: await loadSchema() })
  gql.applyMiddleware({ app })
  app.get('/*', async (req, res) => {
    const payload = !!req.query.payload
    const { html, actions, client, route } = await renderHTML(toLocation(req))
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

  let possibleRoute = []
  for (const route of data.routes) {
    if (route.dynamic) {
      const store = createStore(reducer)
      const paths = await route.getStaticPaths({ store })
      possibleRoute = possibleRoute.concat(paths)
    } else {
      possibleRoute.push(route.url)
    }
  }

  for (const url of possibleRoute) {
    const path = url.substr(1)
    await mkdir(resolve(dist, path), { recursive: true })
    await fetchHTML(url, path)
    await fetchPayload(url, path)
  }
  await copyFile(bundlePath, resolve(dist, 'bundle.js'))
  server.close()
}

async function fetchPayload(url, path) {
  const body = await ky.get(`http://localhost:3000${url}`, { searchParams: { payload: true } }).text()
  await writeFile(resolve(dist, path, 'payload.js'), body)
}

async function fetchHTML(url, path) {
  const body = await ky.get(`http://localhost:3000${url}`).text()
  await writeFile(resolve(dist, path, 'index.html'), body)
}

main()

async function renderHTML(location) {
  const client = new ApolloClient({
    ssrMode: true,
    uri: 'http://localhost:3000/graphql',
    cache: new InMemoryCache(),
  })
  const store = createStore(reducer, [record])
  const { notFound, routes } = await routesPromise
  const findMatchRoute = ({ props, getInitialProps, routeProps }) => {
    const match = matchPath(location.pathname, routeProps)
    return match ? { ...match, getInitialProps, query: props.query } : undefined
  }
  const route = findFirstMap(routes, findMatchRoute) || { params: {}, getInitialProps: noop }

  await route.getInitialProps({ store, route })
  const App = (
    <AppProvider store={store} client={client} location={location} title={defaultTitle}>
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

  const template = await templatePromise
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

async function loadTemplate() {
  const path = resolve(process.cwd(), 'src/index.html')
  try {
    await access(path, constants.R_OK)
    const content = await readFile(path, 'utf-8')
    return compile(content)
  } catch {
    const content = await readFile(resolve(__dirname, 'app/index.html'), 'utf-8')
    return compile(content)
  }
}

function toLocation(req) {
  return { pathname: req.path }
}

function createReducer(slices) {
  const reducer = {}

  for (const [name, slice] of Object.entries(slices)) {
    reducer[name] = slice.reducer
  }

  return reducer
}
