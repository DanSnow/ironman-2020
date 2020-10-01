module.exports = {
  module: {
    rules: [
      {
        test: /\.raw$/,
        loader: require.resolve('./loader'),
        options: {
          name: '[contenthash].[ext]',
        },
      },
    ],
  },
  devtool: false,
  mode: 'development',
}
