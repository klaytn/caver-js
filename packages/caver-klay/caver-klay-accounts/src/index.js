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

    This file is derived from web3.js/packages/web3-eth-accounts/src/index.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/**
 * @file accounts.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

const _ = require('underscore')
const Promise = require('any-promise')
// account, hash, rlp, nat, bytes library will be used from 'eth-lib' temporarily.
const AccountLib = require('eth-lib/lib/account')
const Hash = require('eth-lib/lib/hash')
const RLP = require('eth-lib/lib/rlp')
const Nat = require('eth-lib/lib/nat')
const Bytes = require('eth-lib/lib/bytes')
const cryp = typeof global === 'undefined' ? require('crypto-browserify') : require('crypto')
const uuid = require('uuid')
const elliptic = require('elliptic')
const scrypt = require('./scrypt')
const utils = require('../../../caver-utils')
const helpers = require('../../../caver-core-helpers')

const Method = require('../../../caver-core-method')
const core = require('../../../caver-core')
const {
    encodeRLPByTxType,
    makeRawTransaction,
    getSenderTxHash,
    decodeFromRawTransaction,
    splitFeePayer,
    extractSignatures,
} = require('./makeRawTransaction')

const secp256k1 = new elliptic.ec('secp256k1')

const AccountKeyPublic = require('./accountKey/accountKeyPublic')
const AccountKeyMultiSig = require('./accountKey/accountKeyMultiSig')
const AccountKeyRoleBased = require('./accountKey/accountKeyRoleBased')
const { AccountKeyEnum } = require('./accountKey/accountKeyEnum')

const Account = require('./account/account')
const AccountForUpdate = require('./account/accountForUpdate')

const { rpc } = require('../../../caver-rtm')

const isNot = function(value) {
    return _.isUndefined(value) || _.isNull(value)
}

function coverInitialTxValue(tx) {
    if (typeof tx !== 'object') throw new Error('Invalid transaction')
    if (!tx.senderRawTransaction && (!tx.type || tx.type === 'LEGACY' || tx.type.includes('SMART_CONTRACT_DEPLOY'))) {
        tx.to = tx.to || '0x'
        tx.data = utils.addHexPrefix(tx.data || '0x')
    }
    tx.chainId = utils.numberToHex(tx.chainId)
    return tx
}

/**
 * resolveArgsForSignTransaction parse arguments for signTransaction.
 *
 * @method resolveArgsForSignTransaction
 * @param {Object} args Parameters of signTransaction.
 * @return {Object}
 */
function resolveArgsForSignTransaction(args) {
    if (args.length === 0 || args.length > 3) {
        throw new Error('Invalid parameter: The number of parameters is invalid.')
    }

    // privateKey and callback are optional parameter
    // "args.length === 2" means that user sent parameter privateKey or callback
    const tx = args[0]
    let privateKey
    let callback

    if (!tx || (!_.isObject(tx) && !_.isString(tx))) {
        throw new Error('Invalid parameter: The transaction must be defined as an object or RLP encoded string')
    }

    if (args.length === 2) {
        if (_.isFunction(args[1])) {
            callback = args[1]
        } else {
            privateKey = args[1]
        }
    } else if (args.length === 3) {
        if (args[1] && typeof args[1] !== 'string' && !_.isArray(args[1])) {
            throw new Error('Invalid parameter: The parameter for the private key is invalid')
        }
        privateKey = args[1]
        callback = args[2]
    }

    // For handling when callback is undefined.
    callback = callback || function() {}

    return { tx, privateKey, callback }
}

/**
 * resolveArgsForFeePayerSignTransaction parse arguments for feePayerSignTransaction.
 *
 * @method resolveArgsForFeePayerSignTransaction
 * @param {Object} args Parameters of feePayerSignTransaction.
 * @return {Object}
 */
function resolveArgsForFeePayerSignTransaction(args) {
    if (args.length === 0 || args.length > 4) {
        throw new Error('Invalid parameter: The number of parameters is invalid.')
    }

    // privateKey and callback are optional parameter
    // "args.length === 3" means that user sent parameter privateKey or callback
    const tx = args[0]
    const feePayer = args[1]
    let privateKey
    let callback

    if (!tx || (!_.isObject(tx) && !_.isString(tx))) {
        throw new Error('Invalid parameter: The transaction must be defined as an object or RLP encoded string')
    }

    if (!utils.isAddress(feePayer)) {
        throw new Error(`Invalid fee payer address : ${feePayer}`)
    }

    if (args.length === 3) {
        if (_.isFunction(args[2])) {
            callback = args[2]
        } else {
            privateKey = args[2]
        }
    } else if (args.length === 4) {
        if (args[2] && typeof args[2] !== 'string' && !_.isArray(args[2])) {
            throw new Error('Invalid parameter: The parameter for the private key is invalid')
        }
        privateKey = args[2]
        callback = args[3]
    }

    // For handling when callback is undefined.
    callback = callback || function() {}

    return { tx, privateKey, feePayer, callback }
}

const Accounts = function Accounts(...args) {
    const _this = this

    // sets _requestmanager
    core.packageInit(this, args)

    // remove unecessary core functions
    delete this.BatchRequest
    delete this.extend

    const _klaytnCall = [rpc.getChainId, rpc.getGasPrice, rpc.getTransactionCount]
    // attach methods to this._klaytnCall
    this._klaytnCall = {}
    _.each(_klaytnCall, function(method) {
        method = new Method(method)
        method.attachToObject(_this._klaytnCall)
        method.setRequestManager(_this._requestManager)
    })

    this.wallet = new Wallet(this)
}

Accounts.prototype._addAccountFunctions = function(account) {
    const _this = this

    // add sign functions
    account.signTransaction = function signTransaction(tx, callback) {
        return _this.signTransaction(tx, account.privateKey, callback)
    }
    account.sign = function sign(data) {
        return _this.sign(data, account.privateKey)
    }

    account.encrypt = function encrypt(password, options = {}) {
        options.address = account.address
        return _this.encrypt(account.keys, password, options)
    }

    account.getKlaytnWalletKey = function getKlaytnWalletKey() {
        return genKlaytnWalletKeyStringFromAccount(account)
    }

    return account
}

/**
 * _determineAddress determines the priority of the parameters entered and returns the address that should be used for the account.
 *
 * @method _determineAddress
 * @param {Object} legacyAccount Account with a legacy account key extracted from private key to be used for address determination.
 * @param {String} addressFromKey Address extracted from key.
 * @param {String} userInputAddress Address passed as parameter by user.
 * @return {String}
 */
Accounts.prototype._determineAddress = function _determineAddress(legacyAccount, addressFromKey, userInputAddress) {
    if (userInputAddress) {
        if (addressFromKey && addressFromKey !== userInputAddress) {
            throw new Error('The address extracted from the private key does not match the address received as the input value.')
        }

        if (!utils.isAddress(userInputAddress)) {
            throw new Error('The address received as the input value is invalid.')
        }
        return userInputAddress
    }
    if (addressFromKey) {
        if (!utils.isAddress(addressFromKey)) {
            throw new Error('The address extracted from the private key is invalid.')
        }
        // If userInputAddress is undefined and address which is came from private is existed, set address in account.
        return addressFromKey
    }
    return legacyAccount.address
}

/**
 * _getRoleKey returns a key that matches the role that should be used according to the transaction.
 *
 * @method _getRoleKey
 * @param {Object} tx transaction object to be sign.
 * @param {Object} account Account to be used for signing.
 * @return {String|Array}
 */
Accounts.prototype._getRoleKey = function _getRoleKey(tx, account) {
    let key

    if (!account) {
        throw new Error('The account to be used for signing is not defined.')
    }

    if (tx.senderRawTransaction && tx.feePayer) {
        key = account.feePayerKey
    } else if (tx.type && tx.type.includes('ACCOUNT_UPDATE')) {
        key = account.updateKey
    } else {
        key = account.transactionKey
    }

    if (!key) {
        throw new Error('The key corresponding to the role used for signing is not defined.')
    }

    return key
}

/**
 * create function creates random account with entropy.
 *
 * @method create
 * @param {Object} entropy A random string to increase entropy.
 * @return {Object}
 */
Accounts.prototype.create = function create(entropy) {
    return this._addAccountFunctions(Account.fromObject(AccountLib.create(entropy || utils.randomHex(32))))
}

/**
 * createAccountKey creates AccountKeyPublic, AccountKeyMultiSig or AccountKeyRoleBased instance with parameter.
 *
 * @method createAccountKey
 * @param {String|Array|Object} accountKey Parameters to be used when creating the AccountKey.
 * @return {Object}
 */
