import { resolve } from 'path'
import express from 'express'
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { matchPath } from 'react-router-dom'
import importCwd from 'import-cwd'
import importModules from 'import-modules'
import { createStore } from './app/store'
import { AppProvider } from './app/components/AppProvider'
import { buildRoutes, renderRoutes } from './routes'
import { noop, findFirstMap } from './utils'

const config = importCwd('./config.js').default
const app = express()

const slices = importModules(resolve(process.cwd(), 'src/slices'))

const reducer = createReducer(slices)

config.api(app)

const routesPromise = buildRoutes()

app.get('/*', async (req, res) => {
  res.send(await renderHTML(toLocation(req)))
})

app.listen(3000, () => {
  console.log('server is running at http://localhost:3000')
})

async function renderHTML(location) {
  const store = createStore(reducer)
  const { notFound, routes } = await routesPromise
  const findMatchRoute = ({ props, getInitialProps }) => {
    const match = matchPath(location.pathname, props)
    return match ? { ...match, getInitialProps } : undefined
  }
  const route = findFirstMap(routes, findMatchRoute) || { params: {}, getInitialProps: noop }

  await route.getInitialProps({ store, route })

  return renderToStaticMarkup(
    <html>
      <head>
        <title>My Blog</title>
        <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet" />
      </head>
      <body>
        <div
          id="root"
          dangerouslySetInnerHTML={{
            __html: renderToString(
              <AppProvider store={store} location={location}>
                {renderRoutes(routes, notFound)}
              </AppProvider>
            ),
          }}
        />
      </body>
    </html>
  )
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
