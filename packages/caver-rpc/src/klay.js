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
const MethodBase = require('../../caver-core-method')

const utils = require('../../caver-utils')

const AbstractTransaction = require('../../caver-transaction/src/transactionTypes/abstractTransaction')
const Validator = require('../../caver-validator')

class KlayRPC {
    constructor(...args) {
        const _this = this

        // sets _requestmanager
        core.packageInit(this, args)

        // overwrite package setRequestManager
        const setRequestManager = this.setRequestManager
        this.setRequestManager = function(manager) {
            setRequestManager(manager)
            return true
        }

        // overwrite setProvider
        const setProvider = this.setProvider
        this.setProvider = function(...arg) {
            setProvider.apply(_this, arg)
            _this.setRequestManager(_this._requestManager)
        }

        this.clearSubscriptions = _this._requestManager.clearSubscriptions

        class Method extends MethodBase {
            constructor(options) {
                options.outputFormatterDisable = true
                super(options)
            }
        }

        const _klaytnCall = [
            new Method({
                name: 'getChainId',
                call: 'klay_chainID',
                params: 0,
            }),
            new Method({
                name: 'getGasPrice',
                call: 'klay_gasPrice',
                params: 0,
            }),
            new Method({
                name: 'getTransactionCount',
                call: 'klay_getTransactionCount',
                params: 2,
                inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),
            new Method({
                name: 'getAccountKey',
                call: 'klay_getAccountKey',
                params: 2,
                inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),
            new Method({
                name: 'getTransactionByHash',
                call: 'klay_getTransactionByHash',
                params: 1,
            }),
        ]
        AbstractTransaction._klaytnCall = {}
        Validator._klaytnCall = {}
        _.each(_klaytnCall, function(method) {
            method = new Method(method)
            method.attachToObject(AbstractTransaction._klaytnCall)
            method.attachToObject(Validator._klaytnCall)
            method.setRequestManager(_this._requestManager)
        })

        const methods = [
            ..._klaytnCall,

            // Account
            new Method({
                name: 'accountCreated',
                call: 'klay_accountCreated',
                params: 2,
                inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),
            new Method({
                name: 'getAccounts',
                call: 'klay_accounts',
                params: 0,
            }),
            new Method({
                name: 'encodeAccountKey',
                call: 'klay_encodeAccountKey',
                params: 1,
                inputFormatter: [formatters.inputAccountKeyFormatter],
            }),
            new Method({
                name: 'decodeAccountKey',
                call: 'klay_decodeAccountKey',
                params: 1,
            }),
            new Method({
                name: 'getAccount',
                call: 'klay_getAccount',
                params: 2,
                inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),
            new Method({
                name: 'getBalance',
                call: 'klay_getBalance',
                params: 2,
                inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),
            new Method({
                name: 'getCode',
                call: 'klay_getCode',
                params: 2,
                inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),
            new Method({
                name: 'isContractAccount',
                call: 'klay_isContractAccount',
                params: 2,
                inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),
            new Method({
                name: 'sign',
                call: 'klay_sign',
                params: 2,
                inputFormatter: [formatters.inputAddressFormatter, formatters.inputSignFormatter],
            }),

            // Block
            new Method({
                name: 'getBlockNumber',
                call: 'klay_blockNumber',
                params: 0,
            }),
            new Method({
                name: 'getBlock',
                call: 'klay_getBlockByNumber',
                hexCall: 'klay_getBlockByHash',
                params: 2,
                inputFormatter: [formatters.inputBlockNumberFormatter, formatters.toBoolean],
            }),
            new Method({
                name: 'getBlockByNumber',
                call: 'klay_getBlockByNumber',
                params: 2,
                inputFormatter: [formatters.inputBlockNumberFormatter, formatters.toBoolean],
            }),
            new Method({
                name: 'getBlockByHash',
                call: 'klay_getBlockByHash',
                params: 2,
                inputFormatter: [formatters.inputBlockNumberFormatter, formatters.toBoolean],
            }),
            new Method({
                name: 'getBlockReceipts',
                call: 'klay_getBlockReceipts',
                params: 1,
            }),
            new Method({
                name: 'getBlockTransactionCount',
                call: 'klay_getBlockTransactionCountByNumber',
                hexCall: 'klay_getBlockTransactionCountByHash',
                params: 1,
                inputFormatter: [formatters.inputBlockNumberFormatter],
            }),
            new Method({
                name: 'getBlockTransactionCountByNumber',
                call: 'klay_getBlockTransactionCountByNumber',
                params: 1,
                inputFormatter: [formatters.inputBlockNumberFormatter],
            }),
            new Method({
                name: 'getBlockTransactionCountByHash',
                call: 'klay_getBlockTransactionCountByHash',
                params: 1,
                inputFormatter: [formatters.inputBlockNumberFormatter],
            }),
            new Method({
                name: 'getBlockWithConsensusInfo',
                call: 'klay_getBlockWithConsensusInfoByNumber',
                hexCall: 'klay_getBlockWithConsensusInfoByHash',
                params: 1,
                inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
            }),
            new Method({
                name: 'getBlockWithConsensusInfoByNumber',
                call: 'klay_getBlockWithConsensusInfoByNumber',
                params: 1,
                inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
            }),
            new Method({
                name: 'getBlockWithConsensusInfoByHash',
                call: 'klay_getBlockWithConsensusInfoByHash',
                params: 1,
                inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
            }),
            new Method({
                name: 'getCommittee',
                call: 'klay_getCommittee',
                params: 1,
                inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
            }),
            new Method({
                name: 'getCommitteeSize',
                call: 'klay_getCommitteeSize',
                params: 1,
                inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
            }),
            new Method({
                name: 'getCouncil',
                call: 'klay_getCouncil',
                params: 1,
                inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
            }),
            new Method({
                name: 'getCouncilSize',
                call: 'klay_getCouncilSize',
                params: 1,
                inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
            }),
            new Method({
                name: 'getStorageAt',
                call: 'klay_getStorageAt',
                params: 3,
                inputFormatter: [formatters.inputAddressFormatter, utils.numberToHex, formatters.inputDefaultBlockNumberFormatter],
            }),
            new Method({
                name: 'isMining',
                call: 'klay_mining',
                params: 0,
            }),
            new Method({
                name: 'isSyncing',
                call: 'klay_syncing',
                params: 0,
            }),

            // Transaction
            new Method({
                name: 'call',
                call: 'klay_call',
                params: 2,
                inputFormatter: [formatters.inputCallFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),
            new Method({
                name: 'estimateGas',
                call: 'klay_estimateGas',
                params: 1,
                inputFormatter: [formatters.inputCallFormatter],
            }),
            new Method({
                name: 'estimateComputationCost',
                call: 'klay_estimateComputationCost',
                params: 2,
                inputFormatter: [formatters.inputCallFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),
            new Method({
                name: 'getTransactionFromBlock',
                call: 'klay_getTransactionByBlockNumberAndIndex',
                hexCall: 'klay_getTransactionByBlockHashAndIndex',
                params: 2,
                inputFormatter: [formatters.inputBlockNumberFormatter, utils.numberToHex],
            }),
            new Method({
                name: 'getTransactionByBlockNumberAndIndex',
                call: 'klay_getTransactionByBlockNumberAndIndex',
                params: 2,
                inputFormatter: [formatters.inputBlockNumberFormatter, utils.numberToHex],
            }),
            new Method({
                name: 'getTransactionByBlockHashAndIndex',
                call: 'klay_getTransactionByBlockHashAndIndex',
                params: 2,
                inputFormatter: [formatters.inputBlockNumberFormatter, utils.numberToHex],
            }),
            new Method({
                name: 'getTransaction',
                call: 'klay_getTransactionByHash',
                params: 1,
            }),
            new Method({
                name: 'getTransactionByHash',
                call: 'klay_getTransactionByHash',
                params: 1,
            }),
            new Method({
                name: 'getTransactionBySenderTxHash',
                call: 'klay_getTransactionBySenderTxHash',
                params: 1,
            }),
            new Method({
                name: 'getTransactionReceipt',
                call: 'klay_getTransactionReceipt',
                params: 1,
            }),
            new Method({
                name: 'getTransactionReceiptBySenderTxHash',
                call: 'klay_getTransactionReceiptBySenderTxHash',
                params: 1,
            }),
            new Method({
                name: 'sendRawTransaction',
                call: 'klay_sendRawTransaction',
                params: 1,
            }),
            new Method({
                name: 'submitTransaction',
                call: 'klay_sendRawTransaction',
                params: 1,
            }),
            new Method({
                name: 'sendTransaction',
                call: 'klay_sendTransaction',
                params: 1,
                inputFormatter: [formatters.inputTransactionFormatter],
            }),
            new Method({
                name: 'sendTransactionAsFeePayer',
                call: 'klay_sendTransactionAsFeePayer',
                params: 1,
                inputFormatter: [formatters.inputTransactionFormatter],
            }),
            new Method({
                name: 'signTransaction',
                call: 'klay_signTransaction',
                params: 1,
                inputFormatter: [formatters.inputTransactionFormatter],
            }),
            new Method({
                name: 'signTransactionAsFeePayer',
                call: 'klay_signTransactionAsFeePayer',
                params: 1,
                inputFormatter: [formatters.inputTransactionFormatter],
            }),
            new Method({
                name: 'getDecodedAnchoringTransactionByHash',
                call: 'klay_getDecodedAnchoringTransactionByHash',
                params: 1,
            }),

            // Configuration
            new Method({
                name: 'getClientVersion',
                call: 'klay_clientVersion',
                params: 0,
            }),
            new Method({
                name: 'getGasPriceAt',
                call: 'klay_gasPriceAt',
                params: 1,
                inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
            }),
            new Method({
                name: 'isParallelDBWrite',
                call: 'klay_isParallelDBWrite',
                params: 0,
            }),
            new Method({
                name: 'isSenderTxHashIndexingEnabled',
                call: 'klay_isSenderTxHashIndexingEnabled',
                params: 0,
            }),
            new Method({
                name: 'getProtocolVersion',
                call: 'klay_protocolVersion',
                params: 0,
            }),
            new Method({
                name: 'getRewardbase',
                call: 'klay_rewardbase',
                params: 0,
            }),
            new Method({
                name: 'isWriteThroughCaching',
                call: 'klay_writeThroughCaching',
                params: 0,
            }),

            // Filter
            new Method({
                name: 'getFilterChanges',
                call: 'klay_getFilterChanges',
                params: 1,
                inputFormatter: [utils.numberToHex],
            }),
            new Method({
                name: 'getFilterLogs',
                call: 'klay_getFilterLogs',
                params: 1,
                inputFormatter: [utils.numberToHex],
            }),
            new Method({
                name: 'getLogs',
                call: 'klay_getLogs',
                params: 1,
                inputFormatter: [formatters.inputLogFormatter],
            }),
            new Method({
                name: 'newBlockFilter',
                call: 'klay_newBlockFilter',
                params: 0,
            }),
            new Method({
                name: 'newFilter',
                call: 'klay_newFilter',
                params: 1,
                inputFormatter: [formatters.inputLogFormatter],
            }),
            new Method({
                name: 'newPendingTransactionFilter',
                call: 'klay_newPendingTransactionFilter',
                params: 0,
            }),
            new Method({
                name: 'uninstallFilter',
                call: 'klay_uninstallFilter',
                params: 1,
                inputFormatter: [utils.numberToHex],
            }),

            // Misc
            new Method({
                name: 'sha3',
                call: 'klay_sha3',
                params: 1,
            }),
            new Method({
                name: 'getCypressCredit',
                call: 'klay_getCypressCredit',
                params: 1,
                inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
            }),

            // subscriptions
            new Subscriptions({
                name: 'subscribe',
                type: 'klay',
                subscriptions: {
                    newBlockHeaders: {
                        subscriptionName: 'newHeads', // replace subscription with this name
                        params: 0,
                    },
                    pendingTransactions: {
                        subscriptionName: 'newPendingTransactions', // replace subscription with this name
                        params: 0,
                    },
                    logs: {
                        params: 1,
                        inputFormatter: [formatters.inputLogFormatter],
                        subscriptionHandler: function(output) {
                            this.emit('data', output)

                            if (_.isFunction(this.callback)) {
                                this.callback(null, output, this)
                            }
                        },
                    },
                    syncing: {
                        params: 0,
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
            method.setRequestManager(_this._requestManager)
        })
    }
}

module.exports = KlayRPC
