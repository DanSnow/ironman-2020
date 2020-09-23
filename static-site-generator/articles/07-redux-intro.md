Day 8: Redux 與準備資料來源的 API
=================================

> 這系列的程式碼在 https://github.com/DanSnow/ironman-2020/tree/master/static-site-generator

雖然現在 React 的 hook 還有 context 等等的 API 真的很方便，甚至開始有些文章說你可以把 Redux 丟了，不過 Redux 或是類似的狀態管理器卻是在 SSG 不可或缺的，這點在 Vue 也是一樣的，沒有 Vuex 是沒辦法做 SSG 的，因為有個很嚴重的問題，你沒辦法把 React render 完後的每個元件的狀態都保存下來，然後在 client 回復，所以你需要類似 Redux 的集中狀態管理器

有了集中的狀態管理後，我們也可以開始想辦法讓我們的程式可以去抓 API ，既然 render 的過程必須要是同步的，我們就先把資料填入我們的 store 中，然後才開始 render 的，因為資料已經在 store 中了，可以同步的取得，這就解決了 server 在 render 的過程中沒辦法抓資料的問題了，不過實際套用到我們的程式上是下一篇的事了，這篇還是先來介紹 Redux

如果你有寫過 React ，你可能已經對 Redux 很熟了，不過這系列除了 Redux 還會用到官方做的 redux-toolkit ，另外也會需要用到 middleware ，這邊還是要介紹一下

先來介紹一下 Redux 在做什麼：

