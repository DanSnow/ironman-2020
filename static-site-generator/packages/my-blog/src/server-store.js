import { articles } from './data'
import { configureStore } from '@reduxjs/toolkit'
import { articleSlice } from './slices/articles'

export const store = configureStore({
  reducer: { articles: articleSlice.reducer },
})

const { setArticles } = articleSlice.actions

store.dispatch(setArticles(articles))
