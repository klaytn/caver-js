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

const BaseKIP7 = require('./kip7')
const BaseKIP17 = require('./kip17')
const core = require('../../caver-core')
const { validateDeployParameterForKIP7, validateDeployParameterForKIP17, kip7ByteCode, kip17ByteCode } = require('./kctHelper')

class KCT {
    constructor(...args) {
        const _this = this

        // sets _requestmanager
        core.packageInit(this, args)

        // overwrite package setRequestManager
        const setRequestManager = this.setRequestManager
        this.setRequestManager = function(manager) {
            setRequestManager(manager)

            _this.kip7._requestManager = _this._requestManager
            _this.kip7.currentProvider = _this._provider
            _this.kip17._requestManager = _this._requestManager
            _this.kip17.currentProvider = _this._provider

            return true
        }

        // overwrite setProvider
        const setProvider = this.setProvider
        this.setProvider = function() {
            setProvider.apply(_this, arguments)
            _this.setRequestManager(_this._requestManager)
        }

        // Define KIP7 class for caver-kct
        // In this class, keyrings will be used instead of accounts
        class KIP7 extends BaseKIP7 {
            static deploy(tokenInfo, deployer) {
                validateDeployParameterForKIP7(tokenInfo)

                const { name, symbol, decimals, initialSupply } = tokenInfo
                const kip7 = new KIP7()

                return kip7
                    .deploy({
                        data: kip7ByteCode,
                        arguments: [name, symbol, decimals, initialSupply],
                    })
                    .send({ from: deployer, gas: 4000000, value: 0 })
            }

            constructor(tokenAddress, abi) {
                super(tokenAddress, abi)
                const self = this // eslint-disable-line no-shadow
                const setRequestManager = _this.setRequestManager // eslint-disable-line no-shadow
                _this.setRequestManager = function() {
                    setRequestManager.apply(_this, arguments)
                    core.packageInit(self, [_this])
                }

                this.setKeyrings(args[0].wallet)
            }
        }

        this.kip7 = KIP7

        // Define KIP7 class for caver-kct
        // In this class, keyrings will be used instead of accounts
        class KIP17 extends BaseKIP17 {
            static deploy(tokenInfo, deployer) {
                validateDeployParameterForKIP17(tokenInfo)

                const { name, symbol } = tokenInfo
                const kip17 = new KIP17()

                return kip17
                    .deploy({
                        data: kip17ByteCode,
                        arguments: [name, symbol],
                    })
                    .send({ from: deployer, gas: 6600000, value: 0 })
            }

            constructor(tokenAddress, abi) {
                super(tokenAddress, abi)
                const self = this // eslint-disable-line no-shadow
                const setRequestManager = _this.setRequestManager // eslint-disable-line no-shadow
                _this.setRequestManager = function() {
                    setRequestManager.apply(_this, arguments)
                    core.packageInit(self, [_this])
                }

                this.setKeyrings(args[0].wallet)
            }
        }

        this.kip17 = KIP17
    }
}

module.exports = KCT
