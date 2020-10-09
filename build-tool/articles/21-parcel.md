Day 22: Parcel
==============

Parcel 跟 webpack 是個很像的 bundler ，同樣可以打包各種類型的檔案，不一樣的是 Parcel 不用設定就可以處理大部份的情況，用來快速建一個專案很方便，要安裝的話只要：

```shell
$ yarn add --dev parcel-bundler
```

不過目前穩定版的 v1 似乎還不支援 yarn v2 的 pnp ，所以要在 yarn v2 的環境下使用會有點麻煩， v2 則還在開發中

Parcel 的使用
------------

Parcel 的使用也很簡單：

```shell
$ yarn parcel index.html
```

假設你有一個 `index.html` 的話，它就會自動的去讀取 `index.html` 中引入的 js, css 等等的來做打包，另外這個指令是打開一個開發用的 server ，就像 `webpack-dev-server` 一樣，只要你在瀏覽器打開 `http://localhost:1234` 就會看到結果了，只給單個檔案時會假設你的程式是 SPA ，會在找不到路徑時自動用你指定的 html

另外它也可以有多個 html ：

```shell
$ yarn parcel index.html foo/index.html
```

不過這樣就必須要輸入完整的路徑才能看到網頁，也就是要輸入 `http://localhost:1234/index.html` 才行 ，而且也沒有自動的 history fallback 的功能了

如果要輸出打包的檔案的話就用：

```shell
$ yarn parcel build index.html
```

另外上面的指令當然也可以用在多個檔案上

就結論而言，如果要快速的建一個專案，除了使用那個框架提供的樣版，比如 `create-react-app` 或 `vue-cli` 外， Parcel 也是個不錯的選擇，只是用 Parcel 就不會幫你安裝好你要的 React 或 Vue 了，另外也可以用[這邊](https://createapp.dev/parcel)產生的 Parcel 的樣版

下一篇會來試看看建一個 Parcel 的 plugin ，雖然 Parcel 本身已經支援很多，而不怎麼需要 plugin 了
