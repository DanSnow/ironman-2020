import { articles } from './articles'
import { configureStore } from '@reduxjs/toolkit'
import { articleSlice } from './store/slice/article'

export const store = configureStore({
  reducer: articleSlice.reducer,
})

const { setArticles } = articleSlice.actions

store.dispatch(setArticles(articles))
