Day 12: webpack
===============

現在開發前端只要你有用到什麼框架，大概都會用到 webpack ，雖然就如同之前所說的，它有可能是包在底層而你使用到了卻沒有注意到

webpack 除了核心的 `wepback` 與指令介面的 `webpack-cli` 這兩個套件外，大致可以分成兩個部份 `loader` 與 `plugin`：

- `loader`: 顧名思義，它是負責載入檔案並轉成 webpack 可以處理的格式，而 webpack 本身可以處理的格式實際上只有一種，就是 js 而已
- `plugin`: 是個比 `loader` 還要來的更強大的東西， webpack 允許 plugin 在各個部份插入自己的邏輯，實際上 webpack 本身也被大量的拆成 plugin ，每個 plugin 只負責一部份的功能，然後再由一個程式根據設定檔來決定載入哪些 plugin ，並組合成完整的 webpack ，比如載入 json 的功能就是一個 [plugin](https://github.com/webpack/webpack/blob/master/lib/json/JsonModulesPlugin.js)

webpack 要安裝很簡單，主要只要安裝 `webpack` 與 `webpack-cli` 就行了，不過這樣預設就只能打包 js, json 與 wasm 而已，所以一般還會再安裝其它的 loader 或 plugin ，另外也有可能會安裝 `webpack-dev-server`

```shell
$ yarn add --dev webpack webpack-cli
```

webpack 在 v4 後預設的選項就可以簡單的打包 js 檔了，只要你的程式是在 `src/index.js` 的話就行了，這邊就準備兩個檔案，首先是 `src/index.js`:

```javascript
import { foo } from './lib'

foo()
```

另外一個 `src/lib.js`:

```javascript
export function foo() {
  console.log('foo)
}
```

然後執行：

```shell
$ yarn webpack --mode development
```

應該就會在 `dist/main.js` 看到輸出的檔案了

再來安裝幾個 loader 跟 plugin 還有 webpack-dev-server 來試一下：

```shell
$ yarn add --dev css-loader style-loader html-webpack-plugin pnp-webpack-plugin webpack-dev-server
```

我們會需要一個設定檔來告訴 webpack 要載入哪些 loader 跟 plugin：

```javascript
// 由於使用了 yarn v2 的關係，需要使用這個 plugin 讓 webpack 能正常運作
const PnpWebpackPlugin = require('pnp-webpack-plugin')
// 產生 html 的 plugin
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // 這部份的設定是 pnp-webpack-plugin 提供的，基本上不需要改
  resolve: {
    plugins: [
      PnpWebpackPlugin,
    ],
  },
  resolveLoader: {
    plugins: [
      PnpWebpackPlugin.moduleLoader(module),
    ],
  },

  module: {
    // 設定什麼檔案該怎麼載入
    rules: [
      {
        // 如果檔名符合這個正則表示法就套用這個規則
        test: /\.css$/,
        // 要使用的 loader ，另外要注意的是， loader 的套用順序是相反的，也就是先 css-loader 再 style-loader
        use: [
          {
            // style-loader 會把 css 的 code 加上必要的程式碼，讓它在執行時可以加入到 head 中
            loader: 'style-loader',
          },
          {
            // 處理 css 內的 import 並打包成 js 檔
            loader: 'css-loader',
          },
        ],
      },
    ],
  },
  // 讓 webpack 自動產生一個 html
  plugins: [new HtmlWebpackPlugin()],
  mode: 'development',
  devtool: false,
}
```

再來修改一下，加上 `style.css` ：

```css
body {
  color: #228888;
}
```

並在 `index.js` 引入：

```javascript
import './style.css'

// 省略

document.body.append('Hello world')
```

來執行 `webpack-dev-server` 試試吧：

```shell
$ yarn webpack-dev-server
```

打開瀏覽器到 https://localhost:8080 應該就會看到結果

> 上面完整的程式可以到 https://github.com/DanSnow/ironman-2020/tree/master/build-tool/packages/day-12

這邊就只先說明 `rules` 的設定：

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        // 上面的也可以簡寫成這樣
        use: ['style-loader', 'css-loader'],

        use: [
          {
            // 這算是完整的寫法
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              // 另外這個寫法可以用來傳參數給 loader ，像這個選項是告訴 `css-loader` 要用 css module 的功能
              modules: true,
            },
          }
        ],
      },

      {
        // 可以強制先執行這個設定的 loader
        // 另外這邊也有 'post' 這個選項，則是把 loader 放到最後執行
        enforce: 'pre',
        test: '\.js$',
        // 只有一個 loader 時的簡寫法， `eslint-loader` 是用來檢查程式碼風格的，因此要讓它看到最原始的程式碼
        loader: 'eslint-loader',
        // 不要處理 node_modules 下的檔案，另外這邊也可以用陣列來加上多個條件，或是用一個函式
        exclude: /node_modules/,
        // 有 `exclude` 自然有 `include` ， 另外要注意， `include` 的設定會優先於 `exclude`
        // include: /src/,
      },
    ],
  },
}
```

基本的用法大概就這樣，其它的明天再介紹了
