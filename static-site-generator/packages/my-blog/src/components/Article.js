import React from 'react'
import { Helmet } from 'generator'

function getArticle() {
  return { title: 'Not Found', content: 'Not Found' }
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
