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

    This file is derived from web3.js/packages/web3-core-requestmanager/src/batch.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/**
 * @file batch.js
 * @author Marek Kotewicz <marek@ethdev.com>
 * @date 2015
 */

const Jsonrpc = require('./jsonrpc')
const errors = require('../../caver-core-helpers').errors

const Batch = function(requestManager) {
    this.requestManager = requestManager
    this.requests = []
}

Batch.prototype.add = function(request) {
    this.requests.push(request)
}

Batch.prototype.execute = function() {
    const requests = this.requests
    this.requestManager.sendBatch(requests, function(err, results) {
        results = results || []

        requests
            .map(function(request, index) {
                return results[index] || {}
            })
            .forEach(function(result, index) {
                /**
                 * if callback is defined in requests[index]
                 * 1) Check result.error - if existed throw ErrorResponse.
                 * 2) Check result is valid json response object - if invalid throw InvalidResponse.
                 * 3) After passing 1) 2), if there is format method in requests[index] do formatting, and then callback.
                 */
                if (requests[index].callback) {
                    if (result && result.error) {
                        return requests[index].callback(errors.ErrorResponse(result))
                    }

                    if (!Jsonrpc.isValidResponse(result)) {
                        return requests[index].callback(errors.InvalidResponse(result))
                    }

                    requests[index].callback(null, requests[index].format ? requests[index].format(result.result) : result.result)
                }
            })
    })
}

module.exports = Batch
