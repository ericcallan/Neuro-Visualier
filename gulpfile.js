"use strict";

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var open = require('gulp-open'); // opens in browser
var browserify = require("browserify");
var babelify = require("babelify");
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require("gulp-uglify");
var sass = require('gulp-sass');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var historyApiFallback = require('connect-history-api-fallback');
var imagemin = require('gulp-imagemin');
var notify = require("gulp-notify");
var gulpCopy = require('gulp-copy');

var config = {
  port: 3000,
  devBaseUrl: 'http://localhost',
  paths: {
    html: './src/**/*.html',
    dist: './dist',
    audioDist: './dist/audio',
    js: './src/scripts/**/*.js',
    mainJs: './src/scripts/main.js',
    scss: './src/styles/**/*.scss',
    css: './dist/styles',
    images: './src/images/*',
    audio: './src/sounds/*',
  }
}
gulp.task('connect', function () {
    browserSync.init({
        server: {
            middleware: [historyApiFallback()],
            baseDir: config.paths.dist,
            index: 'index.html'
        }
    });
});

gulp.task('html', function(){
  gulp.src(config.paths.html)
    .pipe(gulp.dest(config.paths.dist))
});

gulp.task('audio', function() {
  gulp.src(config.paths.audio)
    .pipe(gulp.dest(config.paths.audioDist))
});

gulp.task('watch', function() {
  gulp.watch(config.paths.audio, ['audio']);
  gulp.watch(config.paths.html, ['html']);
  gulp.watch(config.paths.scss, ['css']);
  gulp.watch(config.paths.js, ['js']);
  gulp.watch(config.paths.images, ['image']);
});

gulp.task('js', function() {
    browserify(config.paths.mainJs)
        .transform(babelify, {presets: ["es2015", "react"]})
        .bundle()
        .on('error', console.error.bind(console))
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(config.paths.dist + '/scripts'))
});

gulp.task('css', function () {
  return gulp.src(config.paths.scss)
    .pipe(sass({}).on('error', function(err) {
        return notify().write(err);
    }))
    .pipe(gulp.dest(config.paths.css))
    .pipe(browserSync.stream());
});

gulp.task('image', () =>
    gulp.src('./src/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/img'))
);

gulp.task('default', ['html', 'js', 'css', 'image', 'audio', 'watch']);
