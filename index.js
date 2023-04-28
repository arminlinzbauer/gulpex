const { defaults } = require('./defaults');
const { annotate } = require('./annotate');
const { styleFilter, scriptFilter, objectFilter } = require('./filters');
const { register, lookup, retain, apply } = require('./task-registry');
const { end, err } = require('./pipe-controls');
const { findExtensions, loadExtension, guardConfig } = require('./extension-manager');
const { createPipe, executePipe, defineTask, defineHook, registerPipe, buildHookDefiner } = require('./pipe-builder');

const gulp = require('gulp');
const sass = require('gulp-dart-sass');
const sourcemap = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const plumber = require('gulp-plumber');
const autoprefixer = require('autoprefixer');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;
const gulpif = require('gulp-if');

async function main(exports, config, rootDir) {
  if (!rootDir) {
    console.error(
      "GulpEx Error:\n  "
      + "Project root directory not specified. Starting from GulpEx version 2.0,\n  "
      + "`__dirname` must be passed to the `gulpex()` function call as a 3rd argument.\n  "
      + "Consult your GulpEx version's documentation for more information.\n"
    );
    process.exit(1);
  }

  config = Object.assign(defaults, config);
  config.styles = objectFilter(config.bundles, styleFilter);
  config.bundles = objectFilter(config.bundles, scriptFilter);
  config.rootDir = rootDir;

  function init(done) {
    function copyPublicAssets() {
      let assets = config.assets;

      if (assets.length === 0) {
        return Promise.resolve();
      }

      let resolver = Promise.resolve();
      for (let asset in assets) {
        if (!assets.hasOwnProperty(asset)) {
          continue;
        }

        asset = assets[asset];
        if (typeof asset === 'string') {
          asset = { src: asset, dest: config.assetDirectory };
        } else if (typeof asset === 'object' &&
          asset.hasOwnProperty('length')) {
          if (asset.length < 2) {
            asset[1] = config.assetDirectory;
          }
          asset = { src: asset[0], dest: asset[1] };
        }

        if (typeof asset.src === 'undefined') {
          continue;
        }

        if (typeof asset.dest === 'undefined') {
          asset.dest = config.assetDirectory;
        }

        resolver = resolver.then(
          new Promise((resolve, reject) => {
            gulp.src(asset.src).
              on('error', reject).
              pipe(gulp.dest(asset.dest)).
              on('error', reject).
              on('end', resolve);
          }),
        );
      }

      return resolver.catch(() => {
        console.err('Error while copying public assets. Check paths!');
      });
    }

    Promise.resolve().then(copyPublicAssets).catch(error => {
      console.warn(error.message);
    }).finally(() => {
      done();
    });
  }

  function createBundle(bundle, deploy) {
    return new Promise((resolve) => {

      bundle.path = typeof bundle.path !== 'string' ?
        config.scriptsDir :
        bundle.path;

      bundle.minify = typeof bundle.minify === 'boolean' ?
        bundle.minify :
        true;

      gulp.src(bundle.files).
        pipe(gulpif(!deploy, sourcemap.init())).
        on('error', err).
        pipe(concat(bundle.name, { newLine: ';\n' })).
        on('error', err).
        pipe(gulpif(deploy && bundle.minify, uglify())).
        on('error', err).
        pipe(gulpif(deploy && bundle.minify, rename({ suffix: '.min' }))).
        on('error', end).
        pipe(gulpif(!deploy, sourcemap.write('.'))).
        on('error', err).
        pipe(gulp.dest(bundle.path)).
        on('error', err).
        on('end', resolve);
    });
  }

  function buildJs(deploy, bundleKey) {
    deploy = !!deploy;

    let single = typeof bundleKey === 'string';
    single = single && bundleKey.trim().length > 0;
    if (single) {
      bundleKey = bundleKey.trim().toLowerCase();
    }

    return function (done) {
      let promises = [];
      for (let key in config.bundles) {
        if (!config.bundles.hasOwnProperty(key)) continue;
        if (typeof key !== 'string') continue;
        let bundle = config.bundles[key];

        if (!bundle.hasOwnProperty('name')) continue;
        if (typeof bundle.name !== 'string') continue;
        if (typeof bundle.files !== 'object') continue;
        if (bundle.files.length < 1) continue;

        if (!single || key.trim().toLowerCase() === bundleKey) {
          promises.push(createBundle(bundle, deploy));
        }
      }

      Promise.all(promises).then(() => done()).catch(e => {
        console.error(e);
        done();
      });
    };
  }

  function createStyle(style, deploy) {
    return new Promise((resolve) => {
      style.path = typeof style.path !== 'string' ?
        config.cssDirectory :
        style.path;

      style.minify = typeof style.minify === 'boolean' ?
        style.minify :
        true;

      // gulp.src(style.files).
      //   pipe(plumber()).
      //   on('error', err).
      //   pipe(gulpif(!deploy, sourcemap.init())).
      //   on('error', err).
      //   pipe(gulpif(deploy && style.minify, sass({
      //     outputStyle: 'compressed',
      //     includePaths: config.includePaths,
      //   }))).
      //   on('error', err).
      //   pipe(gulpif(!deploy || !style.minify, sass({
      //     outputStyle: 'expanded',
      //     includePaths: config.includePaths,
      //   }))).
      //   on('error', err).
      //   pipe(gulpif(deploy, postcss([autoprefixer()]))).
      //   on('error', end).
      //   pipe(gulpif(deploy && style.minify, rename({ suffix: '.min' }))).
      //   on('error', end).
      //   pipe(gulpif(!deploy, sourcemap.write('.'))).
      //   on('error', err).
      //   pipe(gulp.dest(style.path)).
      //   on('error', err).
      //   on('end', resolve);

      executePipe(
        createPipe(
          defineTask(plumber(), err),
          defineTask(gulpif(!deploy, sourcemap.init()), err),
          defineTask(gulpif(deploy && style.minify, sass({
            outputStyle: 'compressed',
            includePaths: config.includePaths,
          })), err),
          defineTask(gulpif(!deploy || !style.minify, sass({
            outputStyle: 'expanded',
            includePaths: config.includePaths,
          })), err),
          defineHook('style.build.prefix.before'),
          defineTask(gulpif(deploy, postcss([autoprefixer()])), end),
          defineHook('style.build.prefix.after'),
          defineHook('style.build.minify.before'),
          defineTask(gulpif(deploy && style.minify, rename({ suffix: '.min' })), end),
          defineHook('style.build.minify.after'),
          defineHook('style.build.sourcemap.before'),
          defineTask(gulpif(!deploy, sourcemap.write('.')), err),
          defineHook('style.build.sourcemap.after'),
          defineHook('style.build.output.before'),
          defineTask(gulp.dest(style.path), err, resolve),
        ), gulp.src(style.files)
      );
    });
  }

  function buildCss(deploy, styleKey) {
    deploy = !!deploy;

    let single = typeof styleKey === 'string';
    single = single && styleKey.trim().length > 0;
    if (single) {
      styleKey = styleKey.trim().toLowerCase();
    }

    return function (done) {
      let promises = [];
      for (let key in config.styles) {
        if (!config.styles.hasOwnProperty(key)) continue;
        if (typeof key !== 'string') continue;
        let style = config.styles[key];

        if (typeof style.files !== 'object') continue;
        if (style.files.length < 1) continue;

        if (!single || key.trim().toLowerCase() === styleKey) {
          promises.push(createStyle(style, deploy));
        }
      }

      Promise.all(promises).then(() => done()).catch(e => {
        console.error(e);
        done();
      });
    };
  }

  function watch() {
    const watcherOpts = { atomic: true, usePolling: true, alwaysStat: true };

    // Initialize Stylesheet-Watchers
    for (let key in config.styles) {
      if (!config.styles.hasOwnProperty(key)) continue;
      if (typeof key !== 'string') continue;
      let style = config.styles[key];

      if (typeof style.watch !== 'object') {
        if (typeof style.watch === 'undefined') {
          style.watch = [];
        } else {
          style.watch = !!style.watch;
        }
      }

      if (!!style.watch) {
        if (typeof style.watch !== 'object') {
          style.watch = [];
        }

        let watchPaths = style.watch.slice();
        watchPaths.splice(0, 0, ...style.files);

        gulp.watch(
          watchPaths,
          watcherOpts,
          gulp.parallel(
            buildCss(false, key)
          ),
        );
      }
    }

    // Initialize JS-Bundle Watchers
    for (let key in config.bundles) {
      if (!config.bundles.hasOwnProperty(key)) continue;
      if (typeof key !== 'string') continue;
      let bundle = config.bundles[key];

      if (!bundle.hasOwnProperty('name')) continue;
      if (typeof bundle.name !== 'string') continue;

      if (typeof bundle.watch !== 'boolean') {
        bundle.watch = true;
      }

      if (bundle.watch) {
        gulp.watch(
          bundle.files,
          watcherOpts,
          gulp.parallel(
            buildJs(false, key),
          ),
        );
      }
    }
  }

  // Initialization Tasks
  register('init', init);

  // Converting Tasks
  register('convert-js', annotate(buildJs(false), 'convert-js'));
  register('convert-css', annotate(buildCss(false), 'convert-css'));
  register('convert', gulp.parallel(lookup('convert-js'), lookup('convert-css')));

  // Deployment Tasks
  register('deploy-js', gulp.series(lookup('init'), gulp.parallel(lookup('convert-js'), buildJs(true))));
  register('deploy-css', gulp.series(lookup('init'), gulp.parallel(lookup('convert-css'), buildCss(true))));
  register('deploy', gulp.series(lookup('init'), gulp.parallel(
    gulp.parallel(lookup('convert-js'), annotate(buildJs(true), 'deploy-js')),
    gulp.parallel(lookup('convert-css'), annotate(buildCss(true), 'deploy-css'))
  )));

  // Watcher Tasks
  register('watch', gulp.series(lookup('deploy'), watch));
  register('default', lookup('deploy'));

  // Load Plugins
  try {
    const extensions = findExtensions(rootDir, config);
    for (let extensionFile of extensions) {
      const extensionName = String(extensionFile).replace(/autoload\//, '');
      loadExtension(extensionFile, extensionName, rootDir, {
        config: guardConfig(config, extensionName),
        gulp,
        annotate,
        register,
        retain,
        lookup,
        plugin: {
          registerPipe,
          createPipe,
          defineTask,
          defineHook: buildHookDefiner(extensionName),
          err,
          end
        }
      });
    }
  } catch (e) {
  }

  // Publish Defined Tasks
  apply(exports);
};

module.exports = main;