Accounts.prototype.createAccountKey = function createAccountKey(accountKey) {
    if (Account.isAccountKey(accountKey)) accountKey = accountKey.keys

    if (_.isString(accountKey)) {
        accountKey = this.createAccountKeyPublic(accountKey)
    } else if (_.isArray(accountKey)) {
        accountKey = this.createAccountKeyMultiSig(accountKey)
    } else if (_.isObject(accountKey)) {
        accountKey = this.createAccountKeyRoleBased(accountKey)
    } else {
        throw new Error(`Invalid accountKey type: ${typeof accountKey}`)
    }
    return accountKey
}

/**
 * createAccountKeyPublic creates AccountKeyPublic with a string of private key.
 *
 * @method createAccountKeyPublic
 * @param {String} privateKey Private key string that will be used to create AccountKeyPublic.
 * @return {Object}
 */
Accounts.prototype.createAccountKeyPublic = function createAccountKeyPublic(privateKey) {
    if (privateKey instanceof AccountKeyPublic) return privateKey

    if (!_.isString(privateKey)) {
        throw new Error('Creating a AccountKeyPublic requires a private key string.')
    }

    const parsed = utils.parsePrivateKey(privateKey)
    privateKey = parsed.privateKey

    if (!utils.isValidPrivateKey(privateKey)) {
        throw new Error(`Failed to create AccountKeyPublic. Invalid private key : ${privateKey}`)
    }

    return new AccountKeyPublic(privateKey)
}

/**
 * createAccountKeyMultiSig creates AccountKeyMultiSig with an array of private keys.
 *
 * @method createAccountKeyMultiSig
 * @param {Array} privateKeys An Array of private key strings that will be used to create AccountKeyMultiSig.
 * @return {Object}
 */
Accounts.prototype.createAccountKeyMultiSig = function createAccountKeyMultiSig(privateKeys) {
    if (privateKeys instanceof AccountKeyMultiSig) return privateKeys

    if (!_.isArray(privateKeys)) {
        throw new Error('Creating a AccountKeyMultiSig requires an array of private key string.')
    }

    for (let i = 0; i < privateKeys.length; i++) {
        const parsed = utils.parsePrivateKey(privateKeys[i])
        const p = parsed.privateKey
        if (!utils.isValidPrivateKey(p)) {
            throw new Error(`Failed to create AccountKeyMultiSig. Invalid private key : ${p}`)
        }
    }

    return new AccountKeyMultiSig(privateKeys)
}

/**
 * createAccountKeyRoleBased creates AccountKeyRoleBased with an obejct of key.
 *
 * @method createAccountKeyRoleBased
 * @param {Object} keyObject Object that defines key for each role to use when creating AccountKeyRoleBased.
 * @return {Object}
 */
Accounts.prototype.createAccountKeyRoleBased = function createAccountKeyRoleBased(keyObject) {
    if (keyObject instanceof AccountKeyRoleBased) return keyObject

    if (!_.isObject(keyObject) || _.isArray(keyObject)) {
        throw new Error('Creating a AccountKeyRoleBased requires an object.')
    }

    return new AccountKeyRoleBased(keyObject)
}

/**
 * accountKeyToPublicKey creates public key format with AccountKey.
 *
 * @method accountKeyToPublicKey
 * @param {Object} accountKey AccountKey instance for which you want to generate a public key format.
 * @return {String|Array|Object}
 */
Accounts.prototype.accountKeyToPublicKey = function accountKeyToPublicKey(accountKey) {
    accountKey = this.createAccountKey(accountKey)
    return accountKey.toPublicKey(this.privateKeyToPublicKey)
}

/**
 * createWithAccountKey creates Account instance with AccountKey.
 *
 * @method createWithAccountKey
 * @param {String} address The address of account.
 * @param {String|Array|Object} accountKey The accountKey of account.
 * @return {Object}
 */
Accounts.prototype.createWithAccountKey = function createWithAccountKey(address, accountKey) {
    const account = new Account(address, this.createAccountKey(accountKey))
    return this._addAccountFunctions(account)
}

/**
 * createWithAccountKeyPublic create an account with AccountKeyPublic.
 *
 * @method createWithAccountKeyPublic
 * @param {String} address An address of account.
 * @param {String|Object} key Key of account.
 * @return {Object}
 */
Accounts.prototype.createWithAccountKeyPublic = function createWithAccountKeyPublic(address, key) {
    if (!Account.isAccountKey(key)) key = this.createAccountKeyPublic(key)

    if (key.type !== AccountKeyEnum.ACCOUNT_KEY_PUBLIC) {
        throw new Error(`Failed to create account with AccountKeyPublic. Invalid account key : ${key.type}`)
    }

    const account = new Account(address, key)
    return this._addAccountFunctions(account)
}

/**
 * createWithAccountKeyMultiSig create an account with AccountKeyMultiSig.
 *
 * @method createWithAccountKeyMultiSig
 * @param {String} address An address of account.
 * @param {String|Object} keys Key of account.
 * @return {Object}
 */
Accounts.prototype.createWithAccountKeyMultiSig = function createWithAccountKeyMultiSig(address, keys) {
    if (!Account.isAccountKey(keys)) keys = this.createAccountKeyMultiSig(keys)

    if (keys.type !== AccountKeyEnum.ACCOUNT_KEY_MULTISIG) {
        throw new Error(`Failed to create account with AccountKeyMultiSig. Invalid account key : ${keys.type}`)
    }

    const account = new Account(address, keys)
    return this._addAccountFunctions(account)
}

/**
 * createWithAccountKeyRoleBased create an account with AccountKeyRoleBased.
 *
 * @method createWithAccountKeyRoleBased
 * @param {String} address An address of account.
 * @param {String|Object} keyObject Key of account.
 * @return {Object}
 */
Accounts.prototype.createWithAccountKeyRoleBased = function createWithAccountKeyRoleBased(address, keyObject) {
    if (!Account.isAccountKey(keyObject)) {
        keyObject = this.createAccountKeyRoleBased(keyObject)
    }

    if (keyObject.type !== AccountKeyEnum.ACCOUNT_KEY_ROLEBASED) {
        throw new Error(`Failed to create account with AccountKeyRoleBased. Invalid account key : ${keyObject.type}`)
    }

    const account = new Account(address, keyObject)
    return this._addAccountFunctions(account)
}

/**
 * privateKeyToAccount creates and returns an Account through the input passed as parameters.
 *
 * @method privateKeyToAccount
 * @param {String} key The key parameter can be either normal private key or KlaytnWalletKey format.
 * @param {String} userInputAddress The address entered by the user for use in creating an account.
 * @return {Object}
 */
Accounts.prototype.privateKeyToAccount = function privateKeyToAccount(key, userInputAddress) {
    const { legacyAccount: account, klaytnWalletKeyAddress } = this.getLegacyAccount(key)

    account.address = this._determineAddress(account, klaytnWalletKeyAddress, userInputAddress)
    account.address = account.address.toLowerCase()
    account.address = utils.addHexPrefix(account.address)

    return account
}

/**
 * createAccountForUpdate creates an AccountForUpdate instance.
 * The AccountForUpdate returned as a result of this function contains only the address and public key used to update the account.
 *
 * @method createAccountForUpdate
 * @param {String} address The address value of AccountForUpdate, a structure that contains data for updating an account.
 * @param {String|Array|Object} accountKey Private key or AccountKey to update account.
 * @param {Object} options Options to use for setting threshold and weight for multiSig.
 * @return {Object}
 */
Accounts.prototype.createAccountForUpdate = function createAccountForUpdate(address, accountKey, options) {
    let legacyOrFail

    // Logic for handling cases where legacyKey or failKey is set inside AccountKeyRoleBased object.
    if (!_.isArray(accountKey) && _.isObject(accountKey)) {
        legacyOrFail = {}
        Object.keys(accountKey).map(role => {
            if (accountKey[role] === 'legacyKey' || accountKey[role] === 'failKey') {
                legacyOrFail[role] = accountKey[role]
                delete accountKey[role]
            }
        })
        if (Object.keys(accountKey).length === 0) {
            return new AccountForUpdate(address, legacyOrFail, options)
        }
    }

    const publicKey = this.accountKeyToPublicKey(accountKey)

    if (legacyOrFail !== undefined) {
        Object.assign(publicKey, legacyOrFail)
    }

    return new AccountForUpdate(address, publicKey, options)
}

