import React from 'react'
import { resolve, join, relative, parse } from 'path'
import globby from 'globby'
import importCwd from 'import-cwd'
import { Switch, Route } from 'react-router-dom'
import { noop } from './utils'

export async function buildRoutes() {
  const pagesPath = resolve(process.cwd(), 'src/pages')
  const absolutePaths = await globby([join(pagesPath, '**/*.js')])

  return {
    notFound: resolveNotFound(),
    routes: absolutePaths.map((absolutePath) => {
      const projectPath = relative(process.cwd(), absolutePath)
      const path = relative(pagesPath, absolutePath)
      const parsed = parse(path)
      const base = parsed.dir || '/'

      const mod = importCwd('./' + projectPath)
      const url = parsed.name === 'index' ? base : join(base, parsed.name)

      return {
        url,
        file: projectPath,
        getInitialProps: mod.getInitialProps || noop,
        props: {
          exact: url === '/',
          path: url,
          component: mod.default,
        },
      }
    }),
  }
}

export function renderRoutes(routes, notFound) {
  return (
    <Switch>
      {routes.map(({ url, props }) => (
        <Route key={url} {...props} />
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
