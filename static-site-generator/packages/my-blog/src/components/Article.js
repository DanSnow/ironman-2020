import React from 'react'
import { useSelector } from 'react-redux'
import { articleSelector } from '../slices/articles'
import { useParams } from 'react-router-dom'
import { notFound } from '../data'
import { Helmet } from 'generator'

function getArticle() {
  const params = useParams()
  const article = useSelector((state) => articleSelector.selectById(state, params.slug))
  return article || notFound
}

export function Article({ article = getArticle() }) {
  const { title, content } = article

  return (
    <article>
      <Helmet>
        <title>My Blog - {title}</title>
      </Helmet>
      <h1 className="text-4xl text-center font-bold mb-8">{title}</h1>
      <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  )
}
