module.exports = {
    entry: './webpack.js',
    output: {
        filename: 'caver.min.js',
    },
    node: {
        fs: 'empty',
        net: 'empty',
    },
}
