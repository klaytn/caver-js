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

/* eslint-disable max-classes-per-file */
const _ = require('lodash')

const core = require('../../caver-core')
const { formatters } = require('../../caver-core-helpers')
const Subscriptions = require('../../caver-core-subscriptions').subscriptions
const MethodBase = require('../../caver-core-method')

const utils = require('../../caver-utils')

const AbstractTransaction = require('../../caver-transaction/src/transactionTypes/abstractTransaction')

/**
 * A class that can invoke Klay RPC Calls.
 * @class
 * @hideconstructor
 */
class Klay {
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
            /**
             * Returns the chain ID of the chain.
             *
             * @memberof Klay
             * @method getChainId
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getChainId()
             *
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The chain ID of the chain.
             */
            new Method({
                name: 'getChainId',
                call: 'klay_chainID',
                params: 0,
            }),
            /**
             * Returns the current price per gas in peb.
             *
             * @memberof Klay
             * @method getGasPrice
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getGasPrice()
             *
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The current gas price in peb.
             */
            new Method({
                name: 'getGasPrice',
                call: 'klay_gasPrice',
                params: 0,
            }),
            /**
             * Returns the total number of transactions sent from an address.
             *
             * @memberof Klay
             * @method getTransactionCount
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getTransactionCount('0x{address in hex}')
             *
             * @param {string} address The address to get the number of transactions from.
             * @param {number|string} [blocNumber] A block number, the string pending for the pending nonce, or the string `earliest` or `latest` as in the default block parameter. If omitted, `latest` will be used.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The number of transactions sent from the given address in hex.
             */
            new Method({
                name: 'getTransactionCount',
                call: 'klay_getTransactionCount',
                params: 2,
                inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),
            /**
             * Returns a block header by block number.
             *
             * @memberof Klay
             * @method getHeaderByNumber
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getHeaderByNumber(0)
             * const result = await caver.rpc.klay.getHeaderByNumber('latest')
             *
             * @param {string|number|BN|BigNumber} blockNumberOrTag The block number or block tag string to query block header.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.Header>} An object includes block header.
             */
            new Method({
                name: 'getHeaderByNumber',
                call: 'klay_getHeaderByNumber',
                params: 1,
                inputFormatter: [formatters.inputBlockNumberFormatter],
            }),
            /**
             * An object defines the AccountKeyLegacy.
             *
             * @example
             * { keyType: 1, key: {} }
             *
             * @typedef {object} Klay.AccountKeyLegacy
             * @property {number} keyType - The key type number. The AccountKeyLegacy key type is `1`.
             * @property {object} key - The key information object. For AccountKeyLegacy this field will be empty.
             */
            /**
             * An object defines the public key.
             *
             * @typedef {object} Klay.PublicKeyObject
             * @property {string} x - The x point of the public key.
             * @property {string} y - The y point of the public key.
             */
            /**
             * An object defines the AccountKeyPublic.
             *
             * @example
             * {
             *     keyType: 2,
             *     key: { x:'0xb9a4b...', y:'0x7a285...' }
             * }
             *
             * @typedef {object} Klay.AccountKeyPublic
             * @property {number} keyType - The key type number. The AccountKeyPublic key type is `2`.
             * @property {Klay.PublicKeyObject} key - The key information object.
             */
            /**
             * An object defines the AccountKeyFail.
             *
             * @example
             * { keyType: 3, key:{} }
             *
             * @typedef {object} Klay.AccountKeyFail
             * @property {number} keyType - The key type number. The AccountKeyFail key type is `3`.
             * @property {object} key - The key information object. For AccountKeyFail this field will be empty.
             */
            /**
             * An object defines the AccountKeyWeightedMultiSig.
             *
             * @typedef {object} Klay.WeightedPublicKey
             * @property {number} weight - The weight of the key.
             * @property {Klay.PublicKeyObject} key - The public key.
             */
            /**
             * An object defines the AccountKeyWeightedMultiSig.
             *
             * @typedef {object} Klay.WeightedMultiSigKey
             * @property {number} threshold - The threshold of the AccountKeyWeightedMultiSig.
             * @property {Array.<Klay.WeightedPublicKey>} keys - An array that defines weighted public keys.
             */
            /**
             * An object defines the AccountKeyWeightedMultiSig.
             *
             * @example
             * {
             *     keyType: 4,
             *     key: {
             *         threshold: 2,
             *         keys: [
             *             {
             *                 weight: 1,
             *                 key: { x: '0xae6b7...', y: '0x79ddf...' }
             *             },
             *             {
             *                 weight: 1,
             *                 key: { x: '0xd4256...', y: '0xfc5e7...' }
             *             },
             *             {
             *                 weight: 1,
             *                 key: { x: '0xd653e...', y: '0xe974e...' }
             *             }
             *         ]
             *     }
             * }
             *
             * @typedef {object} Klay.AccountKeyWeightedMultiSig
             * @property {number} keyType - The key type number. The AccountKeyWeightedMultiSig key type is `4`.
             * @property {Klay.WeightedMultiSigKey} key - The key information object. For AccountKeyWeightedMultiSig this field will be defined with threshold and weighted public keys to use.
             */
            /**
             * An object defines the AccountKeyRoleBased.
             *
             * @example
             * {
             *     keyType: 5,
             *     key: [
             *         {
             *             key: { x: '0x81965...', y: '0x18242...' },
             *             keyType: 2
             *         },
             *         {
             *             key: { x: '0x73363...', y: '0xfc3e3...' },
             *             keyType: 2
             *         },
             *         {
             *             key: { x: '0x95c92...', y: '0xef783...' },
             *             keyType: 2
             *         }
             *     ]
             * }
             *
             * @typedef {object} Klay.AccountKeyRoleBased
             * @property {number} keyType - The key type number. The AccountKeyRoleBased key type is `5`.
             * @property {Array.<Klay.AccountKeyLegacy|Klay.AccountKeyPublic|Klay.AccountKeyFail|Klay.AccountKeyWeightedMultiSig>} key - The key information object. AccountKeyRoleBased defines account key for each roles.
             */
            /**
             * An account key type.
             *
             * @typedef {Klay.AccountKeyLegacy|Klay.AccountKeyPublic|Klay.AccountKeyFail|Klay.AccountKeyWeightedMultiSig|Klay.AccountKeyRoleBased} Klay.AccountKey
             */
            /**
             * Returns AccountKey of a given address.
             * If the account has {@link https://docs.klaytn.com/klaytn/design/accounts#accountkeylegacy|AccountKeyLegacy} or the account of the given address is a {@link https://docs.klaytn.com/klaytn/design/accounts#smart-contract-accounts-scas|Smart Contract Account}, it will return an empty key value.
             * Please refer to {@link https://docs.klaytn.com/klaytn/design/accounts#account-key|Account Key} for more details.
             *
             * @memberof Klay
             * @method getAccountKey
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getAccountKey('0x{address in hex}')
             *
             * @param {string} address The address of Klaytn account from which you want to get an object of AccountKey information.
             * @param {number|string} [blocNumber] A block number, the string pending for the pending nonce, or the string `earliest` or `latest` as in the default block parameter. If omitted, `latest` will be used.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.AccountKey>} An object that contains AccountKey information. Each AccountKey type has different attributes.
             */
            new Method({
                name: 'getAccountKey',
                call: 'klay_getAccountKey',
                params: 2,
                inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),
            /**
             * An object defines the signature data from the Node.
             *
             * @typedef {object} Klay.SignatureData
             * @property {string} V - V contains ECDSA recovery id.
             * @property {string} R - R contains ECDSA signature r.
             * @property {string} S - S contains ECDSA signature s.
             */
            /**
             * An object defines the Transaction from the Node.
             *
             * @typedef {object} Klay.Transaction
             * @property {string} blockHash - Hash of the block where this transaction was in.
             * @property {string} blockNumber - Block number where this transaction was in.
             * @property {string} [codeFormat] - The code format of smart contract code.
             * @property {string} [feePayer] - Address of the fee payer.
             * @property {Array.<Klay.SignatureData>} [feePayerSignatures] - An array of fee payer's signature objects. A signature object contains three fields (V, R, and S)
             * @property {string} [feeRatio] - Fee ratio of the fee payer. If it is 30, 30% of the fee will be paid by the fee payer. 70% will be paid by the sender.
             * @property {string} from - Address of the sender.
             * @property {string} gas - Gas provided by the sender.
             * @property {string} gasPrice - Gas price provided by the sender in peb.
             * @property {string} hash - Hash of the transaction.
             * @property {boolean} [humanReadable] - `true` if the address is humanReadable, `false` if the address is not humanReadable.
             * @property {string} [key] - The RLP-encoded AccountKey used to update AccountKey of an Klaytn account. See {@link https://docs.klaytn.com/klaytn/design/accounts#account-key|AccountKey} for more details.
             * @property {string} [input] - The data sent along with the transaction.
             * @property {string} nonce - The number of transactions made by the sender prior to this one.
             * @property {string} senderTxHash - Hash of the tx without the fee payer's address and signature. This value is always the same as the value of `hash` for non-fee-delegated transactions.
             * @property {Array.<Klay.SignatureData>} signatures - An array of signature objects. A signature object contains three fields (V, R, and S).
             * @property {string} to - Address of the receiver. null when it is a contract deploying transaction.
             * @property {string} transactionIndex - Integer of the transaction index position in the block.
             * @property {string} type - A string representing the type of the transaction.
             * @property {number} typeInt - An integer representing the type of the transaction.
             * @property {string} value - Value transferred in peb.
             */
            /**
             * Returns the information about a transaction requested by transaction hash.
             *
             * @memberof Klay
             * @method getTransactionByHash
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getTransactionByHash('0x991d2e63b91104264d2886fb2ae2ccdf90551377af4e334b313abe123a5406aa')
             *
             * @param {string} transactionHash A transaction hash.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.Transaction>} A transaction object, or null when no transaction was found.
             */
            new Method({
                name: 'getTransactionByHash',
                call: 'klay_getTransactionByHash',
                params: 1,
            }),
            /**
             * Returns a suggestion for a gas tip cap for dynamic fee transactions in peb.
             * Since Klaytn has a fixed gas price, this `caver.rpc.klay.getMaxPriorityFeePerGas` returns the gas price set by Klaytn.
             *
             * @memberof Klay
             * @method getMaxPriorityFeePerGas
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getMaxPriorityFeePerGas()
             *
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} As a suggested value for the gas tip cap, the current Klaytn uses a fixed gas price, so the gasPrice value is returned.
             */
            new Method({
                name: 'getMaxPriorityFeePerGas',
                call: 'klay_maxPriorityFeePerGas',
                params: 0,
            }),
        ]
        AbstractTransaction._klaytnCall = {}
        this.klaytnCall = {}
        _.each(_klaytnCall, function(method) {
            method = new Method(method)
            method.attachToObject(AbstractTransaction._klaytnCall)
            method.attachToObject(_this.klaytnCall)
            method.setRequestManager(_this._requestManager)
        })

        const methods = [
            ..._klaytnCall,

            // Account
            /**
             * Returns `true` if the account associated with the address is created in the Klaytn blockchain platform. It returns `false` otherwise.
             *
             * @memberof Klay
             * @method accountCreated
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.accountCreated('0x{address in hex}')
             *
             * @param {string} address The address of the account you want to query to see if it has been created on the network.
             * @param {string|number} [blockNumber] A block number, or the string `latest` or `earliest`. If omitted, `latest` will be used.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<boolean>} The existence of an input address in the Klaytn.
             */
            new Method({
                name: 'accountCreated',
                call: 'klay_accountCreated',
                params: 2,
                inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),
            /**
             * Returns a list of addresses owned by the Klaytn Node.
             *
             * @memberof Klay
             * @method getAccounts
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getAccounts()
             *
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Array.<string>>} An array of addresses owned by the Klaytn Node.
             */
            new Method({
                name: 'getAccounts',
                call: 'klay_accounts',
                params: 0,
            }),
            /**
             * Encodes an object that contains AccountKey information using the Recursive Length Prefix (RLP) encoding scheme. Also you can use {@link Account#getRLPEncodingAccountKey|account.getRLPEncodingAccountKey} to get RLP-encoded AccountKey.
             *
             * @memberof Klay
             * @method encodeAccountKey
             * @instance
             *
             * @example
             * // Using Klay.AccountKey(AccountKeyLegacy)
             * const result = await caver.rpc.klay.encodeAccountKey({ keyType: 1, key: {} })
             * // Using Klay.AccountKey(AccountKeyPublic)
             * const result = await caver.rpc.klay.encodeAccountKey({ keyType: 2, key: { x: '0xdbac8...', y: '0x906d7...' } })
             * // Using Klay.AccountKey(AccountKeyFail)
             * const result = await caver.rpc.klay.encodeAccountKey({ keyType: 3, key: {} })
             * // Using Klay.AccountKey(AccountKeyWeightedMultiSig)
             * const result = await caver.rpc.klay.encodeAccountKey({
             *     keyType: 4,
             *     key: {
             *         threshold: 2,
             *         keys: [
             *             { weight: 1, key: { x: '0xc734b...', y: '0x61a44...' } }
             *             { weight: 1, key: { x: '0x12d45...', y: '0x8ef35...' } }
             *         ]
             *     }
             * })
             * // Using Klay.AccountKey(AccountKeyLegacy)
             * const result = await caver.rpc.klay.encodeAccountKey({
             *     keyType: 5,
             *     key: [
             *         { keyType: 2, key: { x: '0xe4a01...', y: '0xa5735...' } },
             *         {
             *             keyType: 4,
             *             key: {
             *                 threshold: 2,
             *                 keys: [
             *                     { weight: 1, key: { x: '0xe4a01...', y: '0xa5735...' } },
             *                     { weight: 1, key: { x: '0x36f63...', y: '0x6fdf9...' } },
             *                 ],
             *             },
             *         },
             *         { keyType: 2, key: { x: '0xc8785...', y: '0x94c27...' } },
             *     ],
             * })
             *
             * // Using Account.AccountKey
             * const accountKey = caver.account.create('0x{address in hex}', '0xf1d2e...').accountKey
             * const result = await caver.rpc.klay.encodeAccountKey(accountKey)
             *
             * @param {Klay.AccountKey|Account.AccountKey} accountKey An object defines `keyType` and `key` inside or an instance of AccountKey.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} An RLP-encoded AccountKey.
             */
            new Method({
                name: 'encodeAccountKey',
                call: 'klay_encodeAccountKey',
                params: 1,
                inputFormatter: [formatters.inputAccountKeyFormatter],
            }),
            /**
             * Decodes An RLP-encoded AccountKey. Also you can use {@link AccountKeyDecoder.decode|caver.account.accountKey.decode} to decode An RLP-encoded AccountKey.
             *
             * @memberof Klay
             * @method decodeAccountKey
             * @instance
             *
             * @example
             * // Decode an accountKeyLegacy
             * const result = await caver.rpc.klay.decodeAccountKey('0x01c0')
             * // Decode an accountKeyPublic
             * const result = await caver.rpc.klay.decodeAccountKey('0x02a102dbac81e8486d68eac4e6ef9db617f7fbd79a04a3b323c982a09cdfc61f0ae0e8')
             * // Decode an accountKeyFail
             * const result = await caver.rpc.klay.decodeAccountKey('0x03c0')
             * // Decode an accountKeyWeightedMultiSig
             * const result = await caver.rpc.klay.decodeAccountKey('0x04f84b02f848e301a102c734b50ddb229be5e929fc4aa8080ae8240a802d23d3290e5e6156ce029b110ee301a10212d45f1cc56fbd6cd8fc877ab63b5092ac77db907a8a42c41dad3e98d7c64dfb')
             * // Decode an accountKeyRoleBased
             * const result = await caver.rpc.klay.decodeAccountKey('0x05f898a302a103e4a01407460c1c03ac0c82fd84f303a699b210c0b054f4aff72ff7dcdf01512db84e04f84b02f848e301a103e4a01407460c1c03ac0c82fd84f303a699b210c0b054f4aff72ff7dcdf01512de301a10336f6355f5b532c3c160')
             *
             * @param {string} encodedKey An RLP-encoded AccountKey.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.AccountKey>} An object defines `keyType` and `key` inside.
             */
            new Method({
                name: 'decodeAccountKey',
                call: 'klay_decodeAccountKey',
                params: 1,
            }),
            /**
             * An object defines the detailed information for EOA.
             *
             * @example
             * {
             *     nonce: 0,
             *     balance: '0x',
             *     humanReadable: false,
             *     key: { keyType: 1, key: {} }
             * }
             *
             * @typedef {object} Klay.EOA
             * @property {number} nonce - A sequence number used to determine the order of transactions. The transaction to be processed next has the same nonce with this value.
             * @property {string} balance - The amount of KLAY the account has.
             * @property {boolean} humanReadable - A boolean value indicating that the account is associated with a human-readable address. Since {@link https://docs.klaytn.com/klaytn/design/accounts#human-readable-address-hra|HRA} is under development, this value is false for all accounts.
             * @property {Klay.AccountKey} key - The key associated with this account.
             */
            /**
             * An object defines the detailed information for SCA.
             *
             * @example
             * {
             *     nonce: 1,
             *     balance: '0x',
             *     humanReadable: false,
             *     key: { keyType: 3, key: {} },
             *     storageRoot: '0xd0ce6b9ba63cf727d48833bcaf69f398bb353e9a5b6235ac5bb3a8e95ff90ecf',
             *     codeHash: '7pemrmP8fcguH/ut/SYHJoUSecfUIcUyeCpMf0sBYVI=',
             *     codeFormat: 0
             * }
             *
             * @typedef {object} Klay.SCA
             * @property {number} nonce - A sequence number used to determine the order of transactions. The transaction to be processed next has the same nonce with this value.
             * @property {string} balance - The amount of KLAY the account has.
             * @property {boolean} humanReadable - A boolean value indicating that the account is associated with a human-readable address. Since {@link https://docs.klaytn.com/klaytn/design/accounts#human-readable-address-hra|HRA} is under development, this value is false for all accounts.
             * @property {Klay.AccountKey} key - The key associated with this account.
             * @property {string} codeHash - The hash of the account's smart contract code. This value is immutable, which means it is set only when the smart contract is created.
             * @property {string} storageRoot - A 256-bit hash of the root of the Merkle Patricia Trie that contains the values of all the storage variables in the account.
             * @property {number} codeFormat - A format of the code in this account. Currently, it supports EVM(0x00) only.
             */
            /**
             * An object defines the Klaytn account.
             *
             * @example
             * // EOA
             * {
             *     accType: 1,
             *     account: {
             *         nonce: 0,
             *         balance: '0x',
             *         humanReadable: false,
             *         key: { keyType: 1, key: {} }
             *     }
             * }
             * // SCA
             * {
             *     accType: 2,
             *     account: {
             *         nonce: 1,
             *         balance: '0x',
             *         humanReadable: false,
             *         key: { keyType: 3, key: {} },
             *         storageRoot: '0xd0ce6b9ba63cf727d48833bcaf69f398bb353e9a5b6235ac5bb3a8e95ff90ecf',
             *         codeHash: '7pemrmP8fcguH/ut/SYHJoUSecfUIcUyeCpMf0sBYVI=',
             *         codeFormat: 0
             *     }
             * }
             *
             * @typedef {object} Klay.Account
             * @property {number} accType - The account type number.
             * @property {Klay.EOA|Klay.SCA} account - The key information object. For AccountKeyLegacy this field will be empty.
             */
            /**
             * Returns the account information of a given address in the Klaytn.
             * For more details about the types of an account in Klaytn, please refer to {@link https://docs.klaytn.com/klaytn/design/accounts#klaytn-account-types|Klaytn Account Types}.
             *
             * @memberof Klay
             * @method getAccount
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getAccount('0x{address in hex}')
             *
             * @param {string} address The address of the account for which you want to get account information.
             * @param {string|number} [blockNumber] A block number, or the string `latest` or `earliest`. If omitted, `latest` will be used.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.Account>} An object defines `keyType` and `key` inside.
             */
            new Method({
                name: 'getAccount',
                call: 'klay_getAccount',
                params: 2,
                inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),
            /**
             * Returns the balance of the account of the given address in Klaytn.
             *
             * @memberof Klay
             * @method getBalance
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getBalance('0x{address in hex}')
             *
             * @param {string} address The address of the account for which you want to get balance.
             * @param {string|number} [blockNumber] A block number, or the string `latest` or `earliest`. If omitted, `latest` will be used.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The current balance for the given address in peb.
             */
            new Method({
                name: 'getBalance',
                call: 'klay_getBalance',
                params: 2,
                inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),
            /**
             * Returns code at a given address.
             *
             * @memberof Klay
             * @method getCode
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getCode('0x{address in hex}')
             *
             * @param {string} address The address to get the code from.
             * @param {string|number} [blockNumber] A block number, or the string `latest` or `earliest`. If omitted, `latest` will be used.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The code from the given address.
             */
            new Method({
                name: 'getCode',
                call: 'klay_getCode',
                params: 2,
                inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),
            /**
             * Returns `true` if an input account has a non-empty codeHash at the time of a specific block number.
             * It returns `false` if the account is an EOA or a smart contract account which doesn't have codeHash.
             * Please refer to {@link https://docs.klaytn.com/klaytn/design/accounts#smart-contract-accounts-scas|Smart Contract Account} for more details.
             *
             * @memberof Klay
             * @method isContractAccount
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.isContractAccount('0x{address in hex}')
             *
             * @param {string} address The address you want to check for isContractAccount.
             * @param {string|number} [blockNumber] A block number, or the string `latest` or `earliest`. If omitted, `latest` will be used.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<boolean>} `true` means the input parameter is an existing smart contract address.
             */
            new Method({
                name: 'isContractAccount',
                call: 'klay_isContractAccount',
                params: 2,
                inputFormatter: [formatters.inputAddressFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),
            /**
             * Generates signed data specific to the Klaytn.
             * Refer to {@link https://docs.klaytn.com/dapp/json-rpc/api-references/klay/account#klay_sign|Klaytn Platform API - klay_sign} to know how the signature is generated
             *
             * This API provides the function to sign a message using an {@link https://docs.klaytn.com/dapp/json-rpc/api-references/personal#personal_importrawkey|imported account} in your Klaytn node.
             * The imported account in your node must be {@link https://docs.klaytn.com/dapp/json-rpc/api-references/personal#personal_unlockaccount|unlocked} to sign the message.
             * To sign a transaction with imported account in your Klaytn node, use {@link signTransaction|caver.rpc.klay.signTransaction}.
             *
             * @memberof Klay
             * @method sign
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.sign('0x{address in hex}', '0xdeadbeaf')
             *
             * @param {string} address The address of the imported account to sign the message.
             * @param {string} message Message to sign.
             * @param {string|number} [blockNumber] A block number, or the string `latest` or `earliest`. If omitted, `latest` will be used.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The signature made from an imported account.
             */
            new Method({
                name: 'sign',
                call: 'klay_sign',
                params: 2,
                inputFormatter: [formatters.inputAddressFormatter, formatters.inputSignFormatter],
            }),

            // Block
            /**
             * Returns the number of the most recent block.
             *
             * @memberof Klay
             * @method getBlockNumber
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getBlockNumber()
             *
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The number of the most recent block in hex.
             */
            new Method({
                name: 'getBlockNumber',
                call: 'klay_blockNumber',
                params: 0,
            }),
            /**
             * An object for block from Klaytn.
             *
             * @example
             * {
             *     blockscore: '0x1',
             *     extraData: '0xd883010602846b6c617988676f312e31352e37856c696e757800000000000000f90164f85494571e53df607be97431a5bbefca1dffe5aef56f4d945cb1a7dccbd0dc446e3640898ede8820368554c89499fb17d324fa0e07f23b49d09028ac0919414db694b74ff9dea397fe9e231df545eb53fe2adf776cb2b841dd5a72e9f6af1f59f18efd9d205314bed1077be5083318274e6284adf82806f3339d0f88d8cb97f297b9f6a239149224a4f26e01a5692f2392ffb0ab73b10d9600f8c9b8417a43d087a58a32299f4d5a647371e31ecd1298c1cdb5921b5e575a93cfd7d65f470f2fbd936b1b80206c73daba3fec2038bc25d521bbc21b428d3067598bd95501b8411678bb3221f448d4f9e2dd3e7bda57b0da954eb5f1dff350751b6fd895b4643f3f14b56742fe091db68c162b3e1a9dd17676a9f4a95445e295f00d1d146f49e801b841df4fef80626bc00f2a0048d7718a499defece1ac3e849aefc5c04f2691ec7951377b7022d8d6b20fecce5e03f5ea891597e0d9aadbba0f2f82c5d7230806a62c01',
             *     gasUsed: '0x3ea49',
             *     governanceData: '0x',
             *     hash: '0x188d4531d668ae3da20d70d4cb4c5d96a0cc5190771f0920c56b461c4d356566',
             *     logsBloom: '0x00000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000008000000000000000000000000000000000000000000000000000200008000000000000000000000000000000000000004010000000020000000000000000000800000000000000002000000010000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000002000000000000000000020000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000',
             *     number: '0x3f79aa7',
             *     parentHash: '0x777d344c8c59c4d8d0041bb4c2ee66e95ec110303fb59d3e329f80e7a9c9c617',
             *     receiptsRoot: '0xffbae3190f858531ff785bcbdc70278d91c3d9becdd8b134b0ab7974b9ef3641',
             *     reward: '0xb2bd3178affccd9f9f5189457f1cad7d17a01c9d',
             *     size: '0x507',
             *     stateRoot: '0xa60d0868bd41b63b4fd67e5a8f801c5949e89a8994a13426747890b77d6bc0c4',
             *     timestamp: '0x610b3164',
             *     timestampFoS: '0xc',
             *     totalBlockScore: '0x3f79aa8',
             *     transactions: [
             *         {
             *             blockHash: '0x188d4531d668ae3da20d70d4cb4c5d96a0cc5190771f0920c56b461c4d356566',
             *             blockNumber: '0x3f79aa7',
             *             feePayer: '0xfee998d423d5bd2bf5b5c0f0acb4e3aae2bd2286',
             *             feePayerSignatures: [{
             *                 V: '0x7f5',
             *                 R: '0xf9aff6f39feb7a18d3e1b8ab9f590f0227e465c72cfe05e8d7c9e390cbf1d349',
             *                 S: '0x6e7317d121a3951a8cbca110be8cc86c5314349f8fb1c37f9af4cadf72fe89ec'
             *             }],
             *             from: '0x11eb23f57151a88d4bb53cc9c27355437138c278',
             *             gas: '0x2dc6c0',
             *             gasPrice: '0x5d21dba00',
             *             hash: '0x109d2836d9fde9d8081a27dd6ac545fd7a53530a56bdc40f2a11e5d6dbc2a09f',
             *             input: '0x850ba1b300000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000011eb23f57151a88d4bb53cc9c27355437138c278000000000000000000000000000000000000000000000000000000000000002b352f38366264316536392d346263392d343239622d613632622d3039366134353231613964632e6a736f6e000000000000000000000000000000000000000000',
             *             nonce: '0x0',
             *             senderTxHash: '0xeca2d3650403a1e27af0bbe9878dcbb248d764fc88751f35a6e05636d2ad9e78',
             *             signatures: [  {
             *                 V: '0x7f6',
             *                 R: '0x9ea78985b004afa86acd455c017da374ec1aec885f963ec8134a38f7ede451b0',
             *                 S: '0xfac0e417f7f7b15023e3f5ac95f1fb5b3280746a2eff04394ddedbdd259fc1'
             *             }],
             *             to: '0x78ca9a1105c3392b56625f3fcfd149b29322c56f',
             *             transactionIndex: '0x0',
             *             type: 'TxTypeFeeDelegatedSmartContractExecution',
             *             typeInt: 49,
             *             value: '0x0'
             *         }
             *     ],
             *     transactionsRoot: '0x109d2836d9fde9d8081a27dd6ac545fd7a53530a56bdc40f2a11e5d6dbc2a09f',
             *     voteData: '0x'
             * }
             *
             * @typedef {object} Klay.Block
             * @property {string} blockscore - The difficulty of mining in the blockchain network. The use of `blockScore` differs from the consensus of the network. Always 1 in the BFT consensus engine.
             * @property {string} extraData - The "extra data" field of this block.
             * @property {string} gasUsed - The gas in total that was used by all transactions in this block.
             * @property {string} governanceData - RLP encoded governance configuration
             * @property {string} hash - Hash of the block. `null` when it is a pending block.
             * @property {string} logsBloom - The bloom filter for the logs of the block. `null` when it is a pending block.
             * @property {string} number - The block number. `null` when it is a pending block.
             * @property {string} parentHash - Hash of the parent block.
             * @property {string} receiptsRoot - The root of the receipts trie of the block.
             * @property {string} reward - The address of the beneficiary to whom the block rewards were given
             * @property {string} size - Integer the size of this block in bytes.
             * @property {string} stateRoot - The root of the final state trie of the block.
             * @property {string} timestamp - The unix timestamp for when the block was collated.
             * @property {string} timestampFoS - The fraction of a second of the timestamp for when the block was collated.
             * @property {string} totalBlockScore - Integer of the total blockScore of the chain until this block.
             * @property {Array.<Klay.Transaction>} transactions - Array of transaction objects, or 32-byte transaction hashes depending on the `returnTransactionObjects` parameter.
             * @property {string} transactionsRoot - The root of the transaction trie of the block.
             * @property {string} voteData - RLP encoded governance vote of the proposer.
             * @property {string} [baseFeePerGas] - Base fee per gas.
             */
            /**
             * Returns information about a block.
             * If parameter is hex string, this will use {@link Klay#getBlockByHash|caver.rpc.klay.getBlockByHash}, if paramter is number type, this will use {@link Klay#getBlockByNumber|caver.rpc.klay.getBlockByNumber}.
             *
             * @memberof Klay
             * @method getBlock
             * @instance
             *
             * @example
             * // Use `caver.rpc.klay.getBlockByNumber`
             * const result = await caver.rpc.klay.getBlock(0)
             * // Use `caver.rpc.klay.getBlockByHash`
             * const result = await caver.rpc.klay.getBlock('0x58482921af951cf42a069436ac9338de50fd963bdbea40e396f416f9ac96a08b')
             *
             * @param {string|number} blockHashOrNumber The block hash or block number.
             * @param {boolean} [returnTransactionObjects] (default `false`) If `true`, the returned block will contain all transactions as objects, and if `false`, it will only contain the transaction hashes.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.Block>} An object includes block.
             */
            new Method({
                name: 'getBlock',
                call: 'klay_getBlockByNumber',
                hexCall: 'klay_getBlockByHash',
                params: 2,
                inputFormatter: [formatters.inputBlockNumberFormatter, formatters.toBoolean],
            }),
            /**
             * Returns information about a block by block number.
             *
             * @memberof Klay
             * @method getBlockByNumber
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getBlockByNumber(0)
             *
             * @param {number} blockNumber The block number.
             * @param {boolean} [returnTransactionObjects] (default `false`) If `true`, the returned block will contain all transactions as objects, and if `false`, it will only contain the transaction hashes.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.Block>} An object includes block.
             */
            new Method({
                name: 'getBlockByNumber',
                call: 'klay_getBlockByNumber',
                params: 2,
                inputFormatter: [formatters.inputBlockNumberFormatter, formatters.toBoolean],
            }),
            /**
             * Returns information about a block by block hash.
             *
             * @memberof Klay
             * @method getBlockByHash
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getBlockByHash('0x58482921af951cf42a069436ac9338de50fd963bdbea40e396f416f9ac96a08b')
             *
             * @param {string} blockHash The block hash.
             * @param {boolean} [returnTransactionObjects] (default `false`) If `true`, the returned block will contain all transactions as objects, and if `false`, it will only contain the transaction hashes.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.Block>} An object includes block.
             */
            new Method({
                name: 'getBlockByHash',
                call: 'klay_getBlockByHash',
                params: 2,
                inputFormatter: [formatters.inputBlockNumberFormatter, formatters.toBoolean],
            }),
            /**
             * An object for block header from Klaytn.
             *
             * @example
             *
             * @typedef {object} Klay.Header
             * @property {string} parentHash - Hash of the parent block.
             * @property {string} reward - The address of the beneficiary to whom the block rewards were given.
             * @property {string} stateRoot - The root of the final state trie of the block.
             * @property {string} transactionsRoot - The root of the transaction trie of the block.
             * @property {string} receiptsRoot - The root of the receipts trie of the block.
             * @property {string} logsBloom - The bloom filter for the logs of the block. `null` when it is pending block.
             * @property {string} blockScore - Former difficulty. Always 1 in the BFT consensus engine.
             * @property {string} number - The block number. `null` when it is pending block.
             * @property {string} gasUsed - The total used gas by all transactions in this block.
             * @property {string} timestamp - The Unix timestamp for when the block was collated.
             * @property {string} timestampFoS - The fraction of a second of the timestamp for when the block was collated.
             * @property {string} extraData - The "extra data" field of this block.
             * @property {string} governanceData - RLP encoded governance configuration.
             * @property {string} hash - Hash of the current block.
             * @property {string} [baseFeePerGas] - Base fee per gas.
             * @property {string} [voteData] - RLP encoded governance vote of the proposer.
             */
            /**
             * Returns a block header.
             * If parameter is hex string, this will use {@link Klay#getHeaderByHash|caver.rpc.klay.getHeaderByHash}, if paramter is number type, this will use {@link Klay#getHeaderByNumber|caver.rpc.klay.getHeaderByNumber}.
             *
             * @memberof Klay
             * @method getHeader
             * @instance
             *
             * @example
             * // Use `caver.rpc.klay.getHeaderByNumber`
             * const result = await caver.rpc.klay.getHeader(0)
             * // Use `caver.rpc.klay.getHeaderByHash`
             * const result = await caver.rpc.klay.getHeader('0x58482921af951cf42a069436ac9338de50fd963bdbea40e396f416f9ac96a08b')
             *
             * @param {string|number|BN|BigNumber} blockHashOrNumber The block hash or block number to query block header.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.Header>} An object includes block header.
             */
            new Method({
                name: 'getHeader',
                call: 'klay_getHeaderByNumber',
                hexCall: 'klay_getHeaderByHash',
                params: 1,
                inputFormatter: [formatters.inputBlockNumberFormatter],
            }),
            /**
             * Returns a block header by block number.
             *
             * @memberof Klay
             * @method getHeaderByNumber
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getHeaderByNumber(0)
             * const result = await caver.rpc.klay.getHeaderByNumber('latest')
             *
             * @param {string|number|BN|BigNumber} blockNumberOrTag The block number or block tag string to query block header.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.Header>} An object includes block header.
             */
            new Method({
                name: 'getHeaderByNumber',
                call: 'klay_getHeaderByNumber',
                params: 1,
                inputFormatter: [formatters.inputBlockNumberFormatter],
            }),
            /**
             * Returns a block header by block hash.
             *
             * @memberof Klay
             * @method getHeaderByHash
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getHeaderByHash('0x58482921af951cf42a069436ac9338de50fd963bdbea40e396f416f9ac96a08b')
             *
             * @param {string} blockHash The block hash to query block header.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.Header>} An object includes block header.
             */
            new Method({
                name: 'getHeaderByHash',
                call: 'klay_getHeaderByHash',
                params: 1,
                inputFormatter: [formatters.inputBlockNumberFormatter],
            }),
            /**
             * An object for transaction receipt from Klaytn.
             *
             * @example
             * {
             *     blockHash: '0x188d4531d668ae3da20d70d4cb4c5d96a0cc5190771f0920c56b461c4d356566',
             *     blockNumber: '0x3f79aa7',
             *     contractAddress: null,
             *     feePayer: '0xfee998d423d5bd2bf5b5c0f0acb4e3aae2bd2286',
             *     feePayerSignatures: [{
             *         V: '0x7f5',
             *         R: '0xf9aff6f39feb7a18d3e1b8ab9f590f0227e465c72cfe05e8d7c9e390cbf1d349',
             *         S: '0x6e7317d121a3951a8cbca110be8cc86c5314349f8fb1c37f9af4cadf72fe89ec'
             *     }],
             *     from: '0x11eb23f57151a88d4bb53cc9c27355437138c278',
             *     gas: '0x2dc6c0',
             *     gasPrice: '0x5d21dba00',
             *     gasUsed: '0x3ea49',
             *     hash: '0x109d2836d9fde9d8081a27dd6ac545fd7a53530a56bdc40f2a11e5d6dbc2a09f',
             *     input: '0x850ba1b300000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000011eb23f57151a88d4bb53cc9c27355437138c278000000000000000000000000000000000000000000000000000000000000002b352f38366264316536392d346263392d343239622d613632622d3039366134353231613964632e6a736f6e000000000000000000000000000000000000000000',
             *     logs: [{
             *         address: '0x78ca9a1105c3392b56625f3fcfd149b29322c56f',
             *         topics: [
             *             '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
             *             '0x0000000000000000000000000000000000000000000000000000000000000000',
             *             '0x00000000000000000000000011eb23f57151a88d4bb53cc9c27355437138c278',
             *             '0x0000000000000000000000000000000000000000000000000000000000000872'
             *         ],
             *         data: '0x',
             *         blockNumber: '0x3f79aa7',
             *         transactionHash: '0x109d2836d9fde9d8081a27dd6ac545fd7a53530a56bdc40f2a11e5d6dbc2a09f',
             *         transactionIndex: '0x0',
             *         blockHash: '0x188d4531d668ae3da20d70d4cb4c5d96a0cc5190771f0920c56b461c4d356566',
             *         logIndex: '0x0',
             *         removed: false
             *     }],
             *     logsBloom: '0x00000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000008000000000000000000000000000000000000000000000000000200008000000000000000000000000000000000000004010000000020000000000000000000800000000000000002000000010000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000002000000000000000000020000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000',
             *     nonce: '0x0',
             *     senderTxHash: '0xeca2d3650403a1e27af0bbe9878dcbb248d764fc88751f35a6e05636d2ad9e78',
             *     signatures: [{
             *         V: '0x7f6',
             *         R: '0x9ea78985b004afa86acd455c017da374ec1aec885f963ec8134a38f7ede451b0',
             *         S: '0xfac0e417f7f7b15023e3f5ac95f1fb5b3280746a2eff04394ddedbdd259fc1'
             *     }],
             *     to: '0x78ca9a1105c3392b56625f3fcfd149b29322c56f',
             *     transactionIndex: '0x0',
             *     type: 'TxTypeFeeDelegatedSmartContractExecution',
             *     typeInt: 49,
             *     value: '0x0'
             * }
             *
             * @typedef {Klay.Transaction} Klay.TransactionReceipt
             * @property {string} contractAddress - The contract address created, if the transaction was a contract creation, otherwise `null`.
             * @property {string} gasUsed - The amount of gas used by this specific transaction alone.
             * @property {Array.<Klay.Log>} logs - Array of log objects, which this transaction generated.
             * @property {string} logsBloom - Bloom filter for light clients to quickly retrieve related logs.
             * @property {string} status - `0x1` if the transaction was successful, `0x0` if the Klaytn Virtual Machine reverted the transaction.
             * @property {string} transactionHash - Hash of the transaction.
             */
            /**
             * An object for transaction receipt from Klaytn.
             *
             * @example
             * {
             *     address: '0x78ca9a1105c3392b56625f3fcfd149b29322c56f',
             *     topics: [
             *         '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
             *         '0x0000000000000000000000000000000000000000000000000000000000000000',
             *         '0x00000000000000000000000011eb23f57151a88d4bb53cc9c27355437138c278',
             *         '0x0000000000000000000000000000000000000000000000000000000000000872'
             *     ],
             *     data: '0x',
             *     blockNumber: '0x3f79aa7',
             *     transactionHash: '0x109d2836d9fde9d8081a27dd6ac545fd7a53530a56bdc40f2a11e5d6dbc2a09f',
             *     transactionIndex: '0x0',
             *     blockHash: '0x188d4531d668ae3da20d70d4cb4c5d96a0cc5190771f0920c56b461c4d356566',
             *     logIndex: '0x0',
             *     removed: false
             * }
             *
             * @typedef {object} Klay.Log
             * @property {string} logIndex - The log index position in the block.
             * @property {string} transactionIndex - The index position of transactions where this log was created from.
             * @property {string} transactionHash - Hash of the transactions this log was created from. null when pending.
             * @property {string} blockHash - Hash of the block where this log was in. `null` when pending.
             * @property {string} blockNumber - The block number where this log was in. `null` when pending.
             * @property {string} address - Address from which this log originated.
             * @property {string} data - Contains the non-indexed arguments of the log.
             * @property {Array.<string>} topics - Array of 0 to 4 32-byte DATA of indexed log arguments. (In Solidity: The first topic is the hash of the signature of the event (e.g., `Deposit(address,bytes32,uint256)`), except you declared the event with the `anonymous` specifier.).
             */
            /**
             * Returns receipts included in a block identified by block hash.
             *
             * @memberof Klay
             * @method getBlockReceipts
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getBlockReceipts('0x58482921af951cf42a069436ac9338de50fd963bdbea40e396f416f9ac96a08b')
             *
             * @param {string} blockHash The block hash.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Array.<Klay.TransactionReceipt>>} The transaction receipts included in a block. If the target block contains no transaction, an empty array `[]` is returned. For detailed description of transaction receipt, please refer to {@link Klay#getTransactionReceipt|caver.rpc.klay.getTransactionReceipt}.
             */
            new Method({
                name: 'getBlockReceipts',
                call: 'klay_getBlockReceipts',
                params: 1,
            }),
            /**
             * Returns the number of transactions in a block.
             * If parameter is hex string, this will use {@link Klay#getBlockTransactionCountByHash|caver.rpc.klay.getBlockTransactionCountByHash}, if paramter is number type, this will use {@link Klay#klay_getBlockTransactionCountByNumber|caver.rpc.klay.klay_getBlockTransactionCountByNumber}.
             *
             * @memberof Klay
             * @method getBlockTransactionCount
             * @instance
             *
             * @example
             * // Use `caver.rpc.klay.getBlockTransactionCountByNumber`
             * const result = await caver.rpc.klay.getBlockTransactionCount(21249)
             * // Use `caver.rpc.klay.getBlockTransactionCountByHash`
             * const result = await caver.rpc.klay.getBlockTransactionCount('0x4584bea6b8b2abe7f024d1e63dd0571cfd28cd5157b4f6cb2ac4160a7b0057e0')
             *
             * @param {string|number} blockHashOrNumber The block hash, block number or the block tag string (`genesis` or `latest`).
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The number of transactions in the given block in hex.
             */
            new Method({
                name: 'getBlockTransactionCount',
                call: 'klay_getBlockTransactionCountByNumber',
                hexCall: 'klay_getBlockTransactionCountByHash',
                params: 1,
                inputFormatter: [formatters.inputBlockNumberFormatter],
            }),
            /**
             * Returns the number of transactions in a block matching the given block number.
             *
             * @memberof Klay
             * @method getBlockTransactionCountByNumber
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getBlockTransactionCountByNumber(21249)
             *
             * @param {string|number} blockNumber The block number or the block tag string (`genesis` or `latest`).
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The number of transactions in the given block in hex.
             */
            new Method({
                name: 'getBlockTransactionCountByNumber',
                call: 'klay_getBlockTransactionCountByNumber',
                params: 1,
                inputFormatter: [formatters.inputBlockNumberFormatter],
            }),
            /**
             * Returns the number of transactions in a block matching the given block hash.
             *
             * @memberof Klay
             * @method getBlockTransactionCountByHash
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getBlockTransactionCountByHash('0x4584bea6b8b2abe7f024d1e63dd0571cfd28cd5157b4f6cb2ac4160a7b0057e0')
             *
             * @param {string} blockHash The block hash.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The number of transactions in the given block in hex.
             */
            new Method({
                name: 'getBlockTransactionCountByHash',
                call: 'klay_getBlockTransactionCountByHash',
                params: 1,
                inputFormatter: [formatters.inputBlockNumberFormatter],
            }),
            /**
             * An object for block from Klaytn with consensus information.
             *
             * @example
             * {
             *     blockscore: '0x1',
             *     committee: [
             *     '0x571e53df607be97431a5bbefca1dffe5aef56f4d',
             *     '0x5cb1a7dccbd0dc446e3640898ede8820368554c8',
             *     '0x99fb17d324fa0e07f23b49d09028ac0919414db6',
             *     '0xb74ff9dea397fe9e231df545eb53fe2adf776cb2'
             *     ],
             *     extraData: '0xd883010602846b6c617988676f312e31352e37856c696e757800000000000000f90164f85494571e53df607be97431a5bbefca1dffe5aef56f4d945cb1a7dccbd0dc446e3640898ede8820368554c89499fb17d324fa0e07f23b49d09028ac0919414db694b74ff9dea397fe9e231df545eb53fe2adf776cb2b841dd5a72e9f6af1f59f18efd9d205314bed1077be5083318274e6284adf82806f3339d0f88d8cb97f297b9f6a239149224a4f26e01a5692f2392ffb0ab73b10d9600f8c9b8417a43d087a58a32299f4d5a647371e31ecd1298c1cdb5921b5e575a93cfd7d65f470f2fbd936b1b80206c73daba3fec2038bc25d521bbc21b428d3067598bd95501b8411678bb3221f448d4f9e2dd3e7bda57b0da954eb5f1dff350751b6fd895b4643f3f14b56742fe091db68c162b3e1a9dd17676a9f4a95445e295f00d1d146f49e801b841df4fef80626bc00f2a0048d7718a499defece1ac3e849aefc5c04f2691ec7951377b7022d8d6b20fecce5e03f5ea891597e0d9aadbba0f2f82c5d7230806a62c01',
             *     gasUsed: '0x3ea49',
             *     governanceData: '0x',
             *     hash: '0x188d4531d668ae3da20d70d4cb4c5d96a0cc5190771f0920c56b461c4d356566',
             *     logsBloom: '0x00000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000008000000000000000000000000000000000000000000000000000200008000000000000000000000000000000000000004010000000020000000000000000000800000000000000002000000010000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000002000000000000000000020000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000',
             *     number: '0x3f79aa7',
             *     originProposer: '0x99fb17d324fa0e07f23b49d09028ac0919414db6',
             *     parentHash: '0x777d344c8c59c4d8d0041bb4c2ee66e95ec110303fb59d3e329f80e7a9c9c617',
             *     proposer: '0x99fb17d324fa0e07f23b49d09028ac0919414db6',
             *     receiptsRoot: '0xffbae3190f858531ff785bcbdc70278d91c3d9becdd8b134b0ab7974b9ef3641',
             *     reward: '0xb2bd3178affccd9f9f5189457f1cad7d17a01c9d',
             *     round: 0,
             *     size: '0x507',
             *     stateRoot: '0xa60d0868bd41b63b4fd67e5a8f801c5949e89a8994a13426747890b77d6bc0c4',
             *     timestamp: '0x610b3164',
             *     timestampFoS: '0xc',
             *     totalBlockScore: '0x3f79aa8',
             *     transactions: [
             *        {
             *             blockHash: '0x188d4531d668ae3da20d70d4cb4c5d96a0cc5190771f0920c56b461c4d356566',
             *             blockNumber: '0x3f79aa7',
             *             contractAddress: null,
             *             feePayer: '0xfee998d423d5bd2bf5b5c0f0acb4e3aae2bd2286',
             *             feePayerSignatures: [{
             *                 V: '0x7f5',
             *                 R: '0xf9aff6f39feb7a18d3e1b8ab9f590f0227e465c72cfe05e8d7c9e390cbf1d349',
             *                 S: '0x6e7317d121a3951a8cbca110be8cc86c5314349f8fb1c37f9af4cadf72fe89ec'
             *             }],
             *             from: '0x11eb23f57151a88d4bb53cc9c27355437138c278',
             *             gas: '0x2dc6c0',
             *             gasPrice: '0x5d21dba00',
             *             gasUsed: '0x3ea49',
             *             input: '0x850ba1b300000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000011eb23f57151a88d4bb53cc9c27355437138c278000000000000000000000000000000000000000000000000000000000000002b352f38366264316536392d346263392d343239622d613632622d3039366134353231613964632e6a736f6e000000000000000000000000000000000000000000',
             *             logs: [{
             *                 address: '0x78ca9a1105c3392b56625f3fcfd149b29322c56f',
             *                 topics: [
             *                     '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
             *                     '0x0000000000000000000000000000000000000000000000000000000000000000',
             *                     '0x00000000000000000000000011eb23f57151a88d4bb53cc9c27355437138c278',
             *                     '0x0000000000000000000000000000000000000000000000000000000000000872'
             *                 ],
             *                 data: '0x',
             *                 blockNumber: '0x3f79aa7',
             *                 transactionHash: '0x109d2836d9fde9d8081a27dd6ac545fd7a53530a56bdc40f2a11e5d6dbc2a09f',
             *                 transactionIndex: '0x0',
             *                 blockHash: '0x188d4531d668ae3da20d70d4cb4c5d96a0cc5190771f0920c56b461c4d356566',
             *                 logIndex: '0x0',
             *                     removed: false
             *             }],
             *             logsBloom: '0x00000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000008000000000000000000000000000000000000000000000000000200008000000000000000000000000000000000000004010000000020000000000000000000800000000000000002000000010000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000002000000000000000000020000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000',
             *             nonce: '0x0',
             *             senderTxHash: '0xeca2d3650403a1e27af0bbe9878dcbb248d764fc88751f35a6e05636d2ad9e78',
             *             signatures: [{
             *                     V: '0x7f6',
             *                     R: '0x9ea78985b004afa86acd455c017da374ec1aec885f963ec8134a38f7ede451b0',
             *                     S: '0xfac0e417f7f7b15023e3f5ac95f1fb5b3280746a2eff04394ddedbdd259fc1'
             *             }],
             *             status: '0x1',
             *             to: '0x78ca9a1105c3392b56625f3fcfd149b29322c56f',
             *             transactionHash: '0x109d2836d9fde9d8081a27dd6ac545fd7a53530a56bdc40f2a11e5d6dbc2a09f',
             *             transactionIndex: '0x0',
             *             type: 'TxTypeFeeDelegatedSmartContractExecution',
             *             typeInt: 49,
             *             value: '0x0'
             *         }
             *     ],
             *     transactionsRoot: '0x109d2836d9fde9d8081a27dd6ac545fd7a53530a56bdc40f2a11e5d6dbc2a09f',
             *     voteData: '0x'
             * }
             *
             * @typedef {object} Klay.BlockWithConsensusInfo
             * @property {string} blockscore - The difficulty of mining in the blockchain network. The use of `blockScore` differs from the consensus of the network. Always 1 in the BFT consensus engine.
             * @property {Array.<string>} committee - Array of addresses of committee members of this block. The committee is a subset of validators who participated in the consensus protocol for this block.
             * @property {string} extraData - The "extra data" field of this block.
             * @property {string} gasUsed - The gas in total that was used by all transactions in this block.
             * @property {string} governanceData - RLP encoded governance configuration
             * @property {string} hash - Hash of the block. `null` when it is a pending block.
             * @property {string} logsBloom - The bloom filter for the logs of the block. `null` when it is a pending block.
             * @property {string} number - The block number. `null` when it is a pending block.
             * @property {string} originProposer - The proposal of 0 round at the same block number.
             * @property {string} parentHash - Hash of the parent block.
             * @property {string} proposer - The address of the block proposer.
             * @property {string} receiptsRoot - The root of the receipts trie of the block.
             * @property {string} reward - The address of the beneficiary to whom the block rewards were given.
             * @property {number} round - The round number.
             * @property {string} size - Integer the size of this block in bytes.
             * @property {string} stateRoot - The root of the final state trie of the block.
             * @property {string} timestamp - The unix timestamp for when the block was collated.
             * @property {string} timestampFoS - The fraction of a second of the timestamp for when the block was collated.
             * @property {string} totalBlockScore - Integer of the total blockScore of the chain until this block.
             * @property {Array.<Klay.TransactionReceipt>} transactions - Array of transaction receipt objects.
             * @property {string} transactionsRoot - The root of the transaction trie of the block.
             * @property {string} voteData - RLP encoded governance vote of the proposer.
             * @property {string} [baseFeePerGas] - Base fee per gas.
             */
            /**
             * Returns a block with consensus information matched by the given hash.
             * If parameter is hex string, this will use {@link Klay#getBlockWithConsensusInfoByHash|caver.rpc.klay.getBlockWithConsensusInfoByHash}, if paramter is number type, this will use {@link Klay#klay_getBlockWithConsensusInfoByNumber|caver.rpc.klay.klay_getBlockWithConsensusInfoByNumber}.
             *
             * @memberof Klay
             * @method getBlockWithConsensusInfo
             * @instance
             *
             * @example
             * // Use `caver.rpc.klay.getBlockWithConsensusInfoByNumber`
             * const result = await caver.rpc.klay.getBlockWithConsensusInfo(21249)
             * // Use `caver.rpc.klay.getBlockWithConsensusInfoByHash`
             * const result = await caver.rpc.klay.getBlockWithConsensusInfo('0x4584bea6b8b2abe7f024d1e63dd0571cfd28cd5157b4f6cb2ac4160a7b0057e0')
             *
             * @param {string|number} blockHashOrNumber The block hash, block number or the block tag string (`genesis` or `latest`).
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.BlockWithConsensusInfo>} An object includes block with consensus information.
             */
            new Method({
                name: 'getBlockWithConsensusInfo',
                call: 'klay_getBlockWithConsensusInfoByNumber',
                hexCall: 'klay_getBlockWithConsensusInfoByHash',
                params: 1,
                inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
            }),
            /**
             * Returns a block with consensus information matched by the given block number.
             *
             * @memberof Klay
             * @method getBlockWithConsensusInfoByNumber
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getBlockWithConsensusInfoByNumber(21249)
             *
             * @param {string|number} blockNumber The block number or the block tag string (`genesis` or `latest`).
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.BlockWithConsensusInfo>} An object includes block with consensus information.
             */
            new Method({
                name: 'getBlockWithConsensusInfoByNumber',
                call: 'klay_getBlockWithConsensusInfoByNumber',
                params: 1,
                inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
            }),
            /**
             * Returns a block with consensus information matched by the given hash.
             *
             * @memberof Klay
             * @method getBlockWithConsensusInfoByHash
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getBlockWithConsensusInfoByHash('0x4584bea6b8b2abe7f024d1e63dd0571cfd28cd5157b4f6cb2ac4160a7b0057e0')
             *
             * @param {string} blockHash The block hash.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.BlockWithConsensusInfo>} An object includes block with consensus information.
             */
            new Method({
                name: 'getBlockWithConsensusInfoByHash',
                call: 'klay_getBlockWithConsensusInfoByHash',
                params: 1,
                inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
            }),
            /**
             * Returns a list of all validators in the committee at the specified block.
             *
             * @memberof Klay
             * @method getCommittee
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getCommittee()
             *
             * @param {string|number} [blockNumber] A block number, or the string `latest` or `earliest`. If omitted, `latest` will be used.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Array.<string>>} Addresses of all validators in the committee at the given block.
             */
            new Method({
                name: 'getCommittee',
                call: 'klay_getCommittee',
                params: 1,
                inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
            }),
            /**
             * Returns the size of the committee at the specified block.
             *
             * @memberof Klay
             * @method getCommitteeSize
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getCommitteeSize()
             *
             * @param {string|number} [blockNumber] A block number, or the string `latest` or `earliest`. If omitted, `latest` will be used.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<number>} The size of the committee at the given block.
             */
            new Method({
                name: 'getCommitteeSize',
                call: 'klay_getCommitteeSize',
                params: 1,
                inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
            }),
            /**
             * Returns a list of all validators of the council at the specified block.
             *
             * @memberof Klay
             * @method getCouncil
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getCouncil()
             *
             * @param {string|number} [blockNumber] A block number, or the string `latest` or `earliest`. If omitted, `latest` will be used.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Array.<string>>} An array of validator addresses of the council at the given block, or null when no council was found.
             */
            new Method({
                name: 'getCouncil',
                call: 'klay_getCouncil',
                params: 1,
                inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
            }),
            /**
             * Returns the size of the council at the specified block.
             *
             * @memberof Klay
             * @method getCouncilSize
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getCouncilSize()
             *
             * @param {string|number} [blockNumber] A block number, or the string `latest` or `earliest`. If omitted, `latest` will be used.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<number>} The size of the council at the given block.
             */
            new Method({
                name: 'getCouncilSize',
                call: 'klay_getCouncilSize',
                params: 1,
                inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
            }),
            /**
             * Returns the value from a storage position at a given address.
             *
             * @memberof Klay
             * @method getStorageAt
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getStorageAt('0x407d73d8a49eeb85d32cf465507dd71d507100c1')
             *
             * @param {string} address The address to get the storage from.
             * @param {number} position The index position of the storage. For more information on calculating the position, refer to {@link https://docs.klaytn.com/dapp/json-rpc/api-references/klay/block#klay_getstorageat|klay_getStorageAt}.
             * @param {string|number} [blockNumber] A block number, or the string `latest` or `earliest`. If omitted, `latest` will be used.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The value at this storage position.
             */
            new Method({
                name: 'getStorageAt',
                call: 'klay_getStorageAt',
                params: 3,
                inputFormatter: [formatters.inputAddressFormatter, utils.numberToHex, formatters.inputDefaultBlockNumberFormatter],
            }),
            /**
             * Returns `true` if client is actively mining new blocks.
             *
             * Currently, every node is on mining mode by default to resend transactions.
             * Please note that actual "mining" process is only done by Consensus Nodes (CNs).
             *
             * @memberof Klay
             * @method isMining
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.isMining()
             *
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<boolean>} `true` if the client is mining, otherwise `false`.
             */
            new Method({
                name: 'isMining',
                call: 'klay_mining',
                params: 0,
            }),
            /**
             * An object for block from Klaytn with consensus information.
             *
             * @example
             * {
             *     startingBlock: 100,
             *     currentBlock: 312,
             *     highestBlock: 512,
             *     knownStates: 234566,
             *     pulledStates: 123455
             * }
             *
             * @typedef {Klay.Block} Klay.SyncObject
             * @property {string} startingBlock - The block number in hex where the sync started.
             * @property {string} currentBlock - The block number in hex where the node currently synced to.
             * @property {string} highestBlock - The estimated block number in hex to sync to.
             * @property {string} knownStates - The estimated states in hex to download.
             * @property {string} pulledStates - The already downloaded states in hex.
             */
            /**
             * Returns an object with data about the sync status or false.
             *
             * @memberof Klay
             * @method isSyncing
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.isSyncing()
             *
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.SyncObject|boolean>} `false` if the Klaytn Node is not syncing. Otherwise, a sync object is returned.
             */
            new Method({
                name: 'isSyncing',
                call: 'klay_syncing',
                params: 0,
            }),

            // Transaction
            /**
             * An object for block from Klaytn with consensus information.
             *
             * @example
             * {
             *     to: '0x5481a10a47C74f800BDF4955BD77550881bde91C', // contract address
             *     input: '0x70a08231000000000000000000000000ddc2002b729676dfd906484d35bb02a8634d7040'
             * }
             *
             * @typedef {Klay.Block} Klay.CallObject
             * @property {string} [to] - The address the transaction is directed to. This can be omitted when testing the deployment of a new contract.
             * @property {string} [input] - The hash of the method signature and encoded parameters. You can use {@link ABI#encodeFunctionCall|caver.abi.encodeFunctionCall}.
             * @property {string} [from] - The address the transaction is sent from.
             * @property {string} [gas] - The gas provided for the transaction execution. `klay_call`(which is called via `caver.rpc.klay.call`) consumes zero gas, but this parameter may be needed by some executions.
             * @property {string} [gasPrice] - The gasPrice used for each paid gas.
             * @property {string} [value] - The value sent with this transaction in `peb`.
             */
            /**
             * Executes a new message call immediately without sending a transaction on the blockchain.
             * It returns data or an error object of JSON RPC if an error occurs.
             *
             * @memberof Klay
             * @method call
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.call({
             *     to: '0x5481a10a47C74f800BDF4955BD77550881bde91C', // contract address
             *     input: '0x70a08231000000000000000000000000ddc2002b729676dfd906484d35bb02a8634d7040'
             * })
             *
             * @param {Klay.CallObject} callObject A transaction call object.
             * @param {string|number} [blockNumber] A block number, or the string `latest` or `earliest`. If omitted, `latest` will be used.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The returned data of the call. e.g., the return value of a smart contract function.
             */
            new Method({
                name: 'call',
                call: 'klay_call',
                params: 2,
                inputFormatter: [formatters.inputCallFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),
            /**
             * Generates and returns an estimate of how much `gas` is necessary to allow a transaction to complete.
             * The transaction from this method will not be added to the blockchain.
             *
             * @memberof Klay
             * @method estimateGas
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.estimateGas({
             *     to: '0x5481a10a47C74f800BDF4955BD77550881bde91C', // contract address
             *     input: '0x70a08231000000000000000000000000ddc2002b729676dfd906484d35bb02a8634d7040'
             * })
             *
             * @param {Klay.CallObject} callObject A transaction call object.
             * @param {string|number} [blockNumber] A block number, or the string `latest` or `earliest`. If omitted, `latest` will be used.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The amount of gas used.
             */
            new Method({
                name: 'estimateGas',
                call: 'klay_estimateGas',
                params: 1,
                inputFormatter: [formatters.inputCallFormatter],
            }),
            /**
             * Generates and returns an estimate of how much `computation cost` will be spent to execute the transaction.
             * Klaytn limits the computation cost of a transaction to `100000000` currently not to take too much time by a single transaction.
             * The transaction will not be added to the blockchain like {@link Klay#estimateGas|caver.rpc.klay.estimateGas}.
             *
             * @memberof Klay
             * @method estimateComputationCost
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.estimateComputationCost({
             *     to: '0x5481a10a47C74f800BDF4955BD77550881bde91C', // contract address
             *     input: '0x70a08231000000000000000000000000ddc2002b729676dfd906484d35bb02a8634d7040'
             * })
             *
             * @param {Klay.CallObject} callObject A transaction call object.
             * @param {string|number} [blockNumber] A block number, or the string `latest` or `earliest`. If omitted, `latest` will be used.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The amount of computation cost used.
             */
            new Method({
                name: 'estimateComputationCost',
                call: 'klay_estimateComputationCost',
                params: 2,
                inputFormatter: [formatters.inputCallFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),
            /**
             * Returns information about a transaction by `block` and `transaction index` position.
             * If parameter is hex string, this will use {@link Klay#getTransactionByBlockHashAndIndex|caver.rpc.klay.getTransactionByBlockHashAndIndex}, if paramter is number type, this will use {@link Klay#getTransactionByBlockNumberAndIndex|caver.rpc.klay.getTransactionByBlockNumberAndIndex}.
             *
             * @memberof Klay
             * @method getTransactionFromBlock
             * @instance
             *
             * @example
             * // Use `caver.rpc.klay.getTransactionByBlockNumberAndIndex`
             * const result = await caver.rpc.klay.getTransactionFromBlock(183, 0)
             * // Use `caver.rpc.klay.getTransactionByBlockHashAndIndex`
             * const result = await caver.rpc.klay.getTransactionFromBlock('0xc9f643c0ebe84932c10695cbc9eb75228af09516931b58952de3e12c21a50576', 0)
             *
             * @param {string|number} blockHashOrNumber The block hash or block number.
             * @param {number} index A transaction index position inside the block.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.Transaction>} A transaction object.
             */
            new Method({
                name: 'getTransactionFromBlock',
                call: 'klay_getTransactionByBlockNumberAndIndex',
                hexCall: 'klay_getTransactionByBlockHashAndIndex',
                params: 2,
                inputFormatter: [formatters.inputBlockNumberFormatter, utils.numberToHex],
            }),
            /**
             * Returns information about a transaction by `block number` and `transaction index` position.
             *
             * @memberof Klay
             * @method getTransactionByBlockNumberAndIndex
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getTransactionByBlockNumberAndIndex(183, 0)
             *
             * @param {string|number} blockNumber The block number or the block tag string (`genesis` or `latest`).
             * @param {number} index A transaction index position inside the block.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.Transaction>} A transaction object.
             */
            new Method({
                name: 'getTransactionByBlockNumberAndIndex',
                call: 'klay_getTransactionByBlockNumberAndIndex',
                params: 2,
                inputFormatter: [formatters.inputBlockNumberFormatter, utils.numberToHex],
            }),
            /**
             * Returns information about a transaction by `block hash` and `transaction index` position.
             *
             * @memberof Klay
             * @method getTransactionByBlockHashAndIndex
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getTransactionByBlockHashAndIndex('0xc9f643c0ebe84932c10695cbc9eb75228af09516931b58952de3e12c21a50576', 0)
             *
             * @param {string} blockHash The block hash.
             * @param {number} index A transaction index position inside the block.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.Transaction>} A transaction object.
             */
            new Method({
                name: 'getTransactionByBlockHashAndIndex',
                call: 'klay_getTransactionByBlockHashAndIndex',
                params: 2,
                inputFormatter: [formatters.inputBlockNumberFormatter, utils.numberToHex],
            }),
            /**
             * Returns the information about a transaction requested by transaction hash.
             * This will be same with {@link Klay#getTransactionByHash|caver.rpc.klay.getTransactionByHash}
             *
             * @memberof Klay
             * @method getTransaction
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getTransaction('0x991d2e63b91104264d2886fb2ae2ccdf90551377af4e334b313abe123a5406aa')
             *
             * @param {string} transactionHash A transaction hash.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.Transaction>} A transaction object.
             */
            new Method({
                name: 'getTransaction',
                call: 'klay_getTransactionByHash',
                params: 1,
            }),
            /**
             * Returns the information about a transaction requested by transaction hash.
             *
             * @memberof Klay
             * @method getTransactionByHash
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getTransactionByHash('0x991d2e63b91104264d2886fb2ae2ccdf90551377af4e334b313abe123a5406aa')
             *
             * @param {string} transactionHash A transaction hash.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.Transaction>} A transaction object.
             */
            new Method({
                name: 'getTransactionByHash',
                call: 'klay_getTransactionByHash',
                params: 1,
            }),
            /**
             * Returns the information about a transaction requested by the sender transaction hash.
             * Please note that this API returns the correct result only if the indexing feature is enabled in the node by `--sendertxhashindexing`.
             * Use {@link Klay#isSenderTxHashIndexingEnabled|caver.rpc.klay.isSenderTxHashIndexingEnabled} to check if the indexing feature is enabled or not.
             *
             * @memberof Klay
             * @method getTransactionBySenderTxHash
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getTransactionBySenderTxHash('0x991d2e63b91104264d2886fb2ae2ccdf90551377af4e334b313abe123a5406aa')
             *
             * @param {string} senderTxHash A sedner transaction hash. See {@link https://docs.klaytn.com/klaytn/design/transactions#sendertxhash|SenderTxHash} for more detail.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.Transaction>} A transaction object.
             */
            new Method({
                name: 'getTransactionBySenderTxHash',
                call: 'klay_getTransactionBySenderTxHash',
                params: 1,
            }),
            /**
             * Returns the receipt of a transaction by transaction hash.
             * Receipt is not available for `pending` transactions whose transactions have not yet been processed.
             *
             * @memberof Klay
             * @method getTransactionReceipt
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getTransactionReceipt('0xdb63fb385e51fbfd84a98873c994aef622c5f1c72c5760a9ff95c55bbfd99898')
             *
             * @param {string} transactionHash A transaction hash.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.TransactionReceipt>} A transaction receipt object, or null when no receipt was found.
             */
            new Method({
                name: 'getTransactionReceipt',
                call: 'klay_getTransactionReceipt',
                params: 1,
            }),
            /**
             * Returns the receipt of a transaction by sender transaction hash.
             *
             * Please note that this API returns the correct result only if the indexing feature is enabled in the node by `--sendertxhashindexing`.
             * Use {@link Klay#isSenderTxHashIndexingEnabled|caver.rpc.klay.isSenderTxHashIndexingEnabled} to check if the indexing feature is enabled or not.
             *
             * Receipt is not available for `pending` transactions whose transactions have not yet been processed.
             *
             * @memberof Klay
             * @method getTransactionReceipt
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getTransactionReceipt('0xdb63fb385e51fbfd84a98873c994aef622c5f1c72c5760a9ff95c55bbfd99898')
             *
             * @param {string} senderTxHash A sedner transaction hash. See {@link https://docs.klaytn.com/klaytn/design/transactions#sendertxhash|SenderTxHash} for more detail.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.TransactionReceipt>} A transaction receipt object, or null when no receipt was found.
             */
            new Method({
                name: 'getTransactionReceiptBySenderTxHash',
                call: 'klay_getTransactionReceiptBySenderTxHash',
                params: 1,
            }),
            /**
             * Sends a signed transaction to the Klaytn.
             * The signedTransaction parameter can be a "RLP-encoded signed transaction".
             * You can get the RLP-encoded transaction of a signed transaction using transaction.getRLPEncoding.
             * For convenience, this also accepts a {@link module:Transaction.Transaction|signed transaction instance} as parameter which has valid `signatures` (and `feePayerSignatures`) already.
             *
             * @memberof Klay
             * @method sendRawTransaction
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.sendRawTransaction('0x08f88...')
             *
             * @param {string|module:Transaction.Transaction} signedTransaction An RLP-encoded signed transaction or an instance of signed transaction.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {PromiEvent} A promise combined event emitter. It will be resolved when a {@link Klay.TransactionReceipt|transaction receipt} is available. And for event emitter, `transactionHash`('string' type) which is fired right after a transaction is sent and a transaction hash is available, `receipt`('{@link Klay.TransactionReceipt|TransactionReceipt}' type) which is fired when a transaction receipt is available and `error`('Error' type) which is fired if an error occurs during sending. On an out-of-gas error, the second parameter is the receipt.
             */
            new Method({
                name: 'sendRawTransaction',
                call: 'klay_sendRawTransaction',
                params: 1,
            }),
            /**
             * Sends a signed transaction to the Klaytn.
             * The signedTransaction parameter can be a "RLP-encoded signed transaction".
             * You can get the RLP-encoded transaction of a signed transaction using transaction.getRLPEncoding.
             * For convenience, this also accepts a {@link module:Transaction.Transaction|signed transaction instance} as parameter which has valid `signatures` (and `feePayerSignatures`) already.
             *
             * @memberof Klay
             * @method submitTransaction
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.submitTransaction('0x08f88...')
             *
             * @param {string|module:Transaction.Transaction} signedTransaction An RLP-encoded signed transaction or an instance of signed transaction.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {PromiEvent} A promise combined event emitter. It will be resolved when a {@link Klay.TransactionReceipt|transaction receipt} is available. And for event emitter, `transactionHash`('string' type) which is fired right after a transaction is sent and a transaction hash is available, `receipt`('{@link Klay.TransactionReceipt|TransactionReceipt}' type) which is fired when a transaction receipt is available and `error`('Error' type) which is fired if an error occurs during sending. On an out-of-gas error, the second parameter is the receipt.
             */
            new Method({
                name: 'submitTransaction',
                call: 'klay_sendRawTransaction',
                params: 1,
            }),
            /**
             * Signs a transaction as a transaction `sender` with an "imported account's private key" in your Klaytn Node and propagates the transaction to the Klaytn.
             *
             * This API provides the function to sign a transaction using an {@link https://docs.klaytn.com/dapp/json-rpc/api-references/personal#personal_importrawkey|imported account} in your Klaytn node.
             * The imported account in your node must be {@link https://docs.klaytn.com/dapp/json-rpc/api-references/personal#personal_unlockaccount|unlocked} to sign a transaction.
             *
             * @memberof Klay
             * @method sendTransaction
             * @instance
             *
             * @example
             * const tx = caver.transaction.valueTransfer.create({
             *     from: '0x{address in hex}',
             *     to: '0x{address in hex}',
             *     value: caver.utils.converToPeb(10, 'KLAY'),
             *     gas: 25000,
             * })
             * const result = await caver.rpc.klay.sendTransaction(tx)
             *
             * @param {module:Transaction.Transaction} transaction An instance of a transaction to be sent to the Klaytn.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {PromiEvent} A promise combined event emitter. It will be resolved when a {@link Klay.TransactionReceipt|transaction receipt} is available. And for event emitter, `transactionHash`('string' type) which is fired right after a transaction is sent and a transaction hash is available, `receipt`('{@link Klay.TransactionReceipt|TransactionReceipt}' type) which is fired when a transaction receipt is available and `error`('Error' type) which is fired if an error occurs during sending. On an out-of-gas error, the second parameter is the receipt.
             */
            new Method({
                name: 'sendTransaction',
                call: 'klay_sendTransaction',
                params: 1,
                inputFormatter: [formatters.inputTransactionFormatter],
            }),
            /**
             * Signs a fee delegated transaction as a transaction `fee payer` with an "imported account's private key" in your Klaytn Node and propagates the transaction to the Klaytn.
             *
             * Before using sendTransaction as a fee payer, the transaction sender must have signed with valid signature(s) and the `nonce` must have been defined.
             *
             * This API provides the function to sign a transaction using an {@link https://docs.klaytn.com/dapp/json-rpc/api-references/personal#personal_importrawkey|imported account} in your Klaytn node.
             * The imported account in your node must be {@link https://docs.klaytn.com/dapp/json-rpc/api-references/personal#personal_unlockaccount|unlocked} to sign a transaction.
             *
             * @memberof Klay
             * @method sendTransactionAsFeePayer
             * @instance
             *
             * @example
             * const tx = caver.transaction.feeDelegatedValueTransfer.create({
             *     from: '0x{address in hex}',
             *     to: '0x{address in hex}',
             *     value: caver.utils.converToPeb(10, 'KLAY'),
             *     gas: 25000,
             *     gas: 50000,
             *     nonce: 1,
             *     signatures: [
             *         [
             *             '0x4e43',
             *             '0x873e9db6d055596a8f79a6a2761bfb464cbc1b352ac1ce53770fc23bb16d929c',
             *             '0x15d206781cc8ac9ffb02c08545cb832e1f1700b46b886d72bb0cfeb4a230871e',
             *         ],
             *     ],
             *     feePayer: '0x3af68ad73f45a1e7686e8fcd23e910625ef2186e', // The address of imported account in Klaytn Node
             * })
             * const result = await caver.rpc.klay.sendTransactionAsFeePayer(tx)
             *
             * @param {module:Transaction.FeeDelegatedTransaction} transaction An instance of fee delegated transaction to send to the Klaytn.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {PromiEvent} A promise combined event emitter. It will be resolved when a {@link Klay.TransactionReceipt|transaction receipt} is available. And for event emitter, `transactionHash`('string' type) which is fired right after a transaction is sent and a transaction hash is available, `receipt`('{@link Klay.TransactionReceipt|TransactionReceipt}' type) which is fired when a transaction receipt is available and `error`('Error' type) which is fired if an error occurs during sending. On an out-of-gas error, the second parameter is the receipt.
             */
            new Method({
                name: 'sendTransactionAsFeePayer',
                call: 'klay_sendTransactionAsFeePayer',
                params: 1,
                inputFormatter: [formatters.inputTransactionFormatter],
            }),
            /**
             * An object defines the signed transaction from the Node.
             *
             * @typedef {object} Klay.SignedTransaction
             * @property {string} raw - An RLP-encoded signed transaction.
             * @property {Klay.SignedTransactionDetail} tx - Block number where this transaction was in.
             */
            /**
             * An object defines the signed transaction detail information.
             *
             * @typedef {object} Klay.SignedTransactionDetail
             * @property {string} [codeFormat] - The code format of smart contract code.
             * @property {string} [feePayer] - Address of the fee payer.
             * @property {Array.<Klay.SignatureData>} [feePayerSignatures] - An array of fee payer's signature objects. A signature object contains three fields (V, R, and S)
             * @property {string} [feeRatio] - Fee ratio of the fee payer. If it is 30, 30% of the fee will be paid by the fee payer. 70% will be paid by the sender.
             * @property {string} from - Address of the sender.
             * @property {string} gas - Gas provided by the sender.
             * @property {string} gasPrice - Gas price provided by the sender in peb.
             * @property {string} hash - Hash of the transaction.
             * @property {boolean} [humanReadable] - `true` if the address is humanReadable, `false` if the address is not humanReadable.
             * @property {string} [key] - The RLP-encoded AccountKey used to update AccountKey of an Klaytn account. See {@link https://docs.klaytn.com/klaytn/design/accounts#account-key|AccountKey} for more details.
             * @property {string} [input] - The data sent along with the transaction.
             * @property {string} nonce - The number of transactions made by the sender prior to this one.
             * @property {Array.<Klay.SignatureData>} signatures - An array of signature objects. A signature object contains three fields (V, R, and S).
             * @property {string} to - Address of the receiver. null when it is a contract deploying transaction.
             * @property {string} type - A string representing the type of the transaction.
             * @property {number} typeInt - An integer representing the type of the transaction.
             * @property {string} value - Value transferred in peb.
             */
            /**
             * Signs a transaction as a transaction sender with an "imported account's private key" in your Klaytn Node.
             *
             * This API provides the function to sign a transaction using an {@link https://docs.klaytn.com/dapp/json-rpc/api-references/personal#personal_importrawkey|imported account} in your Klaytn node.
             * The imported account in your node must be {@link https://docs.klaytn.com/dapp/json-rpc/api-references/personal#personal_unlockaccount|unlocked} to sign a transaction.
             *
             * @memberof Klay
             * @method signTransaction
             * @instance
             *
             * @example
             * const tx = caver.transaction.valueTransfer.create({
             *     from: '0x{address in hex}',
             *     to: '0x{address in hex}',
             *     value: caver.utils.converToPeb(10, 'KLAY'),
             *     gas: 25000,
             * })
             * const result = await caver.rpc.klay.signTransaction(tx)
             *
             * @param {module:Transaction.Transaction} transaction An instance of a transaction to sign.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.SignedTransaction>} An object includes signed transaction.
             */
            new Method({
                name: 'signTransaction',
                call: 'klay_signTransaction',
                params: 1,
                inputFormatter: [formatters.inputTransactionFormatter],
            }),
            /**
             * Signs a transaction as a transaction fee payer with an "imported account's private key" in your Klaytn Node.
             *
             * This API provides the function to sign a transaction using an {@link https://docs.klaytn.com/dapp/json-rpc/api-references/personal#personal_importrawkey|imported account} in your Klaytn node.
             * The imported account in your node must be {@link https://docs.klaytn.com/dapp/json-rpc/api-references/personal#personal_unlockaccount|unlocked} to sign a transaction.
             *
             * @memberof Klay
             * @method signTransactionAsFeePayer
             * @instance
             *
             * @example
             * const tx = caver.transaction.feeDelegatedValueTransfer.create({
             *     from: '0x{address in hex}',
             *     to: '0x{address in hex}',
             *     value: caver.utils.converToPeb(10, 'KLAY'),
             *     gas: 25000,
             *     gas: 50000,
             *     nonce: 1,
             *     signatures: [
             *         [
             *             '0x4e43',
             *             '0x873e9db6d055596a8f79a6a2761bfb464cbc1b352ac1ce53770fc23bb16d929c',
             *             '0x15d206781cc8ac9ffb02c08545cb832e1f1700b46b886d72bb0cfeb4a230871e',
             *         ],
             *     ],
             *     feePayer: '0x3af68ad73f45a1e7686e8fcd23e910625ef2186e', // The address of imported account in Klaytn Node
             * })
             * const result = await caver.rpc.klay.signTransactionAsFeePayer(tx)
             *
             * @param {module:Transaction.FeeDelegatedTransaction} transaction An instance of a transaction to sign.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.SignedTransaction>} An object includes signed transaction.
             */
            new Method({
                name: 'signTransactionAsFeePayer',
                call: 'klay_signTransactionAsFeePayer',
                params: 1,
                inputFormatter: [formatters.inputTransactionFormatter],
            }),
            /**
             * An object defines the decoded anchored data.
             *
             * @typedef {object} Klay.AnchoredData
             * @property {string} BlockHash - Hash of the child chain block that this anchoring transaction was performed.
             * @property {number} BlockNumber - The child chain block number that this anchoring transaction was performed.
             * @property {string} ParentHash - Hash of the parent block.
             * @property {string} TxHash - The root of the transaction trie of the block.
             * @property {string} StateRootHash - The root of the final state trie of the block.
             * @property {string} ReceiptHash - The root of the receipts trie of the block.
             * @property {number} BlockCount - The number of blocks generated during this anchoring period. In most cases, this number is equal to the child chain's `SC_TX_PERIOD`, except the case that this transaction was the first anchoring tx after turning on the anchoring.
             * @property {number} TxCount - The number of transactions generated in the child chain during this anchoring period.
             */
            /**
             * Returns the decoded anchored data in the transaction for the given transaction hash.
             *
             * @memberof Klay
             * @method getDecodedAnchoringTransactionByHash
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getDecodedAnchoringTransactionByHash('0x59831a092a9f0b48018848f5dd88a457efdbfabec13ea07cd769686741a1cd13')
             *
             * @param {string} transactionHash A transaction hash.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.AnchoredData>} An object includes signed transaction.
             */
            new Method({
                name: 'getDecodedAnchoringTransactionByHash',
                call: 'klay_getDecodedAnchoringTransactionByHash',
                params: 1,
            }),
            new Method({
                name: 'getDecodedAnchoringTransaction',
                call: 'klay_getDecodedAnchoringTransactionByHash',
                params: 1,
            }),
            /**
             * An object defines fee history.
             *
             * @typedef {object} Klay.FeeHistoryResult
             * @property {string} oldestBlock - Lowest number block of returned range.
             * @property {string[]} baseFeePerGas - An array of block base fees per gas. This includes the next block after the newest of the returned range, because this value can be derived from the newest block. Zeroes are returned for pre-EIP-1559 blocks.
             * @property {string[][]} reward - A two-dimensional array of effective priority fees per gas at the requested block percentiles.
             * @property {number[]} gasUsedRatio - An array of gasUsed/gasLimit in the block.
             */
            /**
             * Returns fee history for the returned block range. This can be a subsection of the requested range if not all blocks are available.
             *
             * @memberof Klay
             * @method getFeeHistory
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getFeeHistory(16, 'latest', [0.1, 0.2, 0.3])
             *
             * @param {number|BigNumber|BN|string} blockCount Number of blocks in the requested range. Between 1 and 1024 blocks can be requested in a single query. Less than requested may be returned if not all blocks are available.
             * @param {number|BigNumber|BN|string} lastBlock Highest number block (or block tag string) of the requested range.
             * @param {number[]} rewardPercentiles A monotonically increasing list of percentile values to sample from each block’s effective priority fees per gas in ascending order, weighted by gas used. (Example: `['0', '25', '50', '75', '100']` or `['0', '0.5', '1', '1.5', '3', '80']`)
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.FeeHistoryResult>} Fee history for the returned block range. This can be a subsection of the requested range if not all blocks are available.
             */
            new Method({
                name: 'getFeeHistory',
                call: 'klay_feeHistory',
                params: 3,
                inputFormatter: [utils.numberToHex, formatters.inputBlockNumberFormatter, null],
            }),
            /**
             * Returns a suggestion for a gas tip cap for dynamic fee transactions in peb.
             * Since Klaytn has a fixed gas price, this `caver.rpc.klay.getMaxPriorityFeePerGas` returns the gas price set by Klaytn.
             *
             * @memberof Klay
             * @method getMaxPriorityFeePerGas
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getMaxPriorityFeePerGas()
             *
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} As a suggested value for the gas tip cap, the current Klaytn uses a fixed gas price, so the gasPrice value is returned.
             */
            new Method({
                name: 'getMaxPriorityFeePerGas',
                call: 'klay_maxPriorityFeePerGas',
                params: 0,
            }),
            /**
             * An object defines an access list result that includes accessList and gasUsed.
             *
             * @typedef {object} Klay.AccessListResult
             * @property {Klay.AccessList} accessList - The list of addresses and storage keys that will be used by that transaction. The list could change when the transaction is actually mined.
             * @property {string} gasUsed - The estimated amount of gas used.
             */
            /**
             * Klay.AccessList is a list of access tuple.
             *
             * @typedef {Klay.AccessTuple[]} Klay.AccessList
             */
            /**
             * The element type of an access list.
             *
             * @typedef {object} Klay.AccessTuple
             * @property {string} address - An address that the transaction plans to access.
             * @property {string[]} storageKeys - The storage slots that the transaction plans to access.
             */
            /**
             * Returns a list of addresses and storage keys used by the transaction, plus the gas consumed when the access list is added.
             *
             * @memberof Klay
             * @method createAccessList
             * @instance
             *
             * @example
             * const txArgs = {
             *     from: '0x3bc5885c2941c5cda454bdb4a8c88aa7f248e312',
             *     data: '0x20965255',
             *     gasPrice: '0x3b9aca00',
             *     gas: '0x3d0900',
             *     to: '0x00f5f5f3a25f142fafd0af24a754fafa340f32c7'
             * }
             * const result = await caver.rpc.klay.createAccessList(txArgs, 'latest')
             *
             * @param {Klay.CallObject} callObject A transaction call object.
             * @param {number|BigNumber|BN|string} [blockParameter] A block number, blockhash or the block tag string (`latest` or `earliest`). If omitted, `latest` will be used.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Klay.AccessListResult>} An accessListResult for the given transaction
             */
            new Method({
                name: 'createAccessList',
                call: 'klay_createAccessList',
                params: 2,
                inputFormatter: [formatters.inputTransactionFormatter, formatters.inputDefaultBlockNumberFormatter],
            }),

            // Configuration
            /**
             * Returns the current client version of a Klaytn node.
             *
             * @memberof Klay
             * @method getClientVersion
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getClientVersion()
             *
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The current client version of a Klaytn node.
             */
            new Method({
                name: 'getClientVersion',
                call: 'klay_clientVersion',
                params: 0,
            }),
            /**
             * Returns the current price per gas in peb for the given block.
             *
             * @memberof Klay
             * @method getGasPriceAt
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getGasPriceAt()
             *
             * @param {number} [blockNumber] The block number. If omitted, the latest unit price will be returned.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The current gas price in peb.
             */
            new Method({
                name: 'getGasPriceAt',
                call: 'klay_gasPriceAt',
                params: 1,
                inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
            }),
            /**
             * Returns `true` if the node is writing blockchain data in a parallel manner.
             *
             * @memberof Klay
             * @method isParallelDBWrite
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.isParallelDBWrite()
             *
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<boolean>} `true` means the node is writing blockchain data in a parallel manner. It is `false` if the node is serially writing the data.
             */
            new Method({
                name: 'isParallelDBWrite',
                call: 'klay_isParallelDBWrite',
                params: 0,
            }),
            /**
             * Returns `true` if the node is indexing sender transaction hash to transaction hash mapping information.
             *
             * @memberof Klay
             * @method isSenderTxHashIndexingEnabled
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.isSenderTxHashIndexingEnabled()
             *
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<boolean>} `true` means the node is indexing sender transaction hash to transaction hash mapping information.
             */
            new Method({
                name: 'isSenderTxHashIndexingEnabled',
                call: 'klay_isSenderTxHashIndexingEnabled',
                params: 0,
            }),
            /**
             * Returns the Klaytn protocol version of the node.
             *
             * @memberof Klay
             * @method getProtocolVersion
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getProtocolVersion()
             *
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The Klaytn protocol version of the node.
             */
            new Method({
                name: 'getProtocolVersion',
                call: 'klay_protocolVersion',
                params: 0,
            }),
            /**
             * Returns the rewardbase of the current node.
             * Rewardbase is the address of the account where the block rewards go to. It is only required for CNs.
             *
             * @memberof Klay
             * @method getRewardbase
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getRewardbase()
             *
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The rewardbase address.
             */
            new Method({
                name: 'getRewardbase',
                call: 'klay_rewardbase',
                params: 0,
            }),

            // Filter
            /**
             * Polling method for a filter, which returns an array of logs since the last poll.
             *
             * @memberof Klay
             * @method getFilterChanges
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getFilterChanges('0xafb8e49bbcba9d61a3c616a3a312533e')
             *
             * @param {string} filterId The filter id.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Array.<Klay.Log>>} Array of log objects, or an empty array if nothing has changed since the last poll.
             */
            new Method({
                name: 'getFilterChanges',
                call: 'klay_getFilterChanges',
                params: 1,
                inputFormatter: [utils.numberToHex],
            }),
            /**
             * Returns an array of all logs matching the filter with the given id.
             * The filter object should be obtained by using {@link Klay#newFilter|caver.rpc.klay.newFilter}.
             *
             * Note that filter ids returned by other filter creation functions, such as {@link Klay#newBlockFilter|caver.rpc.klay.newBlockFilter} or {@link Klay#newPendingTransactionFilter|caver.rpc.klay.newPendingTransactionFilter}, cannot be used with this function.
             *
             * @memberof Klay
             * @method getFilterLogs
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getFilterLogs('0xafb8e49bbcba9d61a3c616a3a312533e')
             *
             * @param {string} filterId The filter id.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Array.<Klay.Log>>} Array of all logs matching the filter with the given id.
             */
            new Method({
                name: 'getFilterLogs',
                call: 'klay_getFilterLogs',
                params: 1,
                inputFormatter: [utils.numberToHex],
            }),
            /**
             * An object for filter options.
             *
             * @typedef {object} Klay.FilterOptions
             * @property {string|number} [fromBlock] - The block number of the earliest block to get the logs. (`"latest"` means the most recent block.) The default value is `"latest"`.
             * @property {string|number} [toBlock] - The block number of the last block to get the logs. (`"latest"` means the most recent block.). The default value is `"latest"`.
             * @property {string|Array.<string>} [address] - An address or a list of addresses. Only the logs related to the particular account(s) will be returned.
             * @property {Array.<string>} [topics] - An array of values that must appear in the log entries. The order is important. If you want to leave topics out, use `null`, e.g., `[null, '0x12...']`. You can also pass an array for each topic with options for that topic, e.g., `[null, ['option1', 'option2']]`.
             */
            /**
             * Returns an array of all logs matching a given filter object.
             *
             * @memberof Klay
             * @method getLogs
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.getLogs({
             *     fromBlock: '0x1'
             *     toBlock: 'latest',
             *     address:'0x87ac99835e67168d4f9a40580f8f5c33550ba88b'
             * })
             *
             * @param {Klay.FilterOptions} options The filter options.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<Array.<Klay.Log>>} Array of all logs matching a given filter object.
             */
            new Method({
                name: 'getLogs',
                call: 'klay_getLogs',
                params: 1,
                inputFormatter: [formatters.inputLogFormatter],
            }),
            /**
             * Creates a filter in the node, to notify when a new block arrives.
             * To check if the state has changed, call {@link Klay#getFilterChanges|caver.rpc.klay.getFilterChanges}.
             *
             * @memberof Klay
             * @method newBlockFilter
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.newBlockFilter()
             *
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} A filter id.
             */
            new Method({
                name: 'newBlockFilter',
                call: 'klay_newBlockFilter',
                params: 0,
            }),
            /**
             * Creates a filter object using the given filter options, to receive the specific state changes (logs).
             *
             * To check if the state has changed, call {@link Klay#getFilterChanges|caver.rpc.klay.getFilterChanges}.
             * To obtain all logs matching the filter created by `newFilter`, call {@link Klay#getFilterLogs|caver.rpc.klay.getFilterLogs}.
             *
             * For detailed information about the topics in the filter object, please see {@link https://docs.klaytn.com/dapp/json-rpc/api-references/klay/filter#klay_newfilter|Klaytn Platform API - klay_newFilter}.
             *
             * @memberof Klay
             * @method newFilter
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.newFilter({})
             *
             * @param {Klay.FilterOptions} options The filter options.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} A filter id.
             */
            new Method({
                name: 'newFilter',
                call: 'klay_newFilter',
                params: 1,
                inputFormatter: [formatters.inputLogFormatter],
            }),
            /**
             * Creates a filter in the node, to receive the information about new pending transaction arrival.
             * To check if the state has changed, call {@link Klay#getFilterChanges|caver.rpc.klay.getFilterChanges}.
             *
             * @memberof Klay
             * @method newPendingTransactionFilter
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.newPendingTransactionFilter()
             *
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} A filter id.
             */
            new Method({
                name: 'newPendingTransactionFilter',
                call: 'klay_newPendingTransactionFilter',
                params: 0,
            }),
            /**
             * Uninstalls a filter with a given id.
             * Should always be called when a watch is no longer needed.
             * Additionally, filters time out when they are not being called with {@link Klay#getFilterChanges|caver.rpc.klay.getFilterChanges} for a period of time.
             *
             * @memberof Klay
             * @method uninstallFilter
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.uninstallFilter('0x1426438ffdae5abf43edf4159c5b013b')
             *
             * @param {string} filterId The filter id.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<boolean>} `true` if the filter was successfully uninstalled, otherwise `false`.
             */
            new Method({
                name: 'uninstallFilter',
                call: 'klay_uninstallFilter',
                params: 1,
                inputFormatter: [utils.numberToHex],
            }),

            // Misc
            /**
             * Returns Keccak-256 (not the standardized SHA3-256) of the given data.
             * You can use {@link module:utils~sha3|caver.utils.sha3} instead of this.
             *
             * @memberof Klay
             * @method sha3
             * @instance
             *
             * @example
             * const result = await caver.rpc.klay.sha3('0x11223344')
             *
             * @param {string} data The data to be converted into a SHA3 hash.
             * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
             * @return {Promise<string>} The SHA3 result of the given data.
             */
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

module.exports = Klay
