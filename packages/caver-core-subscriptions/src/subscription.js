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

    This file is derived from web3.js/packages/web3-core-subscriptions/src/subscription.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/**
 * @file subscription.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

const _ = require('underscore')
const EventEmitter = require('eventemitter3')
const errors = require('../../caver-core-helpers').errors

function Subscription(options) {
    EventEmitter.call(this)

    this.id = null
    this.callback = null
    this.arguments = null
    this._reconnectIntervalId = null

    this.options = {
        subscription: options.subscription,
        type: options.type,
        requestManager: options.requestManager,
    }
}

Subscription.prototype = Object.create(EventEmitter.prototype, {
    constructor: { value: Subscription },
})

/**
 * Should be used to extract callback from array of arguments. Modifies input param
 *
 * @method extractCallback
 * @param {Array} arguments
 * @return {Function|Null} callback, if exists
 */
Subscription.prototype._extractCallback = function(args) {
    if (_.isFunction(args[args.length - 1])) {
        return args.pop() // modify the args array!
    }
}

/**
 * Should be called to check if the number of arguments is correct
 *
 * @method validateArgs
 * @param {Array} arguments
 * @throws {Error} if it is not
 */
Subscription.prototype._validateArgs = function(args) {
    let subscription = this.options.subscription

    if (!subscription) {
        subscription = {}
    }

    if (!subscription.params) {
        subscription.params = 0
    }

    if (args.length !== subscription.params) {
        throw errors.InvalidNumberOfParams(args.length, subscription.params + 1, args[0])
    }
}

/**
 * Should be called to format input args of method
 *
 * @method formatInput
 * @param {Array}
 * @return {Array}
 */
Subscription.prototype._formatInput = function(args) {
    const subscription = this.options.subscription

    if (!subscription) {
        return args
    }

    if (!subscription.inputFormatter) {
        return args
    }

    const formattedArgs = subscription.inputFormatter.map(function(formatter, index) {
        return formatter ? formatter(args[index]) : args[index]
    })

    return formattedArgs
}

/**
 * Should be called to format output(result) of method
 *
 * @method formatOutput
 * @param {Object}
 * @return {Object}
 */
Subscription.prototype._formatOutput = function(result) {
    const subscription = this.options.subscription

    return subscription && subscription.outputFormatter && result ? subscription.outputFormatter(result) : result
}

/**
 * Should create payload from given input args
 *
 * @method toPayload
 * @param {Array} args
 * @return {Object}
 */

/**
 * _toPayload
 *
 */
Subscription.prototype._toPayload = function(args) {
    let params = []
    this.callback = this._extractCallback(args)

    if (!this.subscriptionMethod) {
        this.subscriptionMethod = args.shift()

        if (this.options.subscription.subscriptionName) {
            this.subscriptionMethod = this.options.subscription.subscriptionName
        }
    }

    if (!this.arguments) {
        this.arguments = this._formatInput(args)
        this._validateArgs(this.arguments)
        args = [] // make empty after validation
    }

    // re-add subscriptionName
    params.push(this.subscriptionMethod)
    params = params.concat(this.arguments)

    if (args.length) {
        throw new Error('Only a callback is allowed as parameter on an already instantiated subscription.')
    }

    return {
        method: `${this.options.type}_subscribe`,
        params: params,
    }
}

/**
 * Unsubscribes and clears callbacks
 *
 * @method unsubscribe
 * @return {Object}
 */
Subscription.prototype.unsubscribe = function(callback) {
    this.options.requestManager.removeSubscription(this.id, callback)
    this.id = null
    this.removeAllListeners()
    clearInterval(this._reconnectIntervalId)
}

/**
 * Subscribes and watches for changes
 *
 * @method subscribe
 * @param {String} subscription the subscription
 * @param {Object} options the options object with address topics and fromBlock
 * @return {Object}
 */
Subscription.prototype.subscribe = function() {
    const _this = this
    const args = Array.prototype.slice.call(arguments)
    const payload = this._toPayload(args)

    if (!payload) {
        return this
    }

    if (!this.options.requestManager.provider) {
        const err1 = new Error('No provider set.')
        this.callback(err1, null, this)
        this.emit('error', err1)
        return this
    }

    if (!this.options.requestManager.provider.on) {
        const err2 = new Error(
            `The current provider doesn't support subscriptions: ${this.options.requestManager.provider.constructor.name}`
        )
        this.callback(err2, null, this)
        this.emit('error', err2)
        return this
    }

    if (this.id) {
        this.unsubscribe()
    }

    this.options.params = payload.params[1]

    // get past logs, if fromBlock is available
    if (
        payload.params[0] === 'logs' &&
        _.isObject(payload.params[1]) &&
        Object.prototype.hasOwnProperty.call(payload.params[1], 'fromBlock') &&
        isFinite(payload.params[1].fromBlock)
    ) {
        // send the subscription request
        this.options.requestManager.send(
            {
                method: 'klay_getLogs',
                params: [payload.params[1]],
            },
            function(err, logs) {
                if (!err) {
                    logs.forEach(function(log) {
                        const output = _this._formatOutput(log)
                        _this.callback(null, output, _this)
                        _this.emit('data', output)
                    })

                    // TODO subscribe here? after the past logs?
                } else {
                    _this.callback(err, null, _this)
                    _this.emit('error', err)
                }
            }
        )
    }

    // create subscription
    // TODO move to separate function? so that past logs can go first?

    if (typeof payload.params[1] === 'object') {
        delete payload.params[1].fromBlock
    }

    this.options.requestManager.send(payload, function(err, result) {
        if (!err && result) {
            _this.id = result

            // call callback on notifications
            _this.options.requestManager.addSubscription(_this.id, payload.params[0], _this.options.type, function(error, ret) {
                if (!error) {
                    if (!_.isArray(ret)) {
                        ret = [ret]
                    }

                    ret.forEach(function(resultItem) {
                        const output = _this._formatOutput(resultItem)

                        if (_.isFunction(_this.options.subscription.subscriptionHandler)) {
                            return _this.options.subscription.subscriptionHandler.call(_this, output)
                        }
                        _this.emit('data', output)

                        // call the callback, last so that unsubscribe there won't affect the emit above
                        if (_.isFunction(_this.callback)) {
                            _this.callback(null, output, _this)
                        }
                    })
                } else {
                    // unsubscribe, but keep listeners
                    _this.options.requestManager.removeSubscription(_this.id)

                    // re-subscribe, if connection fails
                    if (_this.options.requestManager.provider.once) {
                        _this._reconnectIntervalId = setInterval(function() {
                            // TODO check if that makes sense!
                            if (_this.options.requestManager.provider.reconnect) {
                                _this.options.requestManager.provider.reconnect()
                            }
                        }, 500)

                        _this.options.requestManager.provider.once('connect', function() {
                            clearInterval(_this._reconnectIntervalId)
                            _this.subscribe(_this.callback)
                        })
                    }
                    _this.emit('error', error)

                    // call the callback, last so that unsubscribe there won't affect the emit above
                    if (_.isFunction(_this.callback)) {
                        _this.callback(error, null, _this)
                    }
                }
            })
        } else if (_.isFunction(_this.callback)) {
            _this.callback(err, null, _this)
            _this.emit('error', err)
        } else {
            // emit the event even if no callback was provided
            _this.emit('error', err)
        }
    })
    // return an object to cancel the subscription
    return this
}

module.exports = Subscription
