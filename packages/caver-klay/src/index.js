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

    This file is derived from web3.js/packages/web3-eth/src/index.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/**
 * @file index.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

const _ = require('underscore')

const core = require('../../caver-core')
const { formatters } = require('../../caver-core-helpers')
const Subscriptions = require('../../caver-core-subscriptions').subscriptions
const Method = require('../../caver-core-method')
const utils = require('../../caver-utils')
const Net = require('../../caver-net')

const Personal = require('../caver-klay-personal')
const BaseContract = require('../caver-klay-contract')
const Accounts = require('../caver-klay-accounts')
const abi = require('../caver-klay-abi')
const getNetworkType = require('./getNetworkType.js')

const rpcCalls = require('../../caver-rtm')

const { decodeFromRawTransaction } = require('../caver-klay-accounts/src/makeRawTransaction')

const Klay = function Klay(...args) {
    const _this = this

    // sets _requestmanager
    core.packageInit(this, args)

    // overwrite setProvider
    const setProvider = this.setProvider
    this.setProvider = function(...arg) {
        setProvider.apply(_this, arg)
        _this.net.setProvider.apply(_this, arg)
        _this.personal.setProvider.apply(_this, arg)
        _this.accounts.setProvider.apply(_this, arg)
        _this.Contract.setProvider(_this.currentProvider, _this.accounts)
    }

    let defaultAccount = null
    let defaultBlock = 'latest'

    Object.defineProperty(this, 'defaultAccount', {
        get: function() {
            return defaultAccount
        },
        set: function(val) {
            if (val) {
                defaultAccount = utils.toChecksumAddress(formatters.inputAddressFormatter(val))
            }

            // also set on the Contract object
            _this.Contract.defaultAccount = defaultAccount
            _this.personal.defaultAccount = defaultAccount

            // update defaultBlock
            methods.forEach(function(method) {
                method.defaultAccount = defaultAccount
            })

            return val
        },
        enumerable: true,
    })
    Object.defineProperty(this, 'defaultBlock', {
        get: function() {
            return defaultBlock
        },
        set: function(val) {
            if (!utils.isValidBlockNumberCandidate(val)) {
                throw new Error('Invalid default block number.')
            }
            defaultBlock = val
            // also set on the Contract object
            _this.Contract.defaultBlock = defaultBlock
            _this.personal.defaultBlock = defaultBlock

            // update defaultBlock
            methods.forEach(function(method) {
                method.defaultBlock = defaultBlock
            })

            return val
        },
        enumerable: true,
    })

    this.clearSubscriptions = _this._requestManager.clearSubscriptions

    this.decodeTransaction = decodeFromRawTransaction

    // add net
    this.net = new Net(this.currentProvider)
    // add chain detection
    this.net.getNetworkType = getNetworkType.bind(this)

    // add accounts
    this.accounts = new Accounts(this.currentProvider)

    // add personal
    this.personal = new Personal(this.currentProvider)
    this.personal.defaultAccount = this.defaultAccount

    // create a proxy Contract type for this instance, as a Contract's provider
    // is stored as a class member rather than an instance variable. If we do
    // not create this proxy type, changing the provider in one instance of
    // caver-klay would subsequently change the provider for _all_ contract
    // instances!
    const Contract = function Contract() {
        BaseContract.apply(this, arguments)
    }

    Contract.setProvider = function() {
        BaseContract.setProvider.apply(this, arguments)
    }

    // make our proxy Contract inherit from caver-klay-contract so that it has all
    // the right functionality and so that instanceof and friends work properly
    Contract.prototype = Object.create(BaseContract.prototype)
    Contract.prototype.constructor = Contract

    // add contract
    this.Contract = Contract
    this.Contract.defaultAccount = this.defaultAccount
    this.Contract.defaultBlock = this.defaultBlock
    this.Contract.setProvider(this.currentProvider, this.accounts)

    // add IBAN
    this.Iban = utils.Iban

    // add ABI
    this.abi = abi

    const methods = [
        ...rpcCalls.map(item => new Method(item)),
        // subscriptions
        new Subscriptions({
            name: 'subscribe',
            type: 'eth',
            subscriptions: {
                newBlockHeaders: {
                    // TODO rename on RPC side?
                    subscriptionName: 'newHeads', // replace subscription with this name
                    params: 0,
                    outputFormatter: formatters.outputBlockFormatter,
                },
                pendingTransactions: {
                    subscriptionName: 'newPendingTransactions', // replace subscription with this name
                    params: 0,
                },
                logs: {
                    params: 1,
                    inputFormatter: [formatters.inputLogFormatter],
                    outputFormatter: formatters.outputLogFormatter,
                    // DUBLICATE, also in caver-klay-contract
                    subscriptionHandler: function(output) {
                        this.emit('data', output)

                        if (_.isFunction(this.callback)) {
                            this.callback(null, output, this)
                        }
                    },
                },
                syncing: {
                    params: 0,
                    outputFormatter: formatters.outputSyncingFormatter,
                    subscriptionHandler: function(output) {
                        const _this = this /* eslint-disable-line no-shadow */

                        // fire TRUE at start
                        if (this._isSyncing !== true) {
                            this._isSyncing = true
                            this.emit('changed', _this._isSyncing)

                            if (_.isFunction(this.callback)) {
                                this.callback(null, _this._isSyncing, this)
                            }

                            setTimeout(function() {
                                _this.emit('data', output)

                                if (_.isFunction(_this.callback)) {
                                    _this.callback(null, output, _this)
                                }
                            }, 0)

                            // fire sync status
                        } else {
                            this.emit('data', output)
                            if (_.isFunction(_this.callback)) {
                                this.callback(null, output, this)
                            }

                            // wait for some time before fireing the FALSE
                            clearTimeout(this._isSyncingTimeout)
                            this._isSyncingTimeout = setTimeout(function() {
                                if (output.currentBlock > output.highestBlock - 200) {
                                    _this._isSyncing = false
                                    _this.emit('changed', _this._isSyncing)

                                    if (_.isFunction(_this.callback)) {
                                        _this.callback(null, _this._isSyncing, _this)
                                    }
                                }
                            }, 500)
                        }
                    },
                },
            },
        }),
    ]

    methods.forEach(function(method) {
        method.attachToObject(_this)
        // second param means is klay.accounts (necessary for wallet signing)
        method.setRequestManager(_this._requestManager, _this.accounts)
        method.defaultBlock = _this.defaultBlock
        method.defaultAccount = _this.defaultAccount
    })
}

module.exports = Klay
