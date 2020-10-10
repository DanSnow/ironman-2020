import React from 'react'
import { Link } from 'react-router-dom'
import { ArticlePreview } from './ArticlePreview'
import { gql } from 'generator'
import { useStaticQuery } from 'generator/macro'

export function ArticleList() {
  const { allArticles: articles } = useStaticQuery(gql`
    query {
      allArticles {
        slug
        title
        content
      }
    }
  `)
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
