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

    This file is derived from web3.js/packages/web3-providers-ipc/src/index.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/** @file index.js
 * @authors:
 *   Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

const _ = require('underscore')
const oboe = require('oboe')
const errors = require('../../../caver-core-helpers').errors

const IpcProvider = function IpcProvider(path, net) {
    const _this = this
    this.responseCallbacks = {}
    this.notificationCallbacks = []
    this.path = path

    this.connection = net.connect({ path: this.path })

    this.addDefaultEvents()

    // LISTEN FOR CONNECTION RESPONSES
    const callback = function(result) {
        let id = null

        // get the id which matches the returned id
        if (_.isArray(result)) {
            result.forEach(function(load) {
                if (_this.responseCallbacks[load.id]) {
                    id = load.id
                }
            })
        } else {
            id = result.id
        }

        // notification
        if (!id && result.method.indexOf('_subscription') !== -1) {
            _this.notificationCallbacks.forEach(function(cb) {
                if (_.isFunction(cb)) {
                    cb(result)
                }
            })

            // fire the callback
        } else if (_this.responseCallbacks[id]) {
            _this.responseCallbacks[id](null, result)
            delete _this.responseCallbacks[id]
        }
    }

    // use oboe.js for Sockets
    if (net.constructor.name === 'Socket') {
        oboe(this.connection).done(callback)
    } else {
        this.connection.on('data', function(data) {
            _this._parseResponse(data.toString()).forEach(callback)
        })
    }
}

/**
Will add the error and end event to timeout existing calls

@method addDefaultEvents
*/
IpcProvider.prototype.addDefaultEvents = function() {
    const _this = this

    this.connection.on('connect', function() {})

    this.connection.on('error', function() {
        _this._timeout()
    })

    this.connection.on('end', function() {
        _this._timeout()
    })

    this.connection.on('timeout', function() {
        _this._timeout()
    })
}

/**
 Will parse the response and make an array out of it.

 NOTE, this exists for backwards compatibility reasons.

 @method _parseResponse
 @param {String} data
 */
IpcProvider.prototype._parseResponse = function(data) {
    const _this = this
    const returnValues = []

    // DE-CHUNKER
    const dechunkedData = data
        .replace(/\}[\n\r]?\{/g, '}|--|{') // }{
        .replace(/\}\][\n\r]?\[\{/g, '}]|--|[{') // }][{
        .replace(/\}[\n\r]?\[\{/g, '}|--|[{') // }[{
        .replace(/\}\][\n\r]?\{/g, '}]|--|{') // }]{
        .split('|--|')

    dechunkedData.forEach(function(d) {
        // prepend the last chunk
        if (_this.lastChunk) {
            d = _this.lastChunk + d
        }

        let result = null

        try {
            result = JSON.parse(d)
        } catch (e) {
            _this.lastChunk = d

            // start timeout to cancel all requests
            clearTimeout(_this.lastChunkTimeout)
            _this.lastChunkTimeout = setTimeout(function() {
                _this._timeout()
                throw errors.InvalidResponse(d)
            }, 1000 * 15)

            return
        }

        // cancel timeout and set chunk to null
        clearTimeout(_this.lastChunkTimeout)
        _this.lastChunk = null

        if (result) {
            returnValues.push(result)
        }
    })

    return returnValues
}

/**
Get the adds a callback to the responseCallbacks object,
which will be called if a response matching the response Id will arrive.

@method _addResponseCallback
*/
IpcProvider.prototype._addResponseCallback = function(payload, callback) {
    const id = payload.id || payload[0].id
    const method = payload.method || payload[0].method

    this.responseCallbacks[id] = callback
    this.responseCallbacks[id].method = method
}

/**
Timeout all requests when the end/error event is fired

@method _timeout
*/
IpcProvider.prototype._timeout = function() {
    for (const key in this.responseCallbacks) {
        if (Object.prototype.hasOwnProperty.call(this.responseCallbacks, key)) {
            this.responseCallbacks[key](errors.InvalidConnection('on IPC'))
            delete this.responseCallbacks[key]
        }
    }
}

/**
 Try to reconnect

 @method reconnect
 */
IpcProvider.prototype.reconnect = function() {
    this.connection.connect({ path: this.path })
}

IpcProvider.prototype.send = function(payload, callback) {
    // try reconnect, when connection is gone
    if (!this.connection.writable) {
        this.connection.connect({ path: this.path })
    }

    this.connection.write(JSON.stringify(payload))
    this._addResponseCallback(payload, callback)
}

/**
Subscribes to provider events.provider

@method on
@param {String} type    'notification', 'connect', 'error', 'end' or 'data'
@param {Function} callback   the callback to call
*/
IpcProvider.prototype.on = function(type, callback) {
    if (typeof callback !== 'function') {
        throw new Error('The second parameter callback must be a function.')
    }

    switch (type) {
        case 'data':
            this.notificationCallbacks.push(callback)
            break

        // adds error, end, timeout, connect
        default:
            this.connection.on(type, callback)
            break
    }
}

/**
 Subscribes to provider events.provider

 @method on
 @param {String} type    'connect', 'error', 'end' or 'data'
 @param {Function} callback   the callback to call
 */
IpcProvider.prototype.once = function(type, callback) {
    if (typeof callback !== 'function') {
        throw new Error('The second parameter callback must be a function.')
    }

    this.connection.once(type, callback)
}

/**
Removes event listener

@method removeListener
@param {String} type    'data', 'connect', 'error', 'end' or 'data'
@param {Function} callback   the callback to call
*/
IpcProvider.prototype.removeListener = function(type, callback) {
    const _this = this

    switch (type) {
        case 'data':
            this.notificationCallbacks.forEach(function(cb, index) {
                if (cb === callback) {
                    _this.notificationCallbacks.splice(index, 1)
                }
            })
            break

        default:
            this.connection.removeListener(type, callback)
            break
    }
}

/**
Removes all event listeners

@method removeAllListeners
@param {String} type    'data', 'connect', 'error', 'end' or 'data'
*/
IpcProvider.prototype.removeAllListeners = function(type) {
    switch (type) {
        case 'data':
            this.notificationCallbacks = []
            break

        default:
            this.connection.removeAllListeners(type)
            break
    }
}

/**
Resets the providers, clears all callbacks

@method reset
*/
IpcProvider.prototype.reset = function() {
    this._timeout()
    this.notificationCallbacks = []

    this.connection.removeAllListeners('error')
    this.connection.removeAllListeners('end')
    this.connection.removeAllListeners('timeout')

    this.addDefaultEvents()
}

IpcProvider.prototype.supportsSubscriptions = function() {
    return true
}

module.exports = IpcProvider
