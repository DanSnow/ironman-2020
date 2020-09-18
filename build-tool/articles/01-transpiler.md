Day 2: Transpiler: babel & postcss
==================================

在開始之前先說一下，接下來這兩篇會是介紹這些工具的背景，並沒有任何的使用與實作，如果你已經知道這些工具的由來或是沒有興趣的，可以從 Day 4 再開始看起

如果你有用過 React 或 Vue 這些現代的前端框架，那你大概也會聽說 babel 這個能讓你使用最新的 js 語法的神奇轉換器，在前端世界最麻煩的就是瀏覽器不只一家，而每一家實作標準的進度並不同，你也沒辦法保證使用者一定是用最新的瀏覽器來打開你的網頁，雖然有這些酷炫的新語法出現，可是卻不一定能直接使用，而 babel 最初就是為了解決這個問題存在的，事實上 babel 最一開始叫 6to5 ，顧名思義，它是把 es6 的語法轉換成 es5 的工具，直到後來開始支援 plugin ，加入了更多的語法支援，才成為現在的 babel ，而現在的 babel 可不再只是為了解決語法相容問題而存在的了，比如 React 用的 JSX 也是靠 babel 做轉換的，而 JSX 原先是 React 為了讓開發者能在 js 裡用像 html 一樣的方式來描述介面所制定的語法擴充， JSX 本身就不是 js 標準的一部份，而 babel 也去支援與編譯它了

postcss 則是轉換 css 語法的工具，這個一般可能就比較少知道了，因為通常是在不知不覺中用到的，不知道各位有沒有聽過 [`autoprefixer`](https://github.com/postcss/autoprefixer) ，它是個能幫 css 中還沒完全被依標準實作的語法自動加上各家瀏覽器特有的前綴的工具，比如你可能會在某些網站的 css 中看到如 `-webkit`, `-moz` 這樣的前綴，像：

```css
.example {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}
```

說不定那就是被 autoprefixer 轉換出來的，原本可能只有一行

```css
.example {
  display: flex;
}
```

瀏覽器在標準可能還沒完全確定時就會開始實作這些新功能，並加上前綴讓開發者使用，不過到這邊其實都是在講 `autoprefixer` 的功能，而 `autoprefixer` 是一套建立在 postcss 之上的工具，而除了用 `autoprefixer` 來加上前綴外， postcss 也有像 babel 一樣的作用，你可以在 css 中使用新的語法，比如除了現在大多都已經支援的 CSS3 外，你還可以使用 CSS4 ，等等，實際上並不存在 CSS4 ， css 從 CSS3 後就已經被拆分成不同的模組了，不同的模組可以各自發佈新的版本，所以… 並沒有一個完整的 css 版本叫 CSS4 ，不過像 selector 的部份確實是有第 4 版的，可以去看看

而在標題中的 Transpiler 中文似乎翻譯為轉譯器，維基上則是用 `Source-to-Source Compiler` ，它可說是一種比較狹義的編譯器，只負責把程式碼轉換成程式碼，不管是不是轉換到同一個語言，不管是 babel 或是 postcss 做的事情都是在把程式碼轉換到程式碼，這些工具讓我們可以放心的使用各種最新的語法而不用太擔心相容性的問題 (畢竟 babel 終究不是萬能的，尤其是有 IE 的時候)

下一篇是要來講 bundler
