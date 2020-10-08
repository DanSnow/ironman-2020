const { Asset } = require('parcel-bundler')

module.exports = class RawAsset extends Asset {
  constructor(name, options) {
    super(name, options)
    this.type = 'js'
  }

  generate() {
    return [
      {
        type: 'js',
        value: `module.exports = ${JSON.stringify(this.contents)}`,
      },
    ]
  }
}
