exports.extractQueryString = function extractQueryString(node) {
  return node.arguments[0].quasi.quasis[0].value.raw
}

exports.normalizeQuery = function normalizeQuery(query) {
  return query.replace(/\n/g, ' ').trim().replace(/\s+/g, ' ')
}
