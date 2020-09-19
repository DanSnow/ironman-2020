Day 4: Babel 的使用與設定
===========================

終於要開始講到實際應用了，由於 babel 是由多個模組與 plugin 組合起來的專案，於是不透過像 `vue-cli` 之類的專案建構工具的話就要安裝一堆東西很麻煩， babel 要直接使用基本上要安裝幾個東西：

- `@babel/core`: babel 核心的部份，負責讀取設定，提供執行轉換的 API 等等
- `@babel/cli`: babel 的 CLI 介面，這樣才能直接在終端機執行
- `@babel/preset-env`: 一個很常用的 babel preset ，直接包含了大部份處理相容性轉換的 plugin ，另外隨著 js 的標準的更新，這個套件內帶有的 plugin 也跟著在更新，所以可能要注意一下裡面實際包了什麼

babel 除了核心的幾個套件外，其它的可以大致分成兩種 `preset` 與 `plugin` ， `plugin` 是主要轉換程式碼的部份，而 `preset` 則是包裝 `plugin` 與一些設定的東西，官方有推出幾個常用的 `preset` 可以讓你不用手動加入一個個的 `plugin` ，總之直接來看一個範例吧，我們先建一個專案並安裝需要的套件：

```shell
$ mkdir my-project # 要叫什麼都行
$ cd my-project
$ yarn init
$ yard add --dev @babel/core @babel/cli @babel/preset-env
```

然後新增一個 `babel.config.js` 內容為：

```javascript
module.exports = {
  presets: ['@babel/preset-env'],
}
```

這樣就會讓 babel 知道在編譯時要用 `@babel/preset-env` 這個 `preset` 了，接著隨便的新增一個 js 檔來測試一下它是如何轉換的，就放在專案目錄下取名為 `index.js`：

```javascript
import pkg from './package.json'

const log = (x) => console.log(x)

log(pkg)
```

然後執行指令：

```shell
$ yarn babel index.js
```

應該就會看到 babel 輸出了：

```javascript
"use strict";

var _package = _interopRequireDefault(require("./package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var log = function log(x) {
  return console.log(x);
};

log(_package["default"]);
```

上面的結果是 `@babel/preset-env` 所轉換出來的，相容於 es5 且把 es6 module 轉成 commonjs 的結果，這就是 `@babel/preset-env` 預設設定的轉換結果

> commonjs 跟 import 都是 js 的模組的格式， commonjs 用 require 載入相依性，用 `exports` 或 `module.exports` 匯出 API ， es6 module 用 `import` 載入，用 `export` 匯出，而 commonjs 是 Node.js 所使用的模組格式，雖然現在 Node.js 13.2 後也正式支援了 es6 module ，不過行為跟轉換過的 code 其實是有些不一樣的

如何設定
-------

接下來我們先來詳細看 `babel.config.js` 要怎麼設定：

```javascript
module.exports = {
  presets: [
    'preset 1',
    ['preset 2', {'preset 2 的設定': '值'}], // 你可以用 array 的方式來設定 preset 或 plugin 的選項
  ],
  plugins: [
    'plugin 1',
    ['plugin 2', {'plugin 2 的設定': '值'}], // 正如上面所提到的，你可以用 array 來設定 plugin
  ],
}
```

這樣就是 babel 設定的基本寫法了，現在我們來設定 `@babel/preset-env` 做為範例，順便介紹一下它的常用選項：

```javascript
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '12', // 比如我們要支援 node 12 以上(現在的 LTS)版本
          // node: 'current', // 支援現在使用的 node
          // chrome: '85', // 指定瀏覽器的版本以上
          // browsers: ['defaults'], // 用 browser list 指定，等下說明
        },
        loose: true, // 使用比較不符合 spec 的轉換方式，通常是沒有檢查一些 spec 說的限制，一般編出來的檔案會比較小
        // modules: 'commonjs', // 設定要不要轉換 es module 到其它格式， `false` 是不轉換，不過這個選項預設的 'auto' 一般就很好用了
        debug: true, // 顯示哪些 plugin 被加進來了，這個很好用，可以知道自己的設定到底會用到哪些 plugin
        include: [], // 強制載入特定 plugin
        exclude: [], // 強制移除特定 plugin
        useBuiltIns: 'usage', // 這選項的名字超讓人誤會的，實際上它是用來設定要在哪邊載入 polyfill 的，晚點說明
      },
    ],
  ],
}
```

> browser list 是一個套件讓你可以用比較像英文口語的寫法描述你要支援哪些瀏覽器，比如像 `last 2 versions` 這樣的寫法，目前你可以用 `yarn add --dev browserlist` ，然後執行 `yarn browserlist 'last 2 versions'` 的方式來測試你會選出哪些瀏覽器 (使用 CLI 是因為本文在撰寫時，他們的網站 [browserl.ist](https://browserl.ist) 無法使用，若可以使用的話用那邊應該會比較方便)

關於 `useBuiltIns` 有兩種模式：

- `usage`: 只要你有用到某個需要 polyfill 的 API ，那 babel 就會自動加上相關的 polyfill 的 import
- `entry`: 你必須要在你的專案的某個地方 (通常是進入點) 加上 `import 'core-js'` ，然後 babel 會把這邊轉換成必要的 polyfill 的 import

> polyfill: 簡單來說就是將較新的功能在較舊的瀏覽器上實作的一段 code ，這樣你就可以在哪邊都用最新的 API 了，不過並不是所有 API 都有辦法有 polyfill ，比如像 `Object.defineProperty` 這種 API ，因為 getter 跟 setter 一定要有瀏覽器支援才行，所以不一定能 polyfill

下一篇會來介紹 babel 與設定相關的 API ，以及其它 babel 系列的套件
