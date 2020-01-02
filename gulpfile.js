const { src, dest, series } = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
var del = require('del');

function copyFiles(cb) {
    src([
        './routes/**/*',
        './config/**/*',
        './log/**/*',
        './middleware/**/*',
        './data/**/*',
        'package.json',
        'server.js'
    ], {base: '.'})
        .pipe(dest('./dist'));

    cb();
};

async function clearDist() {
    return await del(['dist'], { force: true });
}

exports.copyFiles = copyFiles;
exports.clearDist = clearDist;
exports.build = series(clearDist, copyFiles);