import { resolve } from 'path'
import { writeFile, mkdir } from 'fs/promises'
import { execute } from 'graphql'
import { gql } from '@apollo/client'
import pMap from 'p-map'
import objectHash from 'object-hash'
import { collectQuery } from './collect-query'

export async function executeStaticQueries(schema) {
  const base = resolve(process.cwd(), '.cache/queries')
  await mkdir(base, { recursive: true })
  const queries = await collectQuery()
  await pMap(queries, async (query) => {
    const { data } = await execute(schema, gql(query))
    const hash = objectHash(query)
    writeFile(resolve(base, `${hash}.json`), JSON.stringify(data))
  })
}
