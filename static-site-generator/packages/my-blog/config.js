import { store } from './src/server-store'
import { articleSelector } from './src/slices/articles'

export default {
  title: 'My Blog',

  api: (app) => {
    app.get('/api/articles/:slug', (req, res) => {
      res.json(articleSelector.selectById(store.getState(), req.params.slug))
    })

    app.get('/api/articles', (_req, res) => {
      res.json(articleSelector.selectAll(store.getState()))
    })
  },
}
