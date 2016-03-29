var $ = require('gulp-load-plugins')();
var gulp = require('gulp');
var argv = require('yargs').argv;
var nodemon = require('gulp-nodemon');
var browser = require('browser-sync');
var sequence = require('run-sequence');
var sass = require('gulp-sass');
var sassLint = require('gulp-sass-lint');
var cssnano = require('gulp-cssnano');
var cssjoin = require('gulp-cssjoin');
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var jshint = require('gulp-jshint');
var htmlmin = require('gulp-htmlmin');
var del = require('del');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

// check NODE_ENV
var isProductionBuild = process.env.NODE_ENV === 'production';
var isStagingBuild = process.env.NODE_ENV === 'staging';

var CONFIG_FOR_ENV = '';

if (isProductionBuild) {
  CONFIG_FOR_ENV = 'production';
} else {
  // if --production is found, we treat it as production
  if (!!(argv.production)) {
    CONFIG_FOR_ENV = 'production';
    isProductionBuild = true;
  } else {
    CONFIG_FOR_ENV = 'development';
  }
}

// for minification etc
var buildFilesForProduction = process.env.NODE_ENV === 'production';

// we'd need a slight delay to reload browsers connected to browser-sync after restarting nodemon
var BROWSER_SYNC_RELOAD_DELAY = 500;

// port to use for the development server.
var PORT = 1336;

// browsers to target when prefixing CSS.
var COMPATIBILITY = ['last 2 versions', 'ie >= 10'];

// client base path
var CLIENT_BASE_PATH = './public';

// file paths to various assets are defined here
var PATHS = {
  dist: CLIENT_BASE_PATH + '/dist',
  sass: {
    in: [
      CLIENT_BASE_PATH + '/styles/main.scss'
    ],
    out: CLIENT_BASE_PATH + '/dist/css',
    filesForLinting: [
      CLIENT_BASE_PATH + '/**/*.scss'
    ]
  },
  ejs: {
    in: CLIENT_BASE_PATH + '/**/*.ejs'
  },
  images: {
    in: CLIENT_BASE_PATH + '/assets/images/**/*'
  },
  jsToBuild: [
    './bower_components/jquery/dist/jquery.js',
    './bower_components/angular/angular.js',
    './bower_components/angular-ui-router/release/angular-ui-router.js',
    './bower_components/moment/moment.js',
    './bower_components/moment/locale/nb.js',
    './bower_components/angular-moment/angular-moment.js',
    CLIENT_BASE_PATH + '/core/app.js',
    CLIENT_BASE_PATH + '/core/run.js',
    CLIENT_BASE_PATH + '/core/config/' + CONFIG_FOR_ENV + '.js',
    CLIENT_BASE_PATH + '/core/services/**/*.js',
    CLIENT_BASE_PATH + '/elements/**/*.js',
    CLIENT_BASE_PATH + '/states/**/*.js'
  ],
  jsToLint: [
    CLIENT_BASE_PATH + '/states/**/*.js',
    CLIENT_BASE_PATH + '/elements/**/*.js',
    CLIENT_BASE_PATH + '/core/**/*.js'
  ]
};

// node server task
gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon({
    script: 'server.js',
    watch: ['server.js', 'routes/']
  })
  .on('start', function onStart() {
    // ensure start only got called once
    if (!called) { cb(); }
    called = true;
  })
  .on('restart', function onRestart() {
    // reload connected browsers after a slight delay
    setTimeout(function reload() {
      browser.reload({
        stream: false
      });
    }, BROWSER_SYNC_RELOAD_DELAY);
  });
});

// clean
gulp.task('clean', function () {
  var del = require('del');
  return del([
    PATHS.dist + '/**/*',
  ]);
});

// copy:ejs
gulp.task('copy:ejs', function () {
  return gulp.src(PATHS.ejs.in)
    .pipe($.if(buildFilesForProduction, htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest(PATHS.dist));
});

// compile sass
gulp.task('lint-sass', function () {
  return gulp.src(PATHS.sass.filesForLinting)
    // .pipe(sass())
    .pipe(sassLint())
    .pipe(sassLint.format());
});

// compile sass
gulp.task('sass', ['lint-sass'], function () {
  return gulp.src(PATHS.sass.in)
    .pipe(cssjoin())
    .pipe(sass())
    .pipe($.autoprefixer({
      browsers: COMPATIBILITY
    }))
    .pipe($.if(buildFilesForProduction,cssnano()))
    .pipe(gulp.dest(PATHS.sass.out));
});

// images
gulp.task('images', function (cb) {
  return gulp.src(PATHS.images.in)
    .pipe($.if(buildFilesForProduction,
      imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
      })
    ))
    .pipe(gulp.dest(PATHS.dist + '/images'));
});

// javascript
gulp.task('lint-js', function () {
  return gulp.src(PATHS.jsToLint)
    .pipe($.if(!buildFilesForProduction,jshint()))
    .pipe($.if(!buildFilesForProduction,jshint.reporter('jshint-stylish')));
});

// javascript
gulp.task('javascript', ['lint-js'], function () {
  var uglify = $.uglify()
    .on('error', function (e) {
      console.log(e);
    });

  return gulp.src(PATHS.jsToBuild)
    .pipe($.sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe($.if(buildFilesForProduction, ngAnnotate()))
    .pipe($.if(buildFilesForProduction, uglify))
    .pipe($.if(!buildFilesForProduction, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.dist + '/js'));
});

// dev build task
function buildSequenceDev(done) {
  return sequence('clean', ['copy:ejs', 'sass', 'images', 'javascript'], done);
}

// prod build task when using --production
function buildSequenceProd(done) {
  return sequence('clean', ['copy:ejs', 'sass', 'images', 'javascript'], done);
}

// build the 'dist' folder by running all of the above tasks
gulp.task('build', function(done) {
  if (buildFilesForProduction) {
    buildSequenceProd(done);
  } else {
    buildSequenceDev(done);
  }
});

// start a server to preview the site in
gulp.task('server', ['build', 'nodemon'], function() {
  browser.init({
    proxy: 'http://localhost:1338',
    port: PORT
  });
});
// build the site, run the server, and watch for file changes
gulp.task('run', ['build', 'server'], function() {
  gulp.watch([
    CLIENT_BASE_PATH + 'index.ejs',
    CLIENT_BASE_PATH + '/elements/**/*.scss',
    CLIENT_BASE_PATH + '/elements/**/*.ejs',
    CLIENT_BASE_PATH + '/elements/**/*.js',
    CLIENT_BASE_PATH + '/partials/**/*.ejs',
    CLIENT_BASE_PATH + '/core/**/*.js',
    CLIENT_BASE_PATH + '/states/**/*.scss',
    CLIENT_BASE_PATH + '/states/**/*.ejs',
    CLIENT_BASE_PATH + '/states/**/*.js',
    CLIENT_BASE_PATH + '/styles/**/*.scss',
    'routes/**/*.js',
    'server.js',
    'gulpfile.js',
  ], ['build', browser.reload]);
});
