Day 18: 進化成 SSG
==================

> 這系列的程式碼在 https://github.com/DanSnow/ironman-2020/tree/master/static-site-generator

這篇要來把保存下來的 actions 存到一個檔案中，讓 Client 能去抓它並在 Client 重現，這邊要用到一個新的套件 [`serialize-javascript`](https://github.com/yahoo/serialize-javascript) ，它能把大部份的 js 物件轉換成 js 的 code ，為什麼呢？因為我們要用 JSONP 的方式載入 actions ，雖然也是可以放 json ，不過直接放 js 的 code 感覺比較好看，至於是什麼意思，做出來就知道了

JSONP
-----

所以 JSONP 是什麼鬼呢？它是一個就算有 CORS 問題的情況下，也能跨網域傳遞資料的一個方式，傳資料的雙方要先約定好一個函式名稱當 callback ，我們會使用 `__GENERATOR_JSONP__`：

```javascript
// 產生的存資料的 js ， serialize-javascript 就要負責產生第二個參數
__GENERATOR_JSONP__('/', [{ type: 'action1', payload: 'payload1' }])
// 當然這邊用 json 其實也行
__GENERATOR_JSONP__('/', [{ "type": "action1", "payload": "payload1" }])


// 我們的程式
window.__GENERATOR_JSONP__ = (path, actions) => {
  store.dispatch(__record.actions.loadPage({ path, actions }))
}
```

而上面設定 callback 的部份我包在一個叫 `setupJSONP` 的函式中，並在產生的程式碼的進入點中呼叫

這個方法其實已經很少人用了，因為只要設定好 CORS 的 header ，就算是跨網域也可以存取資料，那為什麼這邊又要使用呢？因為使用 SSG 的人不一定會把 code 佈署在同一個域名下 (比如靜態檔案放在不同域名的 CDN)，如果在不同域名下，又沒設定 CORS 的話就沒辦法用了，事實上這種方法在 webpack 所產生的程式也有在使用，你可以看看，如果你在程式碼裡用了 dynamic import ，被 webpack 拆出來的程式碼是不是會包含修改一個叫 `webpackJsonp` 的陣列呢

產生 `payload.js`
-----------------

我們要把每一頁會 dispatch 的 action 都用上面的方式紀錄到各別的 `payload.js` 中，這樣 Client 只要去抓對應的 `payload.js` 就有資料可以在 Client 重現那個頁面了，這邊直接修改 server ，讓它能回傳上面那樣的 js:

```javascript
import serialize from 'serialize-javascript'

// 省略

app.get('/*', async (req, res) => {
  // 如果有 payload 這個 query
  const payload = !!req.query.payload
  const { html, actions } = await renderHTML(toLocation(req))
  if (payload) {
    // 送出 payload.js
    res.send(
      renderPayload({
        path: req.path,
        actions,
      })
    )
  } else {
    res.send(html)
  }
})

// 省略

function renderPayload({ path, actions }) {
  return `__GENERATOR_JSONP__('${path}', ${serialize(actions, { isJSON: true })})`
}
```

在 Client 端回復狀態
--------------------

這邊要修改 `Page.js` ，讓它是去抓 `payload.js` 來用，而不是去呼叫 `getInitialProps`:

```javascript
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouteMatch } from 'react-router-dom'
import { pageSelector, __record } from '../slices/record'
import { join } from 'path'

export function Page({ component: Component }) {
  const route = useRouteMatch()
  const currentPage = useSelector((state) => state.__record.currentPage)
  const actions = useSelector((state) => pageSelector(state, route.url))
  const dispatch = useDispatch()

  useEffect(() => {
    // 如果沒有 action 的話就去載入 payload.js
    if (!actions) {
      loadPayload(route.url)
    }
  }, [actions, route])

  if (actions) {
    if (route.path !== currentPage) {
      for (const action of actions) {
        dispatch(action)
      }
      dispatch(__record.actions.setCurrentPage(route.url))
    }
  } else {
    return null
  }

  return <Component />
}

// 載入的方法很簡單，建一個 script tag ，然後加到 head 就行了
function loadPayload(url) {
  const $script = document.createElement('script')
  // payload.js 目前放在跟對應的 index.html 同樣的資料夾下
  $script.src = join(url, 'payload.js')
  document.head.append($script)
}
```

建立 `payload.js`
-----------------

既然都讓 server 能產生 `payload.js` 了，就一樣用下載檔案的方式來建立 `payload.js` 就行了：

```javascript
// 在 main 中
// 省略

for (const url of possibleRoute) {
  const path = url.substr(1)
  await mkdir(resolve(dist, path), { recursive: true })
  await fetchHTML(url, path)
  await fetchPayload(url, path)
}
// 這次有記得把 `bundle.js` 放回去了
await copyFile(bundlePath, resolve(dist, 'bundle.js'))

async function fetchPayload(url, path) {
  const body = await ky.get(`http://localhost:3000${url}`, { searchParams: { payload: true } }).text()
  await writeFile(resolve(dist, path, 'payload.js'), body)
}

async function fetchHTML(url, path) {
  const body = await ky.get(`http://localhost:3000${url}`).text()
  await writeFile(resolve(dist, path, 'index.html'), body)
}
```

到這邊我們已經完成了第一版的 SSG 了，如果你有實際測試可能會發現些問題，比如 tailwindcss 每次都會被重新載入，因為 Helmet 的 tag 在沒資料時會被重新 render ，我在思考看看是要讓使用者能提供固定的 layout 或是像 Nuxt 那樣可以在設定檔設定載入的 css 之類的解決方法，總之下一篇預定要來玩 GraphQL
