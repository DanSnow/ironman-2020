Day 19: GraphQL
===============

> 這系列的程式碼在 https://github.com/DanSnow/ironman-2020/tree/master/static-site-generator

GraphQL 如果你不知道的話這邊稍微解釋一下， GraphQL 是種 API 格式，使用一種叫 GraphQL 的查詢語言向後端要資料，這個在產生靜態網頁其實有不少的好處，因為資料的結構 (schema) 不管是資料來源所能提供的或是 Client 端實際需要的部份都有被明確定義，所以一來可以讓 Client 端只存放實際需要的資料而縮減大小，二來可以明確的知道頁面與資料間的關係，從而實作 incremental build ，也就是只重新產生必要的頁面，不過這系列目前就連 webpack 打包的檔案每次都要重跑就是了

之後我們會使用 Apollo 這套 GraphQL 的實作，來提供資料，與在 Client 端取得資料，雖然 GraphQL 要明確的寫出資料的 schema ，但在 SSG 一般都是自動產生的，預期的格式應該會是這樣：

```graphql
type Article {
  slug: ID!
  title: String!
  content: String!
}

type Query {
  allArticles: [Article]
  article(slug: ID!): Article
}
```

而像首頁就只要做這樣的查詢：

```graphql
query {
  allArticles {
    slug
    title
    content
  }
}
```

總之先來簡單的建一下 server 吧，首先在 `generator` 安裝必要的套件：

```shell
$ yarn add graphql apollo-server apollo-server-express
```

像這樣準備好 schema 跟 resolver:

```javascript
import importCwd from 'import-cwd'
import { gql } from 'apollo-server-express'

// 因為沒有資料來源，就直接讓 config.js 提供了
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
```

然後按照範例把 server 跟 express 整合起來：

```javascript
import { ApolloServer } from 'apollo-server-express'
import { typeDefs, resolvers } from './schema'

// 省略

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.applyMiddleware({ app })
```

> 另外我暫時註解掉了 `server.close()` ，還有 apollo 在 yarn v2 的環境下要特別設定一下，請參考 `.yarnrc` 檔案的內容

再來去 `http://localhost:3000/graphql` 就可以試了，下一篇來從資料產生 schema
