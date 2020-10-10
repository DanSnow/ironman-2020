const { relative, dirname, join } = require('path')
const { createMacro } = require('babel-plugin-macros')
const { addDefault } = require('@babel/helper-module-imports')
const objectHash = require('object-hash')
const { normalizeQuery, extractQueryString } = require('./src/queries/utils')

function extractQuery({ references, state }) {
  for (const path of references.useStaticQuery) {
    const query = extractQueryString(path.parent)
    const hash = objectHash(normalizeQuery(query))
    const p = join(state.cwd, `.cache/queries/${hash}.json`)
    const id = addDefault(path, relative(dirname(state.filename), p))
    path.parentPath.replaceWith(id)
  }
}

module.exports = createMacro(extractQuery)
