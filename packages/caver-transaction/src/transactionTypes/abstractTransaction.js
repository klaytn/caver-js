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
const Keyring = require('../../../caver-wallet/src/keyring/keyringFactory')
const SingleKeyring = require('../../../caver-wallet/src/keyring/singleKeyring')
const MultipleKeyring = require('../../../caver-wallet/src/keyring/multipleKeyring')
const RoleBasedKeyring = require('../../../caver-wallet/src/keyring/roleBasedKeyring')
const {
    TX_TYPE_STRING,
    refineSignatures,
    typeDetectionFromRLPEncoding,
    isEthereumTxType,
} = require('../transactionHelper/transactionHelper')
const { KEY_ROLE } = require('../../../caver-wallet/src/keyring/keyringHelper')
const { validateParams } = require('../../../caver-core-helpers/src/validateFunction')
const SignatureData = require('../../../caver-wallet/src/keyring/signatureData')

/**
 * Abstract class that implements common logic for each transaction type.
 * @class
 * @hideconstructor
 * @abstract
 */
class AbstractTransaction {
    /**
     * Abstract class that implements common logic for each transaction type.
     * In this constructor, type, tag, nonce, gasPrice, chainId, gas and signatures are set as transaction member variables.
     *
     * @constructor
     * @param {string} typeString - The type string of transaction.
     * @param {object} createTxObj - The parameters to create a transaction instance.
     * @param {object} [klaytnCall] - An object includes klay rpc calls.
     */
    constructor(typeString, createTxObj, klaytnCall = AbstractTransaction._klaytnCall) {
        this._type = typeString

        createTxObj.type = typeString

        const err = validateParams(createTxObj)
        if (err) throw err

        this.from = createTxObj.from

        this.gas = createTxObj.gas

        // The variables below are values that the user does not need to pass to the parameter.
        if (createTxObj.nonce !== undefined) this.nonce = createTxObj.nonce
        if (createTxObj.chainId !== undefined) this.chainId = createTxObj.chainId

        this.signatures = createTxObj.signatures || []
        this.klaytnCall = klaytnCall
    }

    /**
     * @type {string}
     */
    get type() {
        return this._type
    }

    /**
     * @type {string}
     */
    get from() {
        return this._from
    }

    set from(address) {
        if (
            this.type === TX_TYPE_STRING.TxTypeLegacyTransaction &&
            (address === '0x' || address === '0x0000000000000000000000000000000000000000')
        ) {
            this._from = address.toLowerCase()
        } else {
            if (!utils.isAddress(address)) throw new Error(`Invalid address ${address}`)
            this._from = address.toLowerCase()
        }
    }

    /**
     * @type {string}
     */
    get nonce() {
        return this._nonce
    }

    set nonce(n) {
        this._nonce = utils.numberToHex(n)
    }

    /**
     * @type {string}
     */
    get gas() {
        return this._gas
    }

    set gas(g) {
        this._gas = utils.numberToHex(g)
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
        this._signatures = refineSignatures(sigs, this.type)
    }

    /**
     * @type {object}
     */
    get klaytnCall() {
        return this._klaytnCall
    }

    set klaytnCall(c) {
        this._klaytnCall = c
    }

    /**
     * Calls `klay_chainID` klay rpc call.
     *
     * @example
     * const result = tx.getChainId()
     *
     * @return {string} chain id
     */
    async getChainId() {
        const chainId = await this.klaytnCall.getChainId()
        return chainId
    }

    /**
     * Calls `klay_gasPrice` klay rpc call.
     *
     * @example
     * const result = tx.getGasPrice()
     *
     * @return {string} gas price
     */
    async getGasPrice() {
        const gasPrice = await this.klaytnCall.getGasPrice()
        return gasPrice
    }

    /**
     * Calls `klay_getTransactionCount` klay rpc call.
     *
     * @example
     * const result = tx.getNonce('0x{from address}')
     *
     * @return {string} nonce
     */
    async getNonce(from) {
        const nonce = await this.klaytnCall.getTransactionCount(from, 'pending')
        return nonce
    }

