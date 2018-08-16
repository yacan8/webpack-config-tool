var gulp = require('gulp'),
  conflict = require('gulp-conflict'),
  debug = require('gulp-debug'),
  pkg = require('./package.json'),
  install = require('yarn-install'),
  configPkg = require('./config/package.json'),
  _ = require('lodash'),
  fs = require('fs'),
  path = require('path');
  
function copyTask(dir, to) {
  return new Promise(function(resolve) {
    gulp.src(dir)
      .pipe(debug())
      .pipe(conflict(to))
      .pipe(gulp.dest(to))
      .on('end', function () {
        resolve();
      }).resume();
  });
}

function mergePackage(source, target) {
  var sourceBuffer = fs.readFileSync(source, {encoding: 'utf-8'});
  var targetBuffer = fs.readFileSync(target, {encoding: 'utf-8'});
  var buffer = _.merge(JSON.parse(targetBuffer), JSON.parse(sourceBuffer));
  fs.writeFileSync(target, JSON.stringify(buffer, null, 2));
}

gulp.task('copy files', function (done) {
  Promise.all([
    copyTask([__dirname + '/config/**', '!' + __dirname + '/config/package.json'], './build/')
  ]).then(function() { 
    const dependencies = Object.keys(configPkg.dependencies).map(function(_module) {
      return _module + '@' + configPkg.dependencies[_module];
    });
    const installProcess = install({
      deps: dependencies,
      dev: true
    })
    done();
  });
})

gulp.task('merge package', function(done) {
  var configPkgPath = path.resolve(__dirname, './config/package.json');
  var pkgPath = path.resolve(process.cwd(), 'package.json');
  mergePackage(configPkgPath, pkgPath);
  done();
})