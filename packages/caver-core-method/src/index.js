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

    This file is derived from web3.js/packages/web3-core-method/src/index.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/**
 * @file index.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @author Marek Kotewicz <marek@parity.io>
 * @date 2017
 */

const _ = require('underscore')
const errors = require('../../caver-core-helpers').errors
const formatters = require('../../caver-core-helpers').formatters
const txErrorTable = require('../../caver-core-helpers').txErrorTable
const utils = require('../../caver-utils')
const Subscriptions = require('../../caver-core-subscriptions').subscriptions
const validateParams = require('../../caver-core-helpers').validateFunction.validateParams

const TIMEOUTBLOCK = 50
const AVERAGE_BLOCK_TIME = 1 // 1s
const POLLINGTIMEOUT = AVERAGE_BLOCK_TIME * TIMEOUTBLOCK // ~average block time (seconds) * TIMEOUTBLOCK

function Method(options) {
    // call, name should be existed to create a method.
    if (!options.call || !options.name) throw errors.needNameCallPropertyToCreateMethod

    this.name = options.name
    this.call = options.call
    this.hexCall = options.hexCall
    this.params = options.params || 0
    this.inputFormatter = options.inputFormatter || []
    this.outputFormatter = options.outputFormatter
    this.transformPayload = options.transformPayload
    this.extraFormatters = options.extraFormatters

    this.requestManager = options.requestManager

    // reference to klay.accounts
    this.accounts = options.accounts

    this.defaultBlock = options.defaultBlock || 'latest'
    this.defaultAccount = options.defaultAccount || null
}

Method.prototype.setRequestManager = setRequestManager
Method.prototype.createFunction = createFunction
Method.prototype.attachToObject = attachToObject
Method.prototype.getCall = getCall
Method.prototype.extractCallback = extractCallback
Method.prototype.validateArgs = validateArgs
Method.prototype.formatInput = formatInput
Method.prototype.formatOutput = formatOutput
Method.prototype.toPayload = toPayload
Method.prototype.buildCall = buildCall
Method.prototype._confirmTransaction = _confirmTransaction
Method.prototype.request = request

/**
 * Set requestManager for rpc calling.
 * If it has accounts parameter also, set it.
 * @method setRequestManager
 * @param  {Object} requestManager
 * @param  {Object} accounts
 */
function setRequestManager(requestManager, accounts) {
    this.requestManager = requestManager

    // reference to klay.accounts
    if (accounts) this.accounts = accounts
}

/**
 * createFunction through 'this' context (= instance by created through new Method(...))
 * @method createFunction
 * @param  {Object} requestManager
 * @param  {Object} accounts
 * @return {Function} it will be used for sending RPC call.
 */
function createFunction(requestManager, accounts) {
    // set requestManager for method individulally.
    this.setRequestManager(requestManager || this.requestManager, accounts || this.accounts)

    // this.buildCall() returns function `send = function() { ... }`
    const func = this.buildCall()

    // call is directly used for rpc calling,
    // ex) 'klay_sendTransaction'
    func.call = this.call

    return func
}

/**
 * attach buildCalled method to 'obj' object,
 * by adding a property name through this.name
 * @method attachToObject
 * @param  {Object} obj
 */
function attachToObject(obj) {
    const func = this.buildCall()
    func.call = this.call
    const [callName, optionalName] = this.name.split('.')

    if (optionalName) {
        obj[callName] = obj[callName] || {}
        obj[callName][optionalName] = func
    } else {
        obj[callName] = func
    }
}

/**
 * Should be used to determine name of the jsonrpc method based on arguments
 *
 * @method getCall
 * @param {Array} arguments
 * @return {String} name of jsonrpc method
 */
function getCall(args) {
    // If hexCall is defined, args[0] type is truly hexParameter, return this.hexCall
    // If not, return this.call
    // 'this.call', 'this.hexCall' are defined in rpc.json
    return this.hexCall && utils.isHexParameter(args[0]) ? this.hexCall : this.call
}

/**
 * Should be used to extract callback from array of arguments.
 * (caution) It modifies input param.
 *
 * @method extractCallback
 * @param {Array} arguments
 * @return {Function|Null} callback, if exists
 */
function extractCallback(args) {
    if (_.isFunction(args[args.length - 1])) {
        return args.pop() // 'pop' method modifies the original args array!
    }
}

/**
 * Should be called to check if the number of arguments is correct
 *
 * @method validateArgs
 * @param {Array} arguments
 * @throws {Error} if it is not
 */
function validateArgs(args) {
    if (args.length !== this.params) {
        throw errors.InvalidNumberOfParams(args.length, this.params, this.name)
    }
}

