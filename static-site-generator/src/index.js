import express from 'express'
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { App } from './components/App'

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
]

app.get('/', (_req, res) => {
  res.send(
    renderToStaticMarkup(
      <html>
        <head>
          <title>My Blog</title>
          <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet" />
        </head>
        <body>
          <div
            id="root"
            dangerouslySetInnerHTML={{ __html: renderToString(<App title={'My Blog'} articles={articles} />) }}
          />
        </body>
      </html>
    )
  )
})

app.listen(3000, () => {
  console.log('server is running at http://localhost:3000')
})
