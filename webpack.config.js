const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    background: './src/scripts/background.ts',
    content: './src/scripts/content.ts',
    hero: ['./src/scripts/hero.ts', './src/styles/hero.scss'],
    popup: ['./src/scripts/popup.ts', './src/styles/popup.scss'],
    options: ['./src/scripts/options.ts', './src/styles/options.scss']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'browsers/chrome/dist'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "browsers/chrome/manifest.json", to: "manifest.json" },
        { from: "browsers/chrome/popup.html", to: "popup.html" },
        { from: "browsers/chrome/options.html", to: "options.html" },
        { from: "public", to: "." },
        { from: "node_modules/bootstrap/dist/css/bootstrap.min.css", to: "." },
        { from: "node_modules/bootstrap/dist/js/bootstrap.min.js", to: "." }
      ],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
  devtool: 'inline-source-map'
};
