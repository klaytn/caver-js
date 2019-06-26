#!/usr/bin/env node

'use strict'

var path = require('path')

var del = require('del')
var gulp = require('gulp')
var browserify = require('browserify')
var jshint = require('gulp-jshint')
var uglify = require('gulp-uglify')
var babel = require('gulp-babel')
var rename = require('gulp-rename')
var source = require('vinyl-source-stream')
var exorcist = require('exorcist')
var streamify = require('gulp-streamify')
var replace = require('gulp-replace')
var exec = require('child_process').exec

var DEST = path.join(__dirname, 'dist/')

var packages = [{
    fileName: 'caver',
    expose: 'Caver',
    src: './index.js',
    ignore: ['xhr2', 'xmlhttprequest', 'websocket']
}, {
    fileName: 'caver-utils',
    expose: 'CaverUtils',
    src: './packages/caver-utils/src/index.js'
}, {
    fileName: 'caver-klay',
    expose: 'CaverKlay',
    src: './packages/caver-klay/src/index.js'
},
{
    fileName: 'caver-core-helpers',
    expose: 'CaverHelpers',
    src: './packages/caver-core-helpers/src/index.js'
},
{
    fileName: 'caver-middleware',
    expose: 'CaverMiddleware',
    src: './packages/caver-middleware/src/index.js'
},
{
    fileName: 'caver-rtm',
    expose: 'CaverRtm',
    src: './packages/caver-middleware/src/index.js'
},
{
    fileName: 'caver-net',
    expose: 'CaverNet',
    src: './packages/caver-net/src/index.js'
},
{
    fileName: 'caver-core-requestmanager',
    expose: 'CaverRequestManager',
    src: './packages/caver-core-requestmanager/src/index.js',
    ignore: ['xhr2', 'xmlhttprequest', 'websocket']
}, {
    fileName: 'caver-core-subscriptions',
    expose: 'CaverSubscriptions',
    src: './packages/caver-core-subscriptions/src/index.js'
}, {
    fileName: 'caver-core-method',
    expose: 'CaverMethod',
    src: './packages/caver-core-method/src/index.js'
}]

var browserifyOptions = {
    debug: true,
    derequire: true,
    insertGlobalVars: false, // jshint ignore:line
    detectGlobals: true,
    bundleExternal: true
}

var ugliyOptions = {
    compress: {
        dead_code: true,  // jshint ignore:line
        drop_debugger: true,  // jshint ignore:line
        global_defs: {      // jshint ignore:line
            "DEBUG": false      // matters for some libraries
        }
    }
}

gulp.task('clean', gulp.series(function (cb) {
    del([DEST]).then(cb.bind(null, null))
}))

packages.forEach(function (pckg, i) {
    var prevPckg = (!i) ? 'clean' : packages[i - 1].fileName

    gulp.task(pckg.fileName, gulp.series(prevPckg, function () {
        browserifyOptions.standalone = pckg.expose

        var pipe = browserify(browserifyOptions)
            .require(pckg.src, { expose: pckg.expose })
            .require('bn.js', { expose: 'BN' }) // expose it to dapp developers
            .add(pckg.src)

        if (pckg.ignore) {
            pckg.ignore.forEach(function (ignore) {
                pipe.ignore(ignore)
            })
        }

        return pipe.bundle()
            .pipe(exorcist(path.join(DEST, pckg.fileName + '.js.map')))
            .pipe(source(pckg.fileName + '.js'))
            .pipe(streamify(babel({
                compact: false,
                presets: ['@babel/preset-env'],
                plugins: ['@babel/plugin-transform-runtime'],
            })))
            .pipe(gulp.dest(DEST))
            .pipe(streamify(babel({
                compact: true,
                presets: ['@babel/preset-env'],
                plugins: ['@babel/plugin-transform-runtime'],
            })))
            .pipe(streamify(uglify(ugliyOptions)))
            .on('error', function (err) { console.error(err) })
            .pipe(rename(pckg.fileName + '.min.js'))
            .pipe(gulp.dest(DEST))
    }))
})

gulp.task('all', gulp.series('clean', packages[packages.length - 1].fileName))

gulp.task('default', gulp.series('clean', packages[0].fileName))
