Day 9: 在 Server 使用 Redux
===========================

這次因為要做出像在 client 一樣從 API 取得資料，所以上次的 store 不能直接使用，要準備一個新的，不過 Entity Adapter 的部份是可以共用的，就拿來用吧

首先把 slice 的部份移到 `src/store/slice/article.js` 中，然後加上取得資料的 action ，這邊使用了 `@reduxjs/toolkit` 提供的 `createAsyncThunk` ，抓資料的部份用的是 `ky-universal` ，這是個像 axios 一樣不管在 client 或 server 端都能用的 http client ，它是包裝 `fetch` 的，用一句話解釋就是：

```javascript
// 從這樣：
fetch('https://example.com', { method: 'GET' })
  .then(response => response.json())
  .then(data => processData(data))

// 變成這樣：
ky
  .get('https://example.com')
  .json()
  .then(data => processData(data))
```

用法變的簡單多了，回到新的 action 的部份：

```javascript
import { createEntityAdapter, createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import ky from 'ky-universal'

// 省略 Entity Adapter 與 selector

// 抓全部文章用的 action
export const fetchArticles = createAsyncThunk('articles/fetchArticles', () => {
  return ky.get('http://localhost:3000/api/articles').json()
})

// 抓單一文章用的 action
export const fetchArticleById = createAsyncThunk('articles/fetchArticleById', (slug) => {
  return ky.get(`http://localhost:3000/api/articles/${slug}`).json()
})

export const articleSlice = createSlice({
  name: 'articles',
  initialState: articleAdapter.getInitialState(),
  reducers: {
    setArticles: articleAdapter.setAll,
  },
  extraReducers: {
    // 設定抓成功時要存進 store 中
    [fetchArticles.fulfilled]: articleAdapter.setAll,
    // 設定抓到一篇文章時加進 store 中
    [fetchArticleById.fulfilled]: articleAdapter.addOne,
  },
})
```

接著我們要建立 client 用的 store ，不過這部份其實很簡單：

```javascript
import { configureStore } from '@reduxjs/toolkit'
import { articleSlice } from './slice/article'

// 為了讓 server 端每次 render 時程式都是用全新的 store ，這邊用成函式的型式
export function createStore() {
  return configureStore({
    reducer: articleSlice.reducer,
  })
}
```

並且到 `App.js` 中加入 `react-redux` 的 `Provider` 來提供 `store`：

```javascript
import React from 'react'
import { Provider } from 'react-redux'
// 省略

export function App({ store, location, title }) {
  return (
    <Provider store={store}>
      {/* 中間省略 */}
    </Provider>
  )
}
```

如果你直接去看完整的 code 應該會發現我把文章列表的部份獨立成一個 component 了，因為文章列表要從 `store` 取得，這樣我覺得比較方便，不過從 `store` 中取得資料的部份我們就只用顯示文章的 `Article.js` 來示範：

```javascript
import React from 'react'
import { useSelector } from 'react-redux'
import { articleSelector } from '../store/slice/article'
import { useParams } from 'react-router-dom'
import { notFound } from '../articles'

function getArticle() {
  // 同樣的取得網址參數
  const params = useParams()
  // 用 `useSelector` 從 store 取得資料
  const article = useSelector((state) => articleSelector.selectById(state, params.slug))
  return article || notFound
}

export function Article({ article = getArticle() }) {
  // 省略
}
```

接著就是這次的重頭戲了，我們要在 render 前從 API 取得資料並填到 store 中，我們把 `src/index.js` 中的  `renderHTML` 改成非同步的，並加上 dispatch 取得資料的 action 的程式碼：

```javascript
async function renderHTML(location) {
  const store = createStore()

  if (location.pathname === '/') {
    // 如果是首頁就下載全部的文章
    await store.dispatch(fetchArticles())
  } else {
    // 如果不是就先取得文章的 slug
    const match = matchPath(location.pathname, { path: '/articles/:slug' })
    if (match) {
      // 如果符合網址的格式的話，就拿 slug 去取得單篇的文章
      await store.dispatch(fetchArticleById(match.params.slug))
    }
  }

  return renderToStaticMarkup(
    <html>
      {/* 省略 */}
      <body>
        <div
          id="root"
          dangerouslySetInnerHTML={{
            // 這邊要傳入 store
            __html: renderToString(<App store={store} title={'My Blog'} location={location} articles={articles} />),
          }}
        />
      </body>
    </html>
  )
}
```

雖然現在加上了這個取得資料的判斷感覺又是寫死了程式碼，不過不管是判斷路徑來決定要用哪個 action 的部份，或是多比對一次網址的問題，之後都會去解決的

因為載入資料的部份在這篇也講完了，下一篇為了進入基於檔案系統的路由的部份，我們要先來整理目前的程式碼，將 SSG 的部份變成一個獨立的套件
