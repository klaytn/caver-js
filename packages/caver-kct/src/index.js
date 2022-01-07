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

/* eslint-disable max-classes-per-file */

const _ = require('lodash')
const BaseKIP7 = require('./kip7')
const BaseKIP17 = require('./kip17')
const KIP37 = require('./kip37')
const KIP13 = require('./kip13')
const core = require('../../caver-core')
const { validateDeployParameterForKIP7, validateDeployParameterForKIP17, kip7ByteCode, kip17ByteCode } = require('./kctHelper')

/**
 * A class that manages KCT supported by caver.
 * @hideconstructor
 * @class
 */
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

        /**
         * The KIP7 wrapping class that helps you to use KIP7 class with common architecture features.
         * This class can be used via `caver.kct.kip7`, and this will use `keyrings` intead of `accounts` when operate with smart contract.
         * @ignore
         * @class
         */
        class KIP7 extends BaseKIP7 {
            /**
             * Creates a new KIP7 instance with its bound methods and events.
             *
             * @example
             * const kip7 = caver.kct.kip7.create('0x{address in hex}')
             *
             * @param {string} tokenAddress - The KIP-7 token contract address.
             * @param {Array.<object>} [abi] - The Contract Application Binary Interface (ABI) of the KIP-7.
             * @return {KIP7}
             */
            static create(tokenAddress, abi) {
                return new KIP7(tokenAddress, abi)
            }

            /**
             * An object that defines the parameters required to deploy the KIP-7 contract.
             *
             * @typedef {object} KIP7.KIP7DeployParams
             * @property {string} name - The name of the token.
             * @property {string} symbol - The symbol of the token.
             * @property {number} decimals - The number of decimal places the token uses.
             * @property {string|BigNumber|number} initialSupply - The total amount of token to be supplied initially.
             */
            /**
             * Deploys the KIP-7 token contract to the Klaytn blockchain.
             * A contract deployed using `caver.kct.kip7.deploy` is a fungible token that follows the KIP-7 standard.
             * The KIP7 instance deployed and returned through this function uses the `keyringContainer` instead of accounts.
             *
             * By default, it returns a KIP7 instance when the deployment is finished.
             * If you define a custom function in the `contractDeployFormatter` field in {@link Contract.SendOptions|SendOptions}, you can control return type.
             *
             * @example
             * const tokenInfo = {
             *     name: 'Test',
             *     symbol: 'TST',
             *     decimals: 10,
             *     initialSupply: '1000000000000000000',
             * }
             * // Below example will use `caver.wallet`.
             * const deployed = await caver.kct.kip7.deploy(tokenInfo, '0x{deployer address}')
             *
             * // Use sendOptions instead of deployer address.
             * const sendOptions = { from: '0x{deployer address}', feeDelegation: true, feePayer: '0x{fee payer address}' }
             * const deployed = await caver.kct.kip7.deploy(tokenInfo, sendOptions)
             *
             * // If you want to use your own wallet that implements the 'IWallet' interface, pass it into the last parameter.
             * const deployed = await caver.kct.kip7.deploy(tokenInfo, '0x{deployer address}', wallet)
             *
             * @param {KIP7.KIP7DeployParams} tokenInfo The object that defines the name, symbol, decimals, and initialSupply of the token to deploy.
             * @param {Contract.SendOptions|String} sendOptions The address of the account to deploy the KIP-7 token contract or a {@link Contract.SendOptions|SendOptions object} holding parameters that are required for sending a transaction.
             * @param {IWallet} [wallet] The wallet instance to sign and send a transaction.
             * @return {Promise<*>}
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
                core.packageInit(this, [_this])
                this.setWallet(args[0].wallet)
            }
        }
        /** @type {typeof KIP7} */
        this.kip7 = KIP7

        /**
         * The KIP17 wrapping class that helps you to use KIP17 class with common architecture features.
         * This class can be used via `caver.kct.kip17`, and this will use `keyrings` intead of `accounts` when operate with smart contract.
         * @ignore
         * @class
         */
        class KIP17 extends BaseKIP17 {
            /**
             * Creates an instance of KIP17.
             *
             * @example
             * const kip17 = caver.kct.kip17.create('0x{address in hex}')
             *
             * @param {string} tokenAddress - The KIP-17 token contract address.
             * @param {Array.<object>} [abi] - The Contract Application Binary Interface (ABI) of the KIP-17.
             * @return {KIP17}
             */
            static create(tokenAddress, abi) {
                return new KIP17(tokenAddress, abi)
            }

            /**
             * An object that defines the parameters required to deploy the KIP-17 contract.
             *
             * @typedef {object} KIP17.KIP17DeployParams
             * @property {string} name - The name of the token.
             * @property {string} symbol - The symbol of the token.
             */
            /**
             * Deploys the KIP-17 token contract to the Klaytn blockchain.
             * A contract deployed using `caver.kct.kip17.deploy` is a non-fungible token that follows the KIP-17 standard.
             * The KIP17 instance deployed and returned through this function uses the `keyringContainer` instead of accounts.
             *
             * By default, it returns a KIP17 instance when the deployment is finished.
             * If you define a custom function in the `contractDeployFormatter` field in {@link Contract.SendOptions|SendOptions}, you can control return type.
             *
             * @param {KIP17.KIP17DeployParams} tokenInfo The object that defines the name and symbol of the token to deploy.
             * @param {Contract.SendOptions|String} sendOptions The address of the account to deploy the KIP-17 token contract or a {@link Contract.SendOptions|SendOptions object} holding parameters that are required for sending a transaction.
             * @param {IWallet} [wallet] The wallet instance to sign and send a transaction.
             * @return {Promise<*>}
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
                core.packageInit(this, [_this])
                this.setWallet(args[0].wallet)
            }
        }
        /** @type {typeof KIP17} */
        this.kip17 = KIP17

        /** @type {typeof KIP37} */
        this.kip37 = KIP37
        this.kip37.wallet = args[0].wallet
        this.kip37._requestManager = this._requestManager
        this.kip37.currentProvider = this._requestManager.provider

        /** @type {typeof KIP13} */
        this.kip13 = KIP13
        this.kip13._requestManager = this._requestManager
        this.kip13.currentProvider = this._requestManager.provider
    }
}

module.exports = KCT
