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
const Bytes = require('eth-lib/lib/bytes')
const RLP = require('eth-lib/lib/rlp')
const Hash = require('eth-lib/lib/hash')
const TransactionHasher = require('../transactionHasher/transactionHasher')
const utils = require('../../../caver-utils')
const Keyring = require('../../../caver-wallet/src/keyring/keyring')
const {
    TX_TYPE_STRING,
    TX_TYPE_TAG,
    refineSignatures,
    typeDetectionFromRLPEncoding,
    isValidNumber,
} = require('../transactionHelper/transactionHelper')
const { KEY_ROLE } = require('../../../caver-wallet/src/keyring/keyringHelper')
const { validateParams } = require('../../../caver-core-helpers/src/validateFunction')

/**
 * Abstract class that implements common logic for each transaction type.
 * @class
 */
class AbstractTransaction {
    /**
     * Abstract class that implements common logic for each transaction type.
     * In this constructor, type, tag, nonce, gasPrice, chainId, gas and signatures are set as transaction member variables.
     *
     * @constructor
     * @param {string} typeString - The type string of transaction.
     * @param {object} createTxObj - The parameters to create a transaction instance.
     */
    constructor(typeString, createTxObj) {
        this.type = typeString
        this.tag = TX_TYPE_TAG[typeString]

        createTxObj.type = typeString

        const err = validateParams(createTxObj)
        if (err) throw err

        this.gas = createTxObj.gas

        // The variables below are values that the user does not need to pass to the parameter.
        if (createTxObj.nonce !== undefined) this.nonce = createTxObj.nonce
        if (createTxObj.gasPrice !== undefined) this.gasPrice = createTxObj.gasPrice
        if (createTxObj.chainId !== undefined) this.chainId = createTxObj.chainId

        this.signatures = createTxObj.signatures || []
    }

    /**
     * @type {string}
     */
    get type() {
        return this._type
    }

    set type(t) {
        if (TX_TYPE_STRING[t] === undefined) throw new Error(`Invalid transaction type ${t}. Please refer 'caver.transaction.type'.`)
        this._type = t
    }

    /**
     * @type {string}
     */
    get tag() {
        return this._tag
    }

    set tag(t) {
        if (TX_TYPE_TAG[t] === undefined) throw new Error(`Invalid transaction tag ${t}. Please refer 'caver.transaction.tag'.`)
        this._tag = t
    }

    /**
     * @type {string}
     */
    get nonce() {
        return this._nonce
    }

    set nonce(n) {
        if (!isValidNumber(n)) throw new Error(`Invalid nonce ${n}`)
        this._nonce = utils.toHex(n)
    }

    /**
     * @type {string}
     */
    get gas() {
        return this._gas
    }

    set gas(g) {
        if (!isValidNumber(g)) throw new Error(`Invalid gas ${g}`)
        this._gas = utils.toHex(g)
    }

    /**
     * @type {string}
     */
    get gasPrice() {
        return this._gasPrice
    }

    set gasPrice(g) {
        if (!isValidNumber(g)) throw new Error(`Invalid gasPrice ${g}`)
        this._gasPrice = utils.toHex(g)
    }

    /**
     * @type {string}
     */
    get chainId() {
        return this._chainId
    }

    set chainId(ch) {
        this._chainId = utils.toHex(ch)
    }

    /**
     * @type {Array<string>|Array.<Array<string>>}
     */
    get signatures() {
        return this._signatures
    }

    set signatures(sigs) {
        this._signatures = refineSignatures(sigs, this.type === TX_TYPE_STRING.TxTypeLegacyTransaction)
    }

    /**
     * Signs to the transaction with a single private key in the `key`.
     * @async
     * @param {Keyring|string} key - The instance of Keyring, private key string or KlaytnWalletKey string.
     * @param {number} [index] - The index of private key to use.
     * @param {function} [hasher] - The function to get hash of transaction. In order to use a custom hasher, the index must be defined.
     * @return {Transaction}
     */
    async signWithKey(key, index = 0, hasher = TransactionHasher.getHashForSigning) {
        // User parameter input cases
        // (key) / (key index) / (key index hasher)
        if (_.isFunction(index)) throw new Error(`In order to pass a custom hasher, use the third parameter.`)

        let keyring = key
        if (_.isString(key)) {
            keyring = Keyring.createFromPrivateKey(key)
        }
        if (!(keyring instanceof Keyring))
            throw new Error(
                `Unsupported key type. The key must be a single private key string, KlaytnWalletKey string, or Keyring instance.`
            )

        // When user attempt to sign with a updated keyring into a TxTypeLegacyTransaction error should be thrown.
        if (this.type === TX_TYPE_STRING.TxTypeLegacyTransaction && keyring.isDecoupled())
            throw new Error(`A legacy transaction cannot be signed with a decoupled keyring.`)

        if (!this.from || this.from === '0x') this.from = keyring.address
        if (this.from.toLowerCase() !== keyring.address.toLowerCase())
            throw new Error(`The from address of the transaction is different with the address of the keyring to use.`)

        await this.fillTransaction()
        const hash = hasher(this)
        const role = this.type.includes('ACCOUNT_UPDATE') ? KEY_ROLE.ROLE_ACCOUNT_UPDATE_KEY : KEY_ROLE.ROLE_TRANSACTION_KEY

        const sig = keyring.signWithKey(hash, this.chainId, role, index)

        this.appendSignatures(sig)

        return this
    }

