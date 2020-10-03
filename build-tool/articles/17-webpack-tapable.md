Day 18: webpack tapable
=======================

如果你有在 webpack 的官網上找到關於 tapable 的描述的話，官網上是說 tapable 是 webpack 的骨幹 (backbone) ，在寫 plugin 時一定會碰到它的 API ，所以這邊就來稍微介紹一下

tapable 最重要的就是它的 `Hook` ，這邊來一個簡單的範例：

> 這邊用的是 tapable v2 ，最主要的差別是 v2 移除了一些棄用的 API ，雖然 webpack 4 用的是 tapable v1 ，不過簡單的找了一下，應該是沒有使用到棄用的 API 的，所以這邊就直接使用只有新的 API 的 tapable v2

```javascript
const { SyncWaterfallHook } = require('tapable')
// n 是參數的名字，如果沒有傳 tapable 會不知道有幾個參數
const compute = new SyncWaterfallHook(['n'])

compute.tap('square', (n) => n * n)
compute.tap('addOne', (n) => n + 1)

console.log(compute.call(5)) // 這邊輸出的是 26
```

waterfall hook 會把前一個的執行結果傳給下一個當作輸入，所以第一個執行完後的結果 25 被傳入了下一個函式做加 1

hook 的種類
-----------

tapable 提供了很多種的 hook ，首先就分成了 sync 與 async 兩種，再來根據執行的方式，又有 5 種，分別是：

- normal: 不屬於其它種的，就只是把 `call` 傳入的參數依序傳入用 `tap` 註冊的 callback
- waterfall: 就像上面那樣，會把前一個執行的結果做為下一個的第一個參數傳入，第二個參數以後維持不變，並回傳最後一個 callback 回傳的結果
- bail: 如果 callback 有回傳 `undefined` 以外的值，則會立刻做為回傳值傳回來的，這個很適合用在 resolve 相依性時
- loop: 重覆執行所有的 callback 直到所有的 callback 都回傳 `undefined`

另外 async 的還有兩種執行模式

- series: 執行完一個 async function 才執行下一個
- parallel: 平行執行所有的 async function

照這些模式組合起來一夠有 9 種，因為不是每種都能組合在一起，像 waterfall 這種非照順序不可的就不可能跟 async parallel 組合，最後這 9 種是：

- SyncHook
- SyncBailHook
- SyncWaterfallHook
- SyncLoopHook
- AsyncParallelHook
- AsyncParallelBailHook
- AsyncSeriesHook
- AsyncSeriesBailHook
- AsyncSeriesWaterfallHoo

tapable 的使用
--------------

對於建立 plugin 的這邊要注意的就只有以 tap 開頭的三個函式了：

```javascript
const { AsyncParallelHook } = require('tapable')

const hook = new AsyncParallelHook([])
// tap 是 sync 執行的
hook.tap('sync', () => {})
// tapAsync 則是用 callback 的型式回傳的
hook.tapAsync('async callback', (callback) => {
  callback()
})
// tapPromise 則是 promise
hook.tapPromise('async promise', () => {
  return Promise.resolve()
})
```

而對於呼叫的這邊也有三個函式：

```javascript
const { SyncHook, AsyncParallelHook } = require('tapable')

const syncHook = new SyncHook([])
// call 是用來呼叫 sync 的 hook ，這個函式在 async 的 hook 是沒有的
syncHook.call()

const asyncHook = new AsyncParallelHook([])
// callAsync 是以 callback 的型式呼叫
hook.callAsync((err) => {
  if (err) {
    console.error(err)
  }
})
// promise 則是回傳 promise
hook.promise().then(() => {})
```

有趣的是， tapable 會在呼叫上面三個的任何一個函式時編譯目前所註冊的 callback ，產生一個函式來呼叫，比如像底下的程式：

```javascript
const { SyncHook } = require('tapable')

const hook = new SyncHook([])
hook.tap('a', () => {})
console.log(hook.call.toString())
hook.call()
console.log(hook.call.toString())
```

上面兩次的 `console.log` 的結果是不同的，第一次是這樣：

```javascript
function(...args) {
  this.call = this._createCall("sync");
  return this.call(...args);
}
```

注意上面把原本的 `call` 函式取代掉了，而第二次則變成了：

```javascript
function anonymous() {
  "use strict";
  var _context;
  var _x = this._x;
  var _fn0 = _x[0];
  _fn0();
}
```

已經不再是原本的函式了， tapable 會把所有註冊的 callback 都像這樣展開，另外 `callAsync` 跟 `promise` 也都有一樣的行為，但只要後來又呼叫了 tap 系列的函式， call 系列的又會被回復成第一個的樣子，下次呼叫時又會重新編譯，另外 tapable 目前不支援刪掉已經註冊的 callback

HookMap
-------

`HookMap` 是 tapable 提供的一個 class ，主要是結合 `Map` 與 `Hook` 的功能，可以將 hook 搭配一個 key 來註冊，比如：

```javascript
const { HookMap, SyncHook } = require('tapable')

// 需要傳入一個建立 hook 的函式
const map = new HookMap(() => new SyncHook([]))
// for 回傳的就是一個 SyncHook
map.for('foo').tap('a', () => {})
```

這被用在 webpack 在處理像跟檔案類型有關的 code ，比如 parser 就是類似：

```javascript
const createParser = new HookMap(() => SyncBailHook())

createParser.for('javascript').tap('Javascript', () => new JavascriptParser())
```

另外 tapable 還有兩個功能， `MultiHook` 能像操作單一個 hook 一樣，同時註冊 callback 到多個 hook 上，還有 `interception` ，這個是 tapable 本身的類似 lifecycle hook 的東西，在發生特定事件時會呼叫註冊的 callback ，這邊就不介紹了，有興趣可以去看看

Nuxt.js 的 Hookable
-------------------

雖然我們主要的目前是寫一個 webpack 的 plugin ，不過這邊介紹另一個 plugin 的系統 hookable ：

```javascript
const Hookable = require('hookable')

class Foo extends Hookable {
  async doSomething() {
    await this.callHook('foo')
  }
}

const foo = new Foo()

foo.hook('foo', () => {
  console.log('hook foo')
})

foo.doSomething()
```

hookable 是 Nuxt.js 底下所使用的，沒有像 tapable 一樣有各種模式，也只有 async 的呼叫，相較之下要簡單很多，不過如果只是想簡單的實作 plugin 系統， hookable 或許是個不錯的選擇，另外它支援移除 callback

這篇簡單的介紹了 webpack 底下的 tapable ，下一篇就要實際來寫看看 webpack plugin
