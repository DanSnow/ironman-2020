import { createSlice, createSelector } from '@reduxjs/toolkit'

export const name = '__record'

export const __record = createSlice({
  name,
  initialState: {
    actions: [],
    pages: {},
    currentPage: null,
  },
  reducers: {
    pushAction(state, { payload }) {
      state.actions.push(payload)
    },
    createPage(state, { payload }) {
      state.pages[payload] = state.actions
      state.currentPage = payload
      state.actions = []
    },
    loadPage(state, { payload: { path, actions } }) {
      state.pages[path] = actions
    },
    setCurrentPage(state, { payload }) {
      state.currentPage = payload
    },
  },
})

export const pageSelector = createSelector(
  (state) => state.__record.pages,
  (_, path) => path,
  (pages, path) => pages[path]
)
