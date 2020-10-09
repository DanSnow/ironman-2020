import React from 'react'
import { Link } from 'react-router-dom'
import { ArticlePreview } from './ArticlePreview'

export function ArticleList({ articles = [] }) {
  return (
    <article className="space-y-8">
      {articles.map(({ slug, title, content }) => (
        <Link key={slug} className="block" to={`/articles/${slug}`}>
          <ArticlePreview title={title} content={content} />
        </Link>
      ))}
    </article>
  )
}
