React 介紹與建構環境
====================

> 這篇與之後的程式碼在 https://github.com/ironman-2020/tree/master/static-site-generator

React 要怎麼寫我想應該有一大堆的鐵人賽文章有介紹了，這邊最主要是我想介紹它的特點，以及我為什麼要選擇 React 來做這次的 SSG ，當然有一部份原因是因為我是 React 教徒，但這大概只佔了 30% 左右的原因而已

React 很簡單
------------

我不是指 React 寫起來很簡單 (當然我自己覺得寫起來很簡單)，而是它在概念上很簡單，就是一個函式，輸入資料，輸出頁面 (html)

```javascript
function Component(props) {
  return (
    <div>
      {JSON.stringify(props)}
    </div>
  )
}
```

不過有人覺得 jsx 的語法很可怕，說不定 React 是這樣寫的將會更親民吧，畢竟像我身邊的人一開始看到 React 也是被 jsx 嚇跑的 (另外真的有類似這樣的東西，叫 [`lit-html`](https://lit-html.polymer-project.org))：

```javascript
function Component(props) {
  return `
    <div>My Component with props: ${JSON.stringify(props)}</div>
  `
}
```

React 使用 babel 就能編譯，如果用 Vue ，因為 Vue 有自己的 component 格式，這意謂著我一開始可能就要去應付像 webpack 這樣的 bundler (雖然我也有看到類似能完整轉換 Vue 的 Single File Component 的 babel plugin ，不過我還沒測試過) ，關於這部份的問題之後實際用到 Vue 時會提到

Gatsby
------

雖然這跟 React 本身無關，而是 React 的生態系的一部份， Gatsby 是建在 React 之上的成熟的 SSG，正是這個系列要達成的目標，這個系列會參考 Gatsby 的功能，但不會去抄它的程式碼，如果我真的抄了也會告訴你，實際上也不只是 Gatsby ，本系列還會用到另一個是建立在 React 生態系上的東西， mdx (雖然 mdx 也要開始支援 Vue 了，不過目前還在 alpha 中)，我們會用它來當作一個檔案的資料來源，至於使用起來是什麼樣子，敬請期待

建置環境
-----


介紹完這兩個就是我選擇 React 主要的原因，那麼接下來就開始建環境吧，我們會按部就班來，環境也會慢慢的建起來，這次只要先準備讓 React 的 jsx 也能在 Node.js 下執行的環境就行了

這邊先假設你有安裝 `yarn` 了，推薦是 yarn 1.22 以上的版本，因為你會需要它來安裝 yarn v2 ，本系列一開始說過，我們會用 yarn v2 來做套件管理，關於 yarn v2 的差別，我可以之後寫一篇文章介紹，但不是在這個系列裡，如果你不想跟著使用 yarn v2 也可以用你自己習慣的，總之先來把 yarn v2 安裝起來，要安裝 yarn v2 的話，請執行以下指令：

```shell
$ yarn set version berry
$ # yarn policies set-version berry # 如果你的 yarn 版本低於 1.22 的話你需要用這個指令
```

berry 是 yarn v2 的代號，執行這個指令後 yarn 就會去下載 v2 的執行檔，並把路徑寫到 `.yarnrc.yml` 的設定檔中

接著來安裝 babel 來編譯 React 用的 jsx 與 React 本身：

```shell
$ yarn add --dev @babel/core @babel/register @babel/preset-env @babel/preset-react
$ yarn add react
```

這一步執行完應該多少會注意到 yarn v2 的速度有不少的改進吧，而且沒有超占空間的 node_modules 了 (雖然多了另一個占空間的 `.yarn/cache` ，不過空間的占用量對比下來小很多)，如果你沒有用 yarn v2 也沒關係

接著新增一個檔案在 `src/index.js` 內容如下：

```javascript
import React from 'react'

function App() {
  return <div>Hello world</div>
}

// 這邊就只是要確定 jsx 有正常被處理而已
console.log(App())
```

然後試著執行：

```shell
$ yarn node -r @babel/register src/index.js
```

如果你有看到印出一個 js 的物件，代表你的環境是正確的，為了之後方便，我們把剛剛的指令加到 `package.json` 的 `scripts` 裡：

```json
{
  // ...
  "scripts": {
    "dev": "node -r @babel/register src/index.js"
  },
  // ...
}
```

這樣之後只要用 `yarn dev` 就可以執行了

> 題外話，我自己是使用 [`oh-my-zsh`](https://github.com/ohmyzsh/ohmyzsh) 附的 `yarn` 的外掛，內建有把 `yd` 設定為 `yarn dev` 的別名，因為不是每個人都有這些別名的設定，所以文章中我用的都是完整的指令，不過如果你有用 zsh 很推薦你去裝 `oh-my-zsh` 並習慣一下它設定的別名，可以讓你少打很多字，速度更快 (如： `yarn add --dev` 是 `yad`, `yarn add` 是 `ya`)

下一篇要來介紹 Server Side Render 與一般在 Client Side 的環境有什麼不同
