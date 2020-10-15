function isVueExtend(node) {
  if (node.type !== 'MemberExpression') {
    return false
  }
  if (node.object.type !== 'Identifier' || node.object.name !== 'Vue') {
    return false
  }
  if (node.property.type !== 'Identifier' || node.property.name !== 'Vue') {
    return false
  }
  return true
}

module.exports = {
  meta: {
    fixable: 'whitespace',
    messages: {
      requireNewline: 'require newline between',
    },
  },
  create: function (context) {
    return {
      ObjectExpression(node) {
        if (
          node.parent.type === 'ExportDefaultDeclaration' ||
          (node.parent.type === 'CallExpression' && isVueExtend(node.parent.callee))
        ) {
          const sourceCode = context.getSourceCode()
          for (let i = 0; i < node.properties.length - 1; ++i) {
            if (node.properties[i + 1].loc.start.line - node.properties[i].loc.end.line < 2) {
              context.report({
                messageId: 'requireNewline',
                loc: {
                  start: node.properties[i].loc.end,
                  end: node.properties[i + 1].loc.start,
                },
                fix(fixer) {
                  const tokens = sourceCode.getTokensBetween(node.properties[i], node.properties[i + 1])
                  const comma = tokens[0]
                  return fixer.insertTextAfterRange(comma.range, '\n')
                },
              })
            }
          }
        }
      },
    }
  },
}