    /**
     * Calls `klay_getHeaderByNumber` klay rpc call to get `baseFeePerGas` in header.
     *
     * @example
     * const result = tx.getBaseFee()
     *
     * @return {string} base fee
     */
    async getBaseFee() {
        const header = await this.klaytnCall.getHeaderByNumber('latest')
        return header.baseFeePerGas
    }

    /**
     * Calls `klay_maxPriorityFeePerGas` klay rpc call.
     *
     * @example
     * const result = tx.getMaxPriorityFeePerGas()
     *
     * @return {string} suggested max priority fee per gas
     */
    async getMaxPriorityFeePerGas() {
        const maxPriorityFeePerGas = await this.klaytnCall.getMaxPriorityFeePerGas()
        return maxPriorityFeePerGas
    }

    /**
     * Returns the RLP-encoded string of this transaction (i.e., rawTransaction).
     * This method has to be overrided in classes which extends AbstractTransaction.
     *
     * @example
     * const result = tx.getRLPEncoding()
     *
     * @return {string} An RLP-encoded transaction string.
     */
    getRLPEncoding() {
        throw new Error(`Not implemented.`)
    }

    /**
     * Returns the RLP-encoded string to make the signature of this transaction.
     * This method has to be overrided in classes which extends AbstractTransaction.
     * getCommonRLPEncodingForSignature is used in getRLPEncodingForSignature.
     *
     * @example
     * const result = tx.getCommonRLPEncodingForSignature()
     *
     * @return {string} An RLP-encoded transaction string without signature.
     */
    getCommonRLPEncodingForSignature() {
        throw new Error(`Not implemented.`)
    }

    /**
     * Signs the transaction as a transaction sender with the private key(s) in the `keyring` and appends `signatures` in the transaction object.
     *
     * For {@link AccountUpdate|Account Update} transaction, use "roleAccountUpdateKey", or otherwise, use "roleTransactionKey" in {@link RoleBasedKeyring}.
     * If the user has not defined an `index`, `transaction.sign` signs the transaction using "all the private keys" used by the role.
     * If `index` is defined, the `transaction.sign` signs the transaction using "only one private key" at the given index.
     *
     * @example
     * const keyring = caver.wallet.keyring.create('0x{address in hex}', '0x{private key}')
     * const signedTx = await tx.sign(keyring)
     *
     * const keyring = caver.wallet.keyring.create('0x{address in hex}', ['0x{private key}', '0x{private key}'])
     * const signedTx = await tx.sign(keyring, 1) // sign the transaction with index. If omitted, sign with all private keys.
     *
     * @param {KeyringContainer.Keyring|string} key - A private key string ({@link https://docs.klaytn.com/klaytn/design/accounts#klaytn-wallet-key-format|KlaytnWalletKey} format is also allowed) or an instance of {@link KeyringContainer.Keyring|Keyring}. If a private key string or a KlaytnWalletKey is passed as a parameter, the keyring instance is created internally.
     * @param {number} [index] - The index of the private key you want to use. The index must be less than the length of the array of the private keys defined for each role. If an index is not defined, this method will use all the private keys.
     * @param {function} [hasher] - The hash function to get the hash of the transaction.
     * @return {module:Transaction.Transaction} An instance of signed Transaction. The `signature` is appended to the `transaction.signatures`.
     */
    async sign(key, index, hasher = TransactionHasher.getHashForSignature) {
        // User parameter input cases
        // (key) / (key index) / (key hasher) / (key index hasher)
        if (_.isFunction(index)) {
            hasher = index
            index = undefined
        }

        const { keyring, hash, role } = await this._sign(key, hasher)

        const sig = keyring.sign(hash, this.chainId, role, index)

        this.appendSignatures(sig)

        return this
    }

