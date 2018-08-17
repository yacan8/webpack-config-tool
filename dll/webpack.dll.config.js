const webpack = require('webpack');
const path = require('path');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const isDebug = process.env.NODE_ENV !== 'production';

const output = {
  filename: '[name].js',
  library: '[name]_library',
  path: path.resolve(process.cwd(), isDebug ? './vendor-dev/' : './vendor/')
}

const dllConfig = {
  entry: {
    vendor: ['react', 'react-dom']  // 我们需要事先编译的模块，用entry表示
  },
  output: output,
  plugins: [
    new webpack.DllPlugin({  // 使用dllPlugin
      path: path.join(output.path, `${output.filename}.json`),
      name: output.library // 全局变量名， 也就是 window 下 的 [output.library]
    }),
    new ProgressBarPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      __DEV__: isDebug
    })
  ],
  optimization: {}
}

if (!isDebug) {
  dllConfig.mode = 'production';
  dllConfig.optimization.minimize = true;
  dllConfig.optimization.minimizer = [new UglifyJsPlugin({
    cache: true,
    parallel: true,
    sourceMap: true,
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
  })];
} else {
  dllConfig.mode = 'development';
}

module.exports = dllConfig;