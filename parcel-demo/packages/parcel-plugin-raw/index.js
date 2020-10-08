module.exports = function (bundler) {
  bundler.addAssetType('raw', require.resolve('./RawAsset'))
}
