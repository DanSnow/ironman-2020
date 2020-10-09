import React from 'react'
import { resolve, join, relative, parse, dirname } from 'path'
import globby from 'globby'
import importCwd from 'import-cwd'
import { Switch, Route } from 'react-router-dom'
import { noop } from './utils'
import { Page } from './app/server/Page'
import mdx from '@mdx-js/mdx'
import { readFile, mkdir, writeFile } from 'fs/promises'
import pMap from 'p-map'
import { compile } from 'path-to-regexp'

export async function buildRoutes() {
  const pagesPath = resolve(process.cwd(), 'src/pages')
  const [jsRoutes, mdxRoutes] = await Promise.all([collectJsRoutes(pagesPath), collectMdxRoutes(pagesPath)])
  const routes = jsRoutes.concat(mdxRoutes)

  routes.sort((a, b) => (a.dynamic !== b.dynamic && !b.dynamic ? 1 : 0))

  return {
    notFound: resolveNotFound(),
    routes,
  }
}

async function collectMdxRoutes(pagesPath) {
  const absolutePaths = await globby([join(pagesPath, '**/*.mdx')])
  const mdxPath = resolve(dirname(pagesPath), '.mdx')
  await mkdir(mdxPath, { recursive: true })
  const routes = await pMap(absolutePaths, async (absolutePath) => {
    const path = relative(pagesPath, absolutePath)
    const parsed = parse(path)
    const base = `/${parsed.dir}`

    const content = await readFile(absolutePath)
    const { url, dynamic } = generateURL(parsed, base)
    const code = await mdx(content)
    const outputPath = resolve(mdxPath, path.replace('.mdx', '.js'))
    const lines = code.split('\n')

    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, [lines[0], `import {mdx} from 'generator'`, ...lines.slice(1)].join('\n'))
    const cachePath = relative(process.cwd(), outputPath)
    const mod = importCwd('./' + cachePath)

    return {
      dynamic,
      url,
      file: cachePath,
      getStaticPaths: noop,
      getInitialProps: noop,
      routeProps: {
        exact: url === '/',
        path: url,
      },
      props: {
        component: mod.default,
      },
    }
  })
  return routes
}

async function collectJsRoutes(pagesPath) {
  const absolutePaths = await globby([join(pagesPath, '**/*.js')])
  const routes = absolutePaths.map((absolutePath) => {
    const projectPath = relative(process.cwd(), absolutePath)
    const path = relative(pagesPath, absolutePath)
    const parsed = parse(path)
    const base = `/${parsed.dir}`

    const mod = importCwd('./' + projectPath)
    const { url, dynamic } = generateURL(parsed, base)
    const toPath = compile(url)

    const getStaticPaths = mod.getStaticPaths || noop

    return {
      dynamic,
      url,
      file: projectPath,
      getStaticPaths: async (...args) => {
        const res = await getStaticPaths(...args)
        if (Array.isArray(res)) {
          return res.map((x) => {
            if (typeof x === 'string') {
              return x
            }
            const { params } = x
            return toPath(params)
          })
        }
        return res
      },
      getInitialProps: mod.getInitialProps || noop,
      routeProps: {
        exact: url === '/',
        path: url,
      },
      props: {
        query: mod.query,
        component: mod.default,
      },
    }
  })
  return routes
}

function generateURL(parsed, base) {
  let dynamic = false
  const url = parsed.name === 'index' ? base : join(base, parsed.name)
  const resolvedURL = url.replace(/_([^/]+)/g, (_m, name) => {
    dynamic = true
    return `:${name}`
  })

  return {
    dynamic,
    url: resolvedURL,
  }
}

export function renderRoutes(routes, notFound) {
  return (
    <Switch>
      {routes.map(({ url, routeProps, props }) => (
        <Route key={url} {...routeProps}>
          <Page {...props} />
        </Route>
      ))}
      <Route component={notFound} />
    </Switch>
  )
}

function resolveNotFound() {
  try {
    return importCwd('./src/404').default
  } catch {
    return NotFound
  }
}

function NotFound() {
  return <div>404 Not Found</div>
}
