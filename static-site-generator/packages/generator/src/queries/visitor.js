import * as t from '@babel/types'
import { extractQueryString, normalizeQuery } from './utils'

export const visitor = {
  CallExpression(path, state) {
    if (!t.isIdentifier(path.node.callee, { name: 'useStaticQuery' })) {
      return
    }
    const query = extractQueryString(path.node)
    state.queries.push(normalizeQuery(query))
  },
}
