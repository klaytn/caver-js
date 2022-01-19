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

const _ = require('lodash')

const core = require('../../caver-core')
const { formatters } = require('../../caver-core-helpers')
const Subscriptions = require('../../caver-core-subscriptions').subscriptions
const Method = require('../../caver-core-method')
const utils = require('../../caver-utils')
const Net = require('../../caver-net')

const Personal = require('../caver-klay-personal')
const BaseContract = require('../../caver-contract')
const KIP7 = require('../../caver-kct/src/kip7')
const KIP17 = require('../../caver-kct/src/kip17')
const Accounts = require('../caver-klay-accounts')
const abi = require('../../caver-abi')
const getNetworkType = require('./getNetworkType')

const rpcCalls = require('../../caver-rtm')

const { decodeFromRawTransaction } = require('../caver-klay-accounts/src/makeRawTransaction')

const Klay = function Klay(...args) {
    const _this = this

    // sets _requestmanager
    core.packageInit(this, args)

    // overwrite package setRequestManager
    const setRequestManager = this.setRequestManager
    this.setRequestManager = function(manager) {
        setRequestManager(manager)

        _this.net.setRequestManager(manager)
        _this.personal.setRequestManager(manager)
        _this.accounts.setRequestManager(manager)
        _this.Contract._requestManager = _this._requestManager
        _this.Contract.currentProvider = _this._provider

        return true
    }

    // overwrite setProvider
    const setProvider = this.setProvider
    this.setProvider = function(...arg) {
        setProvider.apply(_this, arg)
        _this.setRequestManager(_this._requestManager)
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
        },
        enumerable: true,
    })

    this.clearSubscriptions = _this._requestManager.clearSubscriptions

    this.decodeTransaction = decodeFromRawTransaction

    // add net
    this.net = new Net(this)
    // add chain detection
    this.net.getNetworkType = getNetworkType.bind(this)

    // add accounts
    this.accounts = new Accounts(this)

    // add personal
    this.personal = new Personal(this)
    this.personal.defaultAccount = this.defaultAccount

    // create a proxy Contract type for this instance, as a Contract's provider
    // is stored as a class member rather than an instance variable. If we do
    // not create this proxy type, changing the provider in one instance of
    // caver-klay would subsequently change the provider for _all_ contract
    // instances!
    const self = this
    const Contract = function Contract() {
        BaseContract.apply(this, arguments)
        core.packageInit(this, [self])
    }

    Contract.setProvider = function() {
        BaseContract.setProvider.apply(this, arguments)
    }

    // make our proxy Contract inherit from caver-contract so that it has all
    // the right functionality and so that instanceof and friends work properly
    Contract.prototype = Object.create(BaseContract.prototype)
    Contract.prototype.constructor = Contract

    // add contract
    this.Contract = Contract
    this.Contract.defaultAccount = this.defaultAccount
    this.Contract.defaultBlock = this.defaultBlock
    this.Contract._requestManager = this._requestManager
    this.Contract._klayAccounts = this.accounts
    this.Contract.currentProvider = this._requestManager.provider

    this.KIP7 = KIP7
    this.KIP7.defaultAccount = this.defaultAccount
    this.KIP7.defaultBlock = this.defaultBlock
    this.KIP7._requestManager = this._requestManager
    this.KIP7._klayAccounts = this.accounts
    this.KIP7.currentProvider = this._requestManager.provider

    // const kip7Deprecated =
    //     '`caver.klay.KIP7` has been deprecated. `caver.klay.KIP7` works using only `caver.klay.accounts.wallet`. If you are using `caver.wallet` then use `caver.kct.kip7`.'
    // // Overwrite constructor with deprecate warning
    // this.KIP7 = util.deprecate(this.KIP7, kip7Deprecated)

    // // Overwrite static deloy method with deprecate warning
    // this.KIP7.deploy = util.deprecate(this.KIP7.deploy, kip7Deprecated)

    this.KIP17 = KIP17
    this.KIP17.defaultAccount = this.defaultAccount
    this.KIP17.defaultBlock = this.defaultBlock
    this.KIP17._requestManager = this._requestManager
    this.KIP17._klayAccounts = this.accounts
    this.KIP17.currentProvider = this._requestManager.provider

    // const kip17Deprecated =
    //     '`caver.klay.KIP17` has been deprecated. `caver.klay.KIP17` works using only `caver.klay.accounts.wallet`. If you are using `caver.wallet` then use `caver.kct.kip17`.'
    // // Overwrite constructor with deprecate warning
    // this.KIP17 = util.deprecate(KIP17, kip17Deprecated)

    // // Overwrite static deloy method with deprecate warning
    // this.KIP17.deploy = util.deprecate(this.KIP17.deploy, kip17Deprecated)

    // add IBAN
    this.Iban = utils.Iban

    // add ABI
    this.abi = abi

    const methods = [
        ...rpcCalls.map(item => new Method(item)),
        // subscriptions
        new Subscriptions({
            name: 'subscribe',
            type: 'klay',
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
                    // DUBLICATE, also in caver-contract
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
        // second param is the klay.accounts module (necessary for signing transactions locally)
        method.setRequestManager(_this._requestManager, _this.accounts)
        method.defaultBlock = _this.defaultBlock
        method.defaultAccount = _this.defaultAccount
    })
}

module.exports = Klay
