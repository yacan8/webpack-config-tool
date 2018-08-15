const Liftoff = require('liftoff');
const gutil = require('gulp-util');
const chalk = require('chalk');
const globalModules = require('global-modules');
const path = require('path');
const prettyTime = require('pretty-hrtime');
const generator = 'webpack-config-tool';

function handleArguments(env) {

  var argv = env.argv;
  // var tasksFlag = argv.T || argv.tasks;
  // var tasks = argv._;
  var toRun = ['default'];
  var args = [];

  if (!env.modulePath) {
    gutil.log(chalk.red('No local gulp install found in'), chalk.magenta(generator));
    process.exit(1);
  }

  require(env.configPath);
  console.info('Using slushfile', chalk.magenta(env.configPath));

  var gulpInst = require(env.modulePath);
  gulpInst.args = args;
  logEvents(generator, gulpInst);

  if (process.cwd() !== env.cwd) {
    process.chdir(env.cwd);
    gutil.log('Working directory changed to', chalk.magenta(env.cwd));
  }

  process.nextTick(function() {
    // if (tasksFlag) {
    //   return logTasks(generator.name, gulpInst);
    // }
    gulpInst.start.apply(gulpInst, toRun);
  });
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
    console.info(chalk.red("Task '" + err.task + "' was not defined in `slush-" + name + "` but you tried to run it."));
    process.exit(1);
  });

  gulpInst.on('stop', function () {
    console.info('Scaffolding done');
  });
}

function install() {
  return new Promise((resolve, reject) => {
    var argv = {};
    argv.cwd = process.cwd();
    argv._ = [];

    var cli = new Liftoff({
      processTitle: 'slush',
      moduleName: 'gulp',
      configName: 'slushfile'
      // completions: require('../lib/completion') FIXME
    });

    cli.on('require', function(name) {
      gutil.log('Requiring external module', chalk.magenta(name));
    });

    cli.on('requireFail', function(name) {
      gutil.log(chalk.red('Failed to load external module'), chalk.magenta(name));
    });

    cli.launch(argv, handleArguments);
  })
}
// install();
module.exports = install;