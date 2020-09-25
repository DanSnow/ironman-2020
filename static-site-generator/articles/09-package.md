Day 10: 將我們的 SSG 變成獨立的套件
===================================

從這篇開始，程式碼的目錄結構會有很大的變化，在這之前我們都把 SSR 與我們自己的 blog 的程式碼混在一起，但這系列是要做出一個通用的 SSG ，所以之後會分成兩個 package ，分別是 SSG 的 `generator` 與 blog 的 `my-blog` ，而 `my-blog` 會去相依在 `generator` 上，新的目錄結構大概是這樣

```plain
📁 packages
├── 📁 generator
│  ├── 📁 bin
│  │  └── 📄 cli.js
│  ├── 📄 package.json
│  └── 📁 src
│     ├── 📁 app
│     │  ├── 📁 components
│     │  │  └── 📄 AppProvider.js
│     │  └── 📄 store.js
│     └── 📄 index.js
└── 📁 my-blog
   ├── 📄 config.js
   ├── 📄 package.json
   └── 📁 src
      ├── 📁 components
      │  ├── 📄 App.js
      │  ├── 📄 Article.js
      │  ├── 📄 ArticleList.js
      │  ├── 📄 ArticlePreview.js
      │  └── 📄 Layout.js
      ├── 📄 data.js
      ├── 📄 index.js
      ├── 📄 server-store.js
      └── 📁 slices
         └── 📄 articles.js
```

為了讓我們的 SSG 變成一個框架，這邊要開始定義一些資料夾該怎麼放檔案，至於怎麼處理這些檔案晚點會說，最開始的是 `slices` 這個資料夾，裡面要放 `@reduxjs/toolkit` 的 Slice ，並 export 一個變數叫 reducer ，以 `articles.js` 來說：

```javascript
import { createEntityAdapter, createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import ky from 'ky-universal'

// 跟之前的一樣的部份省略

// 因為現在我們的 state 跑到了 articles 這個鍵的底下，所以 selectors 這邊要加上這個參數來取得 state
export const articleSelector = articleAdapter.getSelectors((state) => state.articles)

// 省略

export const articleSlice = createSlice({
  name: 'articles',

  // 省略
})

export const reducer = articleSlice.reducer
```

而我們則會把這個檔案變成最後的 store 中的 `articles`，所以假設有 `foo.js` 跟 `bar.js` 這兩個 Slice 的話：

```plain
📁 my-blog
  └── 📁 src
    └── 📁 slices
      ├── 📄 foo.js
      └── 📄 bar.js
```

最後的 store 就會有 `foo` 跟 `bar` 這兩個鍵：

```javascript
{
  foo: ...,
  bar: ...,
}
```

另外還有根目錄有個 `config.js` ，這邊目前放的是 server 的 API 的部份：

```javascript
import { store } from './src/server-store'
import { articleSelector } from './src/slices/articles'

export default {
  // app 是 express 的那個 app
  api: (app) => {
    app.get('/api/articles/:slug', (req, res) => {
      res.json(articleSelector.selectById(store.getState(), req.params.slug))
    })

    app.get('/api/articles', (_req, res) => {
      res.json(articleSelector.selectAll(store.getState()))
    })
  },
}
```

而 `my-blog` 的 `index.js` 則改成要放路由與 layout 的部份， Redux 的 Provider 也改由 `generator` 來提供了，而下一篇我們也要來把路由的部份移到框架中

接下來就是來講怎麼處理上面提到的要放到指定位置的檔案了，這邊會用到兩個小套件 `import-cwd` 與 `import-modules` ， `import-cwd` 可以從執行的位置載入檔案，而平常我們用 `yarn` 等套件管理器呼叫套件提供的指令時，它會保證執行位置在專案目錄，所以就可以用執行時的位置來定位檔案，而 `import-modules` 可以載入一個目錄下的檔案，這會用來載入 `slices`，我們的 `generator` 的 `index.js` 長這樣：

```javascript
import { resolve } from 'path'
// 省略
import importCwd from 'import-cwd'
import importModules from 'import-modules'
import { createStore } from './app/store'
import { AppProvider } from './app/components/AppProvider'

// 載入設定
const config = importCwd('./config.js').default
// 載入主要元件
const App = importCwd('./src/index.js').default
// 這個部份之後還會處理
const { fetchArticleById, fetchArticles } = importCwd('./src/slices/articles.js')
const slices = importModules(resolve(process.cwd(), 'src/slices'))

const reducer = createReducer(slices)

// 讓我們的程式自訂 API
config.api(app)

// 省略

// 用來建立 reducer tree 的
function createReducer(slices) {
  const reducer = {}

  for (const [name, slice] of Object.entries(slices)) {
    reducer[name] = slice.reducer
  }

  return reducer
}
```

然後再加上一個 `bin/cli.js` ，這邊就只是載入 `@babel/register` 後再載入我們的主程式而已，另外還要在 `generator` 的 `package.json` 加入一個 `bin` 的欄位為 `"bin": "bin/cli.js"` ，這樣我們的 `cli.js` 就會變成跟 package 同名的指令了

```json
{
  "name": "generator",
  "version": "0.0.0",
  "bin": "bin/cli.js"
}
```

安裝了這個套件的人就可以用 `yarn generator` 來執行我們的 `cli.js` ，至於在 `cli.js` 中載入 `@babel/register` 則只是為了方便開發的做法，正常應該要先編譯過才對

接著再到 `my-blog` 加入 `generator` 的相依性，這邊我是直接修改 `package.json` ，加入 `"generator": "workspace:packages/generator"` 再執行 `yarn` ，最後再把 `scripts` 中的 `dev` 改為 `generator` 就大功告成了，我們的 SSG 已經變的像一個套件了，你可以執行 `yarn dev` 試試

> 上面提到的套件管理器會保證是執行在專案目錄下的部份，你可以用範例程式，或是自己找個專案試試，比如在 `packages/my-blog/src` 下執行 `yarn dev` ，應該也會是正常運作的

下一篇要來把檔案目錄變成路由
