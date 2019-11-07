/*
    Modifications copyright 2018 The caver-js Authors
    This file is part of web3.js.

    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.

    This file is derived from web3.js/packages/web3-core-requestmanager/src/index.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/**
 * @file index.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

const _ = require('underscore')
const errors = require('../../caver-core-helpers').errors
const middleware = require('../../caver-middleware')

const Jsonrpc = require('./jsonrpc.js')

const BatchManager = require('./batch.js')

const RequestManager = function RequestManager(provider, net) {
    this.provider = null
    this.providers = RequestManager.providers

    this.setProvider(provider, net)
    this.subscriptions = {}
}

RequestManager.providers = {
    WebsocketProvider: require('../caver-providers-ws'),
    HttpProvider: require('../caver-providers-http'),
    IpcProvider: require('../caver-providers-ipc'),
}

/**
 * Should be used to set provider of request manager
 *
 * @method setProvider
 * @param {Object} p
 */
RequestManager.prototype.setProvider = function(p, net) {
    const _this = this

    if (p && typeof p === 'string' && this.providers) {
        // HTTP
        if (/^http(s)?:\/\//i.test(p)) {
            p = new this.providers.HttpProvider(p)

            // WS
        } else if (/^ws(s)?:\/\//i.test(p)) {
            p = new this.providers.WebsocketProvider(p)

            // IPC
        } else if (p && typeof net === 'object' && typeof net.connect === 'function') {
            p = new this.providers.IpcProvider(p, net)
        } else if (p) {
            throw new Error(`Can't autodetect provider for "${p}"`)
        }
    }

    if (this.provider) {
        this.clearSubscriptions()
    }

    this.provider = p || null

    // listen to incoming notifications
    if (this.provider && this.provider.on) {
        this.provider.on('data', function requestManagerNotification(result, deprecatedResult) {
            result = result || deprecatedResult // this is for possible old providers, which may had the error first handler

            // check for result.method, to prevent old providers errors to pass as result
            if (
                result.method &&
                _this.subscriptions[result.params.subscription] &&
                _this.subscriptions[result.params.subscription].callback
            ) {
                _this.subscriptions[result.params.subscription].callback(null, result.params.result)
            }
        })
        // TODO add error, end, timeout, connect??
        // this.provider.on('error', function requestManagerNotification(result){
        //     Object.keys(_this.subscriptions).forEach(function(id){
        //         if(_this.subscriptions[id].callback)
        //             _this.subscriptions[id].callback(err);
        //     });
        // }
    }

    return this
}

/**
 * Should be used to asynchronously send request
 *
 * @method sendAsync
 * @param {Object} data
 * @param {Function} callback
 */
RequestManager.prototype.send = function(data, callback) {
    callback = callback || function() {}

    if (!this.provider) {
        return callback(errors.InvalidProvider())
    }

    const payload = Jsonrpc.toPayload(data.method, data.params)

    const isMiddlewareExist = middleware.getMiddlewares().length !== 0

    if (!isMiddlewareExist) return sendRPC(this.provider)(payload)

    // Attach outbound middleware
    middleware.applyMiddleware(payload, 'outbound', sendRPC(this.provider))

    function sendRPC(provider) {
        return function(p) {
            provider[provider.sendAsync ? 'sendAsync' : 'send'](p, function(err, result) {
                // Attach inbound middleware
                if (isMiddlewareExist) middleware.applyMiddleware(p, 'inbound')
                /**
                 * result = json rpc response object
                 * {
                 *  jsonrpc: '2.0'
                 *  result: ...,
                 *  id: ...,
                 *  error: ...,
                 * }
                 *
                 * Reference: https://www.jsonrpc.org/specification
                 */
                if (result && result.id && p.id !== result.id) {
                    return callback(new Error(`Wrong response id "${result.id}" (expected: "${p.id}") in ${JSON.stringify(p)}`))
                }

                if (err) {
                    return callback(err)
                }

                if (result && result.error) {
                    return callback(errors.ErrorResponse(result))
                }

                if (!Jsonrpc.isValidResponse(result)) {
                    return callback(errors.InvalidResponse(result))
                }

                callback(null, result.result)
            })
        }
    }
}

/**
 * Should be called to asynchronously send batch request
 *
 * @method sendBatch
 * @param {Array} batch data
 * @param {Function} callback
 */
RequestManager.prototype.sendBatch = function(data, callback) {
    if (!this.provider) {
        return callback(errors.InvalidProvider())
    }

    const payload = Jsonrpc.toBatchPayload(data)
    this.provider[this.provider.sendAsync ? 'sendAsync' : 'send'](payload, function(err, results) {
        if (err) {
            return callback(err)
        }

        if (!_.isArray(results)) {
            return callback(errors.InvalidResponse(results))
        }

        callback(null, results)
    })
}

/**
 * Waits for notifications
 *
 * @method addSubscription
 * @param {String} id           the subscription id
 * @param {String} name         the subscription name
 * @param {String} type         the subscription namespace (eth, personal, etc)
 * @param {Function} callback   the callback to call for incoming notifications
 */
RequestManager.prototype.addSubscription = function(id, name, type, callback) {
    if (this.provider.on) {
        this.subscriptions[id] = {
            callback: callback,
            type: type,
            name: name,
        }
    } else {
        throw new Error(`The provider doesn't support subscriptions: ${this.provider.constructor.name}`)
    }
}

/**
 * Waits for notifications
 *
 * @method removeSubscription
 * @param {String} id           the subscription id
 * @param {Function} callback   fired once the subscription is removed
 */
RequestManager.prototype.removeSubscription = function(id, callback) {
    const _this = this

    if (this.subscriptions[id]) {
        this.send(
            {
                method: `${this.subscriptions[id].type}_unsubscribe`,
                params: [id],
            },
            callback
        )

        // remove subscription
        delete _this.subscriptions[id]
    }
}

/**
 * Should be called to reset the subscriptions
 *
 * @method reset
 */
RequestManager.prototype.clearSubscriptions = function(keepIsSyncing) {
    const _this = this

    // uninstall all subscriptions
    Object.keys(this.subscriptions).forEach(function(id) {
        if (!keepIsSyncing || _this.subscriptions[id].name !== 'syncing') {
            _this.removeSubscription(id)
        }
    })

    //  reset notification callbacks etc.
    if (this.provider.reset) {
        this.provider.reset()
    }
}

module.exports = {
    Manager: RequestManager,
    BatchManager: BatchManager,
}
