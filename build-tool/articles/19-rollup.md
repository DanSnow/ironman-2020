Day 20: rollup
==============

rollup 是另一個 bundler ，不過它有幾個跟 webpack 不同的特點：

- 能編出 es6 module
- 預設會做 tree shaking ，跟把模組接在一個檔案中
- 預設不打包任何第三方套件，但如果沒有設定在排除的選項中，會顯示警告

這兩個特色使得它比 webpack 要來的適合打包純 js 的 library  (像包含 css 的 UI 元件庫可能會變的比較麻煩)，至於為什麼呢？

> 只有 es6 module 有辦法做 tree shaking ，而 webpack 沒辦法輸出 es6 module
> 若最後輸出的不是 es6 module ，那 library 的使用者還是只能把 library 完整包進來

而且如果你用的 library 是都先用 webpack 打包的，那你應該會看到你最後打包出來的東西裡有一大堆重覆的 webpack runtime ，就像我們之前自己寫的 bundler 一樣必須要有一個 runtime 一樣， webpack 打包出來的檔案中，那個 runtime 是必要的，雖然一個的檔案大小可能不大，但在前端對於檔案大小很在意的情況下，如果很多個 library 都這麼做的話情況可能就不同了，所以我個人對於撰寫 library 有一些想法：

1. 盡可能使用 rollup 打包，或是只用 babel 提供 commonjs 的版本，並同時提供 es6 module 的原始碼
2. library 中盡量不要用到像 webpack alias 那樣的方式來縮寫 import 路徑，確保直接 import 原始碼也能用

對 json 處理的差別
------------------

這部份其實我之前就有提過，但很抱歉的是，當時我誤會了 webpack ，它用另一種不同的方式實作了 tree shaking ，且預設沒在 development 模式下啟動，之前提過 webpack 會把 json 的內容直接做為一個模組包進去，包進去後實際會類似這樣：

```javascript
module.exports = JSON.parse('{"usedKey": "used value", "unusedKey": "unused value"}')
```

假設 `usedKey` 是使用到的，而 `unusedKey` 則沒有使用到，那在 production 模式下則會變成：

```javascript
module.exports = JSON.parse('{"a": "used value"}')
```

像這樣 key 的名字會被縮短，並刪掉沒用到的 key

至於 rollup 的處理方式呢，上面的 json 會被轉成 es6 module ：

```javascript
export const usedKey = 'used value'
export const unusedKey = 'unused value'
```

再加上 tree shaking 就會刪掉沒用到的 key 了， webpack 對於 loader 最後輸出的要求基本上只要是 js 就有辦法處理，但 rollup 的 plugin 不一樣，除了要是 js 外，還必須要是 es6 module

rollup 的使用
-------------

rollup 也有預設的選項，使得它在簡單的情況下不需要設定檔也能運作，首先從安裝開始， rollup 安裝只需要一個套件：

```shell
$ yarn add --dev rollup
```

最基本的指令就是這樣：

```shell
$ yarn rollup -o bundle.js src/index.js
```

跟 webpack 不太一樣的是，要是不指定檔名， rollup 是會直接把檔案印出來的，建議找個很簡單的 es6 module 格式的程式試試

rollup 的設定
------------

有趣的是， rollup 預設也會用 rollup 打包過一遍設定檔，所以你可以在設定檔中用 es6 module ，不如說一定要用，因為它會假設一般的 js 檔是 es6 module ，如果你想用 commonjs 也行，但副檔名要是 `cjs`

rollup 的設定如下：

```javascript
import json from '@rollup/plugin-json';
export default {
  input: './src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es', // 這是預設選項，所以可以不加，另外還有 `cjs` 跟 `umd` 可以選
  },
  // 這邊是放 plugin 的，由於 rollup 本身提供的功能其實不多，因此使用到 plugin 是常有的情況
  plugins: [
    // 像這邊使用了能載入 json 的 plugin
    json(),
  ],
}
```

只要上面的設定檔使用了預設的檔名 `rollup.config.js` ，那就可以用這樣的指令執行：

```shell
$ yarn rollup -c
```

如果不是預設檔名，就要加在 `-c` 的後面，如：

```shell
$ yarn rollup -c rollup.config.js
```

tsdx
----

雖然我自己還沒實際使用過，不過同樣的 Vue 有 vue-cli ，而 React 有 create-react-app ，如果想快速的建一個使用 ts 的 library 的 package ，這個 [`tsdx`](https://github.com/formium/tsdx) 感覺很實用，這邊就順便提一下

下一篇要來做個 rollup 的 plugin ，相比 webpack 那龐然大物， rollup 的 plugin 要簡單的多
