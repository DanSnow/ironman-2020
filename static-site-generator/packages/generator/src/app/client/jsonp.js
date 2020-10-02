export function setupJSONP(store) {
  window.__GENERATOR_JSONP__ = (path, actions) => {
    store.dispatch({ type: '__record/loadPage', payload: { path, actions } })
  }
}
