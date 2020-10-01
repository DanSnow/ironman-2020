const loaderUtils = require('loader-utils')

module.exports = function (content) {
  const { name: nameTemplate = '[name]-[contenthash].[ext]' } = loaderUtils.getOptions(this)
  const name = loaderUtils.interpolateName(this, nameTemplate, { content })
  this.emitFile(name, content)
  return `export default __webpack_public_path__ + '${name}'`
}

module.exports.raw = true
