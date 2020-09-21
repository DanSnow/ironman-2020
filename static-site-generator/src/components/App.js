import React from 'react'
import { Layout } from './Layout'
import { ArticlePreview } from './ArticlePreview'
import { Article } from './Article'

const notFound = {
  title: 'Not Found',
  content: '404 not found',
}

export function App({ location, title, articles }) {
  const isHome = location.pathname === '/'
  const article = (isHome ? undefined : articles.find(({ slug }) => location.params.slug === slug)) || notFound

  return (
    <Layout location={location} title={title}>
      {isHome ? (
        <article className="space-y-8">
          {articles.map(({ slug, title, content }) => (
            <a key={slug} className="block" href={`/articles/${slug}`}>
              <ArticlePreview title={title} content={content} />
            </a>
          ))}
        </article>
      ) : (
        <Article {...article} />
      )}
    </Layout>
  )
}
