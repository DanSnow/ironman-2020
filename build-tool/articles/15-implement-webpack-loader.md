Day 16: 實作個 webpack loader
=============================

> 這篇的範例程式碼在 https://github.com/DanSnow/ironman-2020/tree/master/build-tool/packages/custom-loaders

這篇來要實際試著做 webpack loader ，首先先來試著做一個 raw loader 吧，要寫 webpack loader 的話幾乎是一定要安裝一個相依套叫 `loader-utils`：

```shell
$ yarn add loader-utils
```

這個套件提供了很多寫 loader 會需要的 API，比如取得傳給 options 的選項，或是跟 webpack 使用的一樣的檔名樣版

raw-loader
----------

raw loader 的功能是把檔案內容轉成字串，這樣講不知道你是不是已經知道這個 loader 到底是怎麼做的了：

```javascript
module.exports = function (content) {
  return `export default ${JSON.stringify(content)}`
}
```

真的就這樣而已，如果你去看 [`webpack-contrib/raw-loader`](https://github.com/webpack-contrib/raw-loader/blob/master/src/index.js) ，你也只會看到他們多取代了一些特殊字元，還有一個決定要不要用 `export default` 的選項


file-loader
-----------

下一個是 file loader ，這個就會需要檔名樣版的部份

```javascript
const loaderUtils = require('loader-utils')

// 這邊的 content 是個 Buffer
module.exports = function (content) {
  // 這邊在取得設定，我們的設定只有一個 `name` ，存的是命名的樣版
  const { name: nameTemplate = '[name]-[contenthash].[ext]' } = loaderUtils.getOptions(this)
  // 用 `interpolateName` 處理樣版，如果要使用 `[contenthash]` 就要傳入 `content`
  const name = loaderUtils.interpolateName(this, nameTemplate, { content })
  // 使用 webpack 的 API 額外的產生一個檔案
  this.emitFile(name, content)
  // 回傳產生的檔案的位置，加上 __webpack_public_path__ 可以加上使用者設定的 publicPath
  return `export default __webpack_public_path__ + '${name}'`
}

// 設定這是一個 raw 的 loader
module.exports.raw = true
```

source-loader
------------

這邊來做一個會同時把程式碼用 `__code__` export 出去的 loader ，這次要用到 pitch loader

```javascript
const { stringifyRequest } = require('loader-utils')

module.exports = function (content) {
  return content
}

// remainingRequest 是在這之後的 loader 跟 import ，要注意的是這邊的順序是以 pitch loader 的順序而言，也就是正常的順序
// 比如設定是 use: ['./loader', 'babel-loader'] ，那 `babel-loader` 就包含在 remainingRequest 中
module.exports.pitch = function (remainingRequest) {
  // 第二個 require 在前面又加上了 raw-loader ，就會把原始碼以字串的型式載入
  return `
  module.exports = require(${stringifyRequest(this, `!!${remainingRequest}`)}) || {}
  module.exports.__code__ = require(${stringifyRequest(this, `!!${require.resolve('raw-loader')}!${remainingRequest}`)})
  `
}
```

用這個 loader 載入的模組就會多一個 `__code__` 的 export 可以取得原始碼

loader API
----------

我們用了幾個範例來介紹 loader 的寫法，再來就是補充一下 loader 中常用的 API 了，這些 API 都是在 `this` 上：

- `context: string`: 目前的資源所在的資料夾
- `resourcePath: string`: 檔名，會是相對於 `context` 的相對路徑
- `async()`: 設定目前的 loader 為 async 的，並回傳 `callback`
- `callback(err: Error, content: string, sourceMap?: SourceMap)`: 跟 `async()` 回傳的 callback 是同一個，同時也是 loader 唯一回傳 source map 的方法
- `cacheable(cacheable: boolean)`: 用來告訴 webpack 這個 loader 產生的結果能不能被 cache ，預設是可以 cache 的，只有呼叫這個函式並傳入 `false` 或是拋出 error 才會變成不可 cache 的
- `emitWarning(err: Error>)`: 傳入 error object 就會變成印出 warning
- `emitError(err: Error)`: 傳入 error object 就會印出 error ，但這不會中斷當下的編譯過程，只是會印出 error 而已，如果要中斷流程要拋出 error
- `loadModule(request: string, callback)`: 可以用來載入其它檔案，它會經過同樣的 webpack 的編譯的流程
- `resolve(context: string, request: string, callback)`: 用來解析檔案的位置的，會用跟 webpack 同樣的邏輯，也就是會受到 `alias` 等設定的影響
- `addDependency(file: string)`: 加入單一檔案到 dependencies 中，當 webpack 在 watch mode 時如果指定的檔案改變了，那這個模組也會重新編譯
- `addContextDependency(directory: string)`: 把整個資料夾加入 dependencies ，包含有新增刪除檔案

上面的 API 是我覺得比較常用，但目前想不到一個好的範例來介紹的，下一篇要來介紹 webpack 的 plugin
