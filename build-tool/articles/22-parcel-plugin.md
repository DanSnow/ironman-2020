Day 23: Parcel plugin
=====================

> 這篇的範例程式碼在 https://github.com/DanSnow/ironman-2020/tree/master/parcel-demo

雖然上一篇說 Parcel 不用設定就可以處理大部份的情況，不過 Parcel 還真的沒有設定檔，只要使用者有安裝 plugin ， Parcel 就會自動去載入，所以如果要處理特殊的檔案只需要安裝 plugin 就好了，這邊就嘗試來幫它寫一個 plugin

接下來的內容是以 Parcel v1 為主，不過 Parcel v2 已經進入 beta ，而且 API 還改不少，不過好處是 v2 的文章比較完整了，這篇接下來的內容在 v1 的文件中是沒寫那麼詳細的

Parcel 的 API ，主要分成兩個部份 `Asset` 與 `Packager`

`Asset`
-------

在 Parcel 中一個檔案就會被定義成一個 `Asset` ，每個 `Asset` 可以有相依性，可以定義自己該怎麼被轉換與處理 (在 v2 中轉換的工作被移到了 `Transformer` 中)

```typescript
// 這邊用 ts 來寫定義，這樣還可以順便寫型態出來，比較方便
class Asset {
  type: string // `Asset` 的類型，預設是檔案的副檔名，不過如果想讓這個檔案一起打包進 js 裡就要設成 js
  contents: string // 檔案的內容

  // 覆寫來自訂如何載入檔案
  async load(): Promise<string>
  // 如果有需要先轉換的話可以用這個
  async pretransform(): Promise<void>
  // 轉換成 ast ，不需要的話其實也可以什麼都不做
  async parse(): Promise<any>
  // 取得相依性
  collectDependencies(): void
  // 會在取得相依性後呼叫，可能會做如 minify 之類的
  async transform(): Promise<void>
  // 產生 code
  async generate(): Promise<{ type: string, value: string }>

  // 用來定義這個檔案的相依性用的
  addDependency(dep: string)
}
```

`Packager`
----------

`Packager` 定義要如何把產生的 `Asset` 組合成最後的檔案，所以 js 之所以會打包成一個檔案就是因為 Parcel 內定義了一個 js 的 `Packager` 並把檔案做打包，不過這篇並不會用到

```typescript
class Packager {
  // 檔案的開頭，可以用來寫 runtime 之類的
  async start(): Promise<void>
  // 加入一個 asset
  async addAsset(asset: Asset): Promise<void>
  // 檔案的結尾，同樣可以用來處理 runtime
  async end(): Promise<void>

  // 寫入檔案
  async write(content: string): Promise<void>
  // 結束檔案
  async end(): Promise<void>
}
```

寫個 plugin
-----------

由於 Parcel 是自動找出所有符合 `parcel-plugin-*` 或是 `@scope/parcel-plugin-*` 名字的 plugin 來載入，加上它又不支援 yarn v2 的 PnP ，所以這邊不像之前放在同一個 yarn 的 workspace 中，而是開一個獨立的專案來做，同時我們的 plugin 也要符合它的命名規則才行

這邊就來寫個像 webpack 的 raw-loader 一樣，把檔案當成字串載入的 plugin ，為了能讓 Parcel 能正確的找到 plugin ，這邊把套件的名字設定成 `parcel-plugin-raw`

首先 plugin 的進入點必須要透過 Parcel 的 `Bundler` 的 API 來定義自己要加入哪些 `Asset` 與 `Packager`：

```javascript
module.exports = function (bundler) {
  // 定義副檔名為 `raw` 的用我們的 `RawAsset` 來處理
  bundler.addAssetType('raw', require.resolve('./RawAsset'))
}
```

`RawAsset`
---------

總於進入本篇了，不過實際上內容很簡單就是了：

```javascript
const { Asset } = require('parcel-bundler')

module.exports = class RawAsset extends Asset {
  constructor(name, options) {
    super(name, options)
    // 為了讓檔案被當 js 處理
    this.type = 'js'
  }

  generate() {
    return [
      {
        type: 'js',
        // 把檔案內容用 `JSON.stringify` 處理過後轉成 js 的 module
        value: `module.exports = ${JSON.stringify(this.contents)}`,
      },
    ]
  }
}
```

就這樣，一個超簡單的 plugin 就完成了

結論
----

雖然 Parcel 已經處理好很多檔案類型，提供了使用者的便利，但就結果而言其實也犧牲了很多的彈性，如果想要處理自訂的檔案類型就一定要寫出一個套件當成 plugin 才行，加上 v1 幾乎沒有給寫 plugin 用的開發文件，這個問題看來在 v2 有改善，但現在的穩定版還是 v1 ，如果你的需求正好符合 Parcel 所支援的檔案類型，或是你有找到相關的 plugin 再用吧，雖然 80% 的使用方式應該都涵蓋到了
