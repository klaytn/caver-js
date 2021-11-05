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
const http = require('http')
const https = require('https')

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

    // keepAlive is true unless explicitly set to false
    const keepAlive = options.keepAlive !== false
    this.host = host || 'http://localhost:8545'
    if (!this.agent) {
        if (this.host.substring(0, 5) === 'https') {
            this.httpsAgent = new https.Agent({ keepAlive })
        } else {
            this.httpAgent = new http.Agent({ keepAlive })
        }
    }
}

/**
 * _prepareRequest create request instance
 */
HttpProvider.prototype._prepareRequest = function() {
    let request

    // the current runtime is a browser
    if (typeof XMLHttpRequest !== 'undefined') {
        // eslint-disable-next-line no-undef
        request = new XMLHttpRequest()
    } else {
        request = new XHR2()
        const agents = { httpsAgent: this.httpsAgent, httpAgent: this.httpAgent, baseUrl: this.baseUrl }

        if (this.agent) {
            agents.httpsAgent = this.agent.https
            agents.httpAgent = this.agent.http
            agents.baseUrl = this.agent.baseUrl
        }

        request.nodejsSet(agents)
    }

    request.open('POST', this.host, true)
    request.setRequestHeader('Content-Type', 'application/json')
    request.timeout = this.timeout
    request.withCredentials = this.withCredentials

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

    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.timeout !== 1) {
            let result = request.responseText
            let error = null

            try {
                result = JSON.parse(result)
            } catch (e) {
                error = errors.InvalidResponse(request.responseText)
            }

            _this.connected = true
            callback(error, result)
        }
    }

    request.ontimeout = function() {
        _this.connected = false
        callback(errors.ConnectionTimeout(this.timeout))
    }

    try {
        request.send(JSON.stringify(payload))
    } catch (error) {
        this.connected = false
        callback(errors.InvalidConnection(this.host))
    }
}

HttpProvider.prototype.disconnect = function() {
    // NO OP
}

HttpProvider.prototype.supportsSubscriptions = function() {
    return false
}

module.exports = HttpProvider
