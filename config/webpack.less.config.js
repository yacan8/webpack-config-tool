const path = require('path');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const happyLoaderId = 'happypack-for-react-babel-loader';

const isDebug = process.env.NODE_ENV !== 'production';

const cssLoader = {
  loader: `css-loader`,
  options: {
    sourceMap: isDebug,
    modules: true,
    localIdentName: '[local]',
    minimize: !isDebug,
    discardComments: { removeAll: true }
  }
}

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    plugins: () => {
      return [
        require('postcss-nested')(),
        require('pixrem')(),
        require('autoprefixer')({browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8']}),
        require('postcss-flexibility')(),
        require('postcss-discard-duplicates')()
      ]
    }
  }
}

const lessLoader = {
  loader: 'less-loader',
  options: {
    sourceMap: isDebug,
    javascriptEnabled: true
  }
}

const lessConfig = {
  module: {
    rules: []
  },
  plugins: []
};

const lessHappyLoaderId = 'happypack-for-less-loader';
const cssHappyLoaderId = 'happypack-for-css-loader';

let loaders = [];

if (isDebug) {
  loaders = [new HappyPack({
    id: lessHappyLoaderId,
    threadPool: happyThreadPool,
    loaders: ['style-loader', cssLoader, postcssLoader, lessLoader ]
  }), {
    test: /\.less$/,
    loader: 'happypack/loader',
    query: {id: lessHappyLoaderId}
  }, new HappyPack({
    id: cssHappyLoaderId,
    threadPool: happyThreadPool,
    loaders: ['style-loader', cssLoader, postcssLoader ]
  }), {
    test: /\.css$/,
    loader: 'happypack/loader',
    query: {id: cssHappyLoaderId}
  }]
} else {
  lessConfig.plugins.push(new MiniCssExtractPlugin({
    filename: '[name].css',
    // chunkFilename: "[id].css"
  }))

  loaders = [new HappyPack({
    id: lessHappyLoaderId,
    loaders: [
      cssLoader,
      postcssLoader,
      lessLoader
    ],
    threadPool: happyThreadPool
  }), {
    test: /\.less$/,
    use: [MiniCssExtractPlugin.loader, {
      loader: 'happypack/loader',
      query: {id: lessHappyLoaderId}
    }]
  }, new HappyPack({
    id: cssHappyLoaderId,
    loaders: [
      cssLoader,
      postcssLoader
    ],
    threadPool: happyThreadPool
  }), {
    test: /\.css/,
    use: [MiniCssExtractPlugin.loader, {
      loader: 'happypack/loader',
      query: {id: cssHappyLoaderId}
    }]
  }]
}

lessConfig.module.rules.push(...loaders);

module.exports = lessConfig;
