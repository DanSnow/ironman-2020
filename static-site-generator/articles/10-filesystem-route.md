Day 11: 基於檔案系統的路由
==========================

> 這系列的程式碼在 https://github.com/DanSnow/ironman-2020/tree/master/static-site-generator

這是在 SSG 常有的一個功能，由你檔案所放的位置與檔名來決定你的路由長怎樣，比如：

| 檔案路徑                    | 對應網址        |
|-----------------------------|-----------------|
| src/pages/index.js          | /               |
| src/pages/about.js          | /about          |
| src/pages/articles/_slug.js | /articles/:slug |

這篇只會先實作靜態路由的部份，也就是只有首頁，另外我們也順便加個 about 的頁面當作範例吧

我們先在 `src/pages/index.js` 放入原本的首頁：

```javascript
import React from 'react'
import { Layout } from '../components/Layout'
import { ArticleList } from '../components/ArticleList'
import { fetchArticles } from '../slices/articles'

// 函式名稱是參考 Next 的，不過目前的實際作用是用來讓程式可以決定 render 前要不要對 store dispatch 東西
export async function getInitialProps({ store }) {
  await store.dispatch(fetchArticles())
}

// 約定元件要用 default export
export default function Index() {
  return (
    <Layout>
      <ArticleList />
    </Layout>
  )
}
```

另外一個 `about.js` 就請去參考 code 的 repo 了，再來的問題就是要如何從這樣的目錄結構產生路由了，這邊要用到一個新的套件 `globby` ，它實作了 glob ，能從一個目錄下找出所有符合條件的檔案，這邊要用它回傳的結果來產生路由：

```javascript
import { resolve, join, relative, parse } from 'path'
import globby from 'globby'
import importCwd from 'import-cwd'
import { noop } from './utils'

export async function buildRoutes() {
  const pagesPath = resolve(process.cwd(), 'src/pages')
  // 找出 pages 資料夾下的所有 js 檔
  const absolutePaths = await globby([join(pagesPath, '**/*.js')])

  return {
    routes: absolutePaths.map((absolutePath) => {
      // 轉換成相對於專案的路徑，用來引入用
      const projectPath = relative(process.cwd(), absolutePath)
      // 轉換成相對於 pages 資料夾的路徑，用來計算網址
      const path = relative(pagesPath, absolutePath)
      const parsed = parse(path)
      const base = parsed.dir || '/'

      // 載入 component
      const mod = importCwd('./' + projectPath)
      // 產生網址，邏輯基本上就是如果最後的檔案是 index 就不要改變路徑，不然就加上檔名
      const url = parsed.name === 'index' ? base : join(base, parsed.name)

      return {
        url,
        file: projectPath,
        // 這邊用 noop 當預設值，這樣使用時就不用擔心沒有這個函式的問題了
        getInitialProps: mod.getInitialProps || noop,
        props: {
          // 如果是 '/' 就加上 exact
          exact: url === '/',
          path: url,
          // default export 是元件
          component: mod.default,
        },
      }
    }),
  }
}
```

> 上面的程式利用了類 Unix 的系統下的檔案路徑是使用跟網址一樣的 `/` 這點，如果在 Windows 下執行，就要做些轉換了

再來是用上面所產生的路由轉成 React Router 的路由，其實很簡單：

```javascript
// 這邊還沒對路由進行排序，之後增加動態路由後就會需要了
export function renderRoutes(routes) {
  return (
    <Switch>
      {routes.map(({ url, props }) => (
        <Route key={url} {...props} />
      ))}
    </Switch>
  )
}
```

之後要在 `generator` 的 `index.js` 去使用這些產生的路由：

```javascript
// 省略

// 這樣寫就只要讀一次檔案系統而已
const routesPromise = buildRoutes()

async function renderHTML(location) {
  const store = createStore(reducer)
  // 取得路由
  const { routes } = await routesPromise

  // 找出符合的路由
  const route = routes.find(({ props }) => matchPath(location.pathname, props)) || { getInitialProps: noop }

  // 讓使用者的程式能在 render 前使用 store
  await route.getInitialProps({ store })

  return renderToStaticMarkup(
  // 省略
  <div
    id="root"
    dangerouslySetInnerHTML={{
      __html: renderToString(
        <AppProvider store={store} location={location}>
          {/* 把路由 render 到這邊 */}
          {renderRoutes(routes)}
        </AppProvider>
      ),
    }}
  />
  // 省略
  )
}
```

到這邊其實基本上就完成了，不過我們再來做一個東西，讓使用者能自訂 404 頁面，這次規定如果使用者想自訂 404 頁面就放一個元件在 `src/404.js` 的位置，而我們的 `buildRoutes` 則要來更新，加上檢查如果使用者有這個檔案，就把它做為 404 頁面，否則就用預設的：

```javascript
export async function buildRoutes() {
  // 省略

  return {
    notFound: resolveNotFound(),
    // 省略
  }
}

export function renderRoutes(routes, notFound) {
  return (
    <Switch>
      {/* 省略 */}
      {/* 加上 404 的 route */}
      <Route component={notFound} />
    </Switch>
  )
}

function resolveNotFound() {
  try {
    // 就直接試著 import ，如果成功就是有這個檔案
    return importCwd('./src/404').default
  } catch {
    // 不成功就回傳預設值
    return NotFound
  }
}

function NotFound() {
  return <div>404 Not Found</div>
}
```

另外還有我在頁面上加了個連結到 about 頁面，這部份就請自己參考範例程式囉

下一篇要來處理產生文章路由的部份
