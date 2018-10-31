var gulp = require('gulp');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var px2rem = require('postcss-px2rem');  
var sass = require('gulp-sass'); //sass
var cssnano = require('gulp-cssnano'); // css的层级压缩合并
var uglify = require('gulp-uglify'); //js压缩  
var concat=require('gulp-concat');//js合并
var rename = require('gulp-rename'); //重命名  
var imagemin = require('gulp-imagemin'); //图片压缩 
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var babel = require('gulp-babel');//es6->es5
var proxy = require('http-proxy-middleware')//跨域
var Config = require('./gulpfile.config.js');
//======= gulp dev 开发环境下 ===============
function dev() {

    var jsonPlaceholderProxy = proxy('/api', {
        target: 'http://192.168.1.222:8080',
        // target: 'http://c.davfang.com',
        changeOrigin: true,
        pathRewrite: {
            '^/api': 'api'
        }
    })

    /** 
     * HTML处理 
     */
    gulp.task('html:dev', function () {
        return gulp.src(Config.html.src).pipe(gulp.dest(Config.html.dist)).pipe(reload({
            stream: true
        }));
    });
    /** 
     * assets文件夹下的所有文件处理 
     */
    gulp.task('assets:dev', function () {
        return gulp.src(Config.assets.src).pipe(gulp.dest(Config.assets.dist)).pipe(reload({
            stream: true
        }));
    });
    /** 
     * CSS样式处理 
     */
    gulp.task('css:dev', function () {
        var plugins = [ 
            autoprefixer({browsers: ['> 1%'], cascade: false}),
            px2rem({remUnit: 37.5})
        ];
        return gulp.src(Config.css.src).pipe(postcss(plugins))
        .pipe(gulp.dest(Config.css.dist)).pipe(reload({
            stream: true
        }));
    });
    /** 
     * SASS样式处理 
     */
    gulp.task('sass:dev', function () {
        var plugins = [ 
            autoprefixer({browsers: ['> 1%'], cascade: false}),
            px2rem({remUnit: 37.5})
        ];
        return gulp.src(Config.sass.src).pipe(sass()).pipe(postcss(plugins))
        .pipe(gulp.dest(Config.sass.dist)).pipe(reload({
            stream: true
        }));
    });
    /** 
     * js处理 
     */
    gulp.task('js:dev', function () {
        return gulp.src(Config.js.src).pipe(babel()).pipe(gulp.dest(Config.js.dist)).pipe(reload({
            stream: true
        }));
    });
    /** 
     * 合并所有js文件并做压缩处理
     */
    gulp.task('js-concat', function () {
        return gulp.src(Config.js.src).pipe(babel()).pipe(concat(Config.js.build_name)).pipe(gulp.dest(Config.js.dist)).pipe(rename({
            suffix: '.min'
        })).pipe(uglify()).pipe(gulp.dest(Config.js.dist));
    });
    /** 
     * 图片处理 
     */
    gulp.task('images:dev', function () {
        return gulp.src(Config.img.src).pipe(imagemin({
            optimizationLevel: 3
            , progressive: true
            , interlaced: true
        })).pipe(gulp.dest(Config.img.dist)).pipe(reload({
            stream: true
        }));
    });
    gulp.task('dev', ['html:dev', 'css:dev', 'sass:dev', 'js:dev', 'assets:dev', 'images:dev'], function () {
        browserSync.init({
            server: {
                baseDir: Config.dist,
                middleware:[jsonPlaceholderProxy]
            }, 
            notify: false,
            //使用（而不是一个自动检测到Browsersync）特定端口 
            port: 8888
        });
        // Watch .html files  
        gulp.watch(Config.html.src, ['html:dev']);
        // Watch .css files  
        gulp.watch(Config.css.src, ['css:dev']);
        // Watch .scss files  
        gulp.watch(Config.sass.src, ['sass:dev']);
        // Watch assets files  
        gulp.watch(Config.assets.src, ['assets:dev']);
        // Watch .js files  
        gulp.watch(Config.js.src, ['js:dev']);
        // Watch image files  
        gulp.watch(Config.img.src, ['images:dev']);
    });
}
//======= gulp dev 开发环境下 ===============
module.exports = dev;