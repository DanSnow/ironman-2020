import { resolve } from 'path'
import importModules from 'import-modules'

const slices = importModules(resolve(process.cwd(), 'src/slices'))

export const reducer = createReducer(slices)

function createReducer(slices) {
  const reducer = {}

  for (const [name, slice] of Object.entries(slices)) {
    reducer[name] = slice.reducer
  }

  return reducer
}
