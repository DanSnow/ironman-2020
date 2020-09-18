從 0 開始建一個 Static Site Generator
=====================================

不知各位有沒有聽過 `JAMStack` ？ `JAMStack` 就是 `JavaScript`, `API`, `Markup` 合在一起的一種稱呼，是一種新的(？)或說是幫已經存在的東西取個新名字的技術，在現在前端框架滿天飛，一堆 Single Page Application 的情況下，主打的是將網頁在建置的過程中就 render 好，只提供 html, css, js 與圖片等等的靜態資源，上線後就不再與資料庫、後端等等的部份溝通的靜態網頁，而體現了 `JAMStack` 這樣的一個技術的就是如 React 的 `Next.js`, `Gatsby` 或是 Vue 的 `Nuxt.js`, `Gridsome` 這類的 Static Site Generator (或是純手工 html 網站w)

這系列主要會從 0 開始打造一個建立在 React 之上的 Static Site Generator ，在這過程中我們可以認識到 server render 究竟是如何實作的，了解如何寫出同時支援 Server Side Render 與 Client Side Render 的程式，也會碰到一些 GraphQL ，一步步的打造出我們自己的 Static Site Generator，再看看 `Gatsby` 還有什麼不錯的功能，也把它給抄過來，最後也會來提一下 Vue 的 server render 要怎麼直接使用

這系列假設你有：

1. 基本的 js 與使用 React 的能力
2. 基本的指令介面操作與能使用 npm/yarn
3. 懂基本的 Node.js 的 API 與使用

另外要提到一點，本系列會傾向使用 yarn v2 做為套件管理器，指令基本上跟 yarn v1 沒有什麼太大的差別，我也會盡可能的使用通用的指令，但 yarn v2 預設是使用 pnp 模式，在這個模式下如果你的相依性沒有被正確定義的話在使用時是會出問題的，如果直接使用本系列附的範例程式碼而發生問題的話，你可以嘗試換成 npm 或透過刪除 yarn 的設定檔 `.yarnrc.yml` 的方式切換回 yarn v1

目錄
----

底下的規劃還只是暫訂的，實際可能會有所調整

1. 前言
2. 反樸歸真的前端
3. React 介紹
4. Server Side Render 介紹
5. 實作第一個頁面
6. 介紹 React Router
7. 在 Server 使用 React Router
8. Redux
9. Redux 在 Server Side Render 的使用
10. 實作能動態載入資料的網頁
11. 基於資料夾結構的路由
12. 動態路由
13. html template & eta.js
14. Helmet
15. 介紹 universal code
16. 可互動的網頁，重新載入 js
17. SSR vs SSG
18. 從 SSR 到 SSG
19. 介紹 GraphQL
20. 產生 GraphQL 的 schema
21. page query
22. 介紹 mdx
23. 從檔案產生資料
24. 介紹 static query
25. 製作處理 static query 的 babel plugin
26. 載入圖片
27. 最佳化圖片
28. 介紹 Vue 的 Server Side Render
29. 實作 Vue 的 Server Side Render
30. 介紹 Bundle Renderer

另外打個廣告，由於本人今年有兩個想寫的題目實在無法抉擇其中一邊，所以兩個都報名了，也請多多支持另一個系列[前端建置工具完全手冊](https://ithelp.ithome.com.tw/users/20111802/ironman/3846)
