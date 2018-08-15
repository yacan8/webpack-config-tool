const gulp = require('gulp'),
  conflict = require('gulp-conflict'),
  debug = require('gulp-debug');
const pkg = require('./package.json');
const install = require('yarn-install');
function copyTask(dir, to) {
  return new Promise(resolve => {
    gulp.src(dir)
      .pipe(debug())
      .pipe(conflict(to))
      .pipe(gulp.dest(to))
      .on('end', function () {
        resolve();
      }).resume();
  });
}

gulp.task('default', function (done) {
  Promise.all([
    copyTask(__dirname + '/config/**', './_conifg/')
  ]).then(() => { 
    const dependencies = Object.keys(pkg.dependencies).map(_module => `${_module}@${pkg.dependencies[_module]}`);
    const installProcess = install({
      deps: dependencies,
      dev: true
    })
    done();
  });
})