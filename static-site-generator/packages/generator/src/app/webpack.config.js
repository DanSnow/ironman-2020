import PnpWebpackPlugin from 'pnp-webpack-plugin'
import { resolve } from 'path'

export default {
  context: process.cwd(),

  entry: './.cache/app',

  output: {
    path: resolve(process.cwd(), '.cache/dist'),
    filename: 'bundle.js',
  },

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
        loader: require.resolve('babel-loader'),
        exclude: /node_modules/,
      },
    ],
  },

  devtool: false,

  mode: 'development',
}
