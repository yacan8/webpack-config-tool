var gutil = require('gulp-util');
var chalk = require('chalk');
var path = require('path');
var prettyTime = require('pretty-hrtime');
var generator = 'webpack-config-tool';

var gulpModulePath = path.resolve(__dirname, './node_modules/gulp/index.js');
var configPath = path.resolve(__dirname, './slushfile.js');
var toRun = ['copy files', 'merge package'];

module.exports = function install() {
  require(configPath);
  console.info('Using slushfile', chalk.magenta(configPath));
  var gulpInst = require(gulpModulePath);
  logEvents(generator, gulpInst);
  process.nextTick(function() {
    gulpInst.start.apply(gulpInst, toRun);
  });
}

// format orchestrator errors
function formatError(e) {
  if (!e.err) return e.message;
  if (e.err.message) return e.err.message;
  return JSON.stringify(e.err);
}

// wire up logging events
function logEvents(name, gulpInst) {
  gulpInst.on('task_start', function(e) {
    gutil.log('Starting', "'" + chalk.cyan(name + ':' + e.task) + "'...");
  });

  gulpInst.on('task_stop', function(e) {
    var time = prettyTime(e.hrDuration);
    gutil.log('Finished', "'" + chalk.cyan(name + ':' + e.task) + "'", 'after', chalk.magenta(time));
  });

  gulpInst.on('task_err', function(e) {
    var msg = formatError(e);
    var time = prettyTime(e.hrDuration);
    gutil.log("'" + chalk.cyan(name + ':' + e.task) + "'", 'errored after', chalk.magenta(time), chalk.red(msg));
  });

  gulpInst.on('task_not_found', function(err) {
    console.info(chalk.red("Task '" + err.task + "' was not defined in `" + name + "` but you tried to run it."));
    process.exit(1);
  });

  gulpInst.on('stop', function () {
    console.info('Scaffolding done');
  });
}