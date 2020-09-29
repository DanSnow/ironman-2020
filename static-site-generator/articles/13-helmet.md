Day 14: Helmet
==============

> 這系列的程式碼在 https://github.com/DanSnow/ironman-2020/tree/master/static-site-generator

抱歉上一篇結尾時又記錯了，這篇要來處理 html 中的 head 的部份，這次會用到一個叫 [`react-helmet`](https://github.com/nfl/react-helmet) 的套件，它可以在 Client 端管理 head 的內容，但同時也可以在 Server 端幫你搜集元件所要求的設定，讓你可以在 Server 端渲染出元件要的標題等等的，這次來幫文章頁面加上修改網頁標題的功能

這次新增一個檔案在 `generator/index.js` ，注意，不是在 `src` 下喔， `src` 下已經被拿來放 Server 端的 code 了，這次的 `index.js` 是之後要拿來放提供給使用者用的 API 的部份，目前檔案的內容很簡單，就是把 `Helmet` export 出去而已：

```javascript
export { Helmet } from 'react-helmet'
```

就算是使用第三方套件的東西，也重新從我們的套件 export 出去，而使用者則用我們 export 的版本，這樣就可以確保使用者用的跟我們用的是同一個版本了

然後在 `Article.js` 加上修改標題的部份：

```javascript
export function Article({ article = getArticle() }) {
  const { title, content } = article

  return (
    <article>
      <Helmet>
        <title>My Blog - {title}</title>
      </Helmet>
      <h1 className="text-4xl text-center font-bold mb-8">{title}</h1>
      <p className="text-gray-700">{content}</p>
    </article>
  )
}
```

另外在 `src/app/AppProvider.js` 的部份加上預設的 Helmet 的標題：

```javascript
export function AppProvider({ store, location, children, title }) {
  return (
    <Provider store={store}>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <StaticRouter location={location}>{children}</StaticRouter>
    </Provider>
  )
}
```

這樣就把 title 完全交給 Helmet 管理了，但也因為這樣，我們的 html template 的部份也要修改：

```html
<html>
  <head>
    <%~ it.title %>
  </head>
</html>
```

接著這邊就是重點了，因為要讓 Helmet 先收集元件要求的值，所以 renderToString 的部份要先執行：

```javascript
async function renderHTML(location) {
  // 省略

  const defaultTitle = config.title || pkg.name || 'My Static site'
  const output = renderToString(
    <AppProvider store={store} location={location} title={defaultTitle}>
      {renderRoutes(routes, notFound)}
    </AppProvider>
  )

  // 這可以清空 Helmet 的內部狀態，並回傳到目前搜集到的值
  const helmet = Helmet.renderStatic()

  const template = await templatePromise
  return render(template, {
    title: helmet.title.toString(),
    output,
  })
}
```

這樣就可以試試看了，頁面的標題應該會隨著文章的標題改變了，不過 Helmet 還可以用來管理其它的值，這邊我就直接加上去而不在這邊說明了，而且如果都由 Helmet 來管理 head 的內容，那在 `my-blog` 裡也沒有必要用自訂的 html template 來加上 tailwindcss 的 css 了

下一篇才是 Universal Javascript
