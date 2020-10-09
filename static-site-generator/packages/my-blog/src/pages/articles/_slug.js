import React from 'react'
import { Layout } from '../../layouts/default'
import { Article } from '../../components/Article'
import { gql } from 'generator'

export const query = gql`
  query ArticleQuery($slug: ID!) {
    article(id: $slug) {
      slug
      title
      content
    }
  }
`

export async function getStaticPaths({ query }) {
  const { data } = await query(gql`
    query {
      allArticles {
        slug
      }
    }
  `)
  return data.allArticles.map(({ slug }) => ({ params: { slug } }))
}

export default function ArticlePage({ data }) {
  return (
    <Layout>
      <Article article={data && data.article} />
    </Layout>
  )
}
