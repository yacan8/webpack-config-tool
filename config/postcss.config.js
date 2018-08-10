module.exports = {
  plugins: () => {
    return [
      require('postcss-nested')(),
      require('pixrem')(),
      require('autoprefixer')({
        browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8']
      }),
      require('postcss-flexibility')(),
      require('postcss-discard-duplicates')()
    ]
  }
}
