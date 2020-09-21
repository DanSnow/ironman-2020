import React from 'react'
import { Layout } from './Layout'
import { ArticlePreview } from './ArticlePreview'
import { Article } from './Article'
import { Route, StaticRouter, Switch, Link } from 'react-router-dom'
import { notFound } from '../articles'

export function App({ location, title, articles }) {
  return (
    <StaticRouter location={location}>
      <Layout location={location} title={title}>
        <Switch>
          <Route path="/" exact>
            <article className="space-y-8">
              {articles.map(({ slug, title, content }) => (
                <Link key={slug} className="block" to={`/articles/${slug}`}>
                  <ArticlePreview title={title} content={content} />
                </Link>
              ))}
            </article>
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
  )
}
