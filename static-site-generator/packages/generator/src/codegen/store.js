import { resolve, relative, basename } from 'path'
import globby from 'globby'
import { format } from 'prettier'

export async function generateStore() {
  const pattern = resolve(process.cwd(), 'src/slices/*.js')
  const files = await globby(pattern)
  const imports = files.map((file) => relative(process.cwd(), file))
  const importPair = imports.map((imp) => [basename(imp, '.js'), imp])
  return format(
    `
    import { createStore } from 'generator'
    ${importPair.map(([key, file]) => `import { reducer as ${key} } from '../${file}'\n`).join('')}

    export const store = createStore({
      ${importPair.map(([key]) => `${key},\n`).join('')}
    })
  `,
    { parser: 'babel' }
  )
}
