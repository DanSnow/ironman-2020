// import decode from 'image-decode'
// import { encode } from 'blurhash'

module.exports = function (buffer) {
  // const { data, height, width } = decode(buffer)
  // const hash = encode(data, width, height, 4, 4)
  return `
  import url from '!!${require.resolve('file-loader')}!${require.resolve('image-webpack-loader')}!${this.resource}'

  // export default { url }`
  // export default { url, hash: '${hash}', width: ${width}, height: ${height} }`
}

module.exports.raw = true