/**
 * createAccountForUpdateWithPublicKey creates AccountForUpdate instance with public key format.
 *
 * @method createAccountForUpdateWithPublicKey
 * @param {String} address The address value of AccountForUpdate, a structure that contains data for updating an account.
 * @param {String|Array|Object} keyForUpdate Public key to update.
 * @param {Object} options Options to use for setting threshold and weight for multiSig.
 * @return {Object}
 */
Accounts.prototype.createAccountForUpdateWithPublicKey = function createAccountForUpdateWithPublicKey(address, keyForUpdate, options) {
    return new AccountForUpdate(address, keyForUpdate, options)
}

/**
 * createAccountForUpdateWithLegacyKey creates AccountForUpdate instance with legacyKey.
 *
 * @method createAccountForUpdateWithLegacyKey
 * @param {String} address The address of account to update with the legacy key.
 * @return {Object}
 */
Accounts.prototype.createAccountForUpdateWithLegacyKey = function createAccountForUpdateWithLegacyKey(address) {
    return new AccountForUpdate(address, 'legacyKey')
}

/**
 * createAccountForUpdateWithFailKey creates AccountForUpdate instance with failKey.
 *
 * @method createAccountForUpdateWithFailKey
 * @param {String} address The address of account to update with the fail key.
 * @return {Object}
 */
Accounts.prototype.createAccountForUpdateWithFailKey = function createAccountForUpdateWithFailKey(address) {
    return new AccountForUpdate(address, 'failKey')
}

/**
 * isDecoupled determines whether or not it is decoupled based on the input value.
 *
 * @method isDecoupled
 * @param {String} key The key parameter can be either normal private key or KlaytnWalletKey format.
 * @param {String} userInputAddress The address to use when determining whether it is decoupled.
 * @return {Boolean}
 */
Accounts.prototype.isDecoupled = function isDecoupled(key, userInputAddress) {
    const { legacyAccount, klaytnWalletKeyAddress } = this.getLegacyAccount(key)
    const actualAddress = this._determineAddress(legacyAccount, klaytnWalletKeyAddress, userInputAddress)

    return legacyAccount.address.toLowerCase() !== actualAddress.toLowerCase()
}

/**
 * getLegacyAccount extracts the private key from the input key and returns an account with the corresponding legacy account key.
 * If the input key is KlaytnWalletKey format, it returns klaytnWalletKeyAddress, which is the address extracted from KlaytnWalletKey.
 *
 * @method getLegacyAccount
 * @param {String} key The key parameter can be either normal private key or KlaytnWalletKey format.
 * @return {Object}
 */
Accounts.prototype.getLegacyAccount = function getLegacyAccount(key) {
    const parsed = utils.parsePrivateKey(key)

    if (!utils.isValidPrivateKey(parsed.privateKey)) {
        throw new Error('Invalid private key')
    }

    const privateKey = utils.addHexPrefix(parsed.privateKey)

    const account = this._addAccountFunctions(Account.fromObject(AccountLib.fromPrivate(privateKey)))

    return { legacyAccount: account, klaytnWalletKeyAddress: parsed.address }
}

/**
 * signTransaction signs to transaction with private key.
 * If there are signatures(feePayerSignatures if the fee payer signs) in tx entered as a parameter,
 * the signatures(feePayerSignatures if the fee payer signs) are appended.
 *
 * @method signTransaction
 * @param {String|Object} tx The transaction to sign.
 * @param {String|Array} privateKey The private key to use for signing.
 * @param {String} callback The callback function to call.
 * @return {Object}
 */
Accounts.prototype.signTransaction = function signTransaction() {
    const _this = this
    let isLegacy = false
    let isFeePayer = false
    let existedSenderSignatures = []
    let existedFeePayerSignatures = []
    let result
    let tx
    let privateKey
    let callback

    const handleError = e => {
        e = e instanceof Error ? e : new Error(e)
        if (callback) callback(e)
        return Promise.reject(e)
    }

    try {
        const resolved = resolveArgsForSignTransaction(arguments)
        tx = resolved.tx
        privateKey = resolved.privateKey
        callback = resolved.callback
    } catch (e) {
        return handleError(e)
    }

    // If the user signs an RLP encoded transaction, tx is of type string.
    if (_.isString(tx)) {
        tx = decodeFromRawTransaction(tx)
    }

    // Validate tx object
    const error = helpers.validateFunction.validateParams(tx)
    if (error) return handleError(error)

    if (tx.senderRawTransaction) {
        if (tx.feePayerSignatures) {
            existedFeePayerSignatures = existedFeePayerSignatures.concat(tx.feePayerSignatures)
        }

        try {
            // Decode senderRawTransaction to get signatures of fee payer
            const { senderRawTransaction, feePayer, feePayerSignatures } = splitFeePayer(tx.senderRawTransaction)

            // feePayer !== '0x' means that in senderRawTransaction there are feePayerSignatures
            if (feePayer !== '0x') {
                // The feePayer inside the tx object does not match the feePayer information contained in the senderRawTransaction.
                if (feePayer.toLowerCase() !== tx.feePayer.toLowerCase()) {
                    return handleError(
                        `Invalid feePayer: The fee payer(${feePayer}) included in the transaction does not match the fee payer(${tx.feePayer}) you want to sign.`
                    )
                }
                existedFeePayerSignatures = existedFeePayerSignatures.concat(feePayerSignatures)
            }

            tx.senderRawTransaction = senderRawTransaction
            isFeePayer = true
        } catch (e) {
            return handleError(e)
        }
    } else {
        isLegacy = !!(tx.type === undefined || tx.type === 'LEGACY')

        if (tx.signatures) {
            // if there is existed signatures or feePayerSignatures, those should be preserved.
            if (isLegacy) {
                return handleError('Legacy transaction cannot be signed with multiple keys.')
            }
            existedSenderSignatures = existedSenderSignatures.concat(tx.signatures)
        }
    }

    // When privateKey is undefined, find Account from Wallet.
    if (privateKey === undefined) {
        try {
            const account = this.wallet.getAccount(isFeePayer ? tx.feePayer : tx.from)
            if (!account) {
                return handleError(
                    'Failed to find get private key to sign. The account you want to use for signing must exist in caver.klay.accounts.wallet or you must pass the private key as a parameter.'
                )
            }
            privateKey = this._getRoleKey(tx, account)
        } catch (e) {
            return handleError(e)
        }
    }

    const privateKeys = _.isArray(privateKey) ? privateKey : [privateKey]

    try {
        for (let i = 0; i < privateKeys.length; i++) {
            const parsed = utils.parsePrivateKey(privateKeys[i])
            privateKeys[i] = parsed.privateKey
            privateKeys[i] = utils.addHexPrefix(privateKeys[i])

            if (!utils.isValidPrivateKey(privateKeys[i])) {
                return handleError('Invalid private key')
            }
        }
    } catch (e) {
        return handleError(e)
    }

    // Attempting to sign with a decoupled account into a legacy type transaction should be rejected.
    if (isLegacy) {
        if (privateKeys.length > 1) {
            return handleError('Legacy transaction cannot signed with multiple keys')
        }
        if (_this.isDecoupled(privateKeys[0], tx.from)) {
            return handleError('A legacy transaction must be with a legacy account key')
        }
    }

    function signed(txObject) {
        try {
            // Guarantee all property in transaction is hex.
            txObject = helpers.formatters.inputCallFormatter(txObject)

            const transaction = coverInitialTxValue(txObject)

            const rlpEncoded = encodeRLPByTxType(transaction)

            const messageHash = Hash.keccak256(rlpEncoded)

            const sigs = isFeePayer ? existedFeePayerSignatures : existedSenderSignatures

            for (const p of privateKeys) {
                const signature = AccountLib.makeSigner(Nat.toNumber(transaction.chainId || '0x1') * 2 + 35)(messageHash, p)
                const [v, r, s] = AccountLib.decodeSignature(signature).map(sig => utils.makeEven(utils.trimLeadingZero(sig)))
                sigs.push([v, r, s])
            }
            // makeRawTransaction will return signatures and feePayerSignatures with duplicates removed.
            const { rawTransaction, signatures, feePayerSignatures } = makeRawTransaction(rlpEncoded, sigs, transaction)

            result = {
                messageHash,
                v: sigs[0][0],
                r: sigs[0][1],
                s: sigs[0][2],
                rawTransaction,
                txHash: Hash.keccak256(rawTransaction),
                senderTxHash: getSenderTxHash(rawTransaction),
            }

            if (isFeePayer) {
                result.feePayerSignatures = feePayerSignatures
            } else {
                result.signatures = signatures
            }
        } catch (e) {
            callback(e)
            return Promise.reject(e)
        }

        callback(null, result)
        return result
    }

    if (tx.nonce !== undefined && tx.chainId !== undefined && tx.gasPrice !== undefined) {
        return Promise.resolve(signed(tx))
    }

    // When the feePayer signs a transaction, required information is only chainId.
    if (isFeePayer) {
        return Promise.all([isNot(tx.chainId) ? _this._klaytnCall.getChainId() : tx.chainId]).then(function(args) {
            if (isNot(args[0])) {
                throw new Error(`"chainId" couldn't be fetched: ${JSON.stringify(args)}`)
            }
            return signed(_.extend(tx, { chainId: args[0] }))
        })
    }

    // Otherwise, get the missing info from the Klaytn Node
    return Promise.all([
        isNot(tx.chainId) ? _this._klaytnCall.getChainId() : tx.chainId,
        isNot(tx.gasPrice) ? _this._klaytnCall.getGasPrice() : tx.gasPrice,
        isNot(tx.nonce) ? _this._klaytnCall.getTransactionCount(tx.from) : tx.nonce,
    ]).then(function(args) {
        if (isNot(args[0]) || isNot(args[1]) || isNot(args[2])) {
            throw new Error(`One of the values "chainId", "gasPrice", or "nonce" couldn't be fetched: ${JSON.stringify(args)}`)
        }
        return signed(
            _.extend(tx, {
                chainId: args[0],
                gasPrice: args[1],
                nonce: args[2],
            })
        )
    })
}

