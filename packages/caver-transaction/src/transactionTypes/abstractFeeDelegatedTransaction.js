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
const RLP = require('eth-lib/lib/rlp')
const Hash = require('eth-lib/lib/hash')
const Bytes = require('eth-lib/lib/bytes')
const TransactionHasher = require('../transactionHasher/transactionHasher')
const AbstractTransaction = require('./abstractTransaction')
const { refineSignatures, typeDetectionFromRLPEncoding } = require('../transactionHelper/transactionHelper')
const Keyring = require('../../../caver-wallet/src/keyring/keyringFactory')
const AbstractKeyring = require('../../../caver-wallet/src/keyring/abstractKeyring')
const { KEY_ROLE } = require('../../../caver-wallet/src/keyring/keyringHelper')
const utils = require('../../../caver-utils/src')
const SignatureData = require('../../../caver-wallet/src/keyring/signatureData')

/**
 * Abstract class that implements common logic for each fee delegated transaction type.
 * @class
 */
class AbstractFeeDelegatedTransaction extends AbstractTransaction {
    /**
     * Abstract class that implements common logic for each fee-delegated transaction type.
     * In this constructor, feePayer and feePayerSignatures are set as transaction member variables.
     *
     * @constructor
     * @param {string} typeString - The type string of transaction.
     * @param {object} createTxObj - The parameters to create an instance of transaction.
     */
    constructor(typeString, createTxObj) {
        super(typeString, createTxObj)
        this.feePayer = createTxObj.feePayer
        this.feePayerSignatures = createTxObj.feePayerSignatures || []
    }

    /**
     * @type {string}
     */
    get feePayer() {
        return this._feePayer
    }

    set feePayer(f) {
        if (f === undefined) f = '0x'
        if (f !== '0x' && !utils.isAddress(f)) throw new Error(`Invalid address of fee payer: ${f}`)

        this._feePayer = f.toLowerCase()
    }

    /**
     * @type {Array.<Array.<string>>}
     */
    get feePayerSignatures() {
        return this._feePayerSignatures
    }

    set feePayerSignatures(sigs) {
        this._feePayerSignatures = refineSignatures(sigs)
    }

    /**
     * Signs to the transaction with private key(s) in `key` as a fee payer.
     * @async
     * @param {Keyring|string} key - The instance of Keyring, private key string or KlaytnWalletKey string.
     * @param {number} [index] - The index of private key to use. If index is undefined, all private keys in keyring will be used.
     * @param {function} [hasher] - The function to get the transaction hash.
     * @return {Transaction}
     */
    async signAsFeePayer(key, index, hasher = TransactionHasher.getHashForFeePayerSignature) {
        // User parameter input cases
        // (key) / (key index) / (key hasher) / (key index hasher)
        if (_.isFunction(index)) {
            hasher = index
            index = undefined
        }

        let keyring = key
        if (_.isString(key)) {
            keyring = Keyring.createFromPrivateKey(key)
        }
        if (!(keyring instanceof AbstractKeyring))
            throw new Error(
                `Unsupported key type. The key parameter of the signAsFeePayer must be a single private key string, KlaytnWalletKey string, or Keyring instance.`
            )

        if (!this.feePayer || this.feePayer === '0x') this.feePayer = keyring.address
        if (this.feePayer.toLowerCase() !== keyring.address.toLowerCase())
            throw new Error(`The feePayer address of the transaction is different with the address of the keyring to use.`)

        await this.fillTransaction()
        const hash = hasher(this)
        const sig = keyring.sign(hash, this.chainId, KEY_ROLE.roleFeePayerKey, index)

        this.appendFeePayerSignatures(sig)

        return this
    }

    /**
     * Appends feePayerSignatures to the transaction.
     *
     * @param {SignatureData|Array.<SignatureData>|Array.<string>|Array.<Array.<string>>} signatures - An array of feePayerSignatures to append to the transaction.
     *                                                      One feePayerSignature can be defined in the form of a one-dimensional array or two-dimensional array,
     *                                                      and more than one feePayerSignatures should be defined in the form of a two-dimensional array.
     */
    appendFeePayerSignatures(signatures) {
        let sig = signatures
        if (_.isString(sig)) sig = utils.resolveSignature(sig)
        if (sig instanceof SignatureData) sig = [sig]

        if (!_.isArray(sig)) throw new Error(`Failed to append signatures: invalid signatures format ${sig}`)

        if (_.isString(sig[0])) sig = [sig]

        this.feePayerSignatures = this.feePayerSignatures.concat(sig)
    }

    /**
     * Combines RLP-encoded transactions (rawTransaction) to the transaction from RLP-encoded transaction strings and returns a single transaction with all signatures combined.
     * When combining the signatures into a transaction instance,
     * an error is thrown if the decoded transaction contains different value except signatures.
     *
     * @param {Array.<string>} rlpEncodedTxs - An array of RLP-encoded transaction strings.
     * @return {string}
     */
    combineSignedRawTransactions(rlpEncodedTxs) {
        if (!_.isArray(rlpEncodedTxs)) throw new Error(`The parameter must be an array of RLP encoded transaction strings.`)

        // If the signatures are empty, there may be an undefined member variable.
        // In this case, the empty information is filled with the decoded result.
        let fillVariables = false
        if (utils.isEmptySig(this.signatures) || utils.isEmptySig(this.feePayerSignatures)) fillVariables = true

        for (const encoded of rlpEncodedTxs) {
            const type = typeDetectionFromRLPEncoding(encoded)
            if (this.type !== type) throw new Error(`Transaction type mismatch: Signatures from different transactions cannot be combined.`)

            const decoded = this.constructor.decode(encoded)

            // Signatures can only be combined for the same transaction.
            // Therefore, compare whether the decoded transaction is the same as this.
            for (const k in decoded) {
                if (k === '_signatures' || k === '_feePayerSignatures') continue
                if (k === '_feePayer') {
                    if ((decoded[k] !== '0x' || this[k] === '0x') && fillVariables) this[k] = decoded[k]
                    if (decoded[k] === '0x') continue
                }

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
            this.appendFeePayerSignatures(decoded.feePayerSignatures)
        }

        return this.getRLPEncoding()
    }

    /**
     * Returns a senderTxHash of transaction
     *
     * @return {string}
     */
    getSenderTxHash() {
        const rlpEncoded = this.getRLPEncoding()
        const type = rlpEncoded.slice(0, 4)
        const typeDetached = `0x${rlpEncoded.slice(4)}`

        const data = RLP.decode(typeDetached)

        return Hash.keccak256(type + RLP.encode(data.slice(0, data.length - 2)).slice(2))
    }

    /**
     * Returns an RLP-encoded transaction string for making signature as a fee payer
     *
     * @return {string}
     */
    getRLPEncodingForFeePayerSignature() {
        return RLP.encode([this.getCommonRLPEncodingForSignature(), this.feePayer, Bytes.fromNat(this.chainId), '0x', '0x'])
    }
}

module.exports = AbstractFeeDelegatedTransaction
