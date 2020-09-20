Day 5: 實作第一個頁面
=====================

> 這系列的程式碼在 https://github.com/DanSnow/ironman-2020/tree/master/static-site-generator

第一個頁面當然不會只有 Hello world 而已囉，這次的目標就訂為寫一個 blog 的產生器吧 (雖說是 blog ，不過實際上這系列做出來的會是通用的 SSG ，只是排版會是 blog 而已) ，這篇會參考 [`gatsby-starter-blog`](https://www.gatsbyjs.com/starters/gatsbyjs/gatsby-starter-blog/) 把它的首頁建出來，資料則都暫時用寫死的方式處理

![layout](https://i.imgur.com/8iMP67g.jpg)

> 圖片來自上面的 `gatsby-starter-blog`，紅色的部份是我自己加上去的切元件的結果

先來安裝所有必要的東西：

```shell
$ yarn add react-dom express
```

其實我自己是習慣用 [`fastify`](https://www.fastify.io) 當 server ，所以寫這篇時我還挺猶豫的，是要用我習慣的嗎？可是這系列的重點又不是在 server ，最後選了大家可能比較熟的 express

然後就是簡單的排版，我用的 css 框架是 [tailwindcss](https://tailwindcss.com) ，目前就主要分成三個元件而已，除了圖上的兩個還有包住整個頁面的 `App` ，由於怎麼寫 React 並不是這系列的重點，這邊就只看 `App.js` 的內容：

```javascript
import React from 'react'
import { Layout } from './Layout'
import { ArticlePreview } from './ArticlePreview'

export function App({ title, articles }) {
  return (
    <Layout title={title}>
      <article className="space-y-8">
        {articles.map(({ title, content }) => (
          <ArticlePreview key={title} title={title} content={content} />
        ))}
      </article>
    </Layout>
  )
}
```

目前的元件比較特別的地方就如同之前所說的，資料都要在 render 時就傳入，所以沒有任何的 API 呼叫，如果有的話也無法正常運作

再來是 `index.js` 的內容：

```javascript
import express from 'express'
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { App } from './components/App'

const app = express()

const articles = [
  // 省略
]

app.get('/', (_req, res) => {
  res.send(
    // 這邊用 renderToStaticMarkup 來產生 html 的樣版，不過這之後會換成類似 ejs 的樣版
    renderToStaticMarkup(
      <html>
        <head>
          <title>My Blog</title>
          <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet" />
        </head>
        <body>
          <div
            id="root"
            {/* 透過 renderToString 來把元件轉成 html */}
            dangerouslySetInnerHTML={{ __html: renderToString(<App title={'My Blog'} articles={articles} />) }}
          />
        </body>
      </html>
    )
  )
})

app.listen(3000, () => {
  console.log('server is running at http://localhost:3000')
})
```

如果你有接觸過 SSR ，你可能會覺得很熟悉，也覺得奇怪，這不就是 SSR 嗎？是的， SSG 跟 SSR 是脫不了關係的，要做出 SSG 要先處理 SSR 的部份，因為我們需要產生 html 的程式碼，之後會再來講到要做出 SSG 還需要什麼，不過在那之前，我們還有不少功能要先加上去

下一篇要來介紹 React Router 並再加上文章頁面