/**
 * feePayerSignTransaction calls signTransaction, creating a format for feePayer to sign the transaction.
 * If there are feePayerSignatures in tx entered as a parameter, the signatures for fee payer are appended.
 *
 * @method feePayerSignTransaction
 * @param {Object|String} tx The transaction to sign.
 * @param {String} feePayer The address of fee payer.
 * @param {String|Array} privateKey The private key to use for signing.
 * @param {Function} callback The callback function to call.
 * @return {Object}
 */
Accounts.prototype.feePayerSignTransaction = function feePayerSignTransaction() {
    const _this = this
    let tx
    let feePayer
    let privateKey
    let callback

    const handleError = e => {
        e = e instanceof Error ? e : new Error(e)
        if (callback) callback(e)
        return Promise.reject(e)
    }

    try {
        const resolved = resolveArgsForFeePayerSignTransaction(arguments)
        tx = resolved.tx
        feePayer = resolved.feePayer
        privateKey = resolved.privateKey
        callback = resolved.callback
    } catch (e) {
        return handleError(e)
    }

    if (_.isString(tx)) {
        return this.signTransaction({ senderRawTransaction: tx, feePayer }, privateKey, callback)
    }

    if (!tx.feePayer || tx.feePayer === '0x') {
        tx.feePayer = feePayer
    }

    if (!tx.senderRawTransaction) {
        if (!tx.type || !tx.type.includes('FEE_DELEGATED')) {
            return handleError(`Failed to sign transaction with fee payer: invalid transaction type(${tx.type ? tx.type : 'LEGACY'})`)
        }
    }

    const e = helpers.validateFunction.validateParams(tx)
    if (e) {
        return handleError(e)
    }

    if (tx.feePayer.toLowerCase() !== feePayer.toLowerCase()) {
        return handleError('Invalid parameter: The address of fee payer does not match.')
    }

    if (tx.senderRawTransaction) {
        return this.signTransaction(tx, privateKey, callback)
    }

    return Promise.all([
        isNot(tx.chainId) ? _this._klaytnCall.getChainId() : tx.chainId,
        isNot(tx.gasPrice) ? _this._klaytnCall.getGasPrice() : tx.gasPrice,
        isNot(tx.nonce) ? _this._klaytnCall.getTransactionCount(tx.from) : tx.nonce,
    ]).then(function(args) {
        if (isNot(args[0]) || isNot(args[1]) || isNot(args[2])) {
            throw new Error(`One of the values "chainId", "gasPrice", or "nonce" couldn't be fetched: ${JSON.stringify(args)}`)
        }
        let transaction = _.extend(tx, {
            chainId: args[0],
            gasPrice: args[1],
            nonce: args[2],
        })

        transaction = helpers.formatters.inputCallFormatter(transaction)
        transaction = coverInitialTxValue(transaction)

        const rlpEncoded = encodeRLPByTxType(transaction)
        const sig = transaction.signatures ? transaction.signatures : [['0x01', '0x', '0x']]
        const { rawTransaction } = makeRawTransaction(rlpEncoded, sig, transaction)

        return _this.signTransaction({ senderRawTransaction: rawTransaction, feePayer }, privateKey, callback)
    })
}

/**
 * getRawTransactionWithSignatures returns object which contains rawTransaction.
 *
 * @method getRawTransactionWithSignatures
 * @param {Object} tx The transaction object which contains signatures or feePayerSignatures.
 * @param {Function} callback The callback function to call.
 * @return {Object}
 */
Accounts.prototype.getRawTransactionWithSignatures = function getRawTransactionWithSignatures(tx, callback) {
    const _this = this
    let result

    callback = callback || function() {}

    const handleError = e => {
        e = e instanceof Error ? e : new Error(e)
        if (callback) callback(e)
        return Promise.reject(e)
    }

    if (!tx || !_.isObject(tx)) {
        return handleError('Invalid parameter: The transaction must be defined as an object')
    }
    if (!tx.signatures && !tx.feePayerSignatures) {
        return handleError('There are no signatures or feePayerSignatures defined in the transaction object.')
    }

    const error = helpers.validateFunction.validateParams(tx)
    if (error) return handleError(error)

    if (tx.senderRawTransaction) {
        tx.feePayerSignatures = tx.feePayerSignatures || [['0x01', '0x', '0x']]

        const decoded = decodeFromRawTransaction(tx.senderRawTransaction)
        // feePayer !== '0x' means that in senderRawTransaction there are feePayerSignatures
        if (decoded.feePayer !== '0x' && !utils.isEmptySig(decoded.feePayerSignatures)) {
            if (decoded.feePayer.toLowerCase() !== tx.feePayer.toLowerCase()) {
                return handleError('Invalid feePayer')
            }
            tx.feePayerSignatures = tx.feePayerSignatures.concat(decoded.feePayerSignatures)
        }

        decoded.feePayer = tx.feePayer
        decoded.feePayerSignatures = tx.feePayerSignatures

        if (tx.signatures) {
            decoded.signatures = decoded.signatures.concat(tx.signatures)
        }
        tx = decoded
    }

    function signed(txObject) {
        try {
            // Guarantee all property in transaction is hex.
            txObject = helpers.formatters.inputCallFormatter(txObject)

            const transaction = coverInitialTxValue(txObject)

            const rlpEncoded = encodeRLPByTxType(transaction)

            let sigs = transaction.signatures ? transaction.signatures : ['0x01', '0x', '0x']

            if (!_.isArray(sigs[0])) sigs = [sigs]

            const { rawTransaction, signatures, feePayerSignatures } = makeRawTransaction(rlpEncoded, sigs, transaction)

            result = {
                rawTransaction,
                txHash: Hash.keccak256(rawTransaction),
                senderTxHash: getSenderTxHash(rawTransaction),
            }

            if (signatures && !utils.isEmptySig(signatures)) {
                result.signatures = signatures
            }

            if (feePayerSignatures && !utils.isEmptySig(feePayerSignatures)) {
                result.feePayerSignatures = feePayerSignatures
            }
        } catch (e) {
            callback(e)
            return Promise.reject(e)
        }

        callback(null, result)
        return result
    }

    if (tx.nonce !== undefined && tx.chainId !== undefined && tx.gasPrice !== undefined) {
        return Promise.resolve(signed(tx))
    }

    // Otherwise, get the missing info from the Klaytn Node
    return Promise.all([
        isNot(tx.chainId) ? _this._klaytnCall.getChainId() : tx.chainId,
        isNot(tx.gasPrice) ? _this._klaytnCall.getGasPrice() : tx.gasPrice,
        isNot(tx.nonce) ? _this._klaytnCall.getTransactionCount(tx.from) : tx.nonce,
    ]).then(function(args) {
        if (isNot(args[0]) || isNot(args[1]) || isNot(args[2])) {
            throw new Error(`One of the values "chainId", "gasPrice", or "nonce" couldn't be fetched: ${JSON.stringify(args)}`)
        }
        return signed(
            _.extend(tx, {
                chainId: args[0],
                gasPrice: args[1],
                nonce: args[2],
            })
        )
    })
}

