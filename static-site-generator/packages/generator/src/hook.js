// import { readFileSync } from 'fs'
import Module from 'module'
// import decode from 'image-decode'
// import { encode } from 'blurhash'

export function patchRequire() {
  const originalRequire = Module.prototype.require

  Module.prototype.require = function (id) {
    if (id.startsWith('~')) {
      // const path = id.replace('~', process.cwd())
      // const buffer = readFileSync(path)
      // const { data, height, width } = decode(buffer)
      // const hash = encode(data, width, height, 4, 4)
      // return { hash, width, height }
      return {}
    }
    return originalRequire.call(this, id)
  }
}
