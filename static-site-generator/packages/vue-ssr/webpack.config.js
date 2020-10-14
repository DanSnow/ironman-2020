const webpack = require('webpack')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const baseConfig = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
  optimization: {
    concatenateModules: true,
  },
  mode: 'none',
  devtool: false,
}

module.exports = [
  {
    ...baseConfig,
    entry: {
      server: './src/entry-server',
    },
    output: {
      libraryTarget: 'commonjs2',
    },
    externals: ['vue'],
    target: 'node',
  },
  {
    ...baseConfig,
    entry: {
      client: './src/entry-client',
    },
  },
]
