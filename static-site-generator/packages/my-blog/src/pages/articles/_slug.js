import React from 'react'
import { Layout } from '../../components/Layout'
import { Article } from '../../components/Article'
import { fetchArticleById, fetchArticles, articleSelector } from '../../slices/articles'

export async function getStaticPaths({ store }) {
  await store.dispatch(fetchArticles())

  const articles = articleSelector.selectAll(store.getState())
  return articles.map(({ slug }) => `/articles/${slug}`)
}

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