/**
 * Should be called to format input args of method
 *
 * @method formatInput
 * @param {Array}
 * @return {Array}
 */
function formatInput(args) {
    const _this = this

    // If inputFormatter is not defined, or empty just return original args.
    if (!this.inputFormatter || _.isEmpty(this.inputFormatter)) {
        return args
    }

    // If inputFormatter is defined, map original args by calling formatter.
    return this.inputFormatter.map((formatter, index) => {
        // bind this for defaultBlock, and defaultAccount
        return (formatter && formatter.call(_this, args[index])) || args[index]
    })
}

/**
 * Should be called to format output(result) of method
 *
 * @method formatOutput
 * @param {Object}
 * @return {Object}
 */
function formatOutput(result) {
    const _this = this

    // If outputFormatter is defined, calling outputFormatter,
    // If not, just return original res.
    const _formatOutput = res => (typeof _this.outputFormatter === 'function' ? _this.outputFormatter(res) : res)

    // If result is array, map it through calling _formatOuput
    // If result is single, just calling _formatOutput.
    return _.isArray(result) ? result.map(_formatOutput) : _formatOutput(result)
}

/**
 * Should create payload from given input args
 *
 * @method toPayload
 * @param {Array} args
 * @return {Object}
 */
function toPayload(args) {
    const call = this.getCall(args)
    const callback = this.extractCallback(args)
    const inputParams = this.formatInput(args)
    this.validateArgs(inputParams)

    const payload = {
        method: call,
        params: inputParams,
        callback,
    }

    // If payload transform option is existing, apply it.
    // If not, just return payload.
    return (this.transformPayload && this.transformPayload(payload)) || payload
}

const buildSendTxCallbackFunc = (defer, method, payload, isSendTx) => (err, result) => {
    try {
        result = method.formatOutput(result)
    } catch (e) {
        if (!err) err = e
    }

    err = (result instanceof Error && result) || err

    // If err exists, fireError
    if (err) {
        return utils._fireError(
            err.error || err, // sometimes, err.error property exists, in case, fire it instead 'err'
            defer.eventEmitter,
            defer.reject,
            payload.callback
        )
    }

    // fire callback
    if (payload.callback) payload.callback(null, result)

    // return PROMISE
    if (!isSendTx) {
        defer.resolve(result)
    } else {
        defer.eventEmitter.emit('transactionHash', result)
        method._confirmTransaction(defer, result, payload)
    }
}

const buildSendSignedTxFunc = (method, payload, sendTxCallback) => sign => {
    const signedPayload = _.extend({}, payload, {
        method: 'klay_sendRawTransaction',
        params: [sign.rawTransaction],
    })

    method.requestManager.send(signedPayload, sendTxCallback)
}

const buildSendRequestFunc = (defer, sendSignedTx, sendTxCallback) => (payload, method) => {
    // Logic for handling multiple cases of parameters in sendSignedTransaction.
    // 1. Object containing rawTransaction
    //    : call 'klay_sendRawTransaction' with RLP encoded transaction(rawTransaction) in object
    // 2. A transaction object containing signatures or feePayerSignatures
    //    : call 'getRawTransactionWithSignatures', then call 'klay_sendRawTransaction' with result of getRawTransactionWithSignatures
    if (method && method.accounts && payload.method === 'klay_sendRawTransaction') {
        const transaction = payload.params[0]
        if (typeof transaction !== 'string' && _.isObject(transaction)) {
            if (transaction.rawTransaction) {
                return sendSignedTx(transaction)
            }
            return method.accounts
                .getRawTransactionWithSignatures(transaction)
                .then(sendSignedTx)
                .catch(e => {
                    sendTxCallback(e)
                })
        }
    }

    if (method && method.accounts && method.accounts.wallet && method.accounts.wallet.length) {
        switch (payload.method) {
            case 'klay_sendTransaction': {
                const tx = payload.params[0]

                let error
                if (!_.isObject(tx)) {
                    sendTxCallback(new Error('The transaction must be defined as an object.'))
                    return
                }

                let addressToUse = tx.from

                if (tx.senderRawTransaction && tx.feePayer) {
                    addressToUse = tx.feePayer
                    if (tx.from) {
                        console.log('"from" is ignored for a fee-delegated transaction.')
                        delete tx.from
                    }
                }

                let wallet

                try {
                    wallet = method.accounts.wallet.getAccount(addressToUse)
                } catch (e) {
                    sendTxCallback(e)
                    return
                }

                if (wallet && wallet.privateKey) {
                    const privateKey = method.accounts._getRoleKey(tx, wallet)
                    // If wallet was found, sign tx, and send using sendRawTransaction
                    return method.accounts
                        .signTransaction(tx, privateKey)
                        .then(sendSignedTx)
                        .catch(e => {
                            sendTxCallback(e)
                        })
                }
                if (tx.signatures) {
                    // If signatures is defined inside of the transaction object,
                    // get rawTransaction string from signed transaction object and send to network
                    return method.accounts
                        .getRawTransactionWithSignatures(tx)
                        .then(sendSignedTx)
                        .catch(e => {
                            sendTxCallback(e)
                        })
                }

                // If wallet was not found in caver-js wallet, then it has to use wallet in Node.
                // Signing to transaction using wallet in Node supports only LEGACY transaction, so if transaction is not LEGACY, return error.
                if (tx.feePayer !== undefined || (tx.type !== undefined && tx.type !== 'LEGACY')) {
                    error = new Error(
                        `No private key found in the caver-js wallet. Trying to use the Klaytn node's wallet, but it only supports legacy transactions. Please add private key of ${addressToUse} to the caver-js wallet.`
                    )
                    sendTxCallback(error)
                    return
                }

                error = validateParams(tx)
                if (error) {
                    sendTxCallback(error)
                    return
                }
                break
            }
            case 'klay_sign': {
                const data = payload.params[1]
                const wallet = method.accounts.wallet.getAccount(payload.params[0])

                if (wallet && wallet.privateKey) {
                    // If wallet was found, sign tx, and send using sendRawTransaction
                    const sign = method.accounts.sign(data, wallet.privateKey)

                    if (payload.callback) payload.callback(null, sign.signature)

                    defer.resolve(sign.signature)
                    return
                }
                break
            }
        }
    }

    return method.requestManager.send(payload, sendTxCallback)
}

