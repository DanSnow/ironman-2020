Day 6: babel 是如何運作的
=========================

前面提過 babel 是個把程式碼編譯成程式碼的工具，本質上它還是個編譯器，所以它在做的事基本上就是編譯器在做的事，不過這邊會避免對編譯器的部份講的太細，重點是只要知道 babel 的工作流程就好了

轉換成 AST
---------

第一步可說是是編譯器的基本功，透過 parser 將原始碼轉換成抽象語法樹 (AST)，顧名思義就是描述語法的資料結構，這步裡一般編譯器都會做兩件事，語法分析與語義分析，語法分析是去定義原始碼中哪些東西應該被視為一個單位，就像單字一樣，再來是語義分析，判斷這些單位組合成的是哪個語法，比如 for 迴圈，在這一步中實際上， plugin 幾乎什麼事情也不能做，因為 babel 並不支援改變 parser 的流程

但 babel 其實有幾個內建的 parser plugin ，這部份可以由 plugin 去開關，不過這一般也會透過官方的 plugin 去開關這些功能，主要是確保不會直接使用到 babel 內部的選項，這就是 babel 官方 plugin 的名字中帶有 `syntax` 的 plugin 在做的事

這邊要介紹一個工具 [AST Explorer](https://astexplorer.net) ，它可以讓你可以看到各種語言的 AST 語法樹，也可以在這上面測試 babel plugin ，這對於要寫 babel plugin 的人而言非常方便，之後我們也會實際使用這個工具來幫助我們寫一個 babel plugin ，這邊來一段範例程式吧：

```javascript
function answer() {
  return 'The answer to life, the universe and everything'
}
```

轉成 AST 後大概會是這種感覺，這邊用 json 表示並省略了位置等資訊：

```json
{
  "type": "File",
  "program": {
    "type": "Program",
    "body": [
      {
        "type": "FunctionDeclaration",
        "id": {
          "type": "Identifier",
          "name": "answer"
        },
        "body": {
          "type": "BlockStatement",
          "body": [
            {
              "type": "ReturnStatement",
              "argument": {
                "type": "StringLiteral",
                "value": "The answer to life, the universe and everything"
              }
            }
          ]
        }
      }
    ]
  }
}
```

> 補充一下： ASTExplorer 支援很多程式語言， js, css, go, python 等等，有興趣可以多玩看看

走訪 AST
-------

babel 會依序訪問每個 AST 上的節點，並呼叫 plugin 對應的函式，是的，這步才是 plugin 工作的時間，在走肪時 babel 會為每個節點建立一個叫 Path 的物件，這個物件會包含這個節點的資訊，也可以讓你訪問這個節點的父節點或子節點，同時在這個物件上也會有各種方法讓你來修改節點的內容與結構，比如像替換掉一個結點

```javascript
export default function (babel) {
  const { types: t } = babel;
  
  return {
    visitor: {
      StringLiteral(path) { // 如果遇到一個字串常數
        // 常數的內容是指定的字串
        if (path.node.value === 'The answer to life, the universe and everything') {
          path.replaceWith(t.numericLiteral(42)) // 換成數字的 42
        }
      }
    }
  };
}
```

上面這段程式碼你就可以去 AST Explorer 試試看了， AST Explorer 上面的個 `Transform` 的選單，選 babelv7 底下就會多一個編輯器讓你輸入，上面的程式碼就可以直接使用了

產生程式碼
--------

最後 babel 會把修改過的 AST 再轉回程式碼，這步同樣的 plugin 也沒有辦法做什麼

```javascript
function answer() {
  return 42;
}
```

接著剩下的工作就是看是要印出來，還是寫入檔案，或是再做進一步的處理都是可以的，轉換回原始碼後其實 babel 的工作就結束了，到這邊我們對於 babel 的基本原理已經有所認識了，下一篇要正式的來寫我們的第一個 babel plugin