/**
 * combineSignatures combines RLP encoded raw transaction strings.
 * combineSignatures compares transaction before combining, and if values in field are not same, this throws error.
 * The comparison allows that the address of the fee payer is '0x'(default value) for some transactions while the other transactions have a specific fee payer. This is for the use case that some transactions do not have the fee payer's information.
 * In this case, feePayer field doesn't have to be compared with other transaction.
 *
 * @method combineSignatures
 * @param {Array} rawTransactions The array of raw transaction string to combine.
 * @param {Function} callback The callback function to call.
 * @return {Object}
 */
Accounts.prototype.combineSignatures = function combineSignatures(rawTransactions, callback) {
    let decodedTx
    let senders = []
    let feePayers = []
    let feePayer

    callback = callback || function() {}

    const handleError = e => {
        e = e instanceof Error ? e : new Error(e)
        if (callback) callback(e)
        return Promise.reject(e)
    }

    if (!_.isArray(rawTransactions)) {
        return handleError('The parameter of the combineSignatures function must be an array of RLP encoded transaction strings.')
    }

    for (const raw of rawTransactions) {
        const { senderSignatures, feePayerSignatures, decodedTransaction } = extractSignatures(raw)

        senders = senders.concat(senderSignatures)
        feePayers = feePayers.concat(feePayerSignatures)

        if (decodedTx) {
            let isSame = true
            const keys = Object.keys(decodedTx)
            for (const key of keys) {
                if (
                    key === 'v' ||
                    key === 'r' ||
                    key === 's' ||
                    key === 'signatures' ||
                    key === 'payerV' ||
                    key === 'payerR' ||
                    key === 'payerS' ||
                    key === 'feePayerSignatures'
                ) {
                    continue
                }

                // feePayer field can be '0x' when after sender signs to trasnaction.
                // For handling this, if feePayer is '0x', don't compare with other transaction
                if (key === 'feePayer') {
                    if (decodedTransaction[key] === '0x') {
                        continue
                    } else {
                        // set feePayer letiable with valid feePayer address(not '0x')
                        feePayer = decodedTransaction[key]
                        if (decodedTx[key] === '0x') {
                            // set feePayer field to decodedTx for comparing feePayer address with other transactions
                            decodedTx[key] = decodedTransaction[key]
                        }
                    }
                }

                if (decodedTransaction[key] === undefined || decodedTx[key] !== decodedTransaction[key]) {
                    isSame = false
                    break
                }
            }
            if (!isSame) {
                return handleError('Failed to combineSignatures: Signatures that sign to different transaction cannot be combined.')
            }
        } else {
            decodedTx = decodedTransaction
        }
    }

    const parsedTxObject = decodeFromRawTransaction(rawTransactions[0])
    parsedTxObject.signatures = senders

    if (feePayer) {
        parsedTxObject.feePayer = feePayer
        if (feePayers.length > 0) {
            parsedTxObject.feePayerSignatures = feePayers
        }
    }
    return this.getRawTransactionWithSignatures(parsedTxObject, callback)
}

/**
 * cav.klay.accounts.recoverTransaction('0xf86180808401ef364594f0109fc8df283027b6285cc889f5aa624eac1f5580801ca031573280d608f75137e33fc14655f097867d691d5c4c44ebe5ae186070ac3d5ea0524410802cdc025034daefcdfa08e7d2ee3f0b9d9ae184b2001fe0aff07603d9');
 * > "0xF0109fC8DF283027b6285cc889F5aA624EaC1F55"
 */
Accounts.prototype.recoverTransaction = function recoverTransaction(rawTx) {
    if (utils.getTxTypeStringFromRawTransaction(rawTx) !== undefined) {
        throw new Error('recoverTransaction only supports transactions of type "LEGACY".')
    }

    const values = RLP.decode(rawTx)

    // If the leading zero is trimmed, it will be filled with a valid length of '0'.
    const arr = values.slice(7, 9).map(sig => {
        sig = sig.replace('0x', '')
        while (sig.length < 64) {
            sig = `0${sig}`
        }
        return `0x${sig}`
    })
    arr.unshift(values[6])

    const signature = AccountLib.encodeSignature(arr)
    const recovery = Bytes.toNumber(values[6])
    const extraData = recovery < 35 ? [] : [Bytes.fromNumber((recovery - 35) >> 1), '0x', '0x']
    const signingData = values.slice(0, 6).concat(extraData)
    const signingDataHex = RLP.encode(signingData)

    return AccountLib.recover(Hash.keccak256(signingDataHex), signature)
}

/**
 * Hashes the given message to be passed cav.klay.accounts.recover() function.
 * The data will be UTF-8 HEX decoded and enveloped as follows:
 * "\x19Klaytn Signed Message:\n" + message.length + message and hashed using keccak256.
 *
 * cav.klay.accounts.hashMessage("Hello World")
 * > "0xa1de988600a42c4b4ab089b619297c17d53cffae5d5120d82d8a92d0bb3b78f2"
 * // the below results in the same hash
 * cav.klay.accounts.hashMessage(caver.utils.utf8ToHex("Hello World"))
 * > "0xa1de988600a42c4b4ab089b619297c17d53cffae5d5120d82d8a92d0bb3b78f2"
 */
Accounts.prototype.hashMessage = function hashMessage(data) {
    const message = utils.isHexStrict(data) ? utils.hexToBytes(data) : data
    const messageBuffer = Buffer.from(message)
    const preamble = `\x19Klaytn Signed Message:\n${message.length}`
    const preambleBuffer = Buffer.from(preamble)
    // klayMessage is concatenated buffer (preambleBuffer + messageBuffer)
    const klayMessage = Buffer.concat([preambleBuffer, messageBuffer])
    // Finally, run keccak256 on klayMessage.
    return Hash.keccak256(klayMessage)
}

/**
 * Signs arbitrary data.
 * This data is before UTF-8 HEX decoded and enveloped as follows:
 * "\x19Klaytn Signed Message:\n" + message.length + message.
 *
 * cav.klay.accounts.sign('Some data', '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318');
 * > {
 *     message: 'Some data',
 *     messageHash: '0x1da44b586eb0729ff70a73c326926f6ed5a25f5b056e7f47fbc6e58d86871655',
 *     v: '0x1c',
 *     r: '0xb91467e570a6466aa9e9876cbcd013baba02900b8979d43fe208a4a4f339f5fd',
 *     s: '0x6007e74cd82e037b800186422fc2da167c747ef045e5d18a5f5d4300f8e1a029',
 *     signature: '0xb91467e570a6466aa9e9876cbcd013baba02900b8979d43fe208a4a4f339f5fd6007e74cd82e037b800186422fc2da167c747ef045e5d18a5f5d4300f8e1a0291c'
 *   }
 */
Accounts.prototype.sign = function sign(data, privateKey) {
    const parsed = utils.parsePrivateKey(privateKey)
    privateKey = parsed.privateKey
    if (!utils.isValidPrivateKey(privateKey)) {
        throw new Error('Invalid private key')
    }

    const messageHash = this.hashMessage(data)
    const signature = AccountLib.sign(messageHash, privateKey)
    const [v, r, s] = AccountLib.decodeSignature(signature)
    return {
        message: data,
        messageHash,
        v,
        r,
        s,
        signature,
    }
}

/**
 * preFixed - Boolean (optional, default: false):
 * If the last parameter is true,
 * the given message will NOT automatically be prefixed with "\x19Klaytn Signed Message:\n" + message.length + message,
 * and assumed to be already prefixed.
 */
Accounts.prototype.recover = function recover(message, signature, preFixed) {
    const args = [].slice.apply(arguments)

    if (_.isObject(message)) {
        return this.recover(message.messageHash, AccountLib.encodeSignature([message.v, message.r, message.s]), true)
    }

    if (!preFixed) {
        message = this.hashMessage(message)
    }

    if (args.length >= 4) {
        preFixed = args.slice(-1)[0]
        preFixed = _.isBoolean(preFixed) ? !!preFixed : false

        return this.recover(message, AccountLib.encodeSignature(args.slice(1, 4)), preFixed) // v, r, s
    }
    /**
     * recover in Account module
     * const recover = (hash, signature) => {
     *   const vals = decodeSignature(signature);
     *   const vrs = { v: Bytes.toNumber(vals[0]), r: vals[1].slice(2), s: vals[2].slice(2) };
     *   const ecPublicKey = secp256k1.recoverPubKey(Buffer.from(hash.slice(2), 'hex'), vrs, vrs.v < 2 ? vrs.v : 1 - vrs.v % 2); // because odd vals mean v=0... sadly that means v=0 means v=1... I hate that
     *   const publicKey = "0x" + ecPublicKey.encode('hex', false).slice(2);
     *   const publicHash = keccak256(publicKey);
     *   const address = toChecksum("0x" + publicHash.slice(-40));
     *   return address;
     * };
     */
    return AccountLib.recover(message, signature)
}

