import React from 'react'
import { Layout } from '../../layouts/default'
import { Article } from '../../components/Article'
import { fetchArticleById, fetchArticles, articleSelector } from '../../slices/articles'
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

export async function getStaticPaths({ store }) {
  await store.dispatch(fetchArticles())

  const articles = articleSelector.selectAll(store.getState())
  return articles.map(({ slug }) => `/articles/${slug}`)
}

export async function getInitialProps({ store, route }) {
  await store.dispatch(fetchArticleById(route.params.slug))
}

export default function ArticlePage({ data }) {
  return (
    <Layout>
      <Article article={data && data.article} />
    </Layout>
  )
}
