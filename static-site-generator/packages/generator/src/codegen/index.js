import { join, resolve } from 'path'
import { mkdir, writeFile } from 'fs/promises'
import { generateRoutes } from './routes'
import { generateStore } from './store'
import { generateEntry } from './entry'

export async function codegen({ title, routes }) {
  const base = resolve(process.cwd(), '.cache')
  await mkdir(base, { recursive: true })
  await writeFile(join(base, 'routes.js'), generateRoutes(routes))
  await writeFile(join(base, 'store.js'), await generateStore())
  await writeFile(join(base, 'app.js'), generateEntry(title))
}
