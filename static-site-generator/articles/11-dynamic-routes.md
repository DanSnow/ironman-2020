Day 12: 動態路由
================

> 這系列的程式碼在 https://github.com/DanSnow/ironman-2020/tree/master/static-site-generator

如同標題，文章的路由包含了動態的部份，所以要特別另外處理才行，我們在 `buildRoutes` 中加上對於動態路由的處理：

```javascript
export async function buildRoutes() {
  const pagesPath = resolve(process.cwd(), 'src/pages')
  const absolutePaths = await globby([join(pagesPath, '**/*.js')])
  const routes = absolutePaths.map((absolutePath) => {
    // 省略
    // 前一篇的時候這邊有 bug ， dir 的開頭一定不會是 `/` ，所以不管如何都要加上去
    const base = `/${parsed.dir}`

    // 省略

    const { url, dynamic } = generateURL(parsed, base)

    return {
      // 將最後的回傳值加上 `dynamic` 這個 flag
      dynamic,
      url,
      file: projectPath,
      getInitialProps: mod.getInitialProps || noop,
      props: {
        exact: url === '/',
        path: url,
        component: mod.default,
      },
    }
  })

  routes.sort((a, b) => (a.dynamic !== b.dynamic && !b.dynamic ? 1 : 0))

  return {
    notFound: resolveNotFound(),
    routes,
  }
}

function generateURL(parsed, base) {
  // 標記是不是動態路由用的
  let dynamic = false
  // 跟之前一樣，如果是 index 就不要加上最後的檔名
  const url = parsed.name === 'index' ? base : join(base, parsed.name)
  // 取代 `_` 開頭的部份變成 route 中以 `:` 開頭的格式
  const resolvedURL = url.replace(/_([^/]+)/g, (_m, name) => {
    // 有 match 的就代表是動態路由
    dynamic = true
    return `:${name}`
  })

  return {
    dynamic,
    url: resolvedURL,
  }
}
```

然後修改 `renderHTML` ，這邊要加上的是呼叫 `getInitialProps` 時要傳入目前的 `params` ，這樣才能讓使用者的 `getInitialProps` 決定要回傳什麼：

```javascript
async function renderHTML(location) {
  // 省略
  const findMatchRoute = ({ props, getInitialProps }) => {
    const match = matchPath(location.pathname, props)
    // 如果 match 的話，把 getInitialProps 也加上去
    return match ? { ...match, getInitialProps } : undefined
  }
  const route = findFirstMap(routes, findMatchRoute) || { params: {}, getInitialProps: noop }

  // 傳入目前的 route 讓使用者可以存取 `params`
  await route.getInitialProps({ store, route })

  // 省略
}

// 這邊寫了個自訂的 helper ，用來做到 find + map 的功能
function findFirstMap(array, mapper) {
  for (const item of array) {
    const mapped = mapper(item)
    if (mapped != null) {
      return mapped
    }
  }
}
```

於是使用者的 `getInitialProps` 就能這樣寫：

```javascript
export async function getInitialProps({ store, route }) {
  // 現在能取得網址中的變數了
  await store.dispatch(fetchArticleById(route.params.slug))
}
```

下一篇要來讓使用者也能自訂 html 的樣版
