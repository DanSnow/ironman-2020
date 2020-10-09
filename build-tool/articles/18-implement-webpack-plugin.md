Day 19: 實作個 webpack plugin
=============================

> 這篇的範例程式碼在 https://github.com/DanSnow/ironman-2020/tree/master/build-tool/packages/webpack-plugins

雖說標題是說要來實作 webpack plugin ，但老實說 plugin 能做的事實在是太多了，現在我一時沒有要寫怎麼樣的 plugin 的點子，我們就來嘗試實作已經有的 plugin ，然後再去對答案吧

CleanWebpackPlugin
------------------

第一個想來挑戰的 CleanWebpackPlugin ，它的功能是在 webpack 開始 build 前把輸出資料夾清掉

```javascript
const del = require('del')

module.exports = class CleanPlugin {
  apply(compiler) {
    // beforeRun 是在 build 之前執行
    compiler.hooks.beforeRun.tapPromise('CleanPlugin', (compiler) =>
      // 這個是 webpack 輸出的位置
     del(compiler.options.output.path)
    )
  }
}
```

做完好像意外的簡單，不過實際去看了 CleanWebpackPlugin 後，發現它是在 `emit` 這個 hook 才去刪檔案的，為了知道是不是真的成功 build 了，所以要等到輸出檔案的前一刻

BannerPlugin
------------

這個 plugin 可以在產生的 code 加上東西，這邊因為要修改產生的檔案，所以應該是在 `emit` 這個 hook 做的：

```javascript
const { RawSource, ConcatSource } = require('webpack-sources')

module.exports = class BannerPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('CleanPlugin', (compilation) => {
      // 取得所有要輸出的檔案
      for (const asset of Object.keys(compilation.assets)) {
        // updateAsset 可以修改要輸出的檔案
        compilation.updateAsset(asset, (source) => {
          // 這個是 webpack 用來表示檔案的一個物件
          return new ConcatSource(new RawSource('/* Hello from plugin */\n'), source)
        })
      }
    })
  }
}
```

實際的 BannerPlugin 似乎多了些判斷，不過應該可以說是差不多的吧

VuePlugin
---------

這個就沒有要實作了，純粹是我好奇它到底做了什麼，看了之後才發現，原來它是修改設定，加上 build vue 檔案的規則， vue 的檔案實際上會被拆成三個部份編譯 html, js 跟 style ，而 VuePlugin 會加入一個 pitch loader 來偵測目前是載入哪個部份，並修改接下來使用的 loader 來正確的載入每個部份

如果有什麼關於 plugin 的好點子也歡迎提供，之後會再來試試看的，下一篇是 rollup
