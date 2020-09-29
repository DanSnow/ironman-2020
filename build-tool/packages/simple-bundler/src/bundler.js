import { readFile } from 'fs/promises'
import { Module } from './module'
import pMap from 'p-map'

export class Bundler {
  constructor(entry, context) {
    this.entryPath = entry
    this.context = context
    this.modules = {}
  }

  async execute() {
    this.entry = await this.loadModule(this.entryPath)

    const seen = new Set()
    let queue = [this.entry]
    while (queue.length) {
      const mod = queue.shift()
      seen.add(mod.path)
      this.modules[mod.path] = mod
      await mod.parse()
      const mods = await pMap(
        mod.dependencies.filter((path) => !seen.has(path)),
        this.loadModule
      )
      queue = queue.concat(mods)
    }
  }

  generate() {
    return runtimeTemplate(Array.from(Object.values(this.modules)), this.entry.id)
  }

  loadModule = async (path) => {
    const code = await readFile(path, 'utf-8')
    return new Module({ path: path, code, context: this.context })
  }
}

function runtimeTemplate(modules, entry) {
  return `
const modules = {
  ${modules.map((mod) => `'${mod.id}': ${wrapCode(mod.transformedCode)},`).join('\n')}
}

const exportCache = {}

function require(name) {
  if (exportCache[name]) {
    return exportCache[name]
  }

  const exports = {}
  modules[name].call(null, require, exports)
  exportCache[name] = exports
  return exports
}

require('${entry}')
`
}

function wrapCode(code) {
  return `function (require, exports) {
    ${code}
  }`
}
