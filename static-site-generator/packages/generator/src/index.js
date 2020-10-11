import { resolve } from 'path'
import { createStore } from './app/store'
import { buildRoutes } from './routes'
import { mkdir, writeFile, readFile } from 'fs/promises'
import { codegen } from './codegen'
import { bundle } from './app/webpack'
import ky from 'ky-universal'
import { createNodes, loadSchema, pageDependencies, trackDependencies } from './schema'
import pEach from 'p-each-series'
import { loadSource } from './sources/filesystem'
import { config } from './config'
import { reducer } from './reducer'
import { configureServer } from './server'
import { execute } from 'graphql'
import { executeStaticQueries } from './queries'
import { patchRequire } from './hook'
import { copy } from 'fs-extra'
import { matchPath } from 'react-router-dom'
import { findFirstMap } from './utils'
import { InMemoryCache, ApolloClient } from '@apollo/client'
import pMapSeries from 'p-map-series'

const dist = resolve(process.cwd(), 'dist')
const webpackPath = resolve(process.cwd(), '.cache/dist')
const cachePath = resolve(process.cwd(), '.cache')

async function main() {
  patchRequire()
  await pEach(config.sources, (options) => loadSource({ createNodes, options }))
  const schema = await loadSchema()
  await executeStaticQueries(schema)

  const data = await buildRoutes()
  codegen({
    title: config.title,
    ...data,
  })
  await bundle()
  const server = await configureServer(data, schema)

  const query = (query) => {
    return execute(schema, query)
  }

  const client = new ApolloClient({
    uri: 'http://localhost:3000/graphql',
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
    },
  })

  let possibleRoute = []
  for (const route of data.routes) {
    if (route.dynamic) {
      const store = createStore(reducer)
      const paths = await route.getStaticPaths({ store, query })
      possibleRoute = possibleRoute.concat(
        await pMapSeries(paths, async (path) => {
          const route = findMatchRoute(path)
          if (route.query) {
            await trackDependencies(path, async () => {
              await client.query({ query: route.query, variables: route.params })
            })
          }
          return path
        })
      )
    } else {
      await trackDependencies(route.url, async () => {
        if (route.props.query) {
          await client.query({ query: route.props.query })
        }
      })
      possibleRoute.push(route.url)
    }
  }

  const pageDependenciesPath = resolve(cachePath, 'page-dependencies.json')
  const previousDependencies = new Map(await loadJSON(pageDependenciesPath, []))

  for (const url of possibleRoute) {
    if (!needRebuild(previousDependencies.get(url), pageDependencies.get(url))) {
      console.log(`Skip ${url}`)
      continue
    }
    console.log(`Build ${url}`)
    const path = url.substr(1)
    await mkdir(resolve(dist, path), { recursive: true })
    await fetchHTML(url, path)
    await fetchPayload(url, path)
  }
  await copy(webpackPath, dist)
  await writeFile(pageDependenciesPath, JSON.stringify(Array.from(pageDependencies.entries())))
  server.close()

  function findMatchRoute(path) {
    const find = ({ props, getInitialProps, routeProps }) => {
      const match = matchPath(path, routeProps)
      return match ? { ...match, getInitialProps, query: props.query } : undefined
    }
    const route = findFirstMap(data.routes, find) || { params: {}, getInitialProps: noop }
    return route
  }
}

function needRebuild(previous, current) {
  if (!previous) {
    return true
  }
  if (previous.length !== current.length) {
    return true
  }

  sortById(previous)
  sortById(current)

  for (let i = 0; i < previous.length; ++i) {
    const prev = previous[i]
    const cur = current[i]
    if (prev.all !== cur.all) {
      return true
    }
    if (prev.all) {
      const res = compareNodes(prev.nodes, cur.nodes)
      if (res) {
        return true
      }
    }
    if (prev.id !== cur.id || prev.hash !== cur.hash) {
      return true
    }
  }
  return false
}

async function loadJSON(path, defaultValue = {}) {
  try {
    return JSON.parse(await readFile(path, 'utf-8'))
  } catch {
    return defaultValue
  }
}

async function fetchPayload(url, path) {
  const body = await ky.get(`http://localhost:3000${url}`, { searchParams: { payload: true } }).text()
  await writeFile(resolve(dist, path, 'payload.js'), body)
}

async function fetchHTML(url, path) {
  const body = await ky.get(`http://localhost:3000${url}`).text()
  await writeFile(resolve(dist, path, 'index.html'), body)
}

function compareNodes(a, b) {
  if (a.length !== b.length) {
    return true
  }

  sortById(a)
  sortById(b)

  for (let i = 0; i < a.length; ++i) {
    const prev = a[i]
    const cur = b[i]
    if (prev.id !== cur.id || prev.hash !== cur.hash) {
      return true
    }
  }
  return false
}

function sortById(nodes) {
  nodes.sort((x, y) => x.id.localeCompare(y.id))
}

main()
