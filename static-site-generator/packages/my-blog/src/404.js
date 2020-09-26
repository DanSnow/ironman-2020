import React from 'react'
import { Layout } from './components/Layout'
import { Article } from './components/Article'
import { notFound } from './data'

export default function NotFound() {
  return (
    <Layout>
      <Article article={notFound} />
    </Layout>
  )
}