const buildSendFunc = (method, isSendTx) => (...args) => {
    const defer = utils.promiEvent(!isSendTx)
    const payload = method.toPayload(args)

    const sendTxCallback = buildSendTxCallbackFunc(defer, method, payload, isSendTx)
    const sendSignedTx = buildSendSignedTxFunc(method, payload, sendTxCallback)
    const sendRequest = buildSendRequestFunc(defer, sendSignedTx, sendTxCallback)

    const isGasPriceInputMissing = isSendTx && _.isObject(payload.params[0]) && payload.params[0].gasPrice === undefined

    // If gasPrice input is missing, call getGasPrice rpc
    if (!isGasPriceInputMissing) {
        sendRequest(payload, method)
        return defer.eventEmitter
    }

    const getGasPrice = new Method({
        name: 'getGasPrice',
        call: 'klay_gasPrice',
        params: 0,
    }).createFunction(method.requestManager)

    getGasPrice((err, gasPrice) => {
        payload.params[0].gasPrice = gasPrice || payload.params[0].gasPrice
        sendRequest(payload, method)
    })

    /**
     * attaching `.on('receipt')` is possible by returning defer.eventEmitter
     */
    return defer.eventEmitter
}

function buildCall() {
    const method = this
    const isSendTx =
        method.call === 'klay_sendTransaction' ||
        method.call === 'klay_sendRawTransaction' ||
        method.call === 'personal_sendTransaction' ||
        method.call === 'personal_sendValueTransfer' ||
        method.call === 'personal_sendAccountUpdate'

    const send = buildSendFunc(method, isSendTx)
    // necessary to attach things to the method
    send.method = method
    // necessary for batch requests
    send.request = this.request.bind(this)
    return send
}

function _confirmTransaction(defer, result, payload) {
    const payloadTxObject = (payload.params && _.isObject(payload.params[0]) && payload.params[0]) || {}

    // mutableConfirmationPack will be used in
    // 1) checkConfirmation,
    // 2) startWatching functions
    // It is * mutable *, both functions can affect properties mutably.
    const mutableConfirmationPack = {
        method: this,
        promiseResolved: false,
        canUnsubscribe: true,
        timeoutCount: 0,
        intervalId: null,
        gasProvided: payloadTxObject.gas || null,
        isContractDeployment: utils.isContractDeployment(payloadTxObject),
        defer,
        result,
        _klaytnCall: {},
    }

    addCustomSendMethod(mutableConfirmationPack)

    kickoffConfirmation(mutableConfirmationPack)
}

