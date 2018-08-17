var gulp = require('gulp'),
  conflict = require('gulp-conflict'),
  debug = require('gulp-debug'),
  ora = require('ora'),
  yarnInstall = require('yarn-install'),
  npmInstall = require('npm-install-package'),
  configPkg = require('./config/package.json'),
  _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  exists = require('global-module-exists'),
  inquirer = require('inquirer');
  
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
  const prompts = [{
    type: 'confirm',
    name: 'dll',
    message: '是否使用 dllPlugin?'
  }]
  inquirer.prompt(prompts).then(function (answers) {
    const tasks = []
    const defaultCopyFiles = [
      __dirname + '/config/**',
      '!' + __dirname + '/**/package.json',
      '!' + __dirname + '/**/node_modules/**'
    ];
    if (answers.dll) {
      defaultCopyFiles.push('!' + __dirname + '/config/webpack.config.js', '!' + __dirname + '/config/index.html'); // 使用dll的webpack.config.js;
      tasks.push(copyTask([__dirname + '/dll/**', '!' + __dirname + '/**/package.json', '!' + __dirname + '/**/node_modules/**'], './build/'))
    }
    tasks.push(copyTask(defaultCopyFiles, './build/'));
    
    Promise.all(tasks).then(() => {
      var configPkgPath = path.resolve(__dirname, './config/package.json');
      var pkgPath = path.resolve(process.cwd(), 'package.json');
      mergePackage(configPkgPath, pkgPath);
      if (answers.dll) {
        var dllPkgPath = path.resolve(__dirname, './dll/package.json');
        mergePackage(dllPkgPath, pkgPath);
      }
    }).then(function() { 
      const dependencies = Object.keys(configPkg.devDependencies).map(function(_module) {
        return _module + '@' + configPkg.devDependencies[_module];
      });
      if (exists('yarn')) {
        yarnInstall({
          deps: dependencies,
          dev: true
        })
        done();
      } else {
        var spinner = ora('npm installing packages, please waiting...').start();
        npmInstall(dependencies, {saveDev: true, cache: true}, function (err) {
          if (err) {
            spinner.fail('packages install err: ' + err.message);
            throw err;
          }
          spinner.text = 'packages install Complete';
          spinner.stop();
          done();
        })
      }
    });
  })
})
