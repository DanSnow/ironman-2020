import express from 'express'
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { App } from './components/App'
import { articles } from './articles'
import { store } from './server-store'
import { createStore } from './store'
import { articleSelector, fetchArticleById, fetchArticles } from './store/slice/article'
import { matchPath } from 'react-router-dom'

const app = express()

app.get('/api/articles/:slug', (req, res) => {
  res.json(articleSelector.selectById(store.getState(), req.params.slug))
})

app.get('/api/articles', (_req, res) => {
  res.json(articleSelector.selectAll(store.getState()))
})

app.get('/*', async (req, res) => {
  res.send(await renderHTML(toLocation(req)))
})

app.listen(3000, () => {
  console.log('server is running at http://localhost:3000')
})

async function renderHTML(location) {
  const store = createStore()

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
            __html: renderToString(<App store={store} title={'My Blog'} location={location} articles={articles} />),
          }}
        />
      </body>
    </html>
  )
}

function toLocation(req) {
  return { pathname: req.path }
}
