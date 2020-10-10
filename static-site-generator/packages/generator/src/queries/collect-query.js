import { resolve } from 'path'
import { readFile } from 'fs/promises'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import { visitor } from './visitor'
import globby from 'globby'
import pMap from 'p-map'

export async function collectQuery() {
  const files = await globby(resolve(process.cwd(), 'src/**/*.js'))
  const collections = await pMap(files, extractQuery)
  const queries = new Set(collections.flat())
  return Array.from(queries)
}

async function extractQuery(file) {
  const code = await readFile(file, 'utf-8')
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'nullishCoalescingOperator', 'optionalChaining', 'objectRestSpread'],
  })
  const state = { queries: [] }
  traverse(ast, visitor, null, state)
  return state.queries
}
