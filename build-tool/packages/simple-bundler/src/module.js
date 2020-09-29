import { dirname, relative, resolve } from 'path'
import { parseAsync, traverse, types as t, template } from '@babel/core'
import generate from '@babel/generator'

const requireTemplate = template('const %%imports%% = require(%%file%%)')

export class Module {
  constructor({ path, code, context }) {
    this.id = relative(context, path)
    this.path = path
    this.context = context
    this.dir = dirname(path)
    this.code = code
    this.dependencies = []
  }

  async parse() {
    this.ast = await parseAsync(this.code)
    traverse(this.ast, {
      ImportDeclaration: (path) => {
        const file = path.node.source.value

        const dep = resolve(this.dir, file)

        this.dependencies.push(dep)
        const imp = path.node.specifiers.map(extractImport)
        const imports = t.objectPattern(
          imp.map(([key, value]) => t.objectProperty(t.identifier(key), t.identifier(value)))
        )
        path.replaceWith(
          requireTemplate({
            imports,
            file: t.stringLiteral(relative(this.context, dep)),
          })
        )
      },

      ExportDeclaration: (path) => {
        path.replaceWith(
          t.assignmentExpression(
            '=',
            t.memberExpression(t.identifier('exports'), getIdentifier(path.node)),
            template.expression.ast(`(${generate(path.node.declaration).code})`)
          )
        )
      },
    })

    this.transformedCode = generate(this.ast).code
  }
}

function extractImport(specifier) {
  if (t.isImportDefaultSpecifier(specifier)) {
    return ['default', specifier.local.name]
  } else if (t.isImportSpecifier(specifier)) {
    return [specifier.imported.name, specifier.local.name]
  }
}

function getIdentifier(node) {
  if (t.isExportNamedDeclaration(node)) {
    return t.identifier(node.declaration.id.name)
  } else if (t.isExportDefaultDeclaration(node)) {
    return t.identifier('default')
  }
}
