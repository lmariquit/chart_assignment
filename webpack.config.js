module.exports = {
  entry: {
    index: './client/index.js',
    another: './public/assets/canvasjs.react.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: __dirname + '/public',
    publicPath: '/',
    filename: 'bundle.js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  devServer: {
    contentBase: './public'
  },
  plugins: [HTMLWebpackPluginConfig]
}
