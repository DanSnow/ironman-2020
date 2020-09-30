Day 15: Universal Javascript
============================

在 SSR 誕生時就出現了一種對於某種程式碼的稱呼 Isomorphic Javascript ，這種程式碼會把與環境相關的部份包裝成同樣的 API ，並靠著 bundler 或其它方式自動在不同的環境切換實作，使得上層的程式可以用同樣的 API 執行在不同的環境中，而到後來，有人覺得 Isomorphic 這個稱呼不好，應該要強調同樣的程式可以執行在 Client 跟 Server 的部份，於是現在稱為 Universal Javascript

其實要寫出 Universal Javascript 沒有很複雜，不如說其實我們的 blog 的部份目前就已經是了，不管是在 Client 或是在 Server 都能執行，不過目前還不會產生一樣的結果就是了，我們還缺少了我們的元件在 Client 端組合起來的部份，這在下一篇會來處理，這邊先來介紹哪些 API 能用，哪些又不能用，不能用的又有沒有什麼解決方法

以網頁而言最容易用到，又跟環境有關的 API 大概就是 http client 了，而能同時在 Client 跟 Server 執行的 http client 其實也已經很多了，比如像很有名的 [`axios`](https://github.com/axios/axios) 或是本系列使用的 [`ky-universal`](https://github.com/sindresorhus/ky-universal) ，只要使用這類的函式庫，不管你在 Server 或 Client 都能呼叫 API

Node.js 內建的套件除了幾個跟作業系統明顯有相關的，比如讀寫檔案，開啟子程式等等的，大多其實都有人寫了可以在網頁使用的版本，這部份看 [webpack 支援哪些套件](https://github.com/webpack/node-libs-browser) 可說是最準的，比如想在網頁使用 `path` 也是可以的，只要改用 [`path-browserify`](https://github.com/browserify/path-browserify) 的話

那如果碰到了真的沒辦法在 Server 使用的 API ，或是一定要在 Client 執行的程式又該怎麼辦呢？只能在 Client 執行的程式其實之前就有提過一個解決方法了，就是包在 React 中那些只會執行在 Client 的 lifecycle 或是 hook 中，比如 `useEffect` ，那 Server 的 API 呢？我們需要一個判斷是不是 Server 的方法，並寫判斷，讓程式只在 Server 執行，最常用的判斷就是這種方式：

```javascript
if (typeof window === 'undefined') {
  // 在 Server 端做點什麼
}
```

比如載入只應該在 Server 端跑的套件

另外也不一定要用寫判斷的方式，比如有使用到 webpack 的時候就可以透過設定 webpack 的方式讓它在 client 端載入不同的檔案：

```javascript
module.exports = {
  resolve: {
    // 像這樣的設定就會讓 webpack 優先載入副檔名是 `.browser.js` 的檔案
    extensions: ['.browser.js', '.js'],
  }
}
```

如果碰到 Client 沒辦法執行的套件，只要不是必要的話 (比如你相依的套件 `foo` 相依到了這樣的套件 `bar` ，但又不好直接改 `foo` 的程式) ，那你也可以利用 webpack 的 alias ，把 `bar` 設定成一個空檔案的別名，這樣就解決了

關於 webpack 的介紹可以看我另一個系列[講到 webpack 的這篇](https://ithelp.ithome.com.tw/articles/10245951)

下一篇要來加上 webpack 並把 js 加回去前端
