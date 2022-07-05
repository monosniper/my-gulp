const fs = require('fs');

const src_folder = 'src';
const build_folder = 'dist';

const path = {
    build: {
        html: build_folder + '/',
        css: build_folder + '/css/',
        js: build_folder + '/js/',
        img: build_folder + '/images/',
        icons: build_folder + '/images/icon',
        fonts: build_folder + '/fonts/',
    },
    src: {
        html: src_folder + '/pages/**/*.html',
        css: src_folder + '/assets/scss/main.scss',
        js: src_folder + '/assets/js/main.js',
        img: src_folder + '/assets/img/**/*.{jpg,png,svg,gif,ico,webp}',
        icons: src_folder + '/assets/icons/**/*.svg',
        fonts: src_folder + '/assets/fonts/*.ttf',
    },
    watch: {
        html: src_folder + '/**/*.html',
        css: src_folder + '/assets/**/*.scss',
        js: src_folder + '/assets/js/**/*.js',
        img: src_folder + '/assets/img/**/*.{jpg,png,svg,gif,ico,webp}',
        icons: src_folder + '/assets/icons/**/*.svg',
        fonts: src_folder + '/assets/fonts/**/*.ttf',
    },
    clean: "./" + build_folder + "/"
};

const {src, dest} = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    fileinclude = require('gulp-file-include'),
    autoprefixer = require('gulp-autoprefixer'),
    groupcssmediaqueries = require('gulp-group-css-media-queries'),
    cleancss = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    del = require('del'),
    concat = require('gulp-concat'),
    esbuild = require('gulp-esbuild'),
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    webphtml = require('gulp-webp-html'),
    svgSprite = require('gulp-svg-sprite'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    uglify = require('gulp-uglify-es').default,
    scss = require('gulp-sass')(require('sass'))

const html = () => {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

const images = () => {
    return src(path.src.img)
        .pipe(webp({
            quality: 70,
        }))
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(imagemin({
            progressive: true,
            svgPlugins: [{ removeViewBox: false }],
            interlaced: true,
            optimizationLevel: 3,
        }))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

const css = () => {
    return src(path.src.css)
        .pipe(scss({
            outputStyle: 'expanded'
        }))
        .pipe(groupcssmediaqueries())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 5 versions'],
            cascade: true,
        }))
        .pipe(dest(path.build.css))
        .pipe(cleancss())
        .pipe(rename({
            extname: ".min.css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

const js = () => {
    return src(path.src.js)
        .pipe(esbuild({
            outfile: 'main.js',
            bundle: true,
        }))
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

const icons = () => {
    return src(path.src.icons)
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../icons.svg",
                }
            }
        }))
        .pipe(dest(path.build.icons))
        .pipe(browsersync.stream())
}

const fonts = () => {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts))
        .pipe(browsersync.stream())

    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts))
        .pipe(browsersync.stream())
}

const watchFiles = () => {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
    gulp.watch([path.watch.icons], icons);
}

const browserSync = () => {
    browsersync.init({
        server: {
            baseDir: "./" + build_folder + "/"
        },
        port: 3000,
        notify: false
    })
}

const clean = () => del(path.clean)

const build = gulp.series(clean, gulp.parallel(html, css, js, images, icons, fonts));
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.images = icons;
exports.icons = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