    /**
     * Appends `signatures` to the transaction.
     *
     * @example
     * tx.appendSignatures([ '0x0fea', '0xade94...', '0x38160...' ])
     *
     * const sig = [[ '0x0fea', '0xade94...', '0x38160...' ], [ '0x0fea', '0xbde66...', '0x546eb...' ]]
     * tx.appendSignatures(sig)
     *
     * @param {SignatureData|Array.<SignatureData>|Array.<string>|Array.<Array.<string>>} signatures - The `signatures` to be appended to the transaction. {@link SignatureData} instance or an array containing {@link SignatureData} instances.
     *                                                                                                 An array in which each 'v', 'r', and 's' are sequentially defined as string formats or a 2D array containing those arrays can also be taken as parameters.
     */
    appendSignatures(signatures) {
        let sig = signatures
        if (_.isString(sig)) sig = utils.resolveSignature(sig)
        if (sig instanceof SignatureData) sig = [sig]

        if (!_.isArray(sig)) throw new Error(`Failed to append signatures: invalid signatures format ${sig}`)

        if (_.isString(sig[0])) sig = [sig]

        this.signatures = this.signatures.concat(sig)
    }

    /**
     * Collects signs in each RLP-encoded transaction string in the given array, combines them with the transaction instance, and returns a RLP-encoded transaction string which includes all signs.
     *
     * Note that the transaction instance doesn't necessarily be signed in advance.
     *
     * When combining the signatures into a transaction instance, an error is thrown if the decoded transaction contains different value except signatures.
     *
     * @example
     * const combined = tx.combineSignedRawTransactions(['0x09f88...'])
     *
     * @param {Array.<string>} rlpEncodedTxs - An array of signed RLP-encoded transaction strings.
     * @return {string} A RLP-encoded transaction string which includes all `signatures`.
     */
    combineSignedRawTransactions(rlpEncodedTxs) {
        if (!_.isArray(rlpEncodedTxs)) throw new Error(`The parameter must be an array of RLP-encoded transaction strings.`)

        // If the signatures are empty, there may be an undefined member variable.
        // In this case, the empty information is filled with the decoded result.
        let fillVariables = false
        if (utils.isEmptySig(this.signatures)) fillVariables = true

        for (const encoded of rlpEncodedTxs) {
            const type = typeDetectionFromRLPEncoding(encoded)
            if (this.type !== type) throw new Error(`Transaction type mismatch: Signatures from different transactions cannot be combined.`)

            const decoded = this.constructor.decode(encoded)

            // Signatures can only be combined for the same transaction.
            // Therefore, compare whether the decoded transaction is the same as this.
            for (const k in decoded) {
                if (k === '_klaytnCall' || k === '_signatures' || k === '_feePayerSignatures') continue
                if (this[k] === undefined && fillVariables) this[k] = decoded[k]

                const differentTxError = `Transactions containing different information cannot be combined.`

                // Compare with the RLP-encoded accountKey string, because 'account' is an object.
                if (k === '_account') {
                    if (this[k].getRLPEncodingAccountKey() !== decoded[k].getRLPEncodingAccountKey()) throw new Error(differentTxError)
                    continue
                }

                if (k === '_accessList') {
                    if (!this[k].isEqual(decoded[k])) throw new Error(differentTxError)
                    continue
                }

                if (this[k] !== decoded[k]) {
                    // console.log(`k(${k}) is different. ${this[k]} vs ${decoded[k]}`)
                    throw new Error(differentTxError)
                }
            }

            this.appendSignatures(decoded.signatures)
        }

        return this.getRLPEncoding()
    }

    /**
     * Returns a `rawTransaction` string (a RLP-encoded transaction string).
     * This function is same with {@link AbstractTransaction#getRLPEncoding|transaction.getRLPEncoding}.
     *
     * @example
     * const result = tx.getRawTransaction()
     *
     * @return {string}
     */
    getRawTransaction() {
        return this.getRLPEncoding()
    }

    /**
     * Returns a hash string of transaction.
     *
     * @example
     * const result = tx.getTransactionHash()
     *
     * @return {string}
     */
    getTransactionHash() {
        return Hash.keccak256(this.getRLPEncoding())
    }

    /**
     * Returns a {@link https://docs.klaytn.com/klaytn/design/transactions#sendertxhash|senderTxHash} of transaction.
     * The {@link https://docs.klaytn.com/klaytn/design/transactions#sendertxhash|senderTxHash} is a hash of the transaction except for the fee payer's address and signature, so transactionHash and senderTxHash are the same for basic transactions.
     *
     * @example
     * const result = tx.getSenderTxHash()
     *
     * @return {string} A senderTxHash.
     */
    getSenderTxHash() {
        return this.getTransactionHash()
    }

