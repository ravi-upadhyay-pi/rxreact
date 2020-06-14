const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const dev = (argv) => argv.mode === 'development';

module.exports = (env, argv) => ({
  mode: argv.mode,
  devtool: dev(argv) ? 'source-map' : false,
  entry: path.join(__dirname, 'src/index.jsx'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[hash].js',
  },
  resolve: {
    extensions: [
      '.js',
      '.jsx',
      '.css',
      '.scss',
    ],
    alias: {
      css: path.resolve(__dirname, 'src/css'),
    },
    modules: [path.resolve(__dirname, 'src'), "node_modules"],
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [              
              "@babel/preset-env",
              "@babel/preset-react",
            ],
            plugins: [
            ].filter(Boolean),
          },
        },
      },
      {
        exclude: /node_modules/,
        test: /\.(css|scss)$/,
        use: dev(argv)
           ? 'style-loader'
           : MiniCssExtractPlugin.loader
      },
      {
        exclude: /node_modules/,
        test: /\.(css|scss)$/,
        use: {
          loader: 'css-loader',
          options: {
            modules: {
              localIdentName: "[local]_[hash:base64:5]",
            },
          },
        },
      },
      {
        exclude: /node_modules/,
        test: /\.(scss)$/,
        use: ['sass-loader']
      }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html'      
    }),
  ].filter(Boolean),
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    historyApiFallback: {
      index: '/',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
      },
    },
  }
});
