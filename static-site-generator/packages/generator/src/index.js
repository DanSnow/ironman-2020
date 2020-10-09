import { resolve } from 'path'
import { createStore } from './app/store'
import { buildRoutes } from './routes'
import { mkdir, writeFile, copyFile } from 'fs/promises'
import { codegen } from './codegen'
import { bundle } from './app/webpack'
import ky from 'ky-universal'
import { createNodes, loadSchema } from './schema'
import pEach from 'p-each-series'
import { loadSource } from './sources/filesystem'
import { config } from './config'
import { reducer } from './reducer'
import { configureServer } from './server'
import { execute } from 'graphql'

const dist = resolve(process.cwd(), 'dist')
const bundlePath = resolve(process.cwd(), '.cache/dist/bundle.js')

async function main() {
  const data = await buildRoutes()
  codegen({
    title: config.title,
    ...data,
  })
  await bundle()
  await pEach(config.sources, (options) => loadSource({ createNodes, options }))
  const schema = await loadSchema()
  const server = await configureServer(data, schema)
  const query = (query) => {
    return execute(schema, query)
  }

  let possibleRoute = []
  for (const route of data.routes) {
    if (route.dynamic) {
      const store = createStore(reducer)
      const paths = await route.getStaticPaths({ store, query })
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
