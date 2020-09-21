import React from 'react'
import { useParams } from 'react-router-dom'
import { articles, notFound } from '../articles'

function getArticle() {
  const params = useParams()
  return articles.find(({ slug }) => params.slug === slug) || notFound
}

export function Article({ article = getArticle() }) {
  const { title, content } = article

  return (
    <article>
      <h1 className="text-4xl text-center font-bold mb-8">{title}</h1>
      <p className="text-gray-700">{content}</p>
    </article>
  )
}
