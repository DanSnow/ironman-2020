import importCwd from 'import-cwd'
import { gql } from 'apollo-server-express'

const config = importCwd('./config.js').default

export const typeDefs = gql`
  type Article {
    slug: ID!
    title: String!
    content: String!
  }

  type Query {
    allArticles: [Article]
    article(slug: ID!): Article
  }
`

export const resolvers = {
  Query: {
    allArticles: () => config.data.getArticles(),
    article: (slug) => config.data.getArticle(slug),
  },
}
