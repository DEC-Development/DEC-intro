const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const TerserWebpackPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    index: './src/web/index.js',
    view: './src/web/view.js'
  }, // Entry point of your application
  output: {
    filename: '[name].[contenthash:8].js',
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  mode: 'production', // Set to 'development' for non-minified output
  plugins: [
    new HtmlWebpackPlugin({
      template: './resources/index.html', // Path to your HTML template
      filename: 'index.html', // Output HTML filename
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      template: './resources/view.html', // Path to your HTML template
      filename: 'view.html', // Output HTML filename
      chunks: ['view']
    }),
    new CopyWebpackPlugin({
      patterns: [
        // Add patterns for files you want to copy during the build
        { from: 'gen', to: '' }, // Example: Copy files from src/static to dist/static
      ],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css' // The name of the extracted CSS file
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      }, {
        test: /\.html$/,
        use: "html-loader"
      }, {
        test: /\.(jpg|jpeg|png|gif|svg)$/,
        type: 'asset',
      }
    ]
  },
  devServer:{
    host: '0.0.0.0'
  }
};
