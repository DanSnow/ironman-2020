import React from 'react'
import { gql } from 'generator'
import { Layout } from '../layouts/default'
import { ArticleList } from '../components/ArticleList'

export const query = gql`
  query {
    allArticles {
      slug
      title
      content
    }
  }
`

export default function Index({ data = {} }) {
  return (
    <Layout>
      <ArticleList articles={data.allArticles} />
    </Layout>
  )
}
