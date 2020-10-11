import React from 'react'
import { Layout } from '../layouts/default'
import { ArticleList } from '../components/ArticleList'
import { Image } from 'generator'
import img from '~/assets/image.jpg'
import { gql } from 'generator'

export const query = gql`
  query {
    allArticles {
      slug
      title
      content
    }
  }
`

export default function Index(data = {}) {
  return (
    <Layout>
      <Image img={img} />
      <ArticleList articles={data.allArticles} />
    </Layout>
  )
}
