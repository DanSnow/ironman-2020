import { schemaComposer } from 'graphql-compose'
import { composeWithJson } from 'graphql-compose-json'
import importCwd from 'import-cwd'
import objectHash from 'object-hash'
import { noop } from './utils'

const config = importCwd('./config.js').default

export const pageDependencies = new Map()
let dependencies = null

export async function createNodes(typename, cb) {
  const nodes = []
  let schema

  await cb((node) => {
    const hash = objectHash(node)
    nodes.push({
      ...node,
      _hash: hash,
    })
    if (!schema) {
      schema = composeWithJson(typename, node)
    }
  })

  schemaComposer.Query.addFields({
    [`all${typename}s`]: {
      type: schema.getTypePlural(),
      resolve: () => {
        dependencies?.push({
          type: typename,
          id: typename,
          all: true,
          nodes: nodes.map((node) => ({ id: generateHashKey(typename, node), hash: node._hash })),
        })
        return nodes
      },
    },
    [typename.toLowerCase()]: {
      type: schema,
      args: {
        id: 'ID!',
      },
      resolve: (_, { id }) => {
        const node = nodes.find((x) => x.id === id)
        if (node) {
          dependencies?.push({
            type: typename,
            id: generateHashKey(typename, node),
            hash: node._hash,
          })
        }
        return node
      },
    },
  })
}

export async function trackDependencies(url, cb) {
  dependencies = []
  await cb()
  pageDependencies.set(url, dependencies)
  dependencies = null
}

export async function loadSchema() {
  const { data = noop } = config
  await data(createNodes)
  return schemaComposer.buildSchema()
}

function generateHashKey(typename, node) {
  return `${typename}:${node.id}`
}
