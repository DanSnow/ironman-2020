import { resolve } from 'path'
import express from 'express'
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { matchPath } from 'react-router-dom'
import importCwd from 'import-cwd'
import importModules from 'import-modules'
import { createStore } from './app/store'
import { AppProvider } from './app/components/AppProvider'

const config = importCwd('./config.js').default
const App = importCwd('./src/index.js').default
const { fetchArticleById, fetchArticles } = importCwd('./src/slices/articles.js')
const app = express()

const slices = importModules(resolve(process.cwd(), 'src/slices'))

const reducer = createReducer(slices)

config.api(app)

app.get('/*', async (req, res) => {
  res.send(await renderHTML(toLocation(req)))
})

app.listen(3000, () => {
  console.log('server is running at http://localhost:3000')
})

async function renderHTML(location) {
  const store = createStore(reducer)

  if (location.pathname === '/') {
    await store.dispatch(fetchArticles())
  } else {
    const match = matchPath(location.pathname, { path: '/articles/:slug' })
    if (match) {
      await store.dispatch(fetchArticleById(match.params.slug))
    }
  }

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
                <App />
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