// Taken from https://github.com/ethereumjs/ethereumjs-wallet
Accounts.prototype.decrypt = function(v3Keystore, password, nonStrict) {
    if (!_.isString(password)) {
        throw new Error('No password given.')
    }

    const json = _.isObject(v3Keystore) ? v3Keystore : JSON.parse(nonStrict ? v3Keystore.toLowerCase() : v3Keystore)

    if (json.version !== 3 && json.version !== 4) {
        console.warn('This is not a V3 or V4 wallet.')
        // throw new Error('Not a valid V3 wallet');
    }

    if (json.version === 3 && !json.crypto) {
        // crypto field should be existed in keystore version 3
        throw new Error("Invalid keystore V3 format: 'crypto' is not defined.")
    }

    if (json.crypto) {
        if (json.keyring) {
            throw new Error("Invalid key store format: 'crypto' can not be with 'keyring'")
        }
        json.keyring = [json.crypto]
        delete json.crypto
    }

    if (_.isArray(json.keyring[0]) && json.keyring.length > 3) {
        throw new Error('Invalid key store format')
    }

    let accountKey = {}

    // AccountKeyRoleBased format
    if (_.isArray(json.keyring[0])) {
        const transactionKey = decryptKey(json.keyring[0])
        if (transactionKey) accountKey.transactionKey = transactionKey

        const updateKey = decryptKey(json.keyring[1])
        if (updateKey) accountKey.updateKey = updateKey

        const feePayerKey = decryptKey(json.keyring[2])
        if (feePayerKey) accountKey.feePayerKey = feePayerKey
    } else {
        accountKey = decryptKey(json.keyring)
    }

    function decryptKey(encryptedArray) {
        if (!encryptedArray || encryptedArray.length === 0) return undefined

        const decryptedArray = []
        for (const encrypted of encryptedArray) {
            let derivedKey
            let kdfparams
            /**
             * Supported kdf modules are the following:
             * 1) pbkdf2
             * 2) scrypt
             */
            if (encrypted.kdf === 'scrypt') {
                kdfparams = encrypted.kdfparams

                // FIXME: support progress reporting callback
                derivedKey = scrypt(
                    Buffer.from(password),
                    Buffer.from(kdfparams.salt, 'hex'),
                    kdfparams.n,
                    kdfparams.r,
                    kdfparams.p,
                    kdfparams.dklen
                )
            } else if (encrypted.kdf === 'pbkdf2') {
                kdfparams = encrypted.kdfparams

                if (kdfparams.prf !== 'hmac-sha256') {
                    throw new Error('Unsupported parameters to PBKDF2')
                }

                derivedKey = cryp.pbkdf2Sync(
                    Buffer.from(password),
                    Buffer.from(kdfparams.salt, 'hex'),
                    kdfparams.c,
                    kdfparams.dklen,
                    'sha256'
                )
            } else {
                throw new Error('Unsupported key derivation scheme')
            }

            const ciphertext = Buffer.from(encrypted.ciphertext, 'hex')

            const mac = utils.sha3(Buffer.concat([derivedKey.slice(16, 32), ciphertext])).replace('0x', '')
            if (mac !== encrypted.mac) {
                throw new Error('Key derivation failed - possibly wrong password')
            }

            const decipher = cryp.createDecipheriv(encrypted.cipher, derivedKey.slice(0, 16), Buffer.from(encrypted.cipherparams.iv, 'hex'))
            decryptedArray.push(`0x${Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('hex')}`)
        }
        return decryptedArray.length === 1 ? decryptedArray[0] : decryptedArray
    }

    return this.createWithAccountKey(json.address, accountKey)
}

/**
 * cav.klay.accounts.encrypt(privateKey, password);
 * cav.klay.accounts.encrypt('0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318', 'test!')
    > {
        version: 3,
        id: '04e9bcbb-96fa-497b-94d1-14df4cd20af6',
        address: '2c7536e3605d9c16a7a3d7b1898e529396a65c23',
        crypto: {
            ciphertext: 'a1c25da3ecde4e6a24f3697251dd15d6208520efc84ad97397e906e6df24d251',
            cipherparams: { iv: '2885df2b63f7ef247d753c82fa20038a' },
            cipher: 'aes-128-ctr',
            kdf: 'scrypt',
            kdfparams: {
                dklen: 32,
                salt: '4531b3c174cc3ff32a6a7a85d6761b410db674807b2d216d022318ceee50be10',
                n: 262144,
                r: 8,
                p: 1
            },
            mac: 'b8b010fff37f9ae5559a352a185e86f9b9c1d7f7a9f1bd4e82a5dd35468fc7f6'
        }
    }

    `dklen` is the desired length of the derived key
    `salt` - A string of characters that modifies the hash to protect against Rainbow table attacks
    `n` - CPU/memory cost parameter
    `r` - The blocksize parameter, which fine-tunes sequential memory read size and performance. 8 is commonly used.
    `p` - Parallelization parameter
    `c` - the number of iterations desired

    {
      "address":"9e1023dbce2d6304f5011a4db56a8ed7ba271650",
      "crypto":{"cipher":"aes-128-ctr",
      "ciphertext":"0f1158156a26e5135e107522639bb2b549acf159a12097c02fc2d73b97841000",
      "version":3,
      "cipherparams":{"iv":"e15c86e8797c37bffd2ebfa68a532595"},
      "kdf":"scrypt",
      "kdfparams":{
        "dklen":32,
        "n":262144,
        "p":1,
        "r":8,
        "salt":"e7c4605ad8200e0d93cd67f9d82fb9971e1a2763b22362017c2927231c2a733a"
      },
      "mac":"d2ad144ef6060ac01d711d691ff56e11d4deffc85a08de0dde27c28c23959251"},
      "id":"dfde6a32-4b0e-404f-8b9f-2b18f279fe21",
    }
 */
/**
 * encrypt encrypts an account and returns a key store object.
 *
 * @method privateKeyToAccount
 * @param {String} key The key parameter can be either normal private key or KlaytnWalletKey format.
 * @param {String} password The password to be used for account encryption. The encrypted key store can be decrypted with this password.
 * @param {Object} options The options to use when encrypt an account.
 * @return {Object}
 */
