import dedent from 'ts-dedent'

export const entry = dedent`
import { AppProvider, ReactDOM, React } from 'generator'
import { store } from './store.js'
import Routes from './routes.js'

function App() {
  return (
    <AppProvider store={store}>
      <Routes />
    </AppProvider>
  )
}

ReactDOM.hydrate(<App />, document.getElementById('root'))
`
