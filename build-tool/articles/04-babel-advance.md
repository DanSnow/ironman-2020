Day 5: babel 進階設定
=====================

有時我們可能會有需要在不同的環境下提供不同的設定，或是針對不同的檔案提供不同的設定的情況，這時候有兩個東西可以使用：

```javascript
module.exports = {
  env: {
    test: {
      presets: [], // 測試環境下，也就是 NODE_ENV 為 test 時的設定
      plugins[],
    },
  },
  overrides: {
    test: './src/**/*.ts', // 要套用的檔案，這邊是用萬用字元表示
    presets: [], // 符合條件時的設定
    plugins[],
  }
}
```

另外要注意的是，如果 env 或 overrides 符合時， babel preset/plugin 的設定會直接蓋掉同樣的 preset/plugin 的設定，也就是：

```javascript
module.exports = {
  presets: [
    '@babel/preset-typescript', // 這個不會受影響
    ['@babel/preset-env', { targets: { node: '12' }, loose: true }],
  ],
  
  env: {
    test: {
      presets: [
        // 這段設定在測試時會蓋掉原本的，所以 loose 的設定會變回預設的 false
        ['@babel/preset-env', { targets: { node: 'current' } }],
      ],
    },
  },
}
```

babel 的設定檔可以用 js 寫，那當然也可以放邏輯進去，比如測試的時候要額外多啟動某些轉換之類的需求就可以用這種方式達成，這只需要把原本 export 的 object 改成用一個函式回傳設定就可以了：

```javascript
module.exports = function (api) {
  return {
    presets: [],
    plugins: [],
  }
}
```

這樣寫就可以在函式中寫判斷等等的，來決定最後回傳的設定要是如何，而 babel 在呼叫這個函式時會傳入一個物件，裡面包含了 「babel 的版本」與「是由誰執行的」等資訊讓使用者可以判斷要回傳什麼樣的設定，比如要判斷是不是在測試中，除了上面的 `env` 外還有另一種方式：

```javascript
module.exports = function(api) {
  // 假設用的是 jest
  const isTest = api.caller((info) => info.name === 'babel-jest') // 判斷現在是不是由 `babel-jest` 載入的
  
  if (isTest) {
    return {} // 回傳測試時的設定
  }
  
  return {} // 回傳不是測試時的設定
}
```

最後這邊要來介紹一個東西 `@babel/register` ，它能讓你直接在 node 下執行程式之前先進行 babel 的轉換，這樣只要你的設定有包含把你用到的語法轉換成相容的設定的話，你就可以不用擔心執行時會出錯，用法很簡單：

```shell
$ node -r @babel/register path/to/index.js
```

> 如果在 yarn v2 的環境下，會需要使用 `yarn node -r @babel/register path/to/index.js` 來執行

上面的 `path/to/index.js` 請換成你自己的檔案的路徑，這個東西其實是去 hook node 載入模組的過程並動態的做轉換，雖然有 cache ，不過如果是在正式環境，還是建議先編譯過再跑

另外預設 `@babel/register` 是不會去處理 typescript 的，如果有需要你要自己寫個 script ，這邊叫 `register.js`

```javascript
require('@babel/register')({ extensions: ['.ts', '.js'] }) // 若有用到 tsx 或 jsx 也可以加上去
```

然後改用：

```shell
node -r ./register path/to/index.ts
```

這樣才會正確的經過 babel 的轉換

下一篇要來介紹 babel 的工作原理
