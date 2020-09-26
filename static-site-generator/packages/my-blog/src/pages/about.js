import React from 'react'
import { Article } from '../components/Article'
import { Layout } from '../components/Layout'

export default function About() {
  return (
    <Layout>
      <Article article={{ title: 'About', content: 'About me...' }} />
    </Layout>
  )
}
