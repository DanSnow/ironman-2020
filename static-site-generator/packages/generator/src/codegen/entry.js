import dedent from 'ts-dedent'

export const generateEntry = (title) => dedent`
import { AppProvider, ReactDOM, React, setupJSONP } from 'generator'
import { store } from './store.js'
import Routes from './routes.js'

setupJSONP(store)

function App() {
  return (
    <AppProvider title="${title}" store={store}>
      <Routes />
    </AppProvider>
  )
}

ReactDOM.hydrate(<App />, document.getElementById('root'))
`
