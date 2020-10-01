Day 16: 重新載入 js
===================

> 這系列的程式碼在 https://github.com/DanSnow/ironman-2020/tree/master/static-site-generator

這篇要來重新把 js 加入到前端，因為我們目前的框架把程式碼拆在不同的資料夾中，並由我們自己來載入，為了在 Client 端能提供同樣的功能，這邊必須要做兩件事：

1. 用 webpack 打包所有程式碼
2. 產生程式碼在 Client 端做到跟目前在 Server 中組合使用者程式一樣的效果

為此我們要產生的有：

1. 路由
2. 組合 reducer
3. 載入上面兩個部份的進入點

雖說產生程式碼聽起來好像很厲害，但基本上就是把我們之前做的事改由字串處理完成而已，比較特別的是在路由的部份，因為我們都是在 express 的路由中去呼叫 `getInitialProps` 這個函式，換到 Client 端時這個動作必須由一個元件來完成，我們叫這個元件 `Page`：

```javascript
import React, { useEffect, useState } from 'react'
import { useStore } from 'react-redux'
import { useRouteMatch } from 'react-router-dom'
import { noop } from '../../utils'

// 取得兩個參數，要顯示的元件與 `getInitialProps`
export function Page({ component: Component, getInitialProps = noop }) {
  const [ready, setReady] = useState()
  const route = useRouteMatch()
  const store = useStore()

  useEffect(() => {
    const fetch = async () => {
      await getInitialProps({ route, store })
      setReady(true)
    }

    fetch()
  }, [getInitialProps])

  if (ready) {
    return <Component />
  }

  return null
}
```

再來就是產生 `routes.js` 來作為路由，這邊要把原本的元件用 `Page` 包起來：

```javascript
import { join } from 'path'
import { format } from 'prettier'

export function generateRoutes(routes) {
  const routesInfo = routes.map(({ file, url, props }) => ({
    file,
    url,
    props,
    name: `_${url.replace(/[/:]/g, '_')}`,
  }))
  // format 是為了讓產生的程式碼好看而已
  return format(
    `
  import {React, Switch, Route, Page} from 'generator'
  ${
    // 引入所有元件
    routesInfo.map(({ file, name }) => `import * as ${name} from  '${join('..', file)}'`).join('\n')
   }

  export default function Routes() {
    return (
      <Switch>
        ${
          // 產生所有路由
          routesInfo
          .map(
            ({ props, name }) =>
              `<Route path="${props.path}" exact={${props.exact}} >
                <Page component={${name}.default} getInitialProps={${name}.getInitialProps} />
               </Route>`
          )
          .join('\n')}
      </Switch>
    )
  }

  `,
    { parser: 'babel' }
  )
}
```

產生 `store.js` 與進入點也是類似的作法，再來就是打包程式碼了， `webpack.config.js` 的設定有個地方要注意的：

```javascript
import PnpWebpackPlugin from 'pnp-webpack-plugin'
import { resolve } from 'path'

export default {
  // 省略
  module: {
    rules: [
      {
        test: /\.js$/,
        // 這邊使用 require.resolve 才能讓 webpack 使用我們提供的版本，而不是使用者自己的版本
        loader: require.resolve('babel-loader'),
        exclude: /node_modules/,
      },
    ],
  },

  // 省略
}
```

再來就是讓 server 在產生程式碼與打包完後才啟動：

```javascript
// 省略
import { codegen } from './codegen'
import { bundle } from './app/webpack'

// 省略
app.use(express.static(resolve(process.cwd(), '.cache/dist')))

async function main() {
  codegen(await routesPromise)
  await bundle()

  app.listen(3000, () => {
    console.log('server is running at http://localhost:3000')
  })
}

main()

// 省略
```

最後改一下 `index.html` 讓它載入打包好的 js ，打開瀏覽器到我們的頁面，同時打開 devtool ，你看到了什麼？

1. 我們的頁面不再是完整的換頁了，變成了 SPA ，只呼叫 API 就能載入新的內容
2. console 有個 error 說 React 的 hydrate 失敗了

失敗的原因只有一個， Server 產生的 html 跟 Client 產生的不同，至於為什麼會不同呢？我們稍微回想一下兩邊的流程， Server 是等待 API 載入完成才開始渲染頁面，所以頁面有文章的資料， Client 等是在第一次 render 時才開始載入資料，在那之前不顯示東西，那解決方法看來只有一個了，把在 Server 的載入的資料也傳到 Client ，在 Client 判斷資料是否已經存在，若不存在則下載資料，若存在則直接顯示

這邊修改 `store.js` 讓它載入 state ：

```javascript
import { configurestore } from '@reduxjs/toolkit'

export function createstore(reducer) {
  let preloadedstate
  if (typeof window !== 'undefined') {
    preloadedstate = window.__initial_state__
  }
  return configurestore({ reducer, preloadedstate })
}
```

然後修改 `index.html` 跟 `src/index.js` 讓它傳入初始的 state ，之後這邊先用一個很偷吃步的方法，只要是第一次 render `Page` ，就當作資料已經存在了：

```javascript
// 省略

let first = true

export function Page({ component: Component, getInitialProps = noop }) {
  const [ready, setReady] = useState(first)
  const route = useRouteMatch()
  const store = useStore()
  first = false

  useEffect(() => {
    const fetch = async () => {
      await getInitialProps({ route, store })
      setReady(true)
    }

    if (!ready) {
      fetch()
    }
  }, [getInitialProps, ready])

  if (ready) {
    return <Component />
  }

  return null
}
```

再試一次，看來還是有類似的問題，我們下一篇，把它正式的變成 Static Site Generator 時再來一起想辦法解決吧
