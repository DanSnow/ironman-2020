import React from 'react'
import { Layout } from '../../components/Layout'
import { Article } from '../../components/Article'
import { fetchArticleById } from '../../slices/articles'

export async function getInitialProps({ store, route }) {
  await store.dispatch(fetchArticleById(route.params.slug))
}

export default function ArticlePage() {
  return (
    <Layout>
      <Article />
    </Layout>
  )
}
