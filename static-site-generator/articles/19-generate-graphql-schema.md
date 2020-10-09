Day 20: 產生 GraphQL schema
===========================

前一篇中直接把 schema 跟取得資料的 API 直接寫在 `config.js` 中，這篇要來實作在 Gatsby 中類似那種 `createNode` 的 API，不過我實際上 API 是參考了 Gridsome 的，這邊會用到 `graphql-compose` 這套方便產生 GraphQL schema 的套件：

```shell
$ yarn add graphql-compose graphql-compose-json
```

然後我們來實作 `createNodes`

```javascript
import { schemaComposer } from 'graphql-compose'
import { composeWithJson } from 'graphql-compose-json'

async function createNodes(typename, cb) {
  const nodes = []
  let schema

  // 保存資料，同時建立 schema
  await cb((node) => {
    nodes.push(node)
    if (!schema) {
      schema = composeWithJson(typename, node)
    }
  })

  // 增加欄位
  schemaComposer.Query.addFields({
    // 這邊我只有直接加 s 這種蠢蠢的轉換成複數型式的方法…
    [`all${typename}s`]: {
      type: schema.getTypePlural(),
      resolve: () => nodes,
    },
    [typename.toLowerCase()]: {
      type: schema,
      args: {
        id: 'ID!',
      },
      resolve: (id) => nodes.find((x) => x.id === id),
    },
  })
}
```

最後我們讓 `config.js` 可以產生自己的 schema

```javascript
export async function loadSchema() {
  await config.data(createNodes)
  return schemaComposer.buildSchema()
}
```

最後只要改一下 `ApolloServer` 的參數傳入 `schema` 即可：

```javascript
new ApolloServer({ schema: await loadSchema() })
```

上面產生的 schema 可以用 graphql 的 `printSchema` 驗證，下一篇要來改用 GraphQL 查詢資料