Accounts.prototype.encrypt = function(key, password, options) {
    /**
     * options can include below
     * {
     *   salt: ...,
     *   iv: ...,
     *   kdf: ...,
     *   dklen: ...,
     *   c: ...,
     *   n: ...,
     *   r: ...,
     *   p: ...,
     *   cipher: ...,
     *   uuid: ...,
     *   cipher: ...,
     * }
     */
    options = options || {}

    let address
    let account

    if (key instanceof Account) {
        if (options.address && options.address !== key.address) {
            throw new Error('Address in account is not matched with address in options object')
        }
        address = key.address
        account = key
    } else if (_.isString(key)) {
        account = this.privateKeyToAccount(key, options.address)
        address = account.address
    } else {
        if (!options.address) {
            throw new Error('The address must be defined inside the options object.')
        }
        address = options.address
    }

    if (!account) account = this.createWithAccountKey(address, key)

    let keyring
    let transactionKey
    let updateKey
    let feePayerKey

    switch (account.accountKeyType) {
        case AccountKeyEnum.ACCOUNT_KEY_PUBLIC:
        case AccountKeyEnum.ACCOUNT_KEY_MULTISIG:
            keyring = encryptKey(account.keys)
            break
        case AccountKeyEnum.ACCOUNT_KEY_ROLEBASED:
            keyring = []
            transactionKey = encryptKey(account.transactionKey)
            updateKey = encryptKey(account.updateKey)
            feePayerKey = encryptKey(account.feePayerKey)
            keyring.push(transactionKey)
            keyring.push(updateKey)
            keyring.push(feePayerKey)
            for (let i = keyring.length - 1; i >= 0; i--) {
                if (keyring[i].length !== 0) break
                keyring = keyring.slice(0, i)
            }
            break
        default:
            throw new Error(`Unsupported account key type: ${account.accountKeyType}`)
    }

    function encryptKey(privateKey) {
        const encryptedArray = []

        if (!privateKey) return encryptedArray

        const privateKeyArray = _.isArray(privateKey) ? privateKey : [privateKey]

        for (let i = 0; i < privateKeyArray.length; i++) {
            const salt = options.salt || cryp.randomBytes(32)
            const iv = options.iv || cryp.randomBytes(16)

            let derivedKey
            const kdf = options.kdf || 'scrypt'
            const kdfparams = {
                dklen: options.dklen || 32,
                salt: salt.toString('hex'),
            }

            /**
             * Supported kdf modules are the following:
             * 1) pbkdf2
             * 2) scrypt - default
             */
            if (kdf === 'pbkdf2') {
                kdfparams.c = options.c || 262144
                kdfparams.prf = 'hmac-sha256'
                derivedKey = cryp.pbkdf2Sync(Buffer.from(password), salt, kdfparams.c, kdfparams.dklen, 'sha256')
            } else if (kdf === 'scrypt') {
                // FIXME: support progress reporting callback
                kdfparams.n = options.n || 4096 // 2048 4096 8192 16384
                kdfparams.r = options.r || 8
                kdfparams.p = options.p || 1
                derivedKey = scrypt(Buffer.from(password), salt, kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen)
            } else {
                throw new Error('Unsupported kdf')
            }

            const cipher = cryp.createCipheriv(options.cipher || 'aes-128-ctr', derivedKey.slice(0, 16), iv)
            if (!cipher) {
                throw new Error('Unsupported cipher')
            }

            const ciphertext = Buffer.concat([cipher.update(Buffer.from(privateKeyArray[i].replace('0x', ''), 'hex')), cipher.final()])

            const mac = utils.sha3(Buffer.concat([derivedKey.slice(16, 32), Buffer.from(ciphertext, 'hex')])).replace('0x', '')

            encryptedArray.push({
                ciphertext: ciphertext.toString('hex'),
                cipherparams: {
                    iv: iv.toString('hex'),
                },
                cipher: options.cipher || 'aes-128-ctr',
                kdf,
                kdfparams,
                mac: mac.toString('hex'),
            })
        }

        return encryptedArray
    }

    return {
        version: 4,
        id: uuid.v4({ random: options.uuid || cryp.randomBytes(16) }),
        address: account.address.toLowerCase(),
        keyring,
    }
}

Accounts.prototype.privateKeyToPublicKey = function(privateKey, compressed = false) {
    const parsed = utils.parsePrivateKey(privateKey)
    privateKey = parsed.privateKey
    privateKey = privateKey.slice(0, 2) === '0x' ? privateKey.slice(2) : privateKey

    if (privateKey.length !== 64) {
        throw new Error('Received a invalid privateKey. The length of privateKey should be 64.')
    }
    const buffer = Buffer.from(privateKey, 'hex')
    const ecKey = secp256k1.keyFromPrivate(buffer)

    let publicKey

    if (!compressed) {
        publicKey = `0x${ecKey.getPublic(false, 'hex').slice(2)}`
    } else {
        publicKey = `0x${ecKey.getPublic(true, 'hex')}`
    }

    return publicKey
}

Accounts.prototype.encodeRLPByTxType = encodeRLPByTxType

Accounts.prototype.setAccounts = function(accounts) {
    this.wallet.clear()

    for (let i = 0; i < accounts.wallet.length; i++) {
        this.wallet.add(accounts.wallet[i])
    }

    return this
}

/* eslint-enable complexity */

// Note: this is trying to follow closely the specs on

/**
  > Wallet {
      0: {...}, // account by index
      "0xF0109fC8DF283027b6285cc889F5aA624EaC1F55": {...},  // same account by address
      "0xf0109fc8df283027b6285cc889f5aa624eac1f55": {...},  // same account by address lowercase
      1: {...},
      "0xD0122fC8DF283027b6285cc889F5aA624EaC1d23": {...},
      "0xd0122fc8df283027b6285cc889f5aa624eac1d23": {...},

      add: function(){},
      remove: function(){},
      save: function(){},
      load: function(){},
      clear: function(){},

      length: 2,
  }
 *
 * Contains an in memory wallet with multiple accounts.
 * These accounts can be used when using cav.klay.sendTransaction().
 */
function Wallet(accounts) {
    this._accounts = accounts
    this.length = 0
    this.defaultKeyName = 'caverjs_wallet'
}

Wallet.prototype._findSafeIndex = function(pointer) {
    pointer = pointer || 0
    if (_.has(this, pointer)) {
        return this._findSafeIndex(pointer + 1)
    }
    return pointer
}

Wallet.prototype._currentIndexes = function() {
    const keys = Object.keys(this)
    const indexes = keys
        .map(function(key) {
            return parseInt(key)
        })
        .filter(function(n) {
            return n < 9e20
        })

    return indexes
}

Wallet.prototype.create = function(numberOfAccounts, entropy) {
    for (let i = 0; i < numberOfAccounts; ++i) {
        this.add(this._accounts.create(entropy).privateKey)
    }
    return this
}

/**
 * Adds an account using a private key or account object to the wallet.
 *
 * cav.klay.accounts.wallet.add({
    privateKey: '0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709',
    address: '0xb8CE9ab6943e0eCED004cDe8e3bBed6568B2Fa01'
    });
    > {
        index: 0,
        address: '0xb8CE9ab6943e0eCED004cDe8e3bBed6568B2Fa01',
        privateKey: '0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709',
        signTransaction: function(tx){...},
        sign: function(data){...},
        encrypt: function(password){...}
    }
 */
Wallet.prototype.add = function(account, userInputAddress) {
    let accountForWallet
    /**
     * cav.klay.accounts.wallet.add('0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318');
     *
     * cav.klay.accounts.wallet.add({
     *   privateKey: '0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709',
     *   address: '0xb8CE9ab6943e0eCED004cDe8e3bBed6568B2Fa01'
     * });
     */
    if (Account.isAccountKey(account)) {
        if (!userInputAddress) {
            throw new Error('Address is not defined. Address cannot be determined from AccountKey')
        }
        accountForWallet = this._accounts.createWithAccountKey(userInputAddress, account)
    } else if (account instanceof Account) {
        accountForWallet = this._accounts.createWithAccountKey(account.address, account.accountKey)
        accountForWallet.address = userInputAddress || account.address
    } else if (_.isObject(account) && account.address && account.privateKey) {
        accountForWallet = this._accounts.privateKeyToAccount(account.privateKey, userInputAddress || account.address)
    } else if (_.isString(account)) {
        accountForWallet = this._accounts.privateKeyToAccount(account, userInputAddress)
    } else {
        const accountKey = this._accounts.createAccountKey(account)
        if (!userInputAddress) {
            throw new Error('Address is not defined. Address cannot be determined from AccountKey format')
        }
        accountForWallet = this._accounts.createWithAccountKey(userInputAddress, accountKey)
    }

    if (this[accountForWallet.address]) {
        throw new Error(`Account exists with ${accountForWallet.address}`)
    }

    accountForWallet.index = this._findSafeIndex()
    this[accountForWallet.index] = accountForWallet

    this[accountForWallet.address] = accountForWallet
    this[accountForWallet.address.toLowerCase()] = accountForWallet
    this[accountForWallet.address.toUpperCase()] = accountForWallet
    try {
        this[utils.toChecksumAddress(accountForWallet.address)] = accountForWallet
    } catch (e) {}

    this.length++

    return accountForWallet
}

Wallet.prototype.updatePrivateKey = function(privateKey, address) {
    if (privateKey === undefined || address === undefined) {
        throw new Error('To update the privatKey in wallet, need to set both privateKey and address.')
    }

    // If privateKey parameter is not string type, return error
    if (!_.isString(privateKey)) {
        throw new Error('The private key used for the update is not a valid string.')
    }

    if (!utils.isAddress(address)) {
        throw new Error(`Invalid address : ${address}`)
    }

    // If failed to find account through address, return error
    const accountExists = !!this[address]
    if (!accountExists) throw new Error(`Failed to find account with ${address}`)

    const account = this[address]

    if (account.accountKeyType !== AccountKeyEnum.ACCOUNT_KEY_PUBLIC) {
        throw new Error(
            'Account using AccountKeyMultiSig or AccountKeyRoleBased must be updated using the caver.klay.accounts.updateAccountKey function.'
        )
    }

    const parsed = utils.parsePrivateKey(privateKey)
    if (!utils.isValidPrivateKey(parsed.privateKey)) {
        throw new Error('Invalid private key')
    }

    if (parsed.address && parsed.address !== account.address) {
        throw new Error('The address extracted from the private key does not match the address received as the input value.')
    }

    const newAccountKeyPublic = new AccountKeyPublic(parsed.privateKey)
    this[account.index].accountKey = newAccountKeyPublic
    this[account.address].accountKey = newAccountKeyPublic
    this[account.address.toLowerCase()].accountKey = newAccountKeyPublic
    this[account.address.toUpperCase()].accountKey = newAccountKeyPublic

    try {
        this[utils.toChecksumAddress(account.address)].accountKey = newAccountKeyPublic
    } catch (e) {}

    return account
}

