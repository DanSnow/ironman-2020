Day 22: mdx
============

mdx 是個 markdown 的擴充格式，主要特色有：

- 可以引入 React 的 component 與寫 JSX 在 markdown 中
- 產出來的也是 React 的 component

對於基於 React 的 SSG 而言大概沒有比這個更好的格式了，畢竟寫 React 的元件就差不多是在寫 html ，雖然元件可以重覆使用，但如果只是要個簡單的排版， markdown 還是比較方便的

```markdown
import Component from './component'

# MDX

- 可以用 markdown
- 也可以用 React 的 component

<Component />
```

安裝與使用
----------

這邊我們來試著把純靜態的頁面換成用 mdx 試試

要安裝的東西有兩個：

- `@mdx-js/mdx`: 編譯 mdx 的 markdown
- `@mdx-js/react`: 提供可以用來設定 mdx 編譯出來的 component 的 MDXProvider

mdx 大部份的工作是在編譯時完成的，因為我們同時也要在 Server 端進行 render ，所以就不用一般使用的 webpack loader 了，而是自己處理編譯，我們在 routes 新增一個函式來收集 mdx 的頁面：

```javascript
async function collectMdxRoutes(pagesPath) {
  const absolutePaths = await globby([join(pagesPath, '**/*.mdx')])
  // 省略，建立暫存資料夾，建立在 `src/.mdx` 中，這樣就可以確保相對路徑一樣
  const routes = await pMap(absolutePaths, async (absolutePath) => {
    // 省略

    // 讀取檔案內容
    const content = await readFile(absolutePath)
    const { url, dynamic } = generateURL(parsed, base)
    // 編譯
    const code = await mdx(content)
    const outputPath = resolve(mdxPath, path.replace('.mdx', '.js'))
    const lines = code.split('\n')

    await mkdir(dirname(outputPath), { recursive: true })
    // 寫到暫存資料夾，另外這邊也插入了 mdx 需要的程式碼
    // mdx 在建立元件時需要用來自 `@mdx-js/react` 的 `mdx` 來代替 `React.createElement`
    await writeFile(outputPath, [lines[0], `import { mdx } from 'generator'`, ...lines.slice(1)].join('\n'))
    const cachePath = relative(process.cwd(), outputPath)
    const mod = importCwd('./' + cachePath)

    return {
      dynamic,
      url,
      file: cachePath,
      getStaticPaths: noop,
      getInitialProps: noop,
      routeProps: {
        exact: url === '/',
        path: url,
      },
      props: {
        component: mod.default,
      },
    }
  })
  return routes
}
```

再來就是修改 `AppProvider` 來加上 `MDXProvider`，這邊並沒有很複雜，可以自己參考看看，最後我們的 `about.js` 換成 mdx 後就可以變成這樣：

```markdown
import { Article } from '../components/Article'

<Article article={{ title: 'About', content: 'About me...' }} />
```

變的簡潔很多，不過 mdx 的用途實際上還不只這樣，下一篇要來讓文章內容不再是寫在 js 裡，另外我也把上一篇留下來的問題修好了，下一篇再來說明我改了什麼
