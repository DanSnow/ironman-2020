const { stringifyRequest } = require('loader-utils')

module.exports = function (content) {
  return content
}

module.exports.pitch = function (remainingRequest) {
  return `
  module.exports = require(${stringifyRequest(this, `!!${remainingRequest}`)}) || {}
  module.exports.__code__ = require(${stringifyRequest(this, `!!${require.resolve('raw-loader')}!${remainingRequest}`)})
  `
}
