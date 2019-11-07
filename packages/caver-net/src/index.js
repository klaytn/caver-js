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

    This file is derived from web3.js/packages/web3-net/src/index.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/**
 * @file index.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

const core = require('../../caver-core')
const utils = require('../../caver-utils')
const rpc = require('../../caver-rtm').rpc
const Method = require('../../caver-core-method')

const Net = function Net(...args) {
    const _this = this

    core.packageInit(this, args)
    const rpcCalls = [rpc.net.getId, rpc.net.isListening, rpc.net.getPeerCount, rpc.net.peerCountByType]
    rpcCalls.forEach(function(method) {
        method = new Method(method)
        method.attachToObject(_this)
        method.setRequestManager(_this._requestManager)
    })
}

module.exports = Net
