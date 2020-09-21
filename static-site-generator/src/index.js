import express from 'express'
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { App } from './components/App'
import { articles } from './articles'

const app = express()

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
