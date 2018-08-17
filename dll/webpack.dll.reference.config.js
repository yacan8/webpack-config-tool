const path = require('path');
const dllConfig = require('./webpack.dll.config');
const baseConfig = require('./webpack.base.config');
const webpack = require('webpack');
const isDebug = process.env.NODE_ENV !== 'production';
const CopyWebpackPlugin = require('copy-webpack-plugin');

const dllPath = dllConfig.output.path;
const dllEntry = dllConfig.entry;

const plugins = [
  new CopyWebpackPlugin([{ from: path.join(process.cwd(), isDebug ? './vendor-dev/' : './vendor/'), to: baseConfig.output.path, ignore: ['*.json']}]) // 将dll文件拷贝到编译目录
];

Object.keys(dllEntry).forEach((key) => {
  const manifest = path.join(dllPath, `${key}.js.json`);
  plugins.push(new webpack.DllReferencePlugin({
    manifest: require(manifest), // 引进dllPlugin编译的json文件
    name: `${key}_library` // 全局变量名，与dllPlugin声明的一直
  }))
})

module.exports = {
  plugins
}