Day 21: 用 GraphQL 載入動態頁面的資料
=====================================

> 這系列的程式碼在 https://github.com/DanSnow/ironman-2020/tree/master/static-site-generator

這篇要來試著把頁面的資料用 GraphQL 載入，首先先來裝 `@apollo/client` ：

```shell
$ yarn add @apollo/client
```

再來我們先在 `_slug` 這邊寫上我們要的 query ：

```javascript
// 之後我們會把 route 的 params 當成 variables 傳進來
export const query = gql`
  query ArticleQuery($slug: ID!) {
    article(id: $slug) {
      slug
      title
      content
    }
  }
`
```

再來因為多了 query 要處理，所以我們 Server 端也要新增一個 `Page` 的元件來幫我們使用 `useQuery` ，另外也別忘了，我們產生的 route 資料也必須要加上 query 的內容，不過那邊的改動並不大，這邊還是來看 `Page`，另外 Client 端的 `Page` 也必須做類似的修改：

```javascript
import React from 'react'
import { useRouteMatch } from 'react-router-dom'
import { useQuery } from '@apollo/client'

export function Page({ query, component: Component }) {
  const route = useRouteMatch()
  let pageData
  if (query) {
    // 有 query 才要做
    const { data } = useQuery(query, { variables: route.params })
    pageData = data
  }

  // 把 data 傳給 component
  return <Component data={pageData} />
}
```

但這麼做就變成是在元件中非同步的取得資料了，不過 Apollo 早已想到這點了，它提供了一個 API 直接讓你在 Server Side 收集頁面的 query ，它有點像是執行兩次 render 的過程，第一次只有收集資料而已，第二次我們要 render 時它早就把資料都抓好放在 cache 了，這邊是 `index.js` 的內容：

```javascript
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { getDataFromTree } from '@apollo/client/react/ssr'

// 省略

const client = new ApolloClient({
  // 啟動 ssr 模式
  ssrMode: true,
  uri: 'http://localhost:3000/graphql',
  cache: new InMemoryCache(),
})

const App = (
  <AppProvider store={store} client={client} location={location} title={defaultTitle}>
    {renderRoutes(routes, notFound)}
  </AppProvider>
)

// 讓 Apollo 收集資料
await getDataFromTree(App)

// 第二次我們自己 render 時就有資料了
const output = renderToString(App)
```

再來我們只要把 cache 中的資料像之前 Redux 的資料一樣送到 Client ，並在 Client 回復，就可以達到用 GraphQL 查詢資料的結果了，要還原 cache 只要：

```javascript
// 只要呼叫 cache 的 restore 就行了，另外這邊沒有加上 link ，就是希望 Apollo 只用 cache 的資料
new ApolloClient({ cache: new InMemoryCache().restore(window.__APOLLO_STATE__) })
```

到這邊應該可以試試看，可以看到用 GraphQL 載入的文章頁面了，不過要直接輸入文章的網址就是了

再來我原本想用 `readQuery` 跟 `writeQuery` 搭配原本的產生 `payload.js` 的方式來實作在 Client 端載入資料的，不過似乎出了點問題，我會再研究看看怎麼解決的，下一篇先照原定的 mdx