Wallet.prototype.updateAccountKey = function updateAccountKey(address, accountKey) {
    if (address === undefined || accountKey === undefined) {
        throw new Error('To update the accountKey in wallet, need to set both address and accountKey.')
    }

    if (!Account.isAccountKey(accountKey)) {
        accountKey = this._accounts.createAccountKey(accountKey)
    }

    if (!utils.isAddress(address)) {
        throw new Error(`Invalid address : ${address}`)
    }

    // If failed to find account through address, return error
    const accountExists = !!this[address]
    if (!accountExists) throw new Error(`Failed to find account with ${address}`)

    const account = this[address]

    this[account.index].accountKey = accountKey
    this[account.address].accountKey = accountKey
    this[account.address.toLowerCase()].accountKey = accountKey
    this[account.address.toUpperCase()].accountKey = accountKey

    try {
        this[utils.toChecksumAddress(account.address)].accountKey = accountKey
    } catch (e) {}

    return account
}

Wallet.prototype.remove = function(addressOrIndex) {
    const account = this[addressOrIndex]

    if (account && account.address) {
        // address
        this[account.address].accountKey = null
        delete this[account.address]

        if (this[account.address.toLowerCase()]) {
            // address lowercase
            this[account.address.toLowerCase()].accountKey = null
            delete this[account.address.toLowerCase()]
        }

        if (this[account.address.toUpperCase()]) {
            // address uppercase
            this[account.address.toUpperCase()].accountKey = null
            delete this[account.address.toUpperCase()]
        }

        try {
            this[utils.toChecksumAddress(account.address)].accountKey = null
            delete this[utils.toChecksumAddress(account.address)]
        } catch (e) {}

        // index
        this[account.index].accountKey = null
        delete this[account.index]

        this.length--

        return true
    }
    return false
}

Wallet.prototype.clear = function() {
    const _this = this
    const indexes = this._currentIndexes()

    indexes.forEach(function(index) {
        _this.remove(index)
    })

    return this
}

/**
 * cav.klay.accounts.wallet.encrypt('test');
    > [ { version: 3,
        id: 'dcf8ab05-a314-4e37-b972-bf9b86f91372',
        address: '06f702337909c06c82b09b7a22f0a2f0855d1f68',
        crypto:
         { ciphertext: '0de804dc63940820f6b3334e5a4bfc8214e27fb30bb7e9b7b74b25cd7eb5c604',
           cipherparams: [Object],
           cipher: 'aes-128-ctr',
           kdf: 'scrypt',
           kdfparams: [Object],
           mac: 'b2aac1485bd6ee1928665642bf8eae9ddfbc039c3a673658933d320bac6952e3' } },
      { version: 3,
        id: '9e1c7d24-b919-4428-b10e-0f3ef79f7cf0',
        address: 'b5d89661b59a9af0b34f58d19138baa2de48baaf',
        crypto:
         { ciphertext: 'd705ebed2a136d9e4db7e5ae70ed1f69d6a57370d5fbe06281eb07615f404410',
           cipherparams: [Object],
           cipher: 'aes-128-ctr',
           kdf: 'scrypt',
           kdfparams: [Object],
           mac: 'af9eca5eb01b0f70e909f824f0e7cdb90c350a802f04a9f6afe056602b92272b' } }
    ]
 */
Wallet.prototype.encrypt = function(password, options) {
    const _this = this
    const indexes = this._currentIndexes()

    const accounts = indexes.map(function(index) {
        return _this[index].encrypt(password, options)
    })

    return accounts
}

/**
 * cav.klay.accounts.wallet.decrypt([
    { version: 3,
    id: '83191a81-aaca-451f-b63d-0c5f3b849289',
    address: '06f702337909c06c82b09b7a22f0a2f0855d1f68',
    crypto:
     { ciphertext: '7d34deae112841fba86e3e6cf08f5398dda323a8e4d29332621534e2c4069e8d',
       cipherparams: { iv: '497f4d26997a84d570778eae874b2333' },
       cipher: 'aes-128-ctr',
       kdf: 'scrypt',
       kdfparams:
        { dklen: 32,
          salt: '208dd732a27aa4803bb760228dff18515d5313fd085bbce60594a3919ae2d88d',
          n: 262144,
          r: 8,
          p: 1 },
       mac: '0062a853de302513c57bfe3108ab493733034bf3cb313326f42cf26ea2619cf9' } },
     { version: 3,
    id: '7d6b91fa-3611-407b-b16b-396efb28f97e',
    address: 'b5d89661b59a9af0b34f58d19138baa2de48baaf',
    crypto:
     { ciphertext: 'cb9712d1982ff89f571fa5dbef447f14b7e5f142232bd2a913aac833730eeb43',
       cipherparams: { iv: '8cccb91cb84e435437f7282ec2ffd2db' },
       cipher: 'aes-128-ctr',
       kdf: 'scrypt',
       kdfparams:
        { dklen: 32,
          salt: '08ba6736363c5586434cd5b895e6fe41ea7db4785bd9b901dedce77a1514e8b8',
          n: 262144,
          r: 8,
          p: 1 },
       mac: 'd2eb068b37e2df55f56fa97a2bf4f55e072bef0dd703bfd917717d9dc54510f0' } }
  ], 'test');
  > Wallet {
      0: {...},
      1: {...},
      "0xF0109fC8DF283027b6285cc889F5aA624EaC1F55": {...},
      "0xD0122fC8DF283027b6285cc889F5aA624EaC1d23": {...}
      ...
  }
 */
Wallet.prototype.decrypt = function(encryptedWallet, password) {
    const _this = this

    encryptedWallet.forEach(function(keystore) {
        const account = _this._accounts.decrypt(keystore, password)

        if (!account) {
            throw new Error("Couldn't decrypt the keystore. Maybe wrong password?")
        }

        const exist = !!_this[account.address]
        if (!exist) {
            _this.add(account)
        }
    })

    return this
}

Wallet.prototype.save = function(password, keyName) {
    /* eslint-disable-next-line no-undef */
    localStorage.setItem(keyName || this.defaultKeyName, JSON.stringify(this.encrypt(password)))

    return true
}

/**
 * cav.klay.accounts.wallet.load('test#!$', 'myWalletKey' || 'web3js_wallet');
    > Wallet {
        0: {...},
        1: {...},
        "0xF0109fC8DF283027b6285cc889F5aA624EaC1F55": {...},
        "0xD0122fC8DF283027b6285cc889F5aA624EaC1d23": {...}
        ...
    }
 */
Wallet.prototype.load = function(password, keyName) {
    /* eslint-disable-next-line no-undef */
    let keystore = localStorage.getItem(keyName || this.defaultKeyName)

    if (keystore) {
        try {
            keystore = JSON.parse(keystore)
        } catch (e) {}
    }

    return this.decrypt(keystore || [], password)
}

if (typeof localStorage === 'undefined') {
    delete Wallet.prototype.save
    delete Wallet.prototype.load
}

Wallet.prototype.getKlaytnWalletKey = function(addressOrIndex) {
    const account = this[addressOrIndex]
    if (!account) throw new Error('Failed to find account')

    return genKlaytnWalletKeyStringFromAccount(account)
}

Wallet.prototype.getAccount = function(input) {
    if (_.isNumber(input)) {
        if (this.length <= input) {
            throw new Error(`The index(${input}) is out of range(Wallet length : ${this.length}).`)
        }
        return this[input]
    }

    if (!_.isString(input)) {
        throw new Error(`Accounts in the Wallet can be searched by only index or address. :${input}`)
    }

    if (!utils.isAddress(input)) {
        throw new Error(`Failed to getAccount from Wallet: invalid address(${input})`)
    }

    return this[input.toLowerCase()]
}

function genKlaytnWalletKeyStringFromAccount(account) {
    let addressString = account.address
    let { privateKey } = account

    privateKey = privateKey.slice(0, 2) === '0x' ? privateKey : `0x${privateKey}`
    addressString = addressString.slice(0, 2) === '0x' ? addressString : `0x${addressString}`

    return `${privateKey}0x00${addressString}`
}

module.exports = Accounts
