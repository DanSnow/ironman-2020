import React from 'react'
import { resolve, join, relative, parse } from 'path'
import globby from 'globby'
import importCwd from 'import-cwd'
import { Switch, Route } from 'react-router-dom'
import { noop } from './utils'
import { Page } from './app/server/Page'

export async function buildRoutes() {
  const pagesPath = resolve(process.cwd(), 'src/pages')
  const absolutePaths = await globby([join(pagesPath, '**/*.js')])
  const routes = absolutePaths.map((absolutePath) => {
    const projectPath = relative(process.cwd(), absolutePath)
    const path = relative(pagesPath, absolutePath)
    const parsed = parse(path)
    const base = `/${parsed.dir}`

    const mod = importCwd('./' + projectPath)
    const { url, dynamic } = generateURL(parsed, base)

    return {
      dynamic,
      url,
      file: projectPath,
      getStaticPaths: mod.getStaticPaths || noop,
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

  routes.sort((a, b) => (a.dynamic !== b.dynamic && !b.dynamic ? 1 : 0))

  return {
    notFound: resolveNotFound(),
    routes,
  }
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
