import React from 'react'
import { Layout } from './Layout'
import { ArticlePreview } from './ArticlePreview'

export function App({ title, articles }) {
  return (
    <Layout title={title}>
      <article className="space-y-8">
        {articles.map(({ title, content }) => (
          <ArticlePreview key={title} title={title} content={content} />
        ))}
      </article>
    </Layout>
  )
}
