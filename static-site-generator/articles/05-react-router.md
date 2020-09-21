Day 6: 介紹 React Router 與實作文章頁面
========================================

如果你有寫過 React ，那你很可能會知道 React Router ，它幾乎可說是用 React 寫 SPA 必備的一個函式庫，雖然現在其實還有另一個 [`@reach/router`](https://reach.tech/router/) 也可以使用，不過這系列還是會用 React Router

> `@reach/router` 的 API 比目前 v5 的 React Router 要來的簡單，不過 React Router 目前正在開發的 v6 版， API 會跟 `@reach/router` 很像，我個人很期待新版的 React Router

React Router 主要提供幾個元件讓使用者宣告他們的路由，不過這系列用到的就只有一部份而已：

- `BrowserRouter`: 這是 client side 用到的 router ，目前還不會用到
- `StaticRouter`: 這是下一篇要來用的 server side 的 router
- `Switch`: 讓底下的 `Route` 只會顯示第一個符合的，不然預設會是符合的全部顯示，這晚點說明
- `Route`: 用來定義路由的元件，這可說是 React Router 最重要的一個元件
- `Link`: 顧名思義，就是連結，如果要做到 SPA 就要用這個連結，這樣才可以達到不換頁的效果

`Route` 元件
------------

React Router 的設計跟一般的路由其實不能說是一樣的，如果你有寫過後端的路由，或是 vue-router 的路由的話你可能會看過類似這樣的程式碼：

```javascript
// 這是 express 的
app.get('/', (req, res) => res.send('Home'))
app.get('/foo', (req, res) => res.send('foo'))

// 這是 vue-router
const routes = [
  { path: '/foo', component: Foo },
  { path: '/bar', component: Bar },
]

const router = new Router({
  routes,
})
```

基本上一個路由就是對應到一個頁面，但 React Router 的概念是這樣的：

```javascript
export function App() {
  return (
    <div>
      {/* 當目前網址符合 "/" 時顯示 "This is home" */}
      <Route path="/" exact>This is home</Route>
      <div>content</div>
      <Switch>
        {/* 當目前網址符合 "/" 時不顯示 */}
        <Route path="/" exact />
        {/* 不然就顯示 "<- back to home" */}
        <Route>{'<- back to home'}</Route>
      </Switch>
    </div>
  )
}
```

比較像是當目前網址符合特定路徑時就顯示底下的內容的設計，雖然用的時候通常還是會在一個地方統一定義好每個頁面的路由，但有時就可以用 `Route` 元件來顯示只在特定的路徑的情況下才顯示的按鈕等等的

`Route` 主要用到的 prop 就幾個：

- `path`: 定義要比對的路徑，如果不加就一定會符合
- `exact`: 是否要完全符合，不然預設 `/` 是會對應到所有路由的，因為每個網址的開頭都是 `/`
- `component`: 如果把元件用這個 prop 傳進去，就會被傳入幾個額外的 prop ，這有用到再說明

而 `Switch` 則能讓底下的 `Route` 只顯示第一個符合的：

```javascript
export function App() {
  return (
    <div>
      {/* 當目前網址符合 "/" 時顯示 "This is home" */}
      <Route path="/" exact>This is home</Route>
      {/* 因為沒包在 Switch 裡，所以一定會顯示 */}
      <Route>{'<- back to home'}</Route>
      <div>content</div>

      {/* 包在 Switch 裡的就一定最多只會顯示一個 */}
      <Switch>
        <Route path="/" exact>This is home</Route>
        <Route>{'<- back to home'}</Route>
      </Switch>
    </div>
  )
}
```

另外 `Route` 是有順序的：

```javascript
export function App() {
  return (
    <div>
      <Switch>
        {/* 網址中的 `:slug` 是動態的參數，這個可以代入任何合規則的不含 / 的路徑 */}
        <Route path="/articles/:slug">{/* 顯示 Article */}</Route>
        {/* 因為 `/articles/new` 也符合上一個規則，所以一定是顯示上面的那個 */}
        <Route path="/articles/new">{/* 新文章 */}</Route>
      </Switch>
    </div>
  )
}
```

不過上面那個情況在我們的 SSG 裡是沒機會發生的，因為沒辦法新增文章

關於 React Router 的介紹就先到這邊，不過實際用到是下一篇的事了

實作文章頁面
------------

這次新增了一個用來顯示文章的元件 `Article.js`:

```javascript
import React from 'react'

export function Article({ title, content }) {
  return (
    <article>
      <h1 className="text-4xl text-center font-bold mb-8">{title}</h1>
      <p className="text-gray-700">{content}</p>
    </article>
  )
}
```

然後修改了一下 `App.js`：

```javascript
import React from 'react'
import { Layout } from './Layout'
import { ArticlePreview } from './ArticlePreview'
import { Article } from './Article'

const notFound = {
  title: 'Not Found',
  content: '404 not found',
}

export function App({ location, title, articles }) {
  const isHome = location.pathname === '/'
  // slug 跟 location 是哪邊來的晚點說明
  const article = (isHome ? undefined : articles.find(({ slug }) => location.params.slug === slug)) || notFound

  return (
    <Layout location={location} title={title}>
      {/* 如果是首頁就顯示文章列表，不然就顯示單一文章，不過這之後會換成 Route 來處理，這邊是暫時的 */}
      {isHome ? (
        <article className="space-y-8">
          {articles.map(({ slug, title, content }) => (
            <a key={slug} className="block" href={`/articles/${slug}`}>
              <ArticlePreview title={title} content={content} />
            </a>
          ))}
        </article>
      ) : (
        <Article {...article} />
      )}
    </Layout>
  )
}
```

而 server 的部份我加上了 `slugify` 這個套件來幫我們把標題轉成合規則的網址，大概會是像這樣：

```javascript
slugify('First Post', { lower: true }) // -> "first-post"
```

另外把 express 的 req 中的路徑轉換成類似 React Router 的 location 物件：

```javascript
function toLocation(req) {
  return { pathname: req.path, params: req.params }
}
```

接著幫我們的 server 加上文章的路由：

```javascript
app.get('/', (req, res) => {
  res.send(renderHTML(toLocation(req)))
})

// 之後也要換成用 React Router 來處理，不然會變成兩邊都要處理路由
app.get('/articles/:slug', (req, res) => {
  res.send(renderHTML(toLocation(req)))
})

function renderHTML(location) {
  return renderToStaticMarkup(
    <html>
      <head>
        <title>My Blog</title>
        <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet" />
      </head>
      <body>
        <div
          id="root"
          dangerouslySetInnerHTML={{
            __html: renderToString(<App title={'My Blog'} location={location} articles={articles} />),
          }}
        />
      </body>
    </html>
  )
}
```

補充： React Router v6
----------------------

這目前還在 beta 中，不過 API 上算是修正了一些問題：

```javascript
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div>
      {/* 這相當於新的 Switch */}
      <Routes>
        {/* 不再需要 exact 了， React Router 會自動去判斷最符合的那個 */}
        <Route path="/">Home</Route>
        <Route path="articles/:slug">Article Page</Route>
        {/* 順序反了也沒問題，如果是沒有動態參數的網址，在完全符合的情況下會優先顯示 */}
        <Route path="articles/new">Article New</Route>
        {/* 還可以嵌套 */}
        <Route path="tags">
          <Route path="/">List Tags</Route>
           {/* 這邊的網址是相對路徑，完整的會變成 `/tags/:tag` */}
          <Route path=":tag">List Tag's Articles</Route>
          <Route path="new">Create Tag</Route>
        </Route>
      </Routes>
    </div>
  )
}
```

總之感覺更方便了，如果你想要現在就有這些功能也可以去用 `@reach/router` ，不過 API 還是有點不一樣就是了

下一篇要來實際用 React Router 來做路由
