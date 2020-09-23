Day 8: 第一個 babel plugin
==============================

介紹了這麼多，我們終於要來介紹怎麼寫個 plugin 了，這邊會盡量涵蓋大部份的用法，不過如果還是有缺的話可以去看超詳細的 [Babel Handbook](https://github.com/jamiebuilds/babel-handbook)，不過它的中文並沒有翻譯完

存取節點
-------

首先你總要先找到要修改的節點，這邊假設我們要幫一個特定的函式 `myFunction` 加上除錯用的資訊，這邊就只加上檔名就好，而這個 `myFunction` 是長這樣的：

```javascript
function myFunction(data, optionalFilename)
```

使用者可以自己在 `optionalFilename` 傳入自己想要的名字，或是由 plugin 加上去，第一步就是打開 [AST Explorer] 並寫個簡單的測試程式來確定 AST 會長怎樣：

```javascript
myFunction(foo, __filename)
```

而結果像這樣

![ast](https://i.imgur.com/I52Lmta.png)

由於我們要能判斷使用者傳入了幾個參數，也要能確定使用者是呼叫我們的函式，所以這邊選擇在 `CallExpression` 這邊做處理：

```javascript
// babel 的 plugin 可以用 module.exports ，或是 es6 的 export default 都行的
// 函式的第一個參數數就是使用者正在使用的 `@babel/core`
module.exports = function ({ types: t }) {
  return {
    name: 'add-debug-information', // plugin 的名字，這不一定要加
    // pre(state) {}, // 要處理一個新的檔案時會呼叫這個函式
    // post(state) {}, // 完成處理一個檔案時呼叫的函式
    visitor: {
      CallExpression(path) {
        console.log(path) // 這邊就可以取得 CallExpression
      },
      // babel 可以在進入節點或是離開節點時呼叫 plugin 的函式，不過因為通常只會需要在進入節點時處理，
      // 所以 babel 讓使用者可以簡寫成上面那樣，如果要實際在進入與離開時存取節點的話要寫成像這樣
      // CallExpression: {
      //   enter() { // 進入時
      //   },
      //   leave() { // 離開時
      //   },
      // }
    }
  }
}
```

判斷是否是目標節點
---------------

下一步就是要判斷是不是我們要做處理的節點了，這邊就先只簡單的判斷兩個條件，函式名稱是 `myFunction` 並且只有傳入一個參數：

```javascript
// 這邊只寫 CallExpression 的內容
if (
  t.isIdentifier(path.node.callee, { name: 'myFunction' }) && // 判斷函式的名稱是 `myFunction` ，這邊的 t 就是 babel 傳進來的 types ，可以回去看一下 plugin 的開頭
  // 另外也可以直接判斷 node 的 name 像： t.isIdentifier(path.node.callee) && path.node.callee.name === 'myFunction'
  
  path.node.arguments.length < 2) { // 確定沒有傳入第二個參數
  // 處理目標節點
}
```

如果要判斷的目標比較複雜，目前也沒有比較好的方法，只能像這樣做比較，另外因為 babel 中只能拿的到 AST 資訊，如果要判斷型態等等的幾乎是沒辦法的，因此實際在寫 plugin 時必須盡可能考慮所有合理的寫法，**若真的沒辦法處理時則要特別告訴使用者必須照著某種格式寫，否則不會處理**

修改節點
------

在已經找到目標節點的情況下，我們要來把檔名加入參數中，這邊我們直接加入 node 下的 `__filename` 變數，這個變數在 node 的模組中會是那個原始碼檔案的檔名

```javascript
// 在上面的 if 中
path.pushContainer('arguments', t.identifier({ name: '__filename' }))
// 另外若要加在開頭可以用 unshiftContainer
```

還記得之前我們曾直接修改 AST 的內容嗎？為什麼這次要用到 `pushContainer` 呢？直接用 `push` 加到 `arguments` 內不行嗎？這邊最大的差別在於 plugin 新增了節點，如果有節點的新增刪除等改變， babel 也必須要去走訪新的節點，因此這邊要用 babel 的 API 讓它知道有節點改變

到這邊完整的程式碼如下：

```javascript
module.exports = function ({ types: t }) {
  
  return {
    name: 'add-debug-information',
    visitor: {
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee, { name: 'myFunction' }) && path.node.arguments.length > 1) {
          path.pushContainer('arguments', t.identifier('__filename'))
        }
      }
    }
  }
}
```

接下來我們再來看看其它範例

移除節點
-------

那假如今天要在正式環境把除錯資訊移除掉的話，這邊我們就把 `myFunction` 第二個以後的參數都移除掉：

```javascript
module.exports = function ({ types: t }) {
  return {
    visitor: {
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee, {name: 'myFunction'})) {
          while (path.node.arguments.length > 1) { // 只要參數數量超過 1 個
            path.get(`arguments.1`).remove() // 就把第二個參數移除，而下一個會補上來，所以再下一次的迴圈會再移除掉下一個
          }
        }
      }
    }
  };
}
```

`path` 的 `get` 可以用來取得指定位置的 `Path` 物件，可以用來對特定的子節點處理

取代節點 & template
------------------

這次需求變成了在程式碼內加上對於 `NODE_ENV` 的判斷，如果是 production 就不要有除錯資訊，結果像這樣：

```javascript
// 原本
myFunction(data)

// 轉成
process.env.NODE_ENV === 'production' ? myFunction(data) : myFunction(data, __filename)
```

> 上面的程式碼在正式環境中通常不會真的多出一個判斷，因為一般的 bundler 會把 NODE_ENV 換成字串常數，然後就會再由 minifier 移除掉不用的部份

因為這邊要產出的程式碼變多了，這次我們就來用 template

```javascript
module.exports = function ({ types: t, template }) {
  // 這邊使用到的 `%%data%%` 是代表等下我們可以放節點去取代那個位置，只用用兩個 `%` 包起來即可，
  // 由於這個是 babel 7.4 以後才支援的語法，如果要支援以前的版本，就要把它改成像 `DATA` (一定要全大寫)
  // template 的回傳值是一個函式
  const tpl = template(`process.env.NODE_ENV === 'production'
  ? myFunction(%%data%%)
  : myFunction(%%data%%, %%source%%);`)
  
  // 用來標記已經走訪過的節點用的，這邊用 Symbol 可以保證不會發生名稱的衝突
  const visited = Symbol()
  
  return {
    visitor: {
      CallExpression(path) {
        // 檢查節點是否走訪過
        if (path.node[visited]) {
          return
        }

        if (t.isIdentifier(path.node.callee, {name: 'myFunction'})) {
          // 替換節點
          path.replaceWith(
            // tpl 是一個函式，只要把 placeholder 的部份傳進去，就會回傳 AST 給我們
            tpl({
              // 這邊要避免使用者並沒有傳入第一個參數，不然後面的參數會變成第一個參數
              // 也可以丟出 error 或是讓 myFunction 在 runtime 時判斷
              data: path.node.arguments[0] || t.identifier('undefined'),
              // 這邊如果使用者自己有提供除錯資訊就用使用者提供的，不然就用 __filename
              source: path.node.arguments[1] || t.identifier('__filename')
            })
          )
          // 把節點下的 `myFunction` 都標記為走訪過
          path.node.consequent[visited] = true
          path.node.alternate[visited] = true
        }
      }
    }
  }
}
```

之前說過，要是新加入節點 babel 也會去走訪它，而我們加入的節點就包含了我們要處理的目標節點，若不特別處理的話就會一直無限的走訪下去，因此這邊把新增的節點加上自己的標記，這樣就可以避免重覆處理到

丟出 error
---------

在上一個例子中為了要避免使用者少傳參數而給了預設值，那如果是少傳時要拋出 error 又要怎麼做呢

```javascript
module.exports = function ({ types: t, template }) {
  // 跟上一個範例基本上一樣
  const tpl = template(`process.env.NODE_ENV === 'production'
  ? myFunction(%%data%%)
  : myFunction(%%data%%, %%source%%);`)
  
  const visited = Symbol()
  
  // 建一個函式來幫忙拋出 error ，如果 throw expression 支援的話或許就不用了
  function throwMissingArgument(path) {
    // 這邊用 path 上的 buildCodeFrameError ，這樣顯示時就會標記有問題的 code 在哪了
    throw path.buildCodeFrameError('`myFunction` required at least 1 argument')
  }
  
  return {
    visitor: {
      CallExpression(path) {
        if (path.node[visited]) {
          return
        }

        if (t.isIdentifier(path.node.callee, {name: 'myFunction'})) {
          path.replaceWith(
            tpl({
              // 這邊就改用 throwMissingArgument
              data: path.node.arguments[0] || throwMissingArgument(path),
              source: path.node.arguments[1] || t.identifier('__filename')
            })
          )
          path.node.consequent[visited] = true
          path.node.alternate[visited] = true
        }
      }
    }
  }
}
```

如果你沒傳參數的話應該就會看到 babel 印出這樣的 error

```plain
code.js: `myFunction` expect at least 1 argument
> 1 |   myFunction()
    |   ^^^^^^^^^^^^
```

到這邊我們已經寫出了第一個 babel plugin，下一篇要來介紹 babel 所提供的 `Scope` 這個物件
