export function setupJSONP(store) {
  window.__GENERATOR_JSONP__ = (path, actions, gql) => {
    store.dispatch({ type: '__record/loadPage', payload: { path, actions } })
    if (gql) {
      client.writeQuery(gql)
    }
  }
}
