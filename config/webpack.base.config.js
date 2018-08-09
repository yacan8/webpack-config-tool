const path = require('path');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const webpack = require('webpack');
const isDebug = process.env.NODE_ENV !== 'production';

export function getUglifyJs (sourceMap) {
  const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
  return new UglifyJsPlugin({
    cache: true,
    parallel: true,
    sourceMap: sourceMap,
    uglifyOptions: {
      comments: false,
      warnings: false,
      compress: {
        unused: true,
        dead_code: true,
        collapse_vars: true,
        reduce_vars: true
      },
      output: {
        comments: false
      }
    }
  });
};

const base = {
  entry: ['babel-polyfill', 'src/index'],
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, '../dist')
  },
  extensions: [".js", ".json"],
  module: {
    rules: [{
      test: /\.(png|jpg|jpeg|gif|svg)(\?v=\d+\.\d+\.\d+)?$/i, // 图片加载
      loader: 'url-loader',
      query: {
        limit: 10000
      }
    }]
  },
  optimization: {
    minimize: isDebug,
    minimizer: !isDebug ? [getUglifyJs(isDebug)] : [],
    splitChunks: {
      chunks: 'all'
    }
  },
  plugins: [
    new ProgressBarPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      '__DEV__': isDebug
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'server',
      analyzerHost: '127.0.0.1',
      analyzerPort: 8889,
      reportFilename: 'report.html',
      defaultSizes: 'parsed',
      generateStatsFile: false,
      statsFilename: 'stats.json',
      statsOptions: null,
      logLevel: 'info'
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../index.html')
    })
  ]
};

if (isDebug) {
  base.devtool = 'source-map';
}


module.exports = base;