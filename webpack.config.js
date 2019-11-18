
const path = require('path');
const fs = require('fs');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const files = fs.readdirSync(path.resolve(__dirname, 'source'));
const htmlFiles = files.filter(fileName => /\.html$/.test(fileName));

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'source/assets/javascripts/index.js'),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].[hash].js',
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        exclude: /node_modules/,
        loader: 'file-loader',
        options: {
          root: path.resolve(__dirname, 'assets'),
          name: '[name].[hash].[ext]',
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    ...htmlFiles.map(fileName => {
      return new HtmlWebpackPlugin({
        template: path.resolve(__dirname, `source/${fileName}`),
        filename: fileName,
        hash: true,
        minify: true,
        cache: true,
        removeScriptTypeAttributes: true,
      });
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
}