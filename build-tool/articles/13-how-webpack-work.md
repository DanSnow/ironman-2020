Day 14: webpack 是如何運作的
============================

> 這篇的完整的程式可以到 https://github.com/DanSnow/ironman-2020/tree/master/build-tool/packages/simple-bundler

為了方便說明，這邊就直接用 babel 建一個簡單的版本出來吧

確定相依關係
------------

第一步是要確定各個檔案間的相依關係，這樣才能知道要處理哪些檔案等等的資訊，這邊我們建立一個 class 叫 `Module` 來代表一個檔案

```javascript
import { dirname, resolve } from 'path'
import { parseAsync, traverse } from '@babel/core'

export class Module {
  constructor({ path, code }) {
    this.path = path
    this.dir = dirname(path)
    this.code = code
    this.dependencies = []
  }

  async parse() {
    this.ast = await parseAsync(this.code)
    traverse(this.ast, {
      ImportDeclaration: (path) => {
        // 找出所有的 import
        this.dependencies.push(resolve(this.dir, path.node.source.value))
      },
    })
  }
}
```

再來我們需要一個 queue 來依序處理檔案：

```javascript
import { readFile } from 'fs/promises'
import { Module } from './module'
import pMap from 'p-map'

export class Bundler {
  constructor(entry) {
    this.entryPath = entry
    this.modules = {}
  }

  async execute() {
    this.entry = await this.loadModule(this.entryPath)

    // 紀錄看過的檔案
    const seen = new Set()
    // 就是 Queue
    let queue = [this.entry]
    while (queue.length) {
      const mod = queue.shift()
      seen.add(mod.path)

      // cache 處理過的 module
      this.modules[mod.path] = mod
      await mod.parse()

      // 載入所有還沒處理的相依性
      const mods = await pMap(
        mod.dependencies.filter((path) => !seen.has(path)),
        this.loadModule
      )

      // 加入 queue 中
      queue = queue.concat(mods)
    }
  }

  async loadModule(path) {
    const code = await readFile(path, 'utf-8')
    return new Module({ path: path, code })
  }
}

```

轉換程式碼
----------

這步要把 import 與 export 都轉換掉，讓我們可以加入自己的載入模組，與匯出 API 的邏輯，這邊我就直接加在原本的 `Module.parse` 一起處理了：

```javascript
const requireTemplate = template('const %%imports%% = require(%%file%%)')

export class Module {
  async parse() {
    this.ast = await parseAsync(this.code)
    traverse(this.ast, {
      ImportDeclaration: (path) => {
        const file = path.node.source.value

        const dep = resolve(this.dir, file)

        this.dependencies.push(dep)

        // 把 import 轉成 object destruction
        const imp = path.node.specifiers.map(extractImport)
        const imports = t.objectPattern(
          imp.map(([key, value]) => t.objectProperty(t.identifier(key), t.identifier(value)))
        )

        // 把 import 取代成 require
        path.replaceWith(
          requireTemplate({
            imports,
            file: t.stringLiteral(relative(this.context, dep)),
          })
        )
      },

      ExportDeclaration: (path) => {
        // 把 export foo 取代成 exports.foo = foo...
        path.replaceWith(
          t.assignmentExpression(
            '=',
            t.memberExpression(t.identifier('exports'), getIdentifier(path.node)),
            // 確保值是 expression
            template.expression.ast(`(${generate(path.node.declaration).code})`)
          )
        )
      },
    })

    this.transformedCode = generate(this.ast).code
  }
}

function extractImport(specifier) {
  if (t.isImportDefaultSpecifier(specifier)) {
    // default import 的話那 key 就是 default 了
    return ['default', specifier.local.name]
  } else if (t.isImportSpecifier(specifier)) {
    return [specifier.imported.name, specifier.local.name]
  }
}

function getIdentifier(node) {
  if (t.isExportNamedDeclaration(node)) {
    return t.identifier(node.declaration.id.name)
  } else if (t.isExportDefaultDeclaration(node)) {
    // default export 的 key 就是 default
    return t.identifier('default')
  }
}
```

看到這邊你可能會覺得，我們這不是在把 es6 module 轉成 commonjs 嗎？是的，因為 commonjs 是可以單純只用 js 實作出來的，因此對於 bundler 來說這是個很好用的實作， webpack 實際上也會把 code 轉成類似 commonjs 的格式

實作 runtime
------------

再來要實作一段程式來提供 require 與 exports ，問題是要怎麼提供呢？目前我們已經有了轉換過的程式碼了，我們只要把它們都包進一個函式，並用 require 與 exports 當成參數就行了，像這樣：

```javascript
function (require, exports) {
  // 轉換過的程式碼
}
```

再來就是要實做 require 的邏輯了：

```javascript
// 包好的程式碼會放進這個 object 裡
const modules = {}

// 這個是放程式的 export 出來的東西
const exportCache = {}

function require(name) {
  // cache 中有的話就不要重覆執行了
  if (exportCache[name]) {
    return exportCache[name]
  }

  const exports = {}
  // 沒有的話就執行一次，並加入 cache 中
  modules[name].call(null, require, exports)
  exportCache[name] = exports
  return exports
}

require('進入點')
```

產生程式碼
----------

再來要把上面的 runtime 跟之前轉換好的 code 都輸出到一個檔案中:

```javascript
export class Bundler {
  generate() {
    return runtimeTemplate(Array.from(Object.values(this.modules)), this.entry.id)
  }
}

// 把程式跟 runtime 組合起來
function runtimeTemplate(modules, entry) {
  return `
const modules = {
  ${modules.map((mod) => `'${mod.id}': ${wrapCode(mod.transformedCode)},`).join('\n')}
}

// 省略 require 的實作

require('${entry}')
`
}

// 把程式碼包進函式中
function wrapCode(code) {
  return `function (require, exports) {
    ${code}
  }`
}
```

最簡單的 bundler 就完成了，真的就這樣，目前要打包的程式的位置是寫死的，你可以打開範例的程式碼自己執行看看：

```shell
$ yarn node -r @babel/register src/index.js
```

當然 webpack 實際上做的東西還要來的更多，比如這個簡化的 bundler 在引入時就沒辦法省略副檔名，當然引入其它類型的檔案是完全不行的，這部份就是 webpack 的 loader 所做的事了， loader 會把其它類型的檔案也轉換成 webpack 所能處理的 js 檔，像 css 就是以字串的形式附在程式碼裡，而圖片等則是以檔名的形式

下一篇就來介紹 webpack 的 loader 在做什麼