const addCustomSendMethod = mutableConfirmationPack => {
    const customSendMethods = [
        new Method({
            name: 'getTransactionReceipt',
            call: 'klay_getTransactionReceipt',
            params: 1,
            outputFormatter: formatters.outputTransactionReceiptFormatter,
        }),
        new Method({
            name: 'getCode',
            call: 'klay_getCode',
            params: 2,
            inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
        }),
        new Subscriptions({
            name: 'subscribe',
            type: 'klay',
            subscriptions: {
                newBlockHeaders: {
                    subscriptionName: 'newHeads', // replace subscription with this name
                    params: 0,
                    outputFormatter: formatters.outputBlockFormatter,
                },
            },
        }),
    ]

    // add custom send Methods
    _.each(customSendMethods, mthd => {
        // attach methods to _klaytnCall
        mthd.attachToObject(mutableConfirmationPack._klaytnCall)
        // assign rather than call setRequestManager()
        mthd.requestManager = mutableConfirmationPack.method.requestManager
    })
}

const kickoffConfirmation = mutableConfirmationPack => {
    const { defer, promiseResolved, result, _klaytnCall } = mutableConfirmationPack
    // first check if we already have a confirmed transaction

    _klaytnCall
        .getTransactionReceipt(result)
        .then(receipt => {
            if (receipt && receipt.blockHash) {
                // `isPolling` is false in default.
                checkConfirmation(mutableConfirmationPack, receipt, false)
            } else if (!promiseResolved) startWatching(mutableConfirmationPack, receipt)
        })
        .catch(err => {
            if (!promiseResolved) startWatching(mutableConfirmationPack)
        })
}

// start watching for confirmation depending on the support features of the provider
const startWatching = function(mutableConfirmationPack, existingReceipt) {
    const { _klaytnCall, intervalId, method } = mutableConfirmationPack
    // if provider allows PUB/SUB
    if (method.requestManager.provider.supportsSubscriptions()) {
        _klaytnCall.subscribe('newBlockHeaders', checkConfirmation.bind(null, mutableConfirmationPack, existingReceipt, false))
    } else {
        mutableConfirmationPack.intervalId = setInterval(checkConfirmation.bind(null, mutableConfirmationPack, existingReceipt, true), 1000)
    }
}

// fire "receipt" and confirmation events and resolve after

const checkConfirmation = function(mutableConfirmationPack, existingReceipt, isPolling, err, blockHeader, sub) {
    const {
        // L1
        intervalId,
        defer,
        method,
        canUnsubscribe,
        _klaytnCall,
        // L2
        isContractDeployment,
        promiseResolved,
        timeoutCount,
        result,
    } = mutableConfirmationPack

    if (err) {
        sub.unsubscribe()
        mutableConfirmationPack.promiseResolved = true
        utils._fireError(
            {
                message: 'Failed to subscribe to new newBlockHeaders to confirm the transaction receipts.',
                data: err,
            },
            defer.eventEmitter,
            defer.reject
        )
        return
    }

    // create fake unsubscribe
    sub = sub || {
        unsubscribe: () => clearInterval(mutableConfirmationPack.intervalId),
    }

    // if we have a valid receipt we don't need to send a request
    return (
        ((existingReceipt && utils.promiEvent.resolve(existingReceipt)) || _klaytnCall.getTransactionReceipt(result))
            // if CONFIRMATION listener exists check for confirmations, by setting canUnsubscribe = false
            .then(receipt => {
                checkIsReceiptInBlock(receipt)

                const formattedReceipt = formatReceipt(receipt, method)

                if (mutableConfirmationPack.promiseResolved) return

                return isContractDeployment
                    ? checkForContractDeployment(mutableConfirmationPack, formattedReceipt, sub)
                    : checkForNormalTx(mutableConfirmationPack, formattedReceipt, sub)
            })
            .catch(countTimeout)
    )
}

const checkIsReceiptInBlock = receipt => {
    if (receipt && !receipt.blockHash) throw txErrorTable.blockHashNull
}

const formatReceipt = (receipt, method) => {
    if (method.extraFormatters && method.extraFormatters.receiptFormatter) {
        receipt = method.extraFormatters.receiptFormatter(receipt)
    }
    return receipt
}

const countTimeout = (mutableConfirmationPack, isPolling, sub) => {
    const { defer, timeoutCount, promiseResolved } = mutableConfirmationPack
    // time out the transaction if not mined after 50 blocks
    mutableConfirmationPack.timeoutCount++

    // check to see if we are http polling
    if (isPolling) {
        // polling timeout is different than TIMEOUTBLOCK blocks since we are triggering every second
        if (mutableConfirmationPack.timeoutCount - 1 >= POLLINGTIMEOUT) {
            sub.unsubscribe()
            mutableConfirmationPack.promiseResolved = true
            utils._fireError(
                new Error(
                    `Transaction was not mined within${POLLINGTIMEOUT} seconds, please make sure your transaction was properly sent. Be aware that it might still be mined!`
                ),
                defer.eventEmitter,
                defer.reject
            )
        }
    } else if (mutableConfirmationPack.timeoutCount - 1 >= TIMEOUTBLOCK) {
        sub.unsubscribe()
        mutableConfirmationPack.promiseResolved = true
        utils._fireError(
            new Error(
                'Transaction was not mined within 50 blocks, please make sure your transaction was properly sent. Be aware that it might still be mined!'
            ),
            defer.eventEmitter,
            defer.reject
        )
    }
}