    /**
     * Signs to the transaction using all private keys in `key`.
     *
     * @async
     * @param {Keyring|string} key - The instance of Keyring, private key string or KlaytnWalletKey string.
     * @param {function} [hasher] - The function to get the transaction hash.
     * @return {Transaction}
     */
    async signWithKeys(key, hasher = TransactionHasher.getHashForSigning) {
        let keyring = key
        if (_.isString(key)) keyring = Keyring.createFromPrivateKey(key)
        if (!(keyring instanceof Keyring))
            throw new Error(
                `Unsupported key type. The key must be a single private key string, KlaytnWalletKey string, or Keyring instance.`
            )

        // When a user attempts to sign with an updated keyring into a TxTypeLegacyTransaction, an error should be thrown.
        if (this.type === TX_TYPE_STRING.TxTypeLegacyTransaction && keyring.isDecoupled())
            throw new Error(`A legacy transaction cannot be signed with a decoupled keyring.`)

        if (!this.from || this.from === '0x') this.from = keyring.address
        if (this.from.toLowerCase() !== keyring.address.toLowerCase())
            throw new Error(`The from address of the transaction is different with the address of the keyring to use.`)

        await this.fillTransaction()
        const hash = hasher(this)
        const role = this.type.includes('ACCOUNT_UPDATE') ? KEY_ROLE.ROLE_ACCOUNT_UPDATE_KEY : KEY_ROLE.ROLE_TRANSACTION_KEY

        const sigs = keyring.signWithKeys(hash, this.chainId, role)

        this.appendSignatures(sigs)

        return this
    }

    /**
     * Appends signatures to the transaction.
     *
     * @param {Array.<string>|Array.<Array.<string>>} sig - An array of signatures to append to the transaction.
     *                                                      One signature can be defined in the form of a one-dimensional array or two-dimensional array,
     *                                                      and more than one signatures should be defined in the form of a two-dimensional array.
     */
    appendSignatures(sig) {
        if (!_.isArray(sig[0])) sig = [sig]
        this.signatures = this.signatures.concat(sig)
    }

    /**
     * Combines signatures to the transaction from RLP-encoded transaction strings and returns a single transaction with all signatures combined.
     * When combining the signatures into a transaction instance,
     * an error is thrown if the decoded transaction contains different value except signatures.
     *
     * @param {Array.<string>} rlpEncodedTxs - An array of RLP-encoded transaction strings.
     * @return {string}
     */
    combineSignatures(rlpEncodedTxs) {
        if (!_.isArray(rlpEncodedTxs)) throw new Error(`The parameter must be an array of RLP-encoded transaction strings.`)

        // If the signatures are empty, there may be an undefined member variable.
        // In this case, the empty information is filled with the decoded result.
        let fillVariables = false
        if (this.signatures.length === 0) fillVariables = true

        for (const encoded of rlpEncodedTxs) {
            const type = typeDetectionFromRLPEncoding(encoded)
            if (this.type !== type) throw new Error(`Transaction type mismatch: Signatures from different transactions cannot be combined.`)

            const decoded = this.constructor.decode(encoded)

            // Signatures can only be combined for the same transaction.
            // Therefore, compare whether the decoded transaction is the same as this.
            for (const k in decoded) {
                if (k === '_signatures' || k === '_feePayerSignatures') continue
                if (this[k] === undefined && fillVariables) this[k] = decoded[k]

                const differentTxError = `Transactions containing different information cannot be combined.`

                // Compare with the RLP-encoded accountKey string, because 'account' is an object.
                if (k === '_account') {
                    if (this[k].getRLPEncodingAccountKey() !== decoded[k].getRLPEncodingAccountKey()) throw new Error(differentTxError)
                    continue
                }

                if (this[k] !== decoded[k]) throw new Error(differentTxError)
            }

            this.appendSignatures(decoded.signatures)
        }

        return this.getRLPEncoding()
    }

    /**
     * Returns RawTransaction(RLP-encoded transaction string)
     *
     * @return {string}
     */
    getRawTransaction() {
        return this.getRLPEncoding()
    }

    /**
     * Returns a hash string of transaction
     *
     * @return {string}
     */
    getTransactionHash() {
        return Hash.keccak256(this.getRLPEncoding())
    }

    /**
     * Returns a senderTxHash of transaction
     *
     * @return {string}
     */
    getSenderTxHash() {
        return this.getTransactionHash()
    }

    /**
     * Returns an RLP-encoded transaction string for signing
     *
     * @return {string}
     */
    getRLPEncodingForSigning() {
        if (this.gasPrice === undefined) throw new Error(`gasPrice is undefined. Use 'transaction.fillTransaction' to fill values.`)
        if (this.nonce === undefined) throw new Error(`nonce is undefined. Use 'transaction.fillTransaction' to fill values.`)
        if (this.chainId === undefined) throw new Error(`chainId is undefined. Use 'transaction.fillTransaction' to fill values.`)

        return RLP.encode([this.getCommonRLPForSigning(), Bytes.fromNat(this.chainId || '0x1'), '0x', '0x'])
    }

    /**
     * Fills empty optional transaction properties(gasPrice, nonce, chainId).
     */
    async fillTransaction() {
        const [chainId, gasPrice, nonce] = await Promise.all([
            isNot(this.chainId) ? AbstractTransaction._klaytnCall.getChainId() : this.chainId,
            isNot(this.gasPrice) ? AbstractTransaction._klaytnCall.getGasPrice() : this.gasPrice,
            isNot(this.nonce) ? AbstractTransaction._klaytnCall.getTransactionCount(this.from, 'pending') : this.nonce,
        ])

        this.chainId = chainId
        this.gasPrice = gasPrice
        this.nonce = nonce
    }
}

const isNot = function(value) {
    return _.isUndefined(value) || _.isNull(value)
}

module.exports = AbstractTransaction
