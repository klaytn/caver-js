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

const Klay = require('./klay')
const Net = require('./net')
const Governance = require('./governance')
const core = require('../../caver-core')

/**
 * A class that manages RPC call classes supported by caver.
 * @hideconstructor
 * @class
 */
class RPC {
    constructor(...args) {
        const _this = this

        // sets _requestmanager
        core.packageInit(this, args)

        // overwrite package setRequestManager
        const setRequestManager = this.setRequestManager
        this.setRequestManager = function(manager) {
            setRequestManager(manager)

            _this.klay.setRequestManager(manager)
            _this.net.setRequestManager(manager)
            _this.governance.setRequestManager(manager)

            return true
        }

        // overwrite setProvider
        const setProvider = this.setProvider
        this.setProvider = function() {
            setProvider.apply(_this, arguments)
            _this.setRequestManager(_this._requestManager)
        }

        /** @type {Klay} */
        this.klay = new Klay(this)

        /** @type {Net} */
        this.net = new Net(this)

        /** @type {Governance} */
        this.governance = new Governance(this)
    }
}

module.exports = RPC
