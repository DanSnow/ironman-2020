const PnpWebpackPlugin = require('pnp-webpack-plugin')

module.exports = {
  resolve: {
    plugins: [PnpWebpackPlugin],
  },
  resolveLoader: {
    plugins: [PnpWebpackPlugin.moduleLoader(module)],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: './loader',
          },
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
  devtool: false,
  mode: 'development',
}
