Day 21: rollup plugin
=====================

rollup 的 plugin 要比 webpack 要來的簡單多，另外 rollup 也有提供一個給寫 plugin 用的 utils ，只要安裝：

```shell
$ yarn add @rollup/pluginutils
```

rollup 也有各種的 hook ，不過 rollup 的 hook 要來的簡單的多，如果要寫一個 rollup 的 plugin 大概像這樣：

```javascript
// 這就是為什麼大部份的 rollup plugin 都是一個函式
export default function plugin() {
  return {
    // plugin 的名字，主要是 debug 用
    name: 'my-plugin',

    // 如果有想要修改 options 的話可以在這邊改
    options(options) {
      return null
    },

    // source 是引入時的檔名，比如 `import './lib'` 那 source 就會是 `./lib`
    // importer 則是載入它的檔案
    resolveId(source, importer) {
      // 回傳代表 module 的 id ，這在之後的 hook 會用到
      // 通常若是真的檔案就要回傳檔案的完整路徑，這邊實際上是不對的
      return source

      // 也可以回傳 null 代表這個不是這個 plugin 負責的
    },

    // id 是 resolveId 回傳的值，這邊要根據 id 回傳檔案的內容
    load(id) {
      return ''
    },

    // 可以對 code 做轉換
    transform(code, filename) {
      return code
    },

    // 這個 hook 是已經產生要輸出檔案了，這邊是修改要輸出的檔案或是新增額外的檔案的好時機
    generateBundle() {},

    // 這邊則是檔案內容已經確實寫到檔案，如果需要輸出檔案可以用這個 hook
    writeBundle() {}
  }
}
```

上面也同時是幾個我覺得比較會用到的 hook

產生虛擬的檔案
--------------

這個功能在 webpack 一般可能會是像 `vue-loader` 那樣的做法，讓 loader 根據情況與檔案內容把同一個檔案轉換成不同內容，不過在 rollup 裡可以讓程式能 import 一個完全不存在的檔案，比如有個程式是這樣的：

```javascript
import { foo } from 'non-exist-module'

foo()
```

而 `non-exist-module` 假設是完全不存在的，在 rollup 中就可以分別在 `resolveId` 中給這個 module 一個 id ，再到 `load` 中對這個特定的 id 回傳檔案內容：

```javascript
export function plugin() {
  return {
    resolveId(source) {
      if (source === 'non-exist-module') {
        return source
        // 也可以回傳 '\0non-exist-module'
        // 這是 rollup plugin 之間的一個約定，如果是 \0 開頭的 id ，那絕對是特殊的 id ，只要不是自己負責的就絕對不會處理
      }
      return null
    },

    load(id) {
      if (id === 'non-exist-module') {
        return `export const foo = () => console.log('Hello world')`
      }
      return null
    },
  }
}
```

像這樣就可以有一個不是實際存在的 module 了，在官方的 plugin 中就有一個實作了這樣的功能的 plugin 叫 [`@rollup/plugin-virtual`](https://github.com/rollup/plugins/tree/master/packages/virtual)

json
----

雖然官方有個 json plugin ，不過這邊就用 json 的 plugin 來做範例吧，如果要自己寫一個的話大概會是：

```javascript
import { dirname, resolve } from 'path'
import { access } from 'fs/promises'
import { addExtension, dataToEsm } from '@rollup/pluginutils'

export default function json() {
  return {
    name: 'json',

    // 有些 hook 其實可以是 async 的
    async resolveId(source, importer) {
      // 不要對進入點做處理
      if (importer == null) {
        return null
      }

      // 嘗試加上 .json 的副檔名，並取得完整路徑來做為 id
      // 這邊實際假設了一定是用相對路徑引入的，所以對 `import 'some-module/data.json'` 這種起不了作用
      const id = resolve(dirname(importer), addExtension(source, '.json'))
      try {
        // 測試檔案是否存在
        await access(id)
        return id
      } catch {
        // 不存在就回傳 null 讓下一個 plugin 或是 rollup 去處理
        return null
      }
    },

    transform(code, filename) {
      if (filename.endsWith('.json')) {
        // dataToEsm 是 rollup 的 pluginutils 提供的函式，可以把 js 的 object 轉成 es6 module 的 code
        return dataToEsm(JSON.parse(code))
      }
      return null
    },
  }
}
```

這個 plugin 跟官方的不同點在於官方的只有實作 transform 的部份，所以引入時一定要帶 `.json` 的副檔名，但這個版本的不用

下一篇就來講 parcel 這個幾乎完全不用設定的 bundler 界的新人 (相較之下的話，說來還有個 esbuild)
