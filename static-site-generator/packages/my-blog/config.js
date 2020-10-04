import { store } from './src/server-store'
import { articleSelector } from './src/slices/articles'

const getArticles = () => {
  return articleSelector.selectAll(store.getState())
}

const getArticle = (slug) => {
  return articleSelector.selectById(store.getState(), slug)
}

export default {
  title: 'My Blog',

  data: {
    getArticles,
    getArticle,
  },

  api: (app) => {
    app.get('/api/articles/:slug', (req, res) => {
      res.json(getArticle(req.params.slug))
    })

    app.get('/api/articles', (_req, res) => {
      res.json(getArticles())
    })
  },
}
