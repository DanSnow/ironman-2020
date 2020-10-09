Day 24: 用 GraphQL 取得動態路由
===============================

> 這系列的程式碼在 https://github.com/DanSnow/ironman-2020/tree/master/static-site-generator

這篇要來把各個部份都換成使用 GraphQL ，同時也會把之前留下來的一些問題處理好，其中最主要的部份應該屬於 `getStaticPaths` 還在使用原本的 API ，這次要來把它也換成用 GraphQL

事實上只要有 schema 跟 query ，也不需要走 http 連到自己的 server ，我們一樣有辦法在 server 端執行 GraphQL 的查詢 (不如說不行反而比較奇怪，不然 ApolloServer 又是怎麼做查詢的)，這邊要直接用到 `graphql` 這個套件中的 `execute` ，它用來執行查詢，另外還有一個函式就叫 `graphql` 也可以用來執行查詢，不過兩個的參數不同，差別如下：

```javascript
import { graphql, execute } from 'graphql'
import gql from 'graphql-tag'

graphql(
  schema,
  `
    query {
      foo
    }
  `
)

execute(
  schema,
  // 差別就在有沒有這個 gql 的 tag ，這個 tag 能把 GraphQL 的查詢語言動態的轉換成 AST
  // 而 graphql 已經有自帶一個轉換了，要是反而傳入 AST 會出錯的
  gql`
    query {
      foo
    }
  `
)
```

所以要做的事其實也很簡單，把上面的函式跟目前的 schema 包成一個新的函式並傳給使用者用就行了，就像這樣：

```javascript
const query = (query) => {
  return execute(schema, query)
}

// 省略

const paths = await route.getStaticPaths({ store, query })
```

接著我們在 `_slug.js` 的 `getStaticPaths` 就可以改成：

```javascript
export async function getStaticPaths({ query }) {
  const { data } = await query(gql`
    query {
      allArticles {
        slug
      }
    }
  `)
  // 這邊改成回傳 params 的陣列了
  return data.allArticles.map(({ slug }) => ({ params: { slug } }))
}
```

之前也說過，要使用者自己組網址什麼的，開發者體驗太差了，這次也來修一下，這邊要用到一個套件叫 `path-to-regexp` ，它是很多跟路由有關的套件如 `express` 或 `react-router` 都在使用的一個東西，主要的功能是把像 `/user/:id` 這樣的網址轉成正規表示法，讓使用它的人可以直接用來判斷網址符不符合，同時也支援給它網址與參數就能組合出完整的網址的功能，這就是這次要用到的部份，我們在 `routes.js` 中把 `getStaticPaths` 再做一層包裝：

```javascript
import { compile } from 'path-to-regexp'

// 編譯來產生能轉換網址的函式
// 此外， vue-router 內也有在做類似的事喔，比如使用 `push({ name: 'foo', params: {bar: 'baz'} })` 時
const toPath = compile(url)
const getStaticPaths = mod.getStaticPaths || noop

return {
  // 省略
  getStaticPaths: async (...args) => {
    const res = await getStaticPaths(...args)
    if (Array.isArray(res)) {
      return res.map((x) => {
        // 支援原本的字串
        if (typeof x === 'string') {
          return x
        }
        const { params } = x
        return toPath(params)
      })
    }
    return res
  },
  // 省略
}
```

另外還有改兩個地方，都在 `src/app/client/Page.js` 中：

- 用 client.readQuery 來讀取一開始的資料，不然用 GraphQL 查的資料讀不到會導致它重新 render
- `setCurrentPage` 用 `setTimeout` 讓它在下一個 event loop 執行的，這解決了 React 的 warning

這篇完成後，原本的 Redux 跟 http 的 API 都可以不需要了，我們可以完全的使用 GraphQL 來取得資料了，下一篇要來試著用 GraphQL 靜態的嵌入資料
