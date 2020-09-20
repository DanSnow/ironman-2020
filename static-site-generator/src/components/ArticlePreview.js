import React from 'react'

export function ArticlePreview({ title, content }) {
  return (
    <section>
      <h3 className="text-2xl font-bold text-blue-600">{title}</h3>
      <p className="text-gray-700">{content}</p>
    </section>
  )
}
