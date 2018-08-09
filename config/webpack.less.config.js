const path = require('path');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

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
  plugins: [],
  optimization: {
    minimizer: [new OptimizeCssAssetsPlugin({
      cssProcessor: require('cssnano'),
      cssProcessorOptions: { discardComments: { removeAll: true } },
      canPrint: true
    })]
  }
};

const lessHappyLoaderId = 'happypack-for-less-loader';
const cssHappyLoaderId = 'happypack-for-css-loader';

let loaders = [];
let plugins = [];

if (isDebug) {
  loaders = [{
    test: /\.less$/,
    loader: 'happypack/loader',
    query: {id: lessHappyLoaderId}
  }, {
    test: /\.css$/,
    loader: 'happypack/loader',
    query: {id: cssHappyLoaderId}
  }]

  plugins = [new HappyPack({
    id: lessHappyLoaderId,
    threadPool: happyThreadPool,
    loaders: ['style-loader', cssLoader, postcssLoader, lessLoader ]
  }),  new HappyPack({
    id: cssHappyLoaderId,
    threadPool: happyThreadPool,
    loaders: ['style-loader', cssLoader, postcssLoader ]
  })]


} else {

  loaders = [{
    test: /\.less$/,
    use: [MiniCssExtractPlugin.loader, {
      loader: 'happypack/loader',
      query: {id: lessHappyLoaderId}
    }]
  }, {
    test: /\.css/,
    use: [MiniCssExtractPlugin.loader, {
      loader: 'happypack/loader',
      query: {id: cssHappyLoaderId}
    }]
  }]

  plugins = [new MiniCssExtractPlugin({
    filename: '[name].css',
    // chunkFilename: "[id].css"
  }), new HappyPack({
    id: lessHappyLoaderId,
    loaders: [
      cssLoader,
      postcssLoader,
      lessLoader
    ],
    threadPool: happyThreadPool
  }), new HappyPack({
    id: cssHappyLoaderId,
    loaders: [
      cssLoader,
      postcssLoader
    ],
    threadPool: happyThreadPool
  })]
}

lessConfig.module.rules.push(...loaders);
lessConfig.plugins.push(...plugins);

module.exports = lessConfig;
