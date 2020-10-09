Day 23: 從檔案載入文章
======================

現在的文章都用 js 的物件存起來了，如果可以用 mdx 來寫不是會方便很多嗎？中間的檔案內容就當作是文章的內容，標題則由 front matter 來設定

> front matter 指的是書本前面的那些資訊，不過在寫 markdown 時有不少的東西都支援寫一段 yaml 之類的設定在開頭的部份，像：

```markdown
---
title: 'Hello world'
---

content
```

在 Client 端載入 GraphQL 的資料
-------------------------------

之前第 20 篇時我最後實際上留下了一個問題，換頁時 js 沒辦法從 `payload.js` 正常載入資料，這部份是後來才修好的，這邊要使用到 Apollo 所提供的 `watchQuery` 來監視查詢的資料載入了沒：

```javascript
const PageComponent = function ({ component: Component, query, client }) {
  const [gqlData, setData] = useState()

  // 省略

  useEffect(() => {
    // 省略，載入 `payload.js` 的內容

    // 如果有 query 的話
    if (query) {
      // 監視載入的情況
      const observableQuery = client.watchQuery({
        query,
        errorPolicy: 'ignore',
        // 不要真的送出查詢
        fetchPolicy: 'cache-only',
        variables: route.params,
      })

      // 等待資料被填入 cache
      observableQuery.result().then(({ data }) => {
        setData(data)
      })
    }
  }, [actions, route, query])

  // 如果沒有用 gql 載入的資料同時有 query 的話就表示還沒載入好
  if (!gqlData && query) {
    return null
  }

  return <Component data={gqlData} />
}
```

然後在 jsonp 的 callback 用 `writeQuery` 寫入 cache

載入檔案中的資料
----------------

現在要來把 mdx 當成檔案來載入：

```javascript
// 省略部份 import
import matter from 'front-matter'
import pEach from 'p-each-series'
import requireString from 'require-from-string'

export async function loadSource({ createNodes, options }) {
  const { name, source } = options
  await createNodes(name, async (createNode) => {
    // 同樣是找到所有的 mdx
    const files = await globby(resolve(process.cwd(), source, '**/*.mdx'))
    await pEach(files, async (file) => {
      const raw = await readFile(file, 'utf-8')
      // parse front matter 的部份
      const { attributes, body } = matter(raw)
      const content = await mdx(body)
      const code = await transform(`import { mdx } from '@mdx-js/react'
        export const matter = ${JSON.stringify(attributes)}
        ${content}
        `)
      // 直接執行 code
      const res = requireString(code, { filename: `${basename(file)}.js` })
      const MDXContent = res.default
      // 這邊讓使用者有機會修改讀到的內容
      const map = options.transform || ((x) => x)
      createNode(
        map({
          ...res.matter,
          // 把產生的內容轉換成靜態的 html
          content: renderToStaticMarkup(<MDXContent />),
        })
      )
    })
  })
}
```

載入設定
--------

我們讓使用者可以在 `config.js` 設定要讀哪邊的檔案：

```javascript
module.exports = {
  // ...
  // 另外移除了原本的 data
  sources: [
    {
      name: 'Article',
      source: './articles',
      // 讓 slug 同時也是 id
      transform: ({ slug, ...rest }) => ({ id: slug, slug, ...rest }),
    },
  ],
  // ...
}
```

再來就是改一下 `Article.js` 讓它可以插入 html ，跟在 `src/index.js` 呼叫 `loadSource` 載入這些檔案而已，是不是越來越像一個完整的 SSG 了呢？雖然還有些地方可以改進的，另外我稍微把目前的程式碼整理過了，應該是比較不會那麼亂了

下一篇要來試著讓首頁也用 GraphQL
