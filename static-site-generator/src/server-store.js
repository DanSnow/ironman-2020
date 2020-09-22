import { createEntityAdapter, configureStore, createSlice } from '@reduxjs/toolkit'
import { articles } from './articles'

const articleAdapter = createEntityAdapter({
  selectId: ({ slug }) => slug,
  // sortComparer: (a, b) => a.slug.localeCompare(b.slug),
})

const articleSlice = createSlice({
  name: 'articles',
  initialState: articleAdapter.getInitialState(),
  reducers: {
    setArticles: articleAdapter.setAll,
  },
})

export const store = configureStore({
  reducer: articleSlice.reducer,
})

const { setArticles } = articleSlice.actions

export const articleSelector = articleAdapter.getSelectors()

store.dispatch(setArticles(articles))
