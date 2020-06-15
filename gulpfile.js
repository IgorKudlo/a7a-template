'use strict';

const gulp = require('gulp'),
  sass = require('gulp-sass'),
  plumber = require('gulp-plumber'),
  copy = require('gulp-copy'),
  browserSync = require('browser-sync'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify-es').default,
  cleancss = require('gulp-clean-css'),
  autoprefixer = require('gulp-autoprefixer'),
  sourceMaps = require('gulp-sourcemaps'),
  imagemin = require('gulp-imagemin'),
  imageminJpegRecompress = require('imagemin-jpeg-recompress'),
  pngquant = require('imagemin-pngquant'),
  webp = require("imagemin-webp"),
  extReplace = require("gulp-ext-replace"),
  spritesmith = require('gulp.spritesmith'),
  svgSprite = require('gulp-svg-sprite'),
  svgmin = require('gulp-svgmin'),
  cheerio = require('gulp-cheerio'),
  replace = require('gulp-replace'),
  del = require('del');

// Local Server
gulp.task('browser-sync', function () {
  browserSync({
    server: {
      baseDir: 'app'
    },
    notify: false,
    // online: false, // Work offline without internet connection
    // tunnel: true, tunnel: 'projectname', // Demonstration page: http://projectname.localtunnel.me
  })
});
function bsReload(done) { browserSync.reload(); done(); };

// Custom Styles
gulp.task('styles', function () {
  return gulp.src('app/sass/**/*.scss')
    .pipe(sourceMaps.init())
    .pipe(plumber({
      handleError: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(sass({
      outputStyle: 'expanded'
    })
      .on('error', function (err) {
        console.log(err.message);
        // sass.logError
        this.emit('end');
      })
    )
    .pipe(concat('styles.min.css'))
    .pipe(autoprefixer({
      grid: true,
      overrideBrowserslist: ['last 3 versions']
    }))
    .pipe(cleancss({ level: { 1: { specialComments: 0 } } })) // Optional. Comment out when debugging
    .pipe(sourceMaps.write())
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.stream())
});

// Scripts & JS Libraries
gulp.task('scripts', function () {
  return gulp.src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/magnific-popup/dist/jquery.magnific-popup.js',
    'node_modules/slick-carousel/slick/slick.js',
    'app/js/_custom.js' // Custom scripts. Always at the end
  ])
    .pipe(concat('scripts.min.js'))
    .pipe(uglify()) // Minify js (opt.)
    .pipe(gulp.dest('app/js'))
    .pipe(browserSync.reload({ stream: true }))
});


// Compress img
gulp.task('img', function () {
  return gulp.src('app/_src-img/**/*.{png,jpg,svg}')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      interlaced: true,
      optimizatioLevel: 3, // 0 to 7
      use: [pngquant()]
    }))
    .pipe(gulp.dest('app/img'));
});


// convert webp
gulp.task("exportWebP", function () {
  return gulp.src('app/img/**/*.{png,jpg}')
    .pipe(imagemin([
      webp({
        quality: 70
      })
    ]))
    .pipe(extReplace(".webp"))
    .pipe(gulp.dest('app/img'));
});


// Sprite png
gulp.task('sprite', function () {
  var spriteData = gulp.src('app/img/icons/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: '_sprite.scss',
    cssFormat: 'css',
    imgPath: '../img/sprite.png',
    padding: 15
  }));
  spriteData.img.pipe(gulp.dest('app/img'));
  spriteData.css.pipe(gulp.dest('app/sass/sprite'));
});


// Sprite svg
gulp.task('svg', function () {
  return gulp.src('app/img/icons-svg/*.svg')
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: "../sprite.svg"
        }
      }
    }))
    .pipe(gulp.dest('app/img/'));
});


// Code & Reload
gulp.task('code', function () {
  return gulp.src('app/**/*.html')
    .pipe(browserSync.reload({ stream: true }))
});


// Clean directory before deploy
gulp.task('clean', function () {
  return del('static');
});

// Build production version
gulp.task('build', gulp.series('clean', gulp.parallel('img', 'styles', 'scripts'), () => {
  return gulp
    .src([
      'app/css/**/*',
      'app/fonts/**/*',
      'app/img/**/*',
      'app/js/**/*',
      'app/*.html',
      'app/*.php',
    ])
    .pipe(copy('static/', { prefix: 1 }))
}));


gulp.task('watch', function () {
  gulp.watch('app/sass/**/*.scss', gulp.parallel('styles'));
  gulp.watch(['libs/**/*.js', 'app/js/_custom.js'], gulp.parallel('scripts'));
  gulp.watch('app/*.html', gulp.parallel('code'));
  gulp.watch('app/_src-img/**/*', gulp.series('img', 'exportWebP'));
});

gulp.task('default', gulp.parallel('img', 'styles', 'scripts', 'browser-sync', 'watch'));
