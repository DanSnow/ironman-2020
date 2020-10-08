import { schemaComposer } from 'graphql-compose'
import { composeWithJson } from 'graphql-compose-json'
import importCwd from 'import-cwd'
import { noop } from './utils'

const config = importCwd('./config.js').default

export async function createNodes(typename, cb) {
  const nodes = []
  let schema

  await cb((node) => {
    nodes.push(node)
    if (!schema) {
      schema = composeWithJson(typename, node)
    }
  })

  schemaComposer.Query.addFields({
    [`all${typename}s`]: {
      type: schema.getTypePlural(),
      resolve: () => nodes,
    },
    [typename.toLowerCase()]: {
      type: schema,
      args: {
        id: 'ID!',
      },
      resolve: (_, { id }) => {
        return nodes.find((x) => x.id === id)
      },
    },
  })
}

export async function loadSchema() {
  const { data = noop } = config
  await data(createNodes)
  return schemaComposer.buildSchema()
}
