var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    plumber = require('gulp-plumber'),
    livereload = require('gulp-livereload'),
    prefix = require('gulp-autoprefixer');

sass.compiler = require('node-sass');

// Scripts Task
// Uglifies
gulp.task('scripts', function() {
    gulp.src('js/**/*.js')
        .pipe(plumber())
        .pipe(uglify())
        .pipe(gulp.dest('./minjs'))
        .pipe(livereload());
});

// Styles Task
// Uglifies
gulp.task('styles', function() {
    gulp.src('scss/**/*.scss')
        .pipe(plumber())
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(prefix('last 3 versions'))
        .pipe(gulp.dest('./mincss'))
        .pipe(livereload());
});

// Watch Task
// Watches JS & SCSS
gulp.task('watch', function() {
    var server = livereload();

    // gulp.watch('js/**/*.js', ['scripts']);
    gulp.watch('scss/**/*.scss', ['styles']);
});

/* Typing only " gulp " will run scripts, styles and 
then watch tasks */
gulp.task('default', ['styles', 'scripts', 'watch']);