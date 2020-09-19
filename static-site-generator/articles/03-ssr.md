Day 4: 介紹 Server Side Render
==============================

React 的 server side renderer 是在 `react-dom` 這個套件的 `react-dom/server` 下，API 就只包含 4 個函式：

回傳字串的：

- renderToString
- renderToStaticMarkup

回傳 stream 的：

- renderToNodeStream
- renderToStaticNodeStream

4 個的參數都一樣，只要傳入要渲染的元件就行了，我們基本上都會用字串的版本，使用方法如下：

```javascript
import React from 'react'
import { renderToString } from 'react-dom/server'

function App() {
  return <div>Hello world</div>
}

console.log(renderToString(<App />))
```

沒意外應該會看到渲染完的 html ，不過更重要的應該是在 server render 的環境下的 React 跟在 client render 的 React 有什麼不同：

- 由於 render 的過程是 sync 的，因此如果有資料必須一開始就準備好，好消息是這可能會在之後抓資料的 Suspense 出來後有所改變
- 除了 Context ，所有的 hook 都沒有實際作用，如果有回傳值的還是會回傳東西，但它們不會有像在 client 一樣的作用
  (這說法其實並不是很精確，像 `useState` 回傳的第二個值 `setState` 還是可以使用，只是因為不可能在 render 的過程中同步的呼叫)
- class 的 lifecycle 基本上也是沒作用的 (除了已經不被推薦的 `UNSAFE_componentWillMount`)

以下的範例 code 可以來印證上面的說法：

```javascript
import React, { useContext, useEffect, createContext, Component } from 'react'
import { renderToString } from 'react-dom/server'

const Context = createContext('foo')

class Class extends Component {
  state = {
    msg: 'initial',
  }

  // 這個是會執行的
  UNSAFE_componentWillMount() {
    this.setState({ msg: 'will mount' })
  }

  // 這個不會執行
  componentDidMount() {
    this.setState({ msg: 'mounted' })
  }

  render() {
    // 會是 `will mount`
    return <div>msg: {this.state.msg}</div>
  }
}

function Functional() {
  const value = useContext(Context)
  useEffect(() => {
    // 這行是不會在 server 印出來的
    console.log('effect')
  })

  return <div>context: {value}</div>
}

function App() {
  // 其實原本想用 Fragment 的簡寫 <> ，但 ithelp 的語法上色會出問題…
  return (
    <div>
      <Class />
      <Functional />
    </div>
  )
}

console.log(
  renderToString(
    <Context.Provider value={'foo'}>
      <App />
    </Context.Provider>
  )
)
```

但因為我們要自己實作 SSG ，所以我們還是要想辦法解決抓取資料的問題，但在那之前先放著吧
