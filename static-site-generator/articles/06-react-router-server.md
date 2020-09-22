Day 7: 在 Server 使用 React Router
==================================

> 這系列的程式碼在 https://github.com/DanSnow/ironman-2020/tree/master/static-site-generator

在 Server 使用 React Router 最重要的應該是怎麼提供 React Router 目前的路徑，不過在那之前，先來把目前的程式改成用 React Router：

```javascript
export function App({ location, title, articles }) {
  const isHome = location.pathname === '/'
  const article = (isHome ? undefined : articles.find(({ slug }) => location.params.slug === slug)) || notFound

  return (
    <Layout location={location} title={title}>
      <Switch>
        <Route path="/" exact>
          <article className="space-y-8">
            {articles.map(({ slug, title, content }) => (
              <a key={slug} className="block" href={`/articles/${slug}`}>
                <ArticlePreview title={title} content={content} />
              </a>
            ))}
          </article>
        </Route>
        <Route path="/articles/:slug">
          {/* 這邊把 article 改成用 prop 傳入，晚點會說明為什麼這麼做 */}
          <Article article={article} />
        </Route>
        {/* 這邊要另外處理網址都不符的情況，因為路由完全由 React Router 來處理了 */}
        <Route>
          <Article article={notFound} />
        </Route>
      </Switch>
    </Layout>
  )
}
```

接下來要來加上 `StaticRouter` ，來提供 React Router 目前的路徑

```javascript
export function App({ location, title, articles }) {
  const isHome = location.pathname === '/'
  const article = (isHome ? undefined : articles.find(({ slug }) => location.params.slug === slug)) || notFound

  return (
    // 就是直接把 location 提供給它就行了，這也是之前為什麼特別把 req 轉成像 React Router 的格式的原因
    // `StaticRouter` 其實還有另一個 context 的參數，不過因為我們沒用到轉址，所以還用不到
    <StaticRouter location={location}>
      <Layout location={location} title={title}>
        <Switch>
          <Route path="/" exact>
            <article className="space-y-8">
              {articles.map(({ slug, title, content }) => (
                <a key={slug} className="block" href={`/articles/${slug}`}>
                  <ArticlePreview title={title} content={content} />
                </a>
              ))}
            </article>
          </Route>
          <Route path="/articles/:slug">
            <Article article={article} />
          </Route>
          {/* 這邊要另外處理網址都不符的情況，因為路由完全由 React Router 來處理了 */}
          <Route>
            <Article article={notFound} />
          </Route>
        </Switch>
      </Layout>
    </StaticRouter>
  )
}
```

`StaticRouter` 接受兩種格式的路徑，一種是字串，另一種物件格式的要長的像這樣：

```javascript
const location = {
  pathname: '/foo', // 路徑，這是唯一必要的
  search: '?bar=1', // query 的部份
  hash: '#baz', // hash 的部份
  state: {}, // 物件裡可以傳任何東西
}
```

不過這邊發生了一個問題，因為我們不再用 express 的路由，而改用 React Router 的，所以原本的 params 已經不能用了，要改用從 React Router 取得的 params ，在那之前為了方便共用變數，我們把 `articles` 等移到一個獨立的檔案，再從 `Article.js` 引入：

```javascript
import React from 'react'
import { useParams } from 'react-router-dom'
import { articles, notFound } from '../articles'

function getArticle() {
  // 這是 React Router 提供的 hook ，可以取得 params
  const params = useParams()
  return articles.find(({ slug }) => params.slug === slug) || notFound
}

// 因為路徑完全不符時我們會直接從 App 那邊傳入文章的內容
// 所以這邊這樣寫可以在沒傳入 article 的情況下改從 `articles` 取得
// 因此這邊改傳入單獨一個 article 的物件比較方便
export function Article({ article = getArticle() }) {
  const { title, content } = article

  return (
    <article>
      <h1 className="text-4xl text-center font-bold mb-8">{title}</h1>
      <p className="text-gray-700">{content}</p>
    </article>
  )
}
```

到這邊就沒問題了，可以再試試看，結果應該會跟上次用 express 做路由的一樣，不過這次我們已經換成用 React Router 做了，另外我還順便把所有的連結都換成用 `Link` 了，這部份就請自行參考放在 Github 上的程式碼了

下一篇是 Redux
