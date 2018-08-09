const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.config');
const reactConfig = require('./webpack.react.config');
const lessConfig = require('./webpack.less.config');

module.exports = merge(baseConfig, reactConfig, lessConfig);
