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
const SingleKeyring = require('../../../caver-wallet/src/keyring/singleKeyring')
const MultipleKeyring = require('../../../caver-wallet/src/keyring/multipleKeyring')
const RoleBasedKeyring = require('../../../caver-wallet/src/keyring/roleBasedKeyring')
const { KEY_ROLE } = require('../../../caver-wallet/src/keyring/keyringHelper')
const utils = require('../../../caver-utils/src')
const SignatureData = require('../../../caver-wallet/src/keyring/signatureData')

/**
 * Abstract class that implements common logic for each fee delegated transaction type.
 * @class
 * @hideconstructor
 * @abstract
 * @augments AbstractTransaction
 */
class AbstractFeeDelegatedTransaction extends AbstractTransaction {
    /**
     * Abstract class that implements common logic for each fee-delegated transaction type.
     * In this constructor, feePayer and feePayerSignatures are set as transaction member variables.
     *
     * @constructor
     * @param {string} typeString - The type string of transaction.
     * @param {object} createTxObj - The parameters to create an instance of transaction.
     * @param {object} [klaytnCall] - An object includes klay rpc calls.
     */
    constructor(typeString, createTxObj, klaytnCall) {
        super(typeString, createTxObj, klaytnCall)
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
        if (!f || f === '0x') f = '0x0000000000000000000000000000000000000000'
        if (!utils.isAddress(f)) throw new Error(`Invalid address of fee payer: ${f}`)

        this._feePayer = f.toLowerCase()
    }

    /**
     * @type {Array.<Array.<string>>}
     */
    get feePayerSignatures() {
        return this._feePayerSignatures
    }

    set feePayerSignatures(sigs) {
        this._feePayerSignatures = refineSignatures(sigs, this.type)
    }

    /**
     * Signs the transaction as a transaction fee payer with the private key(s) in the `keyring` and appends `feePayerSignatures` in the transaction object.
     *
     * This will use "roleFeePayerKey" in {@link RoleBasedKeyring}.
     * If the user has not defined an `index`, `transaction.signAsFeePayer` signs the transaction using "all the private keys" used by the role.
     * If `index` is defined, the `transaction.signAsFeePayer` signs the transaction using "only one private key" at the given index.
     *
     * @example
     * const feePayer = caver.wallet.keyring.create('0x{address in hex}', '0x{private key}')
     * const signedTx = await tx.signAsFeePayer(feePayer)
     *
     * const keyring = caver.wallet.keyring.create('0x{address in hex}', [['0x{private key}'], ['0x{private key}', '0x{private key}'], ['0x{private key}']]) // The third `roleFeePayerKey` will be used.
     * const signedTx = await tx.signAsFeePayer(feePayer, 1) // sign the transaction with index. If omitted, sign with all private keys.
     *
     * @param {KeyringContainer.Keyring|string} key - A private key string ({@link https://docs.klaytn.com/klaytn/design/accounts#klaytn-wallet-key-format|KlaytnWalletKey} format is also allowed) or an instance of {@link KeyringContainer.Keyring|Keyring}. If a private key string or a KlaytnWalletKey is passed as a parameter, the keyring instance is created internally.
     * @param {number} [index] - The index of the private key you want to use. The index must be less than the length of the array of the private keys defined for each role. If an index is not defined, this method will use all the private keys.
     * @param {function} [hasher] - The hash function to get the hash of the transaction.
     * @return {module:Transaction.FeeDelegatedTransaction} An instance of signed fee delegated Transaction. The `feePayerSignatures` is appended to the `transaction.feePayerSignatures`.
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
        if (!(keyring instanceof SingleKeyring) && !(keyring instanceof MultipleKeyring) && !(keyring instanceof RoleBasedKeyring))
            throw new Error(
                `Unsupported key type. The key parameter of the signAsFeePayer must be a single private key string, KlaytnWalletKey string, or Keyring instance.`
            )

        if (!this.feePayer || this.feePayer === '0x' || this.feePayer === '0x0000000000000000000000000000000000000000')
            this.feePayer = keyring.address
        if (this.feePayer.toLowerCase() !== keyring.address.toLowerCase())
            throw new Error(`The feePayer address of the transaction is different with the address of the keyring to use.`)

        await this.fillTransaction()
        const hash = hasher(this)
        const sig = keyring.sign(hash, this.chainId, KEY_ROLE.roleFeePayerKey, index)

        this.appendFeePayerSignatures(sig)

        return this
    }

    /**
     * Appends `feePayerSignatures` to the transaction.
     *
     * @example
     * tx.appendFeePayerSignatures([ '0x0fea', '0xade94...', '0x38160...' ])
     *
     * const sig = [[ '0x0fea', '0xade94...', '0x38160...' ], [ '0x0fea', '0xbde66...', '0x546eb...' ]]
     * tx.appendFeePayerSignatures(sig)
     *
     * @param {SignatureData|Array.<SignatureData>|Array.<string>|Array.<Array.<string>>} signatures - The `feePayerSignatures` to be appended to the transaction. {@link SignatureData} instance or an array containing {@link SignatureData} instances.
     *                                                                                                 An array in which each 'v', 'r', and 's' are sequentially defined as string formats or a 2D array containing those arrays can also be taken as parameters.
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
     * Collects signs in each RLP-encoded transaction string in the given array, combines them with the transaction instance, and returns a RLP-encoded transaction string which includes all signs.
     *
     * Note that the transaction instance doesn't necessarily be signed in advance.
     * The `feePayerSignatures` is also merged and included in the output RLP-encoded transaction string.
     *
     * When combining the signatures into a transaction instance, an error is thrown if the decoded transaction contains different value except signatures.
     *
     * @example
     * const combined = tx.combineSignedRawTransactions(['0x09f88...'])
     *
     * @param {Array.<string>} rlpEncodedTxs - An array of signed RLP-encoded transaction strings.
     * @return {string} A RLP-encoded transaction string which includes all `signatures` and `feePayerSignatures`.
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
                if (k === '_klaytnCall' || k === '_signatures' || k === '_feePayerSignatures') continue
                if (k === '_feePayer') {
                    const emtpyAddress = '0x0000000000000000000000000000000000000000'
                    if (
                        ((decoded[k] !== '0x' && decoded[k] !== emtpyAddress) || (this[k] === '0x' || this[k] === emtpyAddress)) &&
                        fillVariables
                    )
                        this[k] = decoded[k]
                    if (decoded[k] === '0x' || decoded[k] === emtpyAddress) continue
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
     * Returns a {@link https://docs.klaytn.com/klaytn/design/transactions#sendertxhash|senderTxHash} of transaction.
     * The {@link https://docs.klaytn.com/klaytn/design/transactions#sendertxhash|senderTxHash} is a hash of the transaction except for the fee payer's address and signature, so transactionHash and senderTxHash will be different for fee delegated transactions.
     *
     * @example
     * const result = tx.getSenderTxHash()
     *
     * @return {string} A senderTxHash.
     */
    getSenderTxHash() {
        const rlpEncoded = this.getRLPEncoding()
        const type = rlpEncoded.slice(0, 4)
        const typeDetached = `0x${rlpEncoded.slice(4)}`

        const data = RLP.decode(typeDetached)

        return Hash.keccak256(type + RLP.encode(data.slice(0, data.length - 2)).slice(2))
    }

