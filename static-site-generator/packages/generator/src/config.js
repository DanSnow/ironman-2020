import importCwd from 'import-cwd'
import { noop } from './utils'

const pkg = importCwd('./package.json')

export const config = normalizeConfig(importCwd('./config.js').default)

function normalizeConfig(config) {
  return {
    ...config,
    title: config.title || pkg.name || 'My Static site',
    data: config.data || noop,
    sources: config.sources || [],
    api: config.api || noop,
  }
}