    /**
     * Returns an RLP-encoded transaction string for making signature.
     *
     * @example
     * const result = tx.getRLPEncodingForSignature()
     *
     * @return {string} An RLP-encoded transaction string without any signature attached.
     */
    getRLPEncodingForSignature() {
        this.validateOptionalValues()
        if (this.chainId === undefined)
            throw new Error(`chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`)

        return RLP.encode([this.getCommonRLPEncodingForSignature(), Bytes.fromNat(this.chainId), '0x', '0x'])
    }

    /**
     * Recovers the public key strings from `signatures` field in transaction object.
     * If you want to derive an address from public key, please use {@link module:utils~publicKeyToAddress|caver.utils.publicKeyToAddress}.
     *
     * @example
     * const publicKey = tx.recoverPublicKeys()
     *
     * @return {Array.<string>} An array containing public keys recovered from `signatures`.
     */
    recoverPublicKeys() {
        if (utils.isEmptySig(this.signatures)) throw new Error(`Failed to recover public keys from signatures: signatures is empty.`)

        const recovery = Bytes.toNumber(this.signatures[0].v)
        const chainId = recovery < 35 ? Bytes.fromNat('0x1') : Bytes.fromNumber((recovery - 35) >> 1)
        if (!this.chainId) this.chainId = chainId
        const signingDataHex = this.getRLPEncodingForSignature()
        const hasedSigningData = Hash.keccak256(signingDataHex)

        const publicKeys = []
        for (const sig of this.signatures) {
            const sigV = Bytes.toNumber(sig.v)
            const recoveryData = sigV < 35 ? Bytes.fromNat('0x1') : Bytes.fromNumber((sigV - 35) >> 1)

            if (utils.trimLeadingZero(this.chainId) !== utils.trimLeadingZero(recoveryData))
                throw new Error(`Invalid signatures data: recovery data is not matched.`)

            publicKeys.push(utils.recoverPublicKey(hasedSigningData, sig, true))
        }

        return publicKeys
    }

    /**
     * Fills in the optional variables in transaction.
     *
     * If the `gasPrice`, `nonce`, or `chainId` of the transaction are not defined, this method asks the default values for these optional variables and preset them by sending JSON RPC call to the connected Klaytn Node.
     * Use {@link Klay#getGasPrice|caver.rpc.klay.getGasPrice} to get gasPrice, {@link Klay#getTransactionCount|caver.rpc.klay.getTransactionCount} to get nonce and {@link Klay#getChainId|caver.rpc.klay.getChainId} call to get chainId.
     *
     * @example
     * await tx.fillTransaction()
     */
    async fillTransaction() {
        throw new Error(`Not implemented.`)
    }

    /**
     * Checks that member variables that can be defined by the user are defined.
     * If there is an undefined variable, an error occurs.
     *
     * @ignore
     */
    validateOptionalValues() {
        if (this.nonce === undefined)
            throw new Error(`nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`)
    }

    async _sign(key, hasher) {
        let keyring = key
        if (_.isString(key)) {
            keyring = Keyring.createFromPrivateKey(key)
        }
        if (!(keyring instanceof SingleKeyring) && !(keyring instanceof MultipleKeyring) && !(keyring instanceof RoleBasedKeyring))
            throw new Error(
                `Unsupported key type. The key must be a single private key string, KlaytnWalletKey string, or Keyring instance.`
            )

        // When user attempt to sign with a updated keyring into an ethereum tx type error should be thrown.
        if (isEthereumTxType(this.type) && keyring.isDecoupled()) throw new Error(`${this.type} cannot be signed with a decoupled keyring.`)

        if (!this.from || this.from === '0x' || this.from === '0x0000000000000000000000000000000000000000') this.from = keyring.address
        if (this.from.toLowerCase() !== keyring.address.toLowerCase())
            throw new Error(`The from address of the transaction is different with the address of the keyring to use.`)

        await this.fillTransaction()
        const hash = hasher(this)
        const role = this.type.includes('AccountUpdate') ? KEY_ROLE.roleAccountUpdateKey : KEY_ROLE.roleTransactionKey

        return { keyring, hash, role }
    }
}

module.exports = AbstractTransaction
