import express from 'express'
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { App } from './components/App'
import { articles } from './articles'
import { articleSelector, store } from './server-store'

const app = express()

app.get('/api/articles/:slug', (req, res) => {
  res.json(articleSelector.selectById(store.getState(), req.params.slug))
})

app.get('/api/articles', (_req, res) => {
  res.json(articleSelector.selectAll(store.getState()))
})

app.get('/*', (req, res) => {
  res.send(renderHTML(toLocation(req)))
})

app.listen(3000, () => {
  console.log('server is running at http://localhost:3000')
})

function renderHTML(location) {
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
            __html: renderToString(<App title={'My Blog'} location={location} articles={articles} />),
          }}
        />
      </body>
    </html>
  )
}

function toLocation(req) {
  return { pathname: req.path }
}
