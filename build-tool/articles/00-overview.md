Day 1: 前言
===========

前端框架五花八門，可是建置工具卻只更新了 2 3 代而已，相較之下要來的穩定多了，這些工具如 webpack, babel 都是我們在現代開發前端時不知不覺之中得去使用到的工具，可是我們真的了解這些工具嗎？現在我們大多都靠著框架提供的基本設定就搞定了這些工具，會不會有一天，我們非得正面面對這些工具呢？比如只要正確的設定好 webpack 你就可以在打包時順便的對圖片做最佳化，還可以做 prerender 來對由前端渲染的網頁提供更好的 SEO

這系列不只是介紹這些工具的使用方法，還會去探究它們底層的實作原理，以及如何寫個 plugin ，完全客制化這些工具的功能，預計會詳細介紹的有:

- babel
- webpack
- rollup
- postcss

另外也會提到:

- parcel
- vite

最後可能還會介紹 `gulp` 與 `eslint` ， `gulp` 可說是上一代的工具，雖然現在還是有部份的專案在使用就是了，如果只是用來跑一些簡單的任務還挺方便的，而 `eslint` 雖然它不該被分類在建置工具之中，不過我們也可以試著寫個 plugin 加上自己的程式碼風格規則

另外要提到一點，本系列的套件管理器會傾向使用 yarn v2 ，指令基本上跟 yarn v1 沒有什麼太大的差別，我也會盡可能的使用通用的指令，但 yarn v2 預設是使用 pnp 模式，在這個模式下如果你的相依性沒有被正確定義的話在使用時是會出問題的，如果直接使用本系列附的範例程式碼而發生問題的話，你可以嘗試換成 npm 或透過刪除 yarn 的設定檔 `.yarnrc.yml` 的方式切換回 yarn v1

目前底下的規劃還是暫定的，實際可能會有所變動

目錄:

1. 前言
2. Transpiler: babel & postcss
3. Bundler: webpack & rollup
4. babel 的使用與設定
5. babel 的進階設定
6. babel 是怎麼運作的
7. babel 的套件介紹
8. 實作個 babel 的 plugin
9. babel 的 scope 與 helper
10. 介紹 babel macros
11. 實作個 babel macro
12. webpack 的使用與設定
13. webpack 的進階設定
14. webpack 是怎麼運作的
15. 介紹 webpack loader
16. 實作個 webpack loader
17. 介紹 webpack plugin
18. 介紹 webpack tapable
19. 實作個 webpack plugin
20. rollup 的使用與設定
21. 介紹與實作 rollup plugin
22. postcss 的使用與設定
23. 實作個 postcss plugin
24. 介紹 parcel
25. 實作個 parcel plugin
26. 介紹 vite
27. 介紹 gulp
28. gulp 是怎麼運作的
29. 介紹 eslint
30. 實作個 eslint plugin

另外打個廣告，由於本人今年有兩個想寫的題目實在無法抉擇其中一邊，所以兩個都報名了，也請多多支持另一個系列[從 0 開始建一個 Static Site Generator](https://ithelp.ithome.com.tw/users/20111802/ironman/3847)
