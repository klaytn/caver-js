module.exports = {
    entry: './webpack.js',
    output: {
        filename: 'dist/caver.min.js',
    },
    node: {
        fs: 'empty',
        net: 'empty',
    },
}
