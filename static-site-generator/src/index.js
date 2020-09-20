import express from 'express'
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { App } from './components/App'
import slugify from 'slugify'

const app = express()

const articles = [
  {
    title: 'How to write a Static Site Generator',
    content: 'We will introduce you how to write a Static Site Generator...',
  },
  {
    title: 'First Post',
    content: 'My first post',
  },
].map((article) =>
  article.slug
    ? article
    : {
        slug: slugify(article.title, { lower: true }),
        ...article,
      }
)

app.get('/', (req, res) => {
  res.send(renderHTML(toLocation(req)))
})

app.get('/articles/:slug', (req, res) => {
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
  return { pathname: req.path, params: req.params }
}
