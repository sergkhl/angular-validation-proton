var gulp = require('gulp'),
    gutil = require('gulp-util'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    stylus = require('gulp-stylus'),
    watch = require('gulp-watch'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr(),
    inject = require('gulp-inject');

function unique(value, index, self) {
    return self.indexOf(value) === index;
}

var modules = {

    js: ['./src/*.js'],
    vendors: [

    ],
    angularVendors: [
//        '.vendor/angular.min.js',
//        './vendor/angular-*/*.js'
    ],
    baseFunctions: [

    ]
};


for(var key in modules) {
    modules[key] = modules[key].filter(unique);
};


/********* scripts ***********/

gulp.task('scripts-dist', function () {

    var paths = modules.js;

    gulp.src(paths)
        .pipe(concat('angular-validation-proton.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('scripts', function () {
    gulp.start('scripts-dist');
});


/********* watch ***********/
gulp.task('watch', function() {
    gulp.watch(modules.js, ['scripts']);
});

/********* default ***********/
gulp.task('default', function() {
    gulp.start('scripts', 'watch');
});