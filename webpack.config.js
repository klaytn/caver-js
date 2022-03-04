module.exports = {
    entry: './webpack.js',
    output: {
        filename: 'caver.min.js',
        path: `${__dirname}/dist`,
    },
    resolve: {
        fallback: {
            fs: false,
            net: false,
            stream: require.resolve('stream-browserify'),
            crypto: require.resolve('crypto-browserify'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            os: require.resolve('os-browserify/browser'),
            constants: require.resolve('constants-browserify'),
        },
    },
}
