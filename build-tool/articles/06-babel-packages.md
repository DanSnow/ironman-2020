Day 7: babel packages
=====================

babel 實際上拆成好幾個套件，有些平常基本上也用不到，因為那一般而言是開發 plugin 時才會去接觸到的，這邊就來一一介紹跟 plugin 還有一般使用有關的：

- `@babel/core`: 這其實之前就提過了，這是 babel 最主要的一個套件，它提供了 API 把其它的套件串起來使用，如果你要在程式中呼叫 babel 使用也是用這個套件
- `@babel/traverse`: 這包含了走訪 AST 的部份，也是 plugin 最主要會用到的功能
- `@babel/types`: 這個套件在官方的說明中寫著它相當於針對 AST 的 lodash ，它提供了三種功能，建構 AST 的節點，判斷是不是某種 AST 的節點，與 assert 是不是某種節點
- `@babel/template`: 當你要建構比較複雜的 AST 用的，如果用 `@babel/types` 一個一個節點建立的話可能會很累
- `@babel/parser`: 就是 babel 的 parser ，負責把 code 轉換成 AST
- `@babel/generator`: 負責把 AST 轉回 code

> 如果你在寫 js 但還沒用過 [lodash](https://lodash.com) 或是類似的套件的，推薦你去看看，很好用的，它提供了很多方便的函式

實際使用這些套件大概會像這樣

```javascript
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'

const ast = parse(`function square(n) {
  return n * n
}`)

traverse(ast, {
  Identifier(path) {
    if (path.node.name === 'n') {
      path.node.name = 'x' // 可以直接修改 node 的內容
    }
  },
})

console.log(generate(ast).code)

// 輸出應該會是
// function square(x) {
//   return x * x;
// }
```

上面的提到 `@babel/core` 把其它的套件都串起來了，那就實際來用用看吧：

```javascript
import { transformAsync } from '@babel/core'

transformAsync(
  `function square(n) {
    return n * n
  }`,
  // 第二個參數就是傳入像平常寫在 `babel.config.js` 中的設定的內容
  {
    plugins: [
      {
        visitor: {
          Identifier(path) {
            if (path.node.name === 'n') {
              path.node.name = 'x'
            }
          },
        },
      },
    ],
  }
).then((res) => {
  console.log(res.code)
})
```

但如果你有真的去跑的話，你很可能會發現跑出來的結果跟分開呼叫時不一樣，因為使用 `@babel/core` 的 API 時預設會設定 `sourceType` 為 `module` ，導致最後會加上 `"use strict"` ，另外雖然這邊的 `@babel/core` 的 API 是 `transformAsync` ，但實際上 babel 的轉換過程本身是同步的

雖然 babel 的 core 都有重新 export 底下套件的內容，如果是在寫 plugin 的話，為了避免使用到跟使用者不同版本的套件，應該是要用呼叫 plugin 時傳進來的那個 babel ，而不是使用自己的，所以像上面的那個用法實際上只有在自己用 API 的方式使用 babel 才會出現

上一篇的時候抱歉我記錯了，下一篇終於要來寫第一個 babel plugin 了
