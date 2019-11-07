/*
    Copyright 2018 The caver-js Authors
    This file is part of the caver-js library.

    The caver-js library is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    The caver-js library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with the caver-js. If not, see <http://www.gnu.org/licenses/>.
*/

const { last } = require('underscore')
const builtinsMiddleware = require('./builtins')

function Middleware() {
    this.list = []
}

/**
 * getMiddlewares return `this.list` from Middleware instance.
 * @return {Array} `this.list`
 */
Middleware.prototype.getMiddlewares = function() {
    return this.list
}

/**
 * registerMiddleware - add middleware function to `this.list`
 * @param  {function} middleware function to be registered.
 */
Middleware.prototype.registerMiddleware = function(middleware) {
    if (typeof middleware !== 'function') throw Error('Middleware should be a function')
    this.list.push(middleware)
}

Middleware.prototype.applyMiddleware = function(data, type, sendRequest) {
    // Tags `type` property to check whether middleware is consumed from outbound or not.
    // If consumed as outbound, It tags `data` as 'request'
    // Otherwise, It tags `data` as 'response'
    data.type = type === 'outbound' ? 'request' : 'response' // inbound

    // For outbound middleware, it must have RPC send function as last middleware.
    handleMiddleware(
        sendRequest
            ? // `RPC send` is concatenated as a last middleware.
              this.list.concat(sendRequest)
            : // last middleware is not a `RPC send`.
              [...this.list],
        // `bypass` function is only available for outbound middleware
        data.type === 'request' && sendRequest
    )(data)
}

function handleMiddleware(list, bypass) {
    return function recur(data, next) {
        // When there are no more item in `this.list`,
        // it means all middleware function has been consumed.
        if (list.length === 0) return

        // When the argument is put into `next()` function,
        // The `data` argument get changed in next middleware, taking it as first argument `data`.
        if (arguments.length === 2 && typeof next !== 'function') data = next

        // Shift first item from `this.list`, consuming it as a middleware function.
        const fn = list.shift()

        // Consuming middleware function,
        // It would be used outerspace as `caver.use(data, next, bypass)`.
        fn(data, recur.bind(null, data), function _bypass() {
            // `_bypass` function only works when `bypass` value is true.
            if (!bypass) return

            // When the argument is put into `bypass()` function,
            // The `data` arugment get changed in next middleware which is last one, request manager,
            // taking it as first argument `data`.
            if (arguments.length !== 0) data = arguments[0]

            // `_bypass` function skips all middleware list except last one.
            list = [last(list)]
            recur(data)
        })
    }
}

// Generate `Middleware` instance, it would be exported as a *singleton*.
const middleware = new Middleware()

module.exports = middleware
module.exports.builtin = builtinsMiddleware
