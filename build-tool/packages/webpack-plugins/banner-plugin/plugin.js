const { RawSource, ConcatSource } = require('webpack-sources')

module.exports = class BannerPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('CleanPlugin', (compilation) => {
      for (const asset of Object.keys(compilation.assets)) {
        compilation.updateAsset(asset, (source) => {
          return new ConcatSource(new RawSource('/* Hello from plugin */\n'), source)
        })
      }
    })
  }
}
