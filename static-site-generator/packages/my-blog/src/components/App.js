import React from 'react'
import { Layout } from './Layout'
import { Article } from './Article'
import { Route, Switch } from 'react-router-dom'
import { notFound } from '../data'
import { ArticleList } from './ArticleList'

export function App() {
  return (
    <Layout title="My Blog">
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
  )
}
