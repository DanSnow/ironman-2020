const { resolve } = require('path')
const express = require('express')
const { createRenderer } = require('vue-server-renderer')
const createApp = require('./src/entry-server')

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

app.get('/api/foo', (req, res) => {
  res.send({ message: 'Hello world' })
})

app.get('/*', async (req, res) => {
  const context = {}
  const app = await createApp(context)
  const html = await renderer.renderToString(app, context)
  res.send(html)
})

app.listen(3000, () => {
  console.log('listen at http://localhost:3000')
})