    /**
     * Returns an RLP-encoded transaction string for making feePayerSignature.
     *
     * @example
     * const result = tx.getRLPEncodingForFeePayerSignature()
     *
     * @return {string} An RLP-encoded transaction string without any signature and feePayerSignature attached.
     */
    getRLPEncodingForFeePayerSignature() {
        return RLP.encode([this.getCommonRLPEncodingForSignature(), this.feePayer, Bytes.fromNat(this.chainId), '0x', '0x'])
    }

    /**
     * Recovers the public key strings from `feePayerSignatures` field in transaction object.
     * If you want to derive an address from public key, please use {@link module:utils~publicKeyToAddress|caver.utils.publicKeyToAddress}.
     *
     * @example
     * const publicKey = tx.recoverFeePayerPublicKeys()
     *
     * @return {Array.<string>} An array containing public keys recovered from `feePayerSignatures`.
     */
    recoverFeePayerPublicKeys() {
        if (utils.isEmptySig(this.feePayerSignatures))
            throw new Error(`Failed to recover public keys from feePayerSignatures: feePayerSignatures is empty.`)

        const recovery = Bytes.toNumber(this.feePayerSignatures[0].v)
        const chainId = recovery < 35 ? Bytes.fromNat('0x1') : Bytes.fromNumber((recovery - 35) >> 1)
        if (!this.chainId) this.chainId = chainId
        const signingDataHex = this.getRLPEncodingForFeePayerSignature()
        const hasedSigningData = Hash.keccak256(signingDataHex)

        const publicKeys = []
        for (const sig of this.feePayerSignatures) {
            const sigV = Bytes.toNumber(sig.v)
            const recoveryData = sigV < 35 ? Bytes.fromNat('0x1') : Bytes.fromNumber((sigV - 35) >> 1)

            if (utils.trimLeadingZero(this.chainId) !== utils.trimLeadingZero(recoveryData))
                throw new Error(`Invalid feePayerSignatures data: recovery data is not matched.`)

            publicKeys.push(utils.recoverPublicKey(hasedSigningData, sig, true))
        }

        return publicKeys
    }
}

module.exports = AbstractFeeDelegatedTransaction
