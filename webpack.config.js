module.exports = {
    entry: './webpack.js',
    output: {
        filename: 'caver.min.js',
        path: `${__dirname}/dist`,
    },
    node: {
        fs: 'empty',
        net: 'empty',
    },
}