const checkForContractDeployment = (mutableConfirmationPack, receipt, sub) => {
    const { defer, method, canUnsubscribe, _klaytnCall, promiseResolved } = mutableConfirmationPack

    // If contract address doesn't exist, fire error.
    if (!receipt.contractAddress) {
        if (canUnsubscribe) {
            sub.unsubscribe()
            mutableConfirmationPack.promiseResolved = true
        }

        utils._fireError(txErrorTable.receiptDidntContainContractAddress, defer.eventEmitter, defer.reject)
        return
    }

    _klaytnCall.getCode(receipt.contractAddress, (e, code) => {
        if (!code) return

        if (code.length > 2) {
            defer.eventEmitter.emit('receipt', receipt)

            // if contract, return instance instead of receipt
            defer.resolve(
                (method.extraFormatters &&
                    method.extraFormatters.contractDeployFormatter &&
                    method.extraFormatters.contractDeployFormatter(receipt)) ||
                    receipt
            )

            // need to remove listeners, as they aren't removed automatically when succesfull
            if (canUnsubscribe) defer.eventEmitter.removeAllListeners()
        } else {
            // code.length <= 2 means, contract code couldn't be stored.
            utils._fireError(txErrorTable.contractCouldntBeStored, defer.eventEmitter, defer.reject)
        }

        if (canUnsubscribe) sub.unsubscribe()
        mutableConfirmationPack.promiseResolved = true
    })

    return receipt
}

const checkForNormalTx = (mutableConfirmationPack, receipt, sub) => {
    const { defer, canUnsubscribe, promiseResolved, gasProvided } = mutableConfirmationPack

    if (
        receipt &&
        !receipt.outOfGas &&
        (!gasProvided || gasProvided !== receipt.gasUsed) &&
        (receipt.status === true || receipt.status === '0x1' || typeof receipt.status === 'undefined')
    ) {
        // Happy case: transaction is processed well. A.K.A 'well-done receipt'.
        try {
            mutableConfirmationPack.defer.eventEmitter.emit('receipt', receipt)
            mutableConfirmationPack.defer.resolve(receipt)
        } catch (e) {
            console.log('receipt error', e)
        }

        // need to remove listeners, as they aren't removed automatically when succesfull
        if (canUnsubscribe) {
            mutableConfirmationPack.defer.eventEmitter.removeAllListeners()
        }
    } else {
        // Unhappy case: trasaction has error. A.K.A 'bad receipt'.
        if (!receipt) return
        const receiptJSON = JSON.stringify(receipt, null, 2)

        const { txError } = receipt
        if (txError && txErrorTable[txError]) {
            utils._fireError(
                new Error(`${txErrorTable[txError]}\n ${receiptJSON}`),
                mutableConfirmationPack.defer.eventEmitter,
                mutableConfirmationPack.defer.reject
            )
        } else if (receipt.status === false || receipt.status === '0x0') {
            utils._fireError(
                txErrorTable.transactionReverted(receiptJSON),
                mutableConfirmationPack.defer.eventEmitter,
                mutableConfirmationPack.defer.reject
            )
        } else if (receipt.gasUsed >= gasProvided) {
            utils._fireError(
                txErrorTable.transactionRanOutOfGas(receiptJSON),
                mutableConfirmationPack.defer.eventEmitter,
                mutableConfirmationPack.defer.reject
            )
        } else {
            utils._fireError(
                txErrorTable.transactionRanOutOfGas(receiptJSON),
                mutableConfirmationPack.defer.eventEmitter,
                mutableConfirmationPack.defer.reject
            )
        }
    }

    if (canUnsubscribe) sub.unsubscribe()
    mutableConfirmationPack.promiseResolved = true
}

/**
 * Should be called to create the pure JSONRPC request which can be used in a batch request
 *
 * @method request
 * @return {Object} jsonrpc request
 */
function request(...args) {
    const payload = this.toPayload(args)
    payload.format = this.formatOutput.bind(this)
    return payload
}

module.exports = Method
