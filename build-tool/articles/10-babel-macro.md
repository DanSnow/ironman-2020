Day 11: 寫個 babel macro
==============================

在前一篇有提到寫 babel macro 比較簡單，這邊就來看看一個 babel macro 的基本架構：

```javascript
const { createMacro } = require('babel-plugin-macro')

module.exports = createMacro(({ references, state, babel }) => {
  // macro logic
})
```

`createMacro` 要傳入一個函式，參數會是一個物件，包含幾個東西：

- `references`: 是一個物件，存所有 macro 的地方，格式會是以 import 時的名字為鍵 (default import 則是用 `default`)，值為 path 的陣列
- `state`: babel plugin 在走訪時傳入的第二個參數，內含檔名等資訊
- `babel`: 目前的 `@babel/core` ，使用者可以從這邊取得如 `types`, `template` 等之前用到的 helper
- `config`: 使用者在設定檔傳入的設定可以從這邊取得
- `source`: 引入時用的路徑

其中前三個是比較常用的，所以上面的範例才只用了前三個而已

我們先來一個簡單的來試一下 babel macro 該怎麼用，這次來寫一個在編譯時把 json 變成 js 的 object 的 macro 吧：

> 不過有個說法是 `JSON.parse` 其實比 js 的引擎 parse js 的物件還快，因為 js 的語法實在是太複雜了

```javascript
const { createMacro } = require('babel-plugin-macros')

function parseMacro({ references, babel }) {
  const { template, types: t } = babel
  for (const path of references.default) {
    // 檢查是不是用函式呼叫的型式
    if (!t.isCallExpression(path.parentPath)) {
      throw path.parentPath.buildCodeFrameError('must be call expression')
    }

    // 檢查第一個參數是不是字串
    if (!t.isStringLiteral(path.parent.arguments[0])) {
      throw path.parentPath.get('arguments.0').buildCodeFrameError('must be call expression')
    }

    // 算是個小技巧，因為 json 實際上也是個符合語法的 js 物件
    // 所以這邊幫它左右上上括號丟給 `template.ast` parse 後就有 ast 了
    // 加上括號是強制 babel 把它當成 expression ，不然預設會當成 block statement 就會出錯
    // 就像用 arrow function 回傳物件時也要寫 () => ({ foo: 'bar' })
    const ast = template.ast(`(${path.parent.arguments[0].value})`)

    // 取代掉原本的函式呼叫
    path.parentPath.replaceWith(ast)
  }
}

module.exports = createMacro(parseMacro);
```

假說我們寫好的這個叫 `parse.macro` ，那我們就可以這樣使用：

```javascript
import parse from 'parse.macro

const obj = parse('{"foo": "bar"}')

// 轉換後

const obj = {foo: bar}
```

接著就直接示範個我常用的當範例吧，這個可以讓你在寫 vue 的程式時，在程式碼中混用 react 的 jsx ，畢竟 react 跟 vue 的 jsx 的編譯結果其實不一樣，而我通常的用法是在寫 vue 的程式時，有時需要直接建 DOM 的節點，但又不想用 `document.createElement` 慢慢建，所以就用 [`dom-chef`](https://github.com/vadimdemedes/dom-chef) 加上 jsx 來處理了

```javascript
const { createMacro } = require('babel-plugin-macros')
// 轉換 react 的 jsx 所用的底層套件
const createTransformJSX = require('@babel/helper-builder-react-jsx').default

function domMacro({ references, state, babel }) {
  const { t } = babel

  // 設定遇到 Fragment 時轉換成 DocumentFragment ，這個是看 @babel/plugin-transform-react-jsx 知道的
  state.set('jsxFragIdentifier', () => t.identifier('DocumentFragment'))
  // 裡面的參數基本上是從 @babel/plugin-transform-react-jsx 抄來的
  // `@babel/helper-builder-react-jsx` 把設定 tag 的部份與設定呼叫的函式的部份抽出來變成這兩個參數了
  const visitor = createTransformJSX({
    // 設定 tag 的部份
    pre(state) {
      const tagName = state.tagName
      const args = state.args
      if (t.react.isCompatTag(tagName)) {
        args.push(t.stringLiteral(tagName))
      } else {
        args.push(state.tagExpr)
      }
    },
    // 設定呼叫 `h` 這個函式來建 jsx
    post(state) {
      state.callee = t.identifier('h')
    },
  })

  // 轉換所有使用到的部份
  for (const path of references.default) {
    const value = path.parent.arguments[0]
    path.parentPath.traverse(visitor, state)
    path.parentPath.replaceWithMultiple(path.parent.arguments[0])
  }
}

module.exports = createMacro(domMacro)
```

上面的程式碼並沒有像前一個範候一樣，加上是用什麼方式呼叫的檢查，所以使用時一定要遵守用法，這個假設叫 `jsx.macro` ，它的用法就是：

```javascript
import jsx from 'jsx.macro'
// 需要自己引入 `dom-chef`
import { h } from 'dom-chef'

const node = jsx(
  <div>Hello world</div>
)

document.body.append(node)
```

雖然上面用的 jsx 很簡單，不過當複雜時就會覺得很好用了

下一篇開始要進入 webpack 了
