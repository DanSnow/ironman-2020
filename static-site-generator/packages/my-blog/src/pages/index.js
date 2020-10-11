import React from 'react'
import { Layout } from '../layouts/default'
import { ArticleList } from '../components/ArticleList'
import { Image } from 'generator'
import img from '~/assets/image.jpg'

export default function Index() {
  return (
    <Layout>
      <Image img={img} />
      <ArticleList />
    </Layout>
  )
}
