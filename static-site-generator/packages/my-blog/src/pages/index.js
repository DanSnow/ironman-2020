import React from 'react'
import { Layout } from '../layouts/default'
import { ArticleList } from '../components/ArticleList'
import { fetchArticles } from '../slices/articles'

export async function getInitialProps({ store }) {
  await store.dispatch(fetchArticles())
}

export default function Index() {
  return (
    <Layout>
      <ArticleList />
    </Layout>
  )
}
