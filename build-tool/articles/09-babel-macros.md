Day 10: babel macro
===================

babel macro 是一個 babel 的 plugin ，它可以讓你把特殊的 babel 的 plugin 當成 package 來引入使用，這在 `create-react-app` 這類的無法客制化的環境下也可以使用自己的 plugin ，只要那個 plugin 支援 macro 就行，比如像 `idx.macro`:

```javascript
import idx from 'idx.macro'

const obj = {}

const x = idx(obj, obj => obj.a.b.c)
```

`idx.macro` 的功能是像 optional chaining 的功能，簡單來說上面就像是 `obj?.a?.b?.c` ，而轉換後則會像這樣：

```javascript
var _ref;

const obj = {};
const x = (_ref = obj) != null ? (_ref = _ref.a) != null ? (_ref = _ref.b) != null ? _ref.c : _ref : _ref : _ref;
```

這在沒有 optional chaining 時是個很好用的東西，雖然會多個像 function call 的東西還是沒有 optional chaining 好用就是了

babel macro 只需要在 `babel.config.js` 中加入一次 `babel-plugin-macros` 就可以了，之後也不用再改設定就可以直接使用這些 macro ，就像完全不用設定的一個 plugin 一樣，而 macro 在程式中就像是一個變數，某種程度上的限制了使用方法，雖然不像完整的 babel plugin 那樣什麼都能轉換 (因為是一定要能用變數的地方，比如把 const 轉成 var 就做不到) ，卻也簡化了 macro 的開發，也還是能處理大部份的使用情境

這邊再來介紹另一個強大的 babel macro [`preval.macro`](https://github.com/kentcdodds/preval.macro) ，它能在編譯時執行指定的程式碼，並把結果取代回原本使用的位置，比如：

```javascript
import preval from 'preval.macro'

console.log(preval`
const pkg = require('./package.json')
module.exports = pkg.version
`)
```

這樣就可以把 `package.json` 中的 `version` 包含到編譯出的結果了，你可能會說這不是只要引入 `package.json` 就行了嗎？這邊有兩點不同：

1. 這代表你的程式就算預先編譯完就可以運作 (比如沒有相依性，或是用 webpack 打包所有的相依套件) 也還是需要 `package.json` 檔案，使用 preval 的版本會直接嵌進程式碼中
2. webpack 中如果引入 json 檔，會把整個檔案都包進結果中，包含如 `dependencies` 等可能對打包結果不重要但不小的欄位，這點在 rollup 中做的比較好，如果只有用到 `import { version } from './package.json'` 就只會包含 `version`

另外雖然不常使用到，不過 babel macro 是可以傳入設定的，設定檔有幾種不同的格式，詳細可以參考[這裡](https://github.com/kentcdodds/babel-plugin-macros/blob/master/other/docs/user.md#config) ，這邊就用 `babel-plugin-macros.config.js` ，然後要依據 macro 指定的鍵值來設定，比如 styled-component 的設定是用 `styledComponents`:

```javascript
module.exports = {
  styledComponents: { pure: true },
}
```

到這邊應該認識到 macro 的強大了吧，下一篇再來介紹怎麼寫 macro
