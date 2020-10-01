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
import { access, readFile } from 'fs/promises'
import { compile, render } from 'eta'
import { Helmet } from 'react-helmet'
import { codegen } from './codegen'
import { bundle } from './app/webpack'

const pkg = importCwd('./package.json')
const config = importCwd('./config.js').default
const app = express()

const slices = importModules(resolve(process.cwd(), 'src/slices'))

const reducer = createReducer(slices)

config.api(app)

const routesPromise = buildRoutes()
const templatePromise = loadTemplate()

app.use(express.static(resolve(process.cwd(), '.cache/dist')))
app.get('/*', async (req, res) => {
  res.send(await renderHTML(toLocation(req)))
})

async function main() {
  codegen(await routesPromise)
  await bundle()

  app.listen(3000, () => {
    console.log('server is running at http://localhost:3000')
  })
}

main()

async function renderHTML(location) {
  const store = createStore(reducer)
  const { notFound, routes } = await routesPromise
  const findMatchRoute = ({ props, getInitialProps }) => {
    const match = matchPath(location.pathname, props)
    return match ? { ...match, getInitialProps } : undefined
  }
  const route = findFirstMap(routes, findMatchRoute) || { params: {}, getInitialProps: noop }

  await route.getInitialProps({ store, route })

  const defaultTitle = config.title || pkg.name || 'My Static site'
  const output = renderToString(
    <AppProvider store={store} location={location} title={defaultTitle}>
      {renderRoutes(routes, notFound)}
    </AppProvider>
  )

  const helmet = Helmet.renderStatic()
  const title = helmet.title.toString()
  const meta = helmet.meta.toString()
  const link = helmet.link.toString()
  const state = JSON.stringify(store.getState())
  const head = [title, meta, link].join('\n')

  const template = await templatePromise
  return render(template, {
    title,
    head,
    meta,
    state,
    link,
    output,
  })
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
