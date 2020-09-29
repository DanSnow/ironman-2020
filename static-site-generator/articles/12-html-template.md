Day 13: html 樣版與 eta.js
==========================

> 這系列的程式碼在 https://github.com/DanSnow/ironman-2020/tree/master/static-site-generator

目前我們產生的 html 是寫死在程式中的，這篇要來讓使用者可以透過 ejs 的方式寫自己的樣版，不過我們實際要用的樣版引擎不是 ejs 而是 [eta.js](https://eta.js.org/) ，它是個 ejs 的改進版，樣版的寫法幾乎一樣，不過在速度上更快，程式也更有彈性，另外也修復了 ejs 的一個問題：

```ejs
ejs 沒辦法正常 parse 這段 code
<% "%>" %>
```

至於 eta.js 或是 ejs 的樣版語法就在這邊簡單介紹一下：

```ejs
<p>預設其實你想要寫什麼都行</p>
<% // 這種 tag 包起來的部份是 js %>
<%= "這種 tag 包起來的也是 js ，只是裡面的結果會被轉成字串輸出" %>
<%= 42 // 當然數字也行 %>

<% for (let i = 0; i < 3; ++i) { %>
  像這樣寫 code 也是行的 i = <%= i %>
<% } %>

接下來的部份在 eta 跟 ejs 有些微的不同
<%- "<strong> ejs 中不想被跳脫的話要用 - </strong> " %>
<%~ "<strong> eta 中不想被跳脫的話要用 ~ </strong> " %>
```

這邊我們先把原本的 html 改寫成樣版，檔案則在 `src/index.html`：

```ejs
<html>
  <head>
    <title>My Blog</title>
    <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet" />
  </head>
  <body>
    <div id="root">
      <% /* it 是 eta 傳入的變數名稱 */ %>
      <%~ it.output %>
    </div>
  </body>
</html>
```

另外我們的程式也要提供一個預設樣版，這邊為了統一就同樣使用 eta 的樣版了：

```ejs
<html>
  <head>
    <title><%= it.title %></title>
  </head>
  <body>
    <div id="root">
      <%~ it.output %>
    </div>
  </body>
</html>
```

再來就是在 `generator` 處理樣版，方法基本上跟之前處理 404 頁面是差不多的：

```javascript
// 省略
import { constants } from 'fs'
import { access, readFile } from 'fs/promises'
import { compile, render } from 'eta'

// 為了取得 package 名稱來當 title
const pkg = importCwd('./package.json')

// 省略

const templatePromise = loadTemplate()

// 省略

async function renderHTML(location) {
  // 省略

  const template = await templatePromise
  // 渲染樣版
  return render(template, {
    title: config.title || pkg.name || 'My Static site',
    output: renderToString(
      <AppProvider store={store} location={location}>
        {renderRoutes(routes, notFound)}
      </AppProvider>
    ),
  })
}

async function loadTemplate() {
  const path = resolve(process.cwd(), 'src/index.html')
  try {
    // 檢查檔案是不是存在
    await access(path, constants.R_OK)
    const content = await readFile(path, 'utf-8')
    return compile(content)
  } catch {
    const content = await readFile(resolve(__dirname, 'app/index.html'))
    return compile(content)
  }
}
```

不過在寫這篇的時候，我發現其實 Gatsby 是用 js 讓使用者自訂 html 的，或許那樣的方式比較簡單，這個 ejs 的樣版目前我所知道有在用的有 vue-cli 跟 webpack 的 html-webpack-plugin ，就當作是多認識一個樣版函式庫吧

下一篇要來講 universal javascript
