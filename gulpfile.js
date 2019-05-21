'use strict';

var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    cssnano = require('cssnano'),
    yaml = require('js-yaml'),
    fs = require('fs'),
    cfg = yaml.safeLoad(fs.readFileSync('_config.yml')),
    path = require('path');

require('shelljs/global');

var htmlMinifierOptions = {
    removeComments: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    removeOptionalTags: true,
    minifyJS: true,
    minifyCSS: true
};

var dirs = {
    public: 'public',
    fonts: 'public/fonts',
    imgs: 'public/img',
    assetsDir: 'public/assets'
};

gulp.task('hexo', function (done) {
    exec('hexo g');
    done();
});

gulp.task('useref', gulp.series('hexo', function (done) {
    gulp.src('public/**/*.html')
        .pipe($.useref({
            searchPath: 'public',
            allowEmpty: true,
            transformPath: function (filePath) {
                filePath = path.normalize(filePath);
                return filePath.replace(dirs.public + cfg.root, dirs.public + '/');
            }
        }))
        .pipe($.if('*.css', $.postcss([
            cssnano()
        ])))
        .pipe($.if('*.css', $.minifyCss()))
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.html', $.htmlMinifier(htmlMinifierOptions)))
        .pipe(gulp.dest('public'));
    done();
}));

gulp.task('rev:media', function (done) {
    gulp.src([dirs.fonts + '/**/*', dirs.imgs + '/**/*'], { base: dirs.public, allowEmpty: true })
        .pipe($.rev())
        .pipe(gulp.dest(dirs.assetsDir))
        .pipe($.rev.manifest('rev-media.json'))
        .pipe(gulp.dest(dirs.assetsDir));
    done();
});

gulp.task('rev:scripts', gulp.series('useref', 'rev:media', function (done) {
    var manifest = gulp.src(dirs.assetsDir + '/rev-media.json', { allowEmpty: true });
    gulp.src([dirs.public + '/css/dist*.css', dirs.public + '/js/dist*.js'], { base: dirs.public, allowEmpty: true })
        .pipe($.rev())
        .pipe($.revReplace({
            manifest: manifest
        }))
        .pipe(gulp.dest(dirs.assetsDir))
        .pipe($.rev.manifest())
        .pipe(gulp.dest(dirs.assetsDir));
    done();
}));

gulp.task('img:min', gulp.series('rev:media', function (done) {
    var pngquant = require('imagemin-pngquant');
    gulp.src(dirs.assetsDir + '/img/**/*', { base: dirs.assetsDir })
        .pipe($.imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(dirs.assetsDir));
    done();
}));

gulp.task("rev:replace", gulp.series("rev:scripts", function (done) {
    var manifest = gulp.src([dirs.assetsDir + '/rev-*.json']);
    gulp.src([dirs.public + "/**/*.html"])
        .pipe($.revReplace({
            manifest: manifest,
            modifyReved: function (fileName) {
                if (fileName.indexOf('/dist') > -1) {
                    //special files proccessed by gulp-useref
                    fileName = cfg.root + 'assets/' + fileName;
                } else {
                    fileName = 'assets/' + fileName;
                }
                return fileName;
            }
        }))
        .pipe(gulp.dest(dirs.public));
    done();
}));

gulp.task('img', gulp.series('img:min'));
gulp.task('default', gulp.series('rev:replace', 'img'));
