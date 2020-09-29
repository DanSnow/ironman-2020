Day 13: webpack advanced
========================

雖說這篇應該要來更詳細的介紹 webpack 的設定，不過其實 webpack 的設定真的很多，我只能找比較可能會用到的設定介紹了，另外因為在寫這篇時 webpack 5 進入 rc 階段了，目前官網上實際是 webpack 5 的文件

`mode`
----

mode 是 webpack 4 後新增的一個設定，它提供三種不同的模式，讓你有三種不同的基本設定，三個模式分別是：

- `development`： 開發用的模式，程式不會做什麼最佳化，以編譯的速度為優先，另外也會啟動 name modules 等功能，用檔案路徑當成 module 的名稱
- `production`: 啟動所有 webpack 能做的最佳化，比如 minifier ，這也是沒有選擇模式時的預設值
- `none`: 關閉所有的最佳化，另外也不會啟動跟除錯有關的功能

上面的三個選項其實都可以對應到一段 webpack 的設定，因為完整的設定還挺長的，我就不貼在這邊了，還請到[官網](https://v4.webpack.js.org/configuration/mode)去看

`resolve`
-------

`resolve` 是用來告訴 webpack 該怎麼找到要引入的檔案的，底下包含了很多很有用的設定

### `resolve.alias`

它可以讓你設定別名，比如把 `lodash` 對應到 `lodash-es` 或是像在 Vue 的專案中常用的，把 `@` 對應到 `src`：

```javascript
const path = require('path')

module.exports = {
  resolve: {
    alias: {
      // 讓使用 lodash 的地方改用 es module 的版本
      // 如果引入了 `lodash/add` 會被轉成 `lodash-es/add`
      lodash: 'lodash-es,

      // 結尾加上 $ 代表要完全符合，所以如果引入 `vue/dist/vue.runtime.esm.js` 就真的會引入那個檔案
      // 此外這個設定是為了載入包含 template compiler 的 Vue
      // 假如沒有使用字串的 或內嵌 html 的 template  應該是不需要的
      vue$: 'vue/dist/vue.esm.js',

      // 把 `@` 對應到 `src` 這個資料夾，如果在 alias 用相對路徑，那就會變成相對於實際引入的檔案
      // 因此一般除了 npm 等安裝的套件，都應該使用絕對路徑，以免出錯
      '@': path.resolve(__dirname, 'src'),
    }
  }
}
```

### `resolve.extensions`

因為 js 在 import 時可以省略副檔名，這個是用來設定 webpack 要去找哪些副檔名的檔案用的：

```javascript
module.exports = {
  resolve: {
    extensions: ['.browser.js', '.js', '.json'],
    // 預設值是
    // extensions: ['.wasm', '.mjs', '.js', '.json'],
  }
}
```

webpack 就會照著設定的順序檢查檔案是否存在，上面的設定就可以用在 isomorphic javascript 的架構下，如果是要給瀏覽器跑的就加上 `.browser.js` 的副檔名， server 端的設定則不要加上，這樣就可以讓 client 跟 server 端的程式能切換實作了

### `resolve.plugins`

webpack 是使用自己的 resolver 來找要引入的檔案的，而它的 resolver 也可以加入 plugin ，比如像之前使用的 `pnp-webpack-plugin` 就是 resolver 的 plugin ，因此假如現有的選項都不支援的話，也可以用 plugin 來改變 webpack 找檔案的邏輯

比如像 [`directory-named-webpack-plugin`](https://github.com/shaketbaby/directory-named-webpack-plugin) ，它可以讓你用跟資料夾同名的檔案當作是引入資料夾時實際要引入的檔案

```javascript
module.exports = {
  resolve: {
    plugins: [
      new DirectoryNamedWebpackPlugin()
    ],
  },
}
```

`plugins`
---------

這個選項是用來放要載入的 plugin 的，之後我們寫 plugin 也要放這邊

`devtool`
---------

這個選項是用來控制 webpack 怎麼產生 code 與 source map 的， source map 是把編譯過的檔案內容與原始的內容對應起來的一種檔案，可以幫助除錯，畢竟編譯過的 code 有時不是那麼好懂

```javascript
module.exports = {
  devtool: 'cheap-module-eval-source-map',
}
```

它有幾個可能的值，這邊只列出常用的：

適合開發時用的：

- `'eval'`: 號稱是最快的，會把 code 都包在 `eval` 裡，而且沒有 source map ，所以除錯也是最麻煩的，只在你在意打包速度時用
- `'cheap-module-eval-source-map'`: code 一樣會包在 `eval` 裡，不過會有簡化的 source map ，是個打包速度與除錯的容易度的一個折衷的選擇

適合線上的環境用的：

- `false`: 對，就是傳布林值的 `false` ，這會關掉這個功能，你看到的會是轉換過的程式碼，也沒有 source map
- `'source-map'`: 完整的 source map ，編譯速度慢，但除錯上會要來的方便多，不過如果把 source map 一起傳上去的話，其它人也會看到你的原始碼的
- `'hidden-source-map'`: 跟上面的基本一樣，只是不會在產生的程式碼裡提示瀏覽器有 source map 的存在，也因此不會產生一開 devtool 但找不到 source map 檔的警告

`target`
---------

用來設定打包後的程式要在什麼環境下執行

- `web`: 預設值，在網頁的環境執行
- `node`: 在 Node.js 的環境中執行

還有其它如 `electron` 等選項

`externals`
-----------

可以用來排除某些套件不要被打包，以網頁而言如果是要使用 CDN ，或是要寫給別人用的套件就很重要，雖然之前就講過 webpack 不適合用來打包套件，還有在 Node.js 的環境下就是用來讓第三方套件是用 `require` 的方式載入，而不是打包進去這樣的用途

```javascript
module.exports = {
  externals: {
    // 設定 jquery 要從 `jQuery` 這個全域變數取得
    jquery: 'jQuery',
    // 也可以設定在不同的環境下使用不同的取得方式
    lodash: {
      // commonjs 的環境下就是用 `lodash` 這個套件
      commonjs: 'lodash',
      // 如果是執行在網頁的話就用 `_` 這個全域變數
      root: '_',
    },
  },
}
```

另外在 Node.js 的環境下有個套件可以讓你將所有的套件設定成 `externals` 的叫 [`webpack-node-externals`](https://github.com/liady/webpack-node-externals)

`node`
------

讓你可以設定對於 Node.js 環境提供的變數或是模組該怎麼處理，比如像 `__dirname`, `__filename` 這些變數都是 Node.js 所提供的，在網頁環境正常而言是無法使用的

```javascript
module.exports = {
  node: {
    // 不要有 fs 這個套件
    fs: false,
    // 提供 Buffer 的 polyfill
    Buffer: true,
    // 提供沒有功能的套件
    dns: 'mock',
    // 提供空的物件
    util: 'empty'
  }
}
```

4 種不同的選項可以看你的需求使用，如果你需要一個預期自己是在 Node.js 下執行的套件，說不定調一下這個設定就能讓它在網頁執行了

`optimization`
--------------

這應該會是 webpack 最複雜的一個選項了，就直接用範例來介紹：

```javascript
module.exports = {
  optimization: {
    // 開啟或關閉下一個選項： minimizer
    minimize: true,
    // 設定要用的 minimizer ，比如 terser 或是用來壓縮 css 的 css-minimizer-webpack-plugin
    minimizer: [new TerserPlugin()],
    // 要不要有一個獨立的檔案來放 webpack 自己必要的程式碼
    // 因為這個檔案同時也會帶有必要的 module 的資訊，所以有時為了 cache 就必需要獨立出來
    runtimeChunk: 'single',
    // webpack 內部會給每個 module 一個 id ，用在 webpack 自己識別每個 module 上
    // 預設在線上環境是用載入的順序當 id ，用 hashed 的話就會用路徑產生一個 hash 當 id ，可以避免 id 改動
    // 這個 `hashed` 選項在 webpack v5 時被另一個更好的參數 `deterministic` 取代了
    moduleIds: 'hashed',

    // 這個選項預設可以控制 webpack 怎麼處理 dynamic import 產生的額外的檔案
    splitChunks: {
      // 這邊的設定是一些通用的規則

      // 如果一個 module 在兩個以上的不同的 chunk 有用到就拆分出來
      minChunks: 2,
      // 拆出來的 chunk 至少要有這個大小 (單位是 bytes) ，否則就不拆
      minSize: 100000,
      // 若拆開來的 chunk 超過這個大小就想辦法再拆小一點
      maxSize: 10000000,

      // 這個是最複雜的一個選項，這邊會另外解釋
      cacheGroups: {}
    }
  }
}
```

`splitChunks` 是 webpack 4 新增的一個功能，它讓你能提供規則，而 webpack 則自動找出符合這個規則的 module 折分方法來，以一般的 SPA 而言，你不一定需要同時使用到所有的程式碼，比如只在某些頁面需要處理時間，而你只需要在這些頁面載入 `moment` 就行，或是有些頁面並不常用到，你就用動態的 `import` 來載入這些頁面，假設有 A B 兩個頁面，都是用動態的 import 載入的，那 webpack 會分別為這兩個頁面產生一個 chunk ，假如兩個頁面都用到了同一個套件，那 webpack 則會因為 `minChunks` 的設定而幫該套件也產生一個共用在 A B 兩個頁面的 chunk ，一個 chunk 就是一組被 webpack 打包的檔案

`cacheGroups` 可以自己手動設定檔案該怎麼拆，比如要把 `node_modules` 下的套件都拆出來：

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          // chunk 的名字
          name: 'vendor',
          // 檔名中包含 node_modules 的就拆出來
          test: /\/node_modules\//,
          // 數字越小優先度就越高，預設是 0
          priority: -10,
          // 處理一開始載入的 chunk ，就是那些會加到 html 的 chunk，不然預設是只處理 dynamic import 所產生的 chunk
          chunks: 'initial'
        },
      },
    },
  },
}
```

一般會這樣設定是因為通常之後相依套件就不常變動了，所以獨立一個檔案比較好 cache

比如我知道有個套件很佔空間的，我希望除了 vendor 外再額外把它拆出來

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        bigChunk: {
          name: 'big-chunk',
          // moment: 躺著也中槍
          test: /moment/,
          priority: -20,
          // 這樣就假如 dynamic import 的有用到就也會處理到
          chunks: 'all',
        },
        vendor: {
          name: 'vendor',
          test: /\/node_modules\//,
          priority: -10,
          chunks: 'initial'
        },
      },
    },
  },
}
```

這樣在動態載入時也會再載入這些特別的佔空間的套件了

這篇的內容應該是目前這系列最長的了，由此可見 webpack 的設定有多複雜，還真的要好好感謝那些已經幫我們寫好預設的選項的人們，下一篇要來講 webpack 的運作原理
