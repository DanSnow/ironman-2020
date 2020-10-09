Day 24 postcss 的使用與設定
===========================

postcss 可說是相當於 css 的 babel ，可以轉換 css 的語法，同時它也是個 css 的 parser ，被用在像 stylelint 之類的 linter 的底層，如果要直接在終端機使用需要安裝：

```shell
$ yarn add --dev postcss postcss-cli
```

雖然 postcss 大部份情況下應該是搭配其它的工具，比如 webpack 來使用的，另外只安裝這兩個只是有了 postcss 的指令而已， postcss 本身並沒有做任何事情，所以還要安裝它的 plugin ，這邊就用 autoprefixer 來示範：

```shell
$ yarn add --dev autoprefixer
```

比如你有一個這樣的，檔名為 `index.css` 的 css ：

```css
.example {
  user-select: none;
}
```

你只要下：

```shell
$ yarn postcss -u autoprefixer -o main.css index.css
```

postcss 就會用 autoprefixer 處理你的 css 檔案並輸出成 `main.css` ，而 `main.css` 的內容會像這樣：

```css
.example {
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
}
```

已經幫你加上各個瀏覽器的 prefix 了

`postcss.config.js`
-------------------

postcs 的設定檔叫 `postcss.config.js` ，裡面主要有兩種設定，一種是 plugin 的：

```javascript
module.exports = {
  plugins: [
    // tailwindcss 也是一個 plugin 喔
    require('tailwindcss'),
    require('autoprefixer'),
  ]
}
```

有的 plugin 支援選項的就可以讓你這樣使用：

```javascript
module.exports = {
  plugins: [
    require('postcss-preset-env')({ stage: 0 }),
  ]
}
```

另一種設定是可以改變它的 parser ，比如要直接 parse scss 的話，就可以安裝 `postcss-scss` 然後設定：

```javascript
module.exports = {
  syntax: 'postcss-scss',
}
```

甚至還可以加上一些其它的 plugin 讓 postcss 真的能編譯 scss ，只是那其實不好用，有些語法沒辦法支援

下一篇來寫個 postcss 的 plugin
