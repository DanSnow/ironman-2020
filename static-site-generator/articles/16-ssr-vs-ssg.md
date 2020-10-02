Day 17: SSR vs SSG
==================

> 這系列的程式碼在 https://github.com/DanSnow/ironman-2020/tree/master/static-site-generator

我們到現在所做的實際上都是 SSR ，還沒正式的進化成 SSG ，那 SSG 跟 SSR 最大的差別是什麼， SSG 必須完全不呼叫 API ，只用靜態檔案提供服務，以我們所做的 blog 而言，就必須把所有的 blog 的資訊存在檔案中，不過在那之前，先來講一下為什麼昨天的 `React.hydrate` 會印出警告吧，最大的問題出在，我們提供的 html 樣版，原本為了排版好看，所以在樣版中加入了縮排與換行：

```html
<div id="root">
  <%~ it.output %>
</div>
```

然而這會導致我們的輸出前後會多出空白，這對 React 來說也是不行的，所以把換行整個刪掉就沒事了：

```html
<div id="root"><%~ it.output %></div>
```

老實說我還真沒想到是這種原因，不管怎麼樣，目前算是解決了，回到 SSG 的問題，我們面臨的問題有兩點：

1. 保存每頁由 API 取得的資料，並能重現
2. 預先知道動態路由的所有路由

照著目前的架構，資料都會存在 Redux 的 store 中，那之前說的 Redux 的 middleware 終於要拿出來用了，我們來把渲染頁面時所 dispatch 的 action 全部保存下來，在 Client 端要重現時就重覆這些 action ，那不就可以保存各別頁面的狀態了嗎？總之先動手吧：

```javascript
// src/app/middleware/record.js
import { name, __record } from '../slices/record'

export function record() {
  return (next) => (action) => {
    // 讓 action 傳下去
    const res = next(action)
    // 如果不是我們自己的 action
    if (!action.type.startsWith(name)) {
      // 紀錄這個 action
      next(__record.actions.pushAction(action))
    }
    return res
  }
}
```

另外我們也要建一個 slice 來保存紀錄的 action ：

```javascript
// src/app/slices/record.js
import { createSlice, createSelector } from '@reduxjs/toolkit'

export const name = '__record'

export const __record = createSlice({
  name,
  initialState: {
    // 暫存 action
    actions: [],
    // 紀錄某個網址所對應的 action
    pages: {},
    // 目前的網址，用來判斷是不是需要重覆 action 用的
    currentPage: null,
  },
  reducers: {
    pushAction(state, { payload }) {
      state.actions.push(payload)
    },
    // render 結束時就 dispatch 這個 action ，來紀錄到目前為止的 action
    createPage(state, { payload }) {
      state.pages[payload] = state.actions
      state.currentPage = payload
      state.actions = []
    },
    // 載入 action 用的，之後會用到
    loadPage(state, { payload: { path, actions } }) {
      state.pages[path] = actions
    },
  },
})

// 取得 action 的 selector
export const pageSelector = createSelector(
  (state) => state.__record.pages,
  (_, path) => path,
  (pages, path) => pages[path]
)
```

再來是要修改 `Page` ，讓它改判斷 store 是不是有已經要的資訊

```javascript
export function Page({ component: Component, getInitialProps = noop }) {
  const route = useRouteMatch()
  const currentPage = useSelector((state) => state.__record.currentPage)
  // 從 store 取得要用的 action
  const actions = useSelector((state) => pageSelector(state, route.path))
  // 如果已經有 action 的話就已經準備好了
  const [ready, setReady] = useState(typeof actions !== 'undefined')
  const store = useStore()

  // 如果頁面不同才要做 dispatch action
  if (actions && route.path !== currentPage) {
    // 在 client 重現資料
    for (const action of actions) {
      store.dispatch(action)
    }
  }

  // 省略
}
```

到這邊第一個頁面應該可以完全不靠 API 就能 render 了，再來我們要想辦法知道動態路由能產生哪些網址，這部份如果你有用過 SSG 的話應該知道他們是怎麼做的，比如像 Gatsby 是從資料推斷有哪些頁面，像 Next.js 有 `getStaticPaths` ，這邊先採用 Next.js 的作法

我們在 `src/pages/articles/_slug.js` 中加上 `getStaticsPaths`：

```javascript
export async function getStaticPaths({ store }) {
  await store.dispatch(fetchArticles())

  const articles = articleSelector.selectAll(store.getState())
  // 要自己組 URL 我知道很不人性化，不過先讓我偷懶一下
  return articles.map(({ slug }) => `/articles/${slug}`)
}
```

再來我們要產生每頁的 html 檔，這邊要用 url 建資料夾，然後在下面放 `index.html` ，這樣從網址看起來才像是 Client Side 的 Router 產生的，產生 html 的方法非常簡單，我們直接用原本的 SSR 把每頁的 html 抓下來就行了，我們在 `src/index.js` 中的 `main` 結尾加上：

```javascript
// 紀錄所有可能的 URL
let possibleRoute = []
for (const route of data.routes) {
  if (route.dynamic) {
    const store = createStore(reducer)
    // 動態頁面就呼叫 `getStaticPaths`
    const paths = await route.getStaticPaths({ store })
    possibleRoute = possibleRoute.concat(paths)
  } else {
    // 靜態頁面直接加入
    possibleRoute.push(route.url)
  }
}

for (const url of possibleRoute) {
  // 取得 html
  const body = await ky.get(`http://localhost:3000${url}`).text()
  // 建立資料夾，使用 `substr` 是為了去除開頭的 `/`
  await mkdir(resolve(dist, url.substr(1)), { recursive: true })
  // 寫入 html
  await writeFile(resolve(dist, url.substr(1), 'index.html'), body)
}
```

到這邊，你可以用任何靜態的 server 去試看看產生的 `dist` 資料夾了，應該是可以看到它可以完全不呼叫 API 就顯示各個頁面，不過我們才完成進化的過程到一半而已，真正的 SSG 還會在 Client Side 切換成在 Client 做 render (雖然這本身就是個額外的功能，因為到目前已經達成了 JAMStack 的要求了) ，下一篇再來繼續
