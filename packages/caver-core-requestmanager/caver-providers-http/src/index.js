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

    This file is derived from web3.js/packages/web3-providers-http/src/index.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/** @file httpprovider.js
 * @authors:
 *   Marek Kotewicz <marek@parity.io>
 *   Marian Oancea
 *   Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2015
 */

const XHR2 = require('xhr2-cookies').XMLHttpRequest

const errors = require('../../../caver-core-helpers').errors

/**
 * HttpProvider should be used to send rpc calls over http
 */
/**
 * @param       {string} host
 * @param       {object} options
 * @constructor
 */
const HttpProvider = function HttpProvider(host, options) {
    options = options || {}
    this.host = host || 'http://localhost:8545'
    this.timeout = options.timeout || 0
    this.headers = options.headers
    this.connected = false
}

/**
 * _prepareRequest create request instance
 */
HttpProvider.prototype._prepareRequest = function() {
    const request = new XHR2()

    request.open('POST', this.host, true)
    request.setRequestHeader('Content-Type', 'application/json')
    request.timeout = this.timeout && this.timeout !== 1 ? this.timeout : 0

    if (this.headers) {
        this.headers.forEach(function(header) {
            request.setRequestHeader(header.name, header.value)
        })
    }

    return request
}

/**
 * Should be used to make async request
 *
 * @method send
 * @param {Object} payload
 * @param {Function} callback triggered on end with (err, result)
 */
HttpProvider.prototype.send = function(payload, callback) {
    const _this = this
    const request = this._prepareRequest()
    const host = this.host
    let timer

    request.onreadystatechange = function() {
        /**
         * readystate value
         * 0: UNSENT - When client is created
         * 1: OPENED - When request is opened
         * 2: HEADERS_RECEIVED - When "send" is called and headers and status are available
         * 3: LOADING - downloading
         * 4: DONE - When receive response after operating request
         */

        if (request.readyState === 2) {
            clearTimeout(timer)
        }

        if (request.readyState === 4 && request.timeout !== 1) {
            let result = request.responseText
            let error = null

            if (request.response === null) {
                error = errors.InvalidResponse(request.response)
                clearTimeout(timer)
            } else {
                try {
                    result = JSON.parse(result)
                } catch (e) {
                    console.error(`Invalid JSON RPC response: ${JSON.stringify(request.responseText)}`)
                    error = errors.InvalidResponse(request.responseText)
                }
            }

            _this.connected = true
            callback(error, result)
        }
    }

    request.ontimeout = function() {
        console.error(`CONNECTION TIMEOUT: timeout of ${this.timeout}ms achived`)
        _this.connected = false
        clearTimeout(timer)
        callback(errors.ConnectionTimeout(this.timeout))
    }

    try {
        // Set timeout for connection
        if (request.timeout !== 0) {
            timer = setTimeout(function() {
                if (request.status < 4) {
                    console.error(`CONNECTION ERROR: Couldn't connect to node ${host}`)
                    request.abort()
                    callback(errors.InvalidConnection(host))
                }
            }, request.timeout)
        }
        request.send(JSON.stringify(payload))
    } catch (error) {
        console.error(`CONNECTION ERROR: Couldn't connect to node ${this.host}`)
        this.connected = false
        clearTimeout(timer)
        callback(errors.InvalidConnection(this.host))
    }
}

HttpProvider.prototype.supportsSubscriptions = function() {
    return false
}

module.exports = HttpProvider
