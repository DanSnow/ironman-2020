Day 15: webpack loader
======================

webpack loader 之前也講過，能把檔案做預先處理，在**「最後」**轉換成 webpack 能夠理解的 js 來讓 webpack 處理，在 webpack 中 loader 在概念上類似函式，以 scss 檔來說，它要依序經過 `sass-loader`, `css-loader`, `style-loader` 的處理，如果寫成 js 會像這樣：

```javascript
// 這不是真的程式碼
const output = styleLoader(cssLoader(sassLoader(code)))
```

所以其實只要最後一個 loader 能把檔案轉成 js ，那 webpack 就能處理，中間是其它的格式也是可以的

內嵌的 loader 設定
------------------

除了從設定檔設定要使用哪些 loader 外，其實有個可以直接寫在 js 中的方法：

```javascript
import 'style-loader!css-loader!sass-loader!foo.scss'
```

這個方法雖然不推薦實際使用在 code 中，不過對於 loader 而言，這個方法可以用來修改某個檔案該如何載入，另外也可以用 query string 傳參數給 loader

```javascript
import foo from 'url-loader?limit=8192!foo.jpg'
```

你可以看到上面在 loader 後加上了像網頁用的 query string 來傳入參數，不過這只能用來傳可以傳成字串的選項，像函式就沒辦法用這種方式傳 (比如 `sass-loader` 可以傳入 sass 的實作)

loader 前綴
-----------

webpack 中有幾個前綴可以告訴 webpack 要不要忽略設定的 loader

- `!`: 加個驚嘆號在開頭會讓 webpack 忽略一般的 loader ，但有設定 `enforce` 的 loader 還是會執行
- `!!`: 這樣就會讓 webpack 忽略所有的 loader 設定
- `-!`: 這是忽略除了 post loader 以外的 loader

使用方法就只要在開頭加上去就行，另外寫在 import 中的 loader 還是會被使用，比如強制一個檔案一定要用 `url-loader`

```javascript
import foo from '!!url-loader?limit=8192!foo.jpg'
```

如果是在更上面的例子，假如原本就有設定 `file-loader` 那就會被執行到，但這邊的不會

Resource Query String
---------------------

檔名後面也可以加上 query string ，這可以用來傳額外的訊息給 loader ，或是你可以在設定裡指定附有特定的 query 的檔案使用什麼 loader ，比如一個設定如下：

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.jpg$/,
        // oneOf 會由上往下找到第一個符合條件的 loader
        oneOf: [
          {
            // query 要包含 inline
            resourceQuery: /inline/,
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
          {
            // 不加其它條件就一定會符合，這個就相當於是預設值
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
}
```

如果引入檔案時是用：

```javascript
import img from 'icon.jpg?inline'
```

那這個檔案就會由 `url-loader` 來處理，如果不加上 `?inline` 就是由 `file-loader` 處理

> 另外補充一下 `url-loader` 跟 `file-loader` 都有載入檔案的功能，它們都可以把檔案重命名放到輸出資料夾，並回傳轉換後的網址，但 `url-loader` 會根據設定，把大小在 `limit` 下的轉成 data url ，可以用來把一些小檔案直接內嵌在 js 或 css 中

順帶一提， `vue-loader` 就是用這個方法區分是一般的 css 檔或是內嵌在 SFC 中的 css 的

loader 的運作方式
-----------------

loader 的工作流程實際上分成兩段， `pitch` 與 `normal` ：

- `normal`: 這就是正常的流程，會照在設定檔中相反的順序被呼叫
- `pitch`: 這個則是在正常流程前照正常順序先執行的，讓 loader 有機會修改接下來要呼叫的 loader 用的

以一開始的 `sass-loader` 為範例畫成圖就會變成：

![loader flow](https://i.imgur.com/42UfCrW.png)

loader 基本的格式是一個函式：

```javascript
// 一定要用一般的 function ，因為 webpack 會把很多資訊用 `this` 傳進來
module.exports = function (code) {
  // 對 code 做些轉換
  const transformedCode = code
  return transformedCode
}
```

如果加上 `pitch` 的話就是這樣：

```javascript
function loader(code) {
  return loader
}

loader.pitch = function () {
  if (...) {
    // 如果在 pitch 中回傳東西就會打斷接下來的流程，流程就會跳到這個 loader 執行完後，而回傳的東西會被當成程式碼處理
    // 上面提到的前綴就很適合在這邊使用，比如回傳 `require('!!some-loader!...')` 之類的
    return 'new code'
  }
}

module.exports = loader
```

上面的打斷流程，如果舉個例說明的話，假如有 loader 照著 `c-loader!b-loader!a-loader!file` 的順序，而 `b-loader` 的 `pitch` 回傳了，那再來會執行的就只有 `a-loader` 的正常流程而已

另外還有幾個變種，比如 raw loader :

```javascript
module.exports = function (buffer) {
  // buffer 會是 Node.js 用來處理二進位檔的 Buffer
}

module.exports.raw = true
```

跟 async loader

```javascript
module.exports = function (code) {
  const callback = this.async()
  setTimeout(() => {
    const transformedCode = code
    // 完成時要呼叫 callback，第一個參數是 error ，而第二個是原本的回傳值
    callback(null, transformedCode)
  }, 100)
}
```

async 的 pitch loader 也是存在的，不過在 pitch loader 執行時還沒有載入檔案，所以 raw 的選項對 pitch loader 來說沒什麼差別

下一篇就試著來寫一個 webpack loader
