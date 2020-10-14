const { resolve } = require('path')
const express = require('express')
const { createRenderer } = require('vue-server-renderer')
const createApp = require('./dist/server').default

const template = `
<html>
  <head>
    <title>SSR test</title>
  </head>
  <body>
    <!--vue-ssr-outlet-->
    <script src="client.js"></script>
  </body>
</html>
`

const app = express()
const renderer = createRenderer({
  template,
})

app.use(express.static(resolve(__dirname, 'dist')))

app.get('/', async (req, res) => {
  const context = {}
  const app = createApp()
  const html = await renderer.renderToString(app, context)
  res.send(html)
})

app.listen(3000, () => {
  console.log('listen at http://localhost:3000')
})
