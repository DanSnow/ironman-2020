import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { articleSelector } from '../slices/articles'
import { ArticlePreview } from './ArticlePreview'

export function ArticleList() {
  const articles = useSelector(articleSelector.selectAll)

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
