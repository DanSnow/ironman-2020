import { resolve } from 'path'
import { constants } from 'fs'
import { readFile } from 'fs/promises'
import { compile } from 'eta'

export const templatePromise = loadTemplate()

async function loadTemplate() {
  const path = resolve(process.cwd(), 'src/index.html')
  try {
    await access(path, constants.R_OK)
    const content = await readFile(path, 'utf-8')
    return compile(content)
  } catch {
    const content = await readFile(resolve(__dirname, 'app/index.html'), 'utf-8')
    return compile(content)
  }
}
