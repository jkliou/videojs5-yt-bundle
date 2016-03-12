var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var browserSync = require('browser-sync').create();
var path = require('path');
var collapse = require('bundle-collapser/plugin');
// minify
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var rename    = require("gulp-rename");

//process.env.BROWSERIFYSHIM_DIAGNOSTICS=1;

gulp.task('js:videojs', function () {
    return browserify()
        .require(path.dirname(require.resolve('video.js')) + "/video.js", {expose: 'video.js', fullPaths: false})
        .plugin(collapse)
        .bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('videojs.js'))
        .pipe(gulp.dest('./dist/js'));
});
gulp.task('js:videojs-yt-standalone', function() {
    return browserify('./src/Youtube.js', { fullPaths: false })
        .exclude('video.js')
        .plugin(collapse)
        .bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('videojs.yt.js'))
        .pipe(gulp.dest('./dist/js'));
});
// bundle
gulp.task('js:videojs-bundle', function () {
    return browserify('./src/videojs.bundle/index.js', { fullPaths: false })
        .plugin(collapse)
        .bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('video.ytbundle.js'))
        .pipe(gulp.dest('./dist/js'));
});
gulp.task('js:build', function() {
  return gulp.src('./dist/js/*.js')
    .pipe(uglify())
    .pipe(rename(function(path) {
      path.basename += ".min";
      path.extname = ".js";
    }))
    .pipe(gulp.dest('./build/js'));
});
gulp.task('js', [
    'js:videojs-bundle',
    'js:build'
]);
gulp.task('jsdev', [
    'js:videojs',
    'js:videojs-yt-standalone',
    'js:videojs-bundle'
]);

gulp.task('css:copy-videojs.min.css', function () {
    gulp.src(path.dirname(require.resolve('video.js')) + '/video-js.min.css')
        .pipe(gulp.dest('dist/css'));
});
gulp.task('css:concat', function() {
  return gulp.src('./dist/css/*.css')
    .pipe(concat('video.ytbundle.min.css'))
    .pipe(gulp.dest('./build/css'));
});
gulp.task('css:build', function () {
    gulp.src('./dist/css/video.ytbundle.css')
    .pipe(minifyCSS({
       keepBreaks: true,
    }))
    .pipe(rename(function(path) {
      path.basename += ".min";
      path.extname = ".css";
    }))
    .pipe(gulp.dest('./build/css/'));
});
gulp.task('css', [
    'css:copy-videojs.min.css',
    'css:concat'
]);

gulp.task('font:copy-videojs-font', function () {
    gulp.src(path.dirname(require.resolve('video.js')) + '/font/**')
        .pipe(gulp.dest('dist/css/font'));
});
gulp.task('font:concat', function() {
    gulp.src('./dist/css/font/**')
        .pipe(gulp.dest('build/css/font'));
});
gulp.task('fonts', [
    'font:copy-videojs-font',
    'font:concat'
]);

gulp.task('dev:bs', ['default'], function() {
    browserSync.init({
        server: {baseDir: './'},
        directory: true
    });

    gulp.watch(['src/**/*.js', 'examples/*.html'], ['dev:watch']);
});
gulp.task('dev:watch', ['default'], browserSync.reload);
gulp.task('dev', ['dev:bs']);


gulp.task('default', ['js', 'fonts', 'css']);