![Redux pattern](https://upload.wikimedia.org/wikipedia/commons/0/06/Ngrx-redux-pattern-diagram.png)

> 圖片是從 [wiki](https://commons.wikimedia.org/wiki/File:Ngrx-redux-pattern-diagram.png) AAMINE1965 / CC BY-SA (https://creativecommons.org/licenses/by-sa/4.0)

使用者跟頁面互動所產生的事件會轉換成描述資料如何改變的 action ，再送到 reducer 計算出下一個狀態存回 store 中，而 UI 再從 store 中取得資料，以此為一個循環，而原本只用 Redux 寫的程式會有點小麻煩，像這樣：

```javascript
// 這主要是為了防止直接用字串的時候打錯字
const SET_DATA = 'SET_DATA'

// 這個就是計算下一個狀態的 reducer
function reducer(state = { data: 'foo', another: 'bar' }, { type, payload }) {
  switch (type) {
    case SET_DATA:
      // Redux 有要求要回傳新的 state
      return {...state, data: payload}
  }
  return state
}


const store = createStore(reducer)

// 接著就可以 dispatch action 來改變狀態了
store.dispatch({ type: SET_DATA })

// 然後可以取得目前狀態
console.log(store.getState())
```

而 `redux-toolkit` 則可以把上面的 code 改得像這樣：

```javascript
import { createAction, createReducer, createSlice, configureStore } from '@reduxjs/toolkit'

const setData = createAction('SET_DATA')

const reducer = createReducer({ data: 'foo', another: 'bar' }, {
  [setData]: (state, {payload}) => { state.data = payload },
})

const store = configureStore({ reducer })

// 或是用到 slice 的功能
// 不過這個版本的 action 會加上前綴

const mainSlice = createSlice({
  name: 'main',
  initialState: { data: 'foo', another: 'bar' },
  reducers: {
    setData: (state, {payload}) => { state.data = payload },
  },
})


const store = configureStore({ reducer: mainSlice.reducer })
```

middleware
----------

再來要介紹的是 middleware 的部份，因為在之後會需要用到，不知道你有沒有看過 Redux 網站上關於 middleware 的介紹呢？雖然 middleware 最後的參數真的很複雜，但他們網站上把每一步為什麼要這麼做都有講出來，這邊我就用我自己的方法解釋，如果沒看懂也可以看看[網站上的說明](https://redux.js.org/advanced/middleware)

middleware 最主要的功能是在 action 真正的傳到 reducer 之前先做一些處理，所以 middleware 做的事就是把原本的 dispatch 包裝，並在前後加上自己的處理程式，這大概會是這樣子的 (**請注意，這邊還不是完整的 code**) ：

```javascript
// 傳入的參數是真正的 dispatch
function middleware(dispatch) {
  // 接著我們要回傳自己包裝一個新的 dispatch ， 因為我們取代了原本的 dispatch
  // 這邊的 dispatchWrapper 就會是新的 dispatch ，參數則是 dispatch 傳入的 action
  return function dispatchWrapper(action) {
    // 假設我們要做的事印出 action 與 state ，不過這邊還沒辦法取得 state
    console.log(action)
    // 執行真正的 dispatch
    dispatch(action)
  }
}
```

這上面的東西我覺得跟 React 的 HOC 有那麼點像，或是像 python 中的 decorator ，不過上面這樣的寫法還缺少了取得狀態的 API ，所以 Redux 就要 middleware 再多包一層：

```javascript
// 要再多包一層建立 middleware 的函式給 Redux 呼叫，並且它會把 store 當參數傳進來
function createMiddleware(store) {
  return function middleware(dispatch) {
    return function dispatchWrapper(action) {
      // 這邊就能從 store 取得 state 了
      console.log(action, store.getState())
      dispatch(action)
    }
  }
}
```

於是 Redux 的 middleware 就變成像上面這樣的三層結構了

資料來源
--------

到目前為止我們的資料都是寫死在程式裡的，這並不符合一般的網頁程式，下一篇我們就要來正式解決這個問題，這邊先把取得資料的 API 準備好，這邊也介紹一下 `@redux/toolkit` 的 `createEntityAdapter` ，它會回傳一個類似資料庫的 CRUD 的介面，操作資料上可能會比較容易…吧，之後如果不行我自己再換成用 [`lowdb`](https://github.com/typicode/lowdb) 這種比較簡單的，現在因為介紹 Redux 的關係，我想盡量用現有的函式庫

我們先把文章的資料用剛剛提到的 `createEntityAdapter` 建起來：

```javascript
import { createEntityAdapter, configureStore, createSlice } from '@reduxjs/toolkit'
import { articles } from './articles'

const articleAdapter = createEntityAdapter({
  // 讓 EntityAdapter 知道 id 是哪個欄位
  selectId: ({ slug }) => slug,

  // 讓 EntityAdapter 知道怎麼排序，不然就會維持資料加入的順序
  // 不過因為原本的順序就是我們要的，所以就不使用了
  // sortComparer: (a, b) => a.slug.localeCompare(b.slug),
})

// 這邊用 slice 來處理存文章的部份
const articleSlice = createSlice({
  name: 'articles',
  // initial state 會是 `{ ids: [], entities: {} }` ，這樣把 id 跟資料分開來的格式
  // 這樣可以快速的透過 id 查詢，又可以維持順序
  // 關於這種儲存方式可以去看 normalizr 這個套件的說明，連結我附在 code 後
  initialState: articleAdapter.getInitialState(),
  reducers: {
    // 目前只需要儲存所有的文章就行了
    setArticles: articleAdapter.setAll,
  },
})

export const store = configureStore({
  reducer: articleSlice.reducer,
})

// 從 slice 取得建立 action 的函式
const { setArticles } = articleSlice.actions

// 取得可以取出資料的 selector
export const articleSelector = articleAdapter.getSelectors()

// 用法像這樣
// console.log(articleSelector.selectAll(store.getState()))

// 存入所有文章
store.dispatch(setArticles(articles))
```

> 說好的 [normalizr](https://github.com/paularmstrong/normalizr) 的連結

老實說寫完上面這段的第一個感覺是：「好像沒多好用」，不過還是先繼續處理 API 吧，我們在 `index.js` 加上兩個 API：

```javascript
import { articleSelector, store } from './server-store'

// 記得要放在原本的 `/*` 的前面，不然因為 `*` 會符合所有的路由，後面的就執行不到了
app.get('/api/articles/:slug', (req, res) => {
  // 用 slug 來取得
  res.json(articleSelector.selectById(store.getState(), req.params.slug))
})

app.get('/api/articles', (_req, res) => {
  // 取得全部的文章
  res.json(articleSelector.selectAll(store.getState()))
})
```

下一篇要來正式從 API 取資料了
