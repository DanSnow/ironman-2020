Day 17: webpack plugin
======================

webpack 大概是我目前看過彈性最高的套件了，只要你知道它的 plugin 的 API ，幾乎什麼東西都能自由修改，不過這麼自由的 API 其實也有個不小的麻煩， webpack 的程式流程非常難追蹤，這之前也提過， webpack 就連本身的程式都拆成 plugin ，所以到處都只會看到註冊 plugin 與呼叫 plugin 而已，不過這篇只要先講個概念，另外我還想介紹兩個比較少用，但很有用的 plugin

plugin 的結構
-------------

webpack 的 plugin 結構其實非常簡單，或著該說很簡潔：

```javascript
class Plugin {
  // 這是你唯一要實作的方法，參數視你註冊 plugin 的位置而定
  // 可能是 compiler (webpack 的 instance) 或是 resolver (當你註冊成為 resolver plugin 時，不過這系列不會介紹)
  apply(compiler) {
    // tap 的第一個參數是 plugin 的名字，用來 debug 用的
    compiler.hooks.emit.tap('Plugin', (compilation) => {
      // plugin 的邏輯
      const content = 'User-Agent: *\nDisallow: /\n'
      compilation.emitAsset('robots.txt', { source: () => content, size: () => content.length })
    })
  }
}
```

就像這樣，找一個自己想加入邏輯的 hook ，然後呼叫 `tap` 或是它的變種，而 webpack 則會在特定的時候去呼叫這些 hook ，讓你的 hook 能被執行，比如上面的 plugin 就會幫你加個 `robots.txt` (不過這類需求其實用 `CopyWebpackPlugin` 比較好)

`tap` 與它的變種的函式都是由一個叫 `tapable` 的套件提供的，下一篇才會來詳細介紹

此外除了在 webpack 的設定中註冊 plugin 外，如果你用 webpack 的 API 來呼叫 webpack 的話，也可以像這樣做：

```javascript
const webpack = require('webpack')

// 傳入設定就會回傳一個 webpack 的 instance
const compiler = webpack(config)

// 把 compiler 傳入 webpack 的 apply 裡
new Plugin().apply(compiler)
```

所以假如你要在 plugin 中加入其它的 plugin 的話，就像上面那樣就行了

`IgnorePlugin`
--------------

`IgnorePlugin` 如同其名字一般，是個用來忽略特定的檔案或資料夾的 plugin ，用途大概有兩種：

1. 載入有可選的 Node.js 或是什麼的支援的套件，用來忽略掉它支援其它環境的部份
2. 載入像 moment, highlight.js 這樣包含了很多可能不是很必要的檔案的套件 (比如你不一定需要全時區支援，或是全語言)

被忽略掉的檔案在被載入時會拋出錯誤，就像這個檔案本來就不存在一樣，所以如果程式不是類似這樣寫的，就會出問題：

```javascript
let foo
try {
  foo = require('optional-foo')
} catch {}

if (foo) {
  // use foo
}
```

不過 moment 跟 highlight.js 我確定都是可以這樣用的，這個 plugin 是這樣使用的 (這邊的範例是文件中的)：

```javascript
const webpack = require('webpack')
module.exports = {
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/, // 忽略路徑有 locale 的部份
      contextRegExp: /moment$/, // 比對載入的位置的，這個參數是可選的，加上後就可以控制只能由使用者引入需要的部份
    })
  ]
}
```

`ContextReplacementPlugin`
--------------------------

webpack 在處理類似 `require('./' + name)` 這樣的程式碼時，因為不知道你實際要載入什麼檔案，所以會從當中固定的部份推出所有可能的檔案，並都打包進去 (同時要是完全沒有固定的部份，會當成載入失敗來處理) ，而這個 plugin 就是可以控制這個行為的，也就是可以讓你決定實際上要載入哪些檔案

以下是範例，同樣來自文件：

```javascript
const webpack = require('webpack')
module.exports = {
  plugins: [
    new webpack.ContextReplacementPlugin(
      /moment[/\\]locale$/, // 比對固定部份所解析到的資料夾
      /de|fr|hu/ // 只有符合這個 regex 的檔案才會被載入
    )
  ]
}
```

下一篇就來玩 tapable 這個強大的 plugin 系統，另外我想順便提一下 Nuxt.js 所用的
