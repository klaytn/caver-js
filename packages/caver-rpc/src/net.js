/*
    Copyright 2020 The caver-js Authors
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

const core = require('../../caver-core')
const Method = require('../../caver-core-method')

/**
 * A class that can invoke Net RPC Calls.
 * @class
 * @hideconstructor
 */
const Net = function Net(...args) {
    const _this = this

    core.packageInit(this, args)

    const netMethods = [
        /**
         * Returns the network identifier (network ID) of the Klaytn Node.
         *
         * @memberof Net
         * @method getNetworkId
         * @instance
         *
         * @example
         * const result = await caver.rpc.net.getNetworkId()
         *
         * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
         * @return {Promise<number>} The network id.
         */
        new Method({
            name: 'getNetworkId',
            call: 'net_networkID',
            params: 0,
        }),
        new Method({
            name: 'getNetworkID',
            call: 'net_networkID',
            params: 0,
        }),
        /**
         * Returns `true` if the Klaytn Node is actively listening for network connections.
         *
         * @memberof Net
         * @method isListening
         * @instance
         *
         * @example
         * const result = await caver.rpc.net.isListening()
         *
         * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
         * @return {Promise<boolean>} `true` when listening, otherwise `false`.
         */
        new Method({
            name: 'isListening',
            call: 'net_listening',
            params: 0,
        }),
        /**
         * Returns the number of peers currently connected to the Klaytn Node.
         *
         * @memberof Net
         * @method getPeerCount
         * @instance
         *
         * @example
         * const result = await caver.rpc.net.getPeerCount()
         *
         * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
         * @return {Promise<string>} The number of connected peers in hex.
         */
        new Method({
            name: 'getPeerCount',
            call: 'net_peerCount',
            params: 0,
        }),
        /**
         * Returns the number of connected nodes by type and the total number of connected nodes with key/value pairs.
         *
         * @memberof Net
         * @method getPeerCountByType
         * @instance
         *
         * @example
         * const result = await caver.rpc.net.getPeerCountByType()
         *
         * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
         * @return {Promise<object>} The number of connected peers by type as well as the total number of connected peers.
         */
        new Method({
            name: 'getPeerCountByType',
            call: 'net_peerCountByType',
            params: 0,
        }),
    ]

    netMethods.forEach(function(method) {
        method.attachToObject(_this)
        method.setRequestManager(_this._requestManager)
    })
}

module.exports = Net
