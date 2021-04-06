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

const _ = require('lodash')
const BaseKIP7 = require('./kip7')
const BaseKIP17 = require('./kip17')
const KIP37 = require('./kip37')
const KIP13 = require('./kip13')
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
            _this.kip37._requestManager = _this._requestManager
            _this.kip37.currentProvider = _this._provider

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
            /**
             * Creates an instance of KIP7.
             * @method create
             * @param {string} tokenAddress - The KIP-7 token contract address.
             * @param {Array} [abi] - The Contract Application Binary Interface (ABI) of the KIP-7.
             * @return {object}
             */
            static create(tokenAddress, abi) {
                return new KIP7(tokenAddress, abi)
            }

            /**
             * deploy deploys a KIP-7 token contract to Klaytn network.
             * The KIP7 instance deployed and returned through this function uses the keyringContainer instead of accounts.
             * @method deploy
             * @param {Object} tokenInfo The object that defines the name, symbol, decimals, and initialSupply of the token to deploy.
             * @param {Object|String} sendOptions The address of the account to deploy the KIP-7 token contract or an object holding parameters that are required for sending a transaction.
             * @param {IWallet} wallet The wallet instance to sign and send a transaction.
             * @return {object}
             */
            static deploy(tokenInfo, sendOptions, wallet) {
                validateDeployParameterForKIP7(tokenInfo)

                const { name, symbol, decimals, initialSupply } = tokenInfo
                const kip7 = new KIP7()
                if (wallet !== undefined) kip7.setWallet(wallet)

                // If sendOptions is string type, sendOptions means deployer's address
                if (_.isString(sendOptions)) sendOptions = { from: sendOptions, gas: 4000000, value: 0 }
                sendOptions.gas = sendOptions.gas !== undefined ? sendOptions.gas : 4000000

                return kip7
                    .deploy({
                        data: kip7ByteCode,
                        arguments: [name, symbol, decimals, initialSupply],
                    })
                    .send(sendOptions)
            }

            /**
             * Wrapping class of the KIP7.
             * In this constructor, call `setWallet` with keyringContainer to use keyringContainer instead of accounts.
             *
             * @constructor
             * @param {string} tokenAddress - The KIP-7 token contract address.
             * @param {Array} [abi] - The Contract Application Binary Interface (ABI) of the KIP-7.
             */
            constructor(tokenAddress, abi) {
                super(tokenAddress, abi)
                const self = this // eslint-disable-line no-shadow
                const setRequestManager = _this.setRequestManager // eslint-disable-line no-shadow
                _this.setRequestManager = function() {
                    setRequestManager.apply(_this, arguments)
                    core.packageInit(self, [_this])
                }

                this.setWallet(args[0].wallet)
            }
        }

        this.kip7 = KIP7

        // Define KIP17 class for caver-kct
        // In this class, keyrings will be used instead of accounts
        class KIP17 extends BaseKIP17 {
            /**
             * Creates an instance of KIP17.
             * @method create
             * @param {string} tokenAddress - The KIP-17 token contract address.
             * @param {Array} [abi] - The Contract Application Binary Interface (ABI) of the KIP-17.
             * @return {object}
             */
            static create(tokenAddress, abi) {
                return new KIP17(tokenAddress, abi)
            }

            /**
             * deploy deploys a KIP-17 token contract to Klaytn network.
             * The KIP17 instance deployed and returned through this function uses the keyringContainer instead of accounts.
             * @method deploy
             * @param {Object} tokenInfo The object that defines the name and symbol of the token to deploy.
             * @param {Object|String} sendOptions The address of the account to deploy the KIP-17 token contract or an object holding parameters that are required for sending a transaction.
             * @param {IWallet} wallet The wallet instance to sign and send a transaction.
             * @return {object}
             */
            static deploy(tokenInfo, sendOptions, wallet) {
                validateDeployParameterForKIP17(tokenInfo)

                const { name, symbol } = tokenInfo
                const kip17 = new KIP17()
                if (wallet !== undefined) kip17.setWallet(wallet)

                // If sendOptions is string type, sendOptions means deployer's address
                if (_.isString(sendOptions)) sendOptions = { from: sendOptions, gas: 6600000, value: 0 }
                sendOptions.gas = sendOptions.gas !== undefined ? sendOptions.gas : 6600000

                return kip17
                    .deploy({
                        data: kip17ByteCode,
                        arguments: [name, symbol],
                    })
                    .send(sendOptions)
            }

            /**
             * Wrapping class of the KIP17.
             * In this constructor, call `setWallet` with keyringContainer to use keyringContainer instead of accounts.
             *
             * @constructor
             * @param {string} tokenAddress - The KIP-17 token contract address.
             * @param {Array} [abi] - The Contract Application Binary Interface (ABI) of the KIP-17.
             */
            constructor(tokenAddress, abi) {
                super(tokenAddress, abi)
                const self = this // eslint-disable-line no-shadow
                const setRequestManager = _this.setRequestManager // eslint-disable-line no-shadow
                _this.setRequestManager = function() {
                    setRequestManager.apply(_this, arguments)
                    core.packageInit(self, [_this])
                }

                this.setWallet(args[0].wallet)
            }
        }

        this.kip17 = KIP17

        this.kip37 = KIP37
        this.kip37.wallet = args[0].wallet
        this.kip37._requestManager = this._requestManager
        this.kip37.currentProvider = this._requestManager.provider

        this.kip13 = KIP13
        this.kip13._requestManager = this._requestManager
        this.kip13.currentProvider = this._requestManager.provider
    }
}

module.exports = KCT
