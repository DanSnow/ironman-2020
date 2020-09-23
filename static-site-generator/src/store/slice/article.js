import { createEntityAdapter, createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import ky from 'ky-universal'

export const articleAdapter = createEntityAdapter({
  selectId: ({ slug }) => slug,
})

export const articleSelector = articleAdapter.getSelectors()

export const fetchArticles = createAsyncThunk('articles/fetchArticles', () => {
  return ky.get('http://localhost:3000/api/articles').json()
})

export const fetchArticleById = createAsyncThunk('articles/fetchArticleById', (slug) => {
  return ky.get(`http://localhost:3000/api/articles/${slug}`).json()
})

export const articleSlice = createSlice({
  name: 'articles',
  initialState: articleAdapter.getInitialState(),
  reducers: {
    setArticles: articleAdapter.setAll,
  },
  extraReducers: {
    [fetchArticles.fulfilled]: articleAdapter.setAll,
    [fetchArticleById.fulfilled]: articleAdapter.addOne,
  },
})
