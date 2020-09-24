Day 9: babel scope & helpers
============================

這邊的 scope 就是指變數的作用域， babel 在解析時也會去分析變數的使用情況，於是我們就有機會判斷一個變數實際的值是什麼，或是可以用來避免增加新的變數時與原本的名稱衝突到，比如我們想要準備一個暫時的變數：

```javascript
module.exports = function ({ types: t, template }) {
  return {
    visitor: {
      // Program 是整個程式，所以這邊其實會把變數加在程式的開頭
      Program(path) {
        // 產生一個不衝突的 id ，並且名字會包含 `myVar`，
        // 這邊的 `myVar` 是命名的提示， babel 會在變數名稱內包含這個字，
        // 如果沒指定，那就會是 `temp` ， babel 產生的變數開頭都會是 _ ，
        // 所以沒衝突的情況下，實際的變數會是 `_myVar`
        const id = path.scope.generateUidIdentifier("myVar");
        path.unshiftContainer(
          "body",
          // 這相於 `let _myVar = 42`
          t.variableDeclaration("let", [
            t.variableDeclarator(id, t.numericLiteral(42)),
          ])
        );
      },
    },
  };
};
```

重新命名變數
------------

babel 也可以用來重新命名變數，比如把程式中變數的名字全部改短 (簡單來說就是 minifier 在做的事)：

```javascript
const foo = 42

console.log(foo)

// 變成
const a = 42
console.log(a)
```

```javascript
module.exports = function ({ types: t, template }) {
  return {
    visitor: {
      Program: {
        exit(path) {
          // 這邊只用了 26 個變數名
          const available = 'abcdefghijklmnopqrstuvwyxz'.split('')
          // 走訪 scope 中全部的 binding (如變數或是函式的名字等)
          for (const name of Object.keys(path.scope.bindings)) {
            let newName = available.shift()
            // 用來防止因為名字衝突而出 bug 的
            while (path.scope.hasBinding(newName)) {
              newName = available.shift()
            }
            // 重新命名
            path.scope.rename(name, newName)
          }
        }
      }
    }
  }
}
```

這邊做的其實非常陽春，只有處理最上層的變數而已，如果是寫在函式中的區域變數就沒有處理了，而且 26 個字母用完就沒有了，正常的 minifier 會開始用兩個字母組變數名稱等等的

`@babel/helper-module-imports`
------------------------------

如果你需要引入某個 package 的話，你可以用 `@babel/helper-module-imports` ，像這樣：

```javascript
const { addNamed } = require('@babel/helper-module-imports')

module.exports = function ({ types: t }) {
  return {
    visitor: {
      Program(path) {
        const id = addNamed(path, 'add', 'lodash')
        path.unshiftContainer('body', t.callExpression(id, [t.numericLiteral(1), t.numericLiteral(2)]))
      }
    }
  }
}
```

這樣你就可以從 lodash 引入 add 來使用了，但引入的名字也跟 babel 在產生暫時變數時一樣，你傳給 babel 的名字會拿來參考並產生一個不會衝突的變數，所以通常引入的函式名會變成 `_add`

上面的程式如果要測試你必須要在自己本機安裝 `@babel/core` 跟 `@babel/helper-module-imports` 才行， AST Explorer 並不支援引入套件使用

下一篇要來介紹 babel macros ，它本身也是個 babel 的 plugin ，不過它能讓你把特定的 plugin 像平常引入套件一樣的引入使用，寫起來也比完整的 plugin 要來的簡單，可以用在一些簡單的轉換上
