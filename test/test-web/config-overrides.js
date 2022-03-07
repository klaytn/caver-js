const webpack = require('webpack')
module.exports = function override(config, env) {
    config.resolve.fallback = {
		fs: false,
		net: false,
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream-browserify'),
        constants: require.resolve('constants-browserify'),
	}
    config.plugins.push(
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    )

    return config
}
