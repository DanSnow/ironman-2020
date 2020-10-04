const del = require('del')

module.exports = class CleanPlugin {
  apply(compiler) {
    compiler.hooks.beforeRun.tapPromise('CleanPlugin', (compiler) => del(compiler.options.output.path))
  }
}
