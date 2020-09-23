import React from 'react'
import { Provider } from 'react-redux'
import { Layout } from './Layout'
import { Article } from './Article'
import { Route, StaticRouter, Switch } from 'react-router-dom'
import { notFound } from '../articles'
import { ArticleList } from './ArticleList'

export function App({ store, location, title }) {
  return (
    <Provider store={store}>
      <StaticRouter location={location}>
        <Layout location={location} title={title}>
          <Switch>
            <Route path="/" exact>
              <ArticleList />
            </Route>
            <Route path="/articles/:slug">
              <Article />
            </Route>
            <Route>
              <Article article={notFound} />
            </Route>
          </Switch>
        </Layout>
      </StaticRouter>
    </Provider>
  )
}
