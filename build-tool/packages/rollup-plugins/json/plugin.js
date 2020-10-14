import { dirname, resolve } from 'path'
import { access } from 'fs/promises'
import { addExtension, dataToEsm } from '@rollup/pluginutils'

export default function json() {
  return {
    name: 'json',

    async resolveId(source, importer) {
      if (importer == null) {
        return null
      }

      const id = resolve(dirname(importer), addExtension(source, '.json'))
      try {
        await access(id)
        return id
      } catch {
        return null
      }
    },

    transform(code, filename) {
      if (filename.endsWith('.json')) {
        return dataToEsm(JSON.parse(code))
      }
      return null
    },
  }
}
