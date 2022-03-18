/*
    Copyright 2022 The caver-js Authors
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
const Bytes = require('eth-lib/lib/bytes')
const Hash = require('eth-lib/lib/hash')
const AbstractTransaction = require('../abstractTransaction')
const {
    TX_TYPE_STRING,
    TX_TYPE_TAG,
    refineSignatures,
    getTypeTagWithoutEthereumTxTypeEnvelopeTag,
    isNot,
} = require('../../transactionHelper/transactionHelper')
const utils = require('../../../../caver-utils/src')
const AccessList = require('../../utils/accessList')
const TransactionHasher = require('../../transactionHasher/transactionHasher')

function _decode(rlpEncoded) {
    rlpEncoded = utils.addHexPrefix(rlpEncoded)
    if (!rlpEncoded.startsWith(TX_TYPE_TAG.TxTypeEthereumDynamicFee))
        throw new Error(`Cannot decode to EthereumDynamicFee. The prefix must be ${TX_TYPE_TAG.TxTypeEthereumDynamicFee}: ${rlpEncoded}`)

    const typeDettached = `0x${rlpEncoded.replace(TX_TYPE_TAG.TxTypeEthereumDynamicFee, '')}`
    const [chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gas, to, value, input, encodedAccessList, v, r, s] = RLP.decode(
        typeDettached
    )
    return {
        chainId: utils.trimLeadingZero(chainId),
        nonce: utils.trimLeadingZero(nonce),
        maxPriorityFeePerGas: utils.trimLeadingZero(maxPriorityFeePerGas),
        maxFeePerGas: utils.trimLeadingZero(maxFeePerGas),
        gas: utils.trimLeadingZero(gas),
        to,
        value: utils.trimLeadingZero(value),
        input: input,
        encodedAccessList,
        signatures: [v, r, s],
    }
}
/**
 * Represents a ethereum dynamic fee transaction.
 * @class
 * @hideconstructor
 * @augments AbstractTransaction
 */
class EthereumDynamicFee extends AbstractTransaction {
    /**
     * Creates a ethereum dynamic fee transaction.
     *
     * @example
     * const tx = caver.transaction.ethereumDynamicFee.create({ from: '0x{}', ... })
     *
     * @method create
     * @param {object|string} createTxObj - The parameters to create a EthereumDynamicFee transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                                      The object can define `from`, `to`, `value`, `input`, `nonce`, `gas`, `maxPriorityFeePerGas`, `maxFeePerGas`, `accessList` and `chainId`.
     * @param {object} [klaytnCall] - An object includes klay rpc calls.
     * @return {EthereumDynamicFee}
     */
    static create(createTxObj, klaytnCall) {
        return new EthereumDynamicFee(createTxObj, klaytnCall)
    }

    /**
     * decodes the RLP-encoded string and returns an EthereumDynamicFee instance.
     *
     * @example
     * const tx = caver.transaction.ethereumDynamicFee.decode('0x{rlp encoded data}')
     *
     * @param {string} rlpEncoded The RLP-encoded ethereum dynamic fee transaction.
     * @param {object} [klaytnCall] - An object includes klay rpc calls.
     * @return {EthereumDynamicFee}
     */
    static decode(rlpEncoded, klaytnCall) {
        const decoded = _decode(rlpEncoded)
        decoded.accessList = AccessList.decode(decoded.encodedAccessList)
        return new EthereumDynamicFee(decoded, klaytnCall)
    }

    /**
     * Creates a ethereum dynamic fee transaction.
     * @constructor
     * @param {object|string} createTxObj - The parameters to create a EthereumDynamicFee transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                                      The object can define `from`, `to`, `value`, `input`, `nonce`, `gas`, `maxPriorityFeePerGas`, `maxFeePerGas`, `accessList` and `chainId`.
     * @param {object} [klaytnCall] - An object includes klay rpc calls.
     */
    constructor(createTxObj, klaytnCall) {
        if (_.isString(createTxObj)) createTxObj = _decode(createTxObj)

        createTxObj.from = createTxObj.from || '0x0000000000000000000000000000000000000000'

        super(TX_TYPE_STRING.TxTypeEthereumDynamicFee, createTxObj, klaytnCall)
        this.to = createTxObj.to || '0x'

        if (createTxObj.input && createTxObj.data)
            throw new Error(`'input' and 'data' properties cannot be defined at the same time, please use either 'input' or 'data'.`)
        this.input = createTxObj.input || createTxObj.data || '0x'

        this.value = createTxObj.value || '0x0'

        this.accessList = createTxObj.accessList || []

        if (createTxObj.maxPriorityFeePerGas !== undefined) this.maxPriorityFeePerGas = createTxObj.maxPriorityFeePerGas
        if (createTxObj.maxFeePerGas !== undefined) this.maxFeePerGas = createTxObj.maxFeePerGas
    }

    /**
     * @type {string}
     */
    get to() {
        return this._to
    }

    set to(address) {
        if (address !== '0x' && !utils.isAddress(address)) throw new Error(`Invalid address ${address}`)
        this._to = address.toLowerCase()
    }

    /**
     * @type {string}
     */
    get value() {
        return this._value
    }

    set value(val) {
        this._value = utils.numberToHex(val)
    }

    /**
     * @type {string}
     */
    get input() {
        return this._input
    }

    set input(input) {
        if (!input || !utils.isHex(input)) throw new Error(`Invalid input data ${input}`)
        this._input = utils.addHexPrefix(input)
    }

    /**
     * @type {string}
     */
    get data() {
        return this._input
    }

    set data(data) {
        this._input = data
    }

    /**
     * @type {AccessList}
     */
    get accessList() {
        return this._accessList
    }

    set accessList(list) {
        if (!(list instanceof AccessList)) list = AccessList.create(list)
        this._accessList = list
    }

    /**
     * @type {string}
     */
    get maxPriorityFeePerGas() {
        return this._maxPriorityFeePerGas
    }

    set maxPriorityFeePerGas(mpf) {
        this._maxPriorityFeePerGas = utils.numberToHex(mpf)
    }

    /**
     * @type {string}
     */
    get maxFeePerGas() {
        return this._maxFeePerGas
    }

    set maxFeePerGas(mf) {
        this._maxFeePerGas = utils.numberToHex(mf)
    }

    /**
     * @type {SignatureData}
     */
    get signatures() {
        return this._signatures
    }

    // overrides signatures getter/setter to validate y-parity.
    set signatures(sigs) {
        const refined = refineSignatures(sigs, this.type)
        if (!utils.isEmptySig(refined)) {
            const v = utils.hexToNumber(refined.v)
            if (v !== 0 && v !== 1) {
                throw new Error(`Invalid signature: The y-parity of the transaction should either be 0 or 1.`)
            }
        }
        this._signatures = refined
    }

    /**
     * Appends signatures array to transaction.
     * EthereumDynamicFee transaction cannot have more than one signature, so an error will be occured if the transaction already has a signature or the `sig` parameter has more than one signatures.
     *
     * @example
     * tx.appendSignatures([ '0x0fea', '0xade94...', '0x38160...' ])
     *
     * @override
     * @param {SignatureData|Array.<SignatureData>|Array.<string>|Array.<Array.<string>>} signatures - The `signatures` to be appended to the transaction. {@link SignatureData|SignatureData} instance or an array containing {@link SignatureData|SignatureData} instances.
     *                                                                                                 An array in which each 'v', 'r', and 's' are sequentially defined as string formats or a 2D array containing those arrays can also be taken as parameters.
     */
    appendSignatures(sig) {
        if (!utils.isEmptySig(this.signatures))
            throw new Error(
                `signatures already defined. ${this.type} cannot include more than one signature. Please use tx.signatures = sigArr to replace.`
            )

        if (Array.isArray(sig[0])) {
            if (sig.length > 1) throw new Error(`signatures are too long. ${this.type} cannot include more than one signature.`)
            sig = sig[0]
        }

        this.signatures = sig
    }

    /**
     * Returns the RLP-encoded string of this transaction (i.e., rawTransaction).
     * This returns with `TxTypeEthereumDynamicFee` type prefix('0x7801').
     *
     * @example
     * const result = tx.getRLPEncoding()
     *
     * @return {string} An RLP-encoded transaction string.
     */
    getRLPEncoding() {
        this.validateOptionalValues()

        const [v, r, s] = this.signatures.encode()
        // TxTypeEthereumEnvelope(0x78) || 0x01 || rlp([chainId, nonce, gasPrice, gasLimit, to, value, data, accessList, signatureYParity, signatureR, signatureS])
        return (
            TX_TYPE_TAG[this.type] +
            RLP.encode([
                Bytes.fromNat(this.chainId),
                Bytes.fromNat(this.nonce),
                Bytes.fromNat(this.maxPriorityFeePerGas),
                Bytes.fromNat(this.maxFeePerGas),
                Bytes.fromNat(this.gas),
                this.to.toLowerCase(),
                Bytes.fromNat(this.value),
                this.input,
                this.accessList.encodeToBytes(),
                v,
                r,
                s,
            ]).slice(2)
        )
    }

    /**
     * Returns RLP-encoded string for making signature.
     *
     * @example
     * const result = tx.getRLPEncodingForSignature()
     *
     * @override
     * @return {string}
     */
    getRLPEncodingForSignature() {
        this.validateOptionalValues()

        // sigRLP = 0x01 || rlp([chainId, nonce, gasPrice, gasLimit, to, value, data, accessList])
        return (
            getTypeTagWithoutEthereumTxTypeEnvelopeTag(this.type) +
            RLP.encode([
                Bytes.fromNat(this.chainId),
                Bytes.fromNat(this.nonce),
                Bytes.fromNat(this.maxPriorityFeePerGas),
                Bytes.fromNat(this.maxFeePerGas),
                Bytes.fromNat(this.gas),
                this.to.toLowerCase(),
                Bytes.fromNat(this.value),
                this.input,
                this.accessList.encodeToBytes(),
            ]).slice(2)
        )
    }

    /**
     * EthereumDynamicFee does not have a common RLP encoding because no other type exists.
     * So getCommonRLPEncodingForSignature calls getRLPEncodingForSignature to return RLP-encoded string.
     *
     * @return {string}
     */
    getCommonRLPEncodingForSignature() {
        return this.getRLPEncodingForSignature()
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
        if (utils.isEmptySig(this.signatures)) throw new Error(`Failed to recover public key from signatures: signatures is empty.`)

        const recovery = Bytes.toNumber(this.signatures.v)
        const signingDataHex = this.getRLPEncodingForSignature()
        const hasedSigningData = Hash.keccak256(signingDataHex)

        const publicKeys = []
        publicKeys.push(
            utils.recoverPublicKey(hasedSigningData, [utils.makeEven(utils.toHex(recovery)), this.signatures.r, this.signatures.s], true)
        )

        return publicKeys
    }

    /**
     * Signs the transaction as a transaction sender with the private key(s) in the `keyring` and appends `signatures` in the transaction object.
     *
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

        const sig = keyring.ecsign(hash, role, index)

        this.appendSignatures(sig)

        return this
    }

    /**
     * Fills in the optional variables in transaction.
     *
     * If the `maxPriorityFeePerGas`, `maxFeePerGas`, `nonce`, or `chainId` of the transaction are not defined, this method asks the default values for these optional variables and preset them by sending JSON RPC call to the connected Klaytn Node.
     * Use {@link Klay#getGasPrice|caver.rpc.klay.getGasPrice} to get gasPrice, {@link Klay#getTransactionCount|caver.rpc.klay.getTransactionCount} to get nonce and {@link Klay#getChainId|caver.rpc.klay.getChainId} call to get chainId.
     * Also this uses {@link Klay#getHeaderByNumber|caver.rpc.klay.getHeaderByNumber} to get base fee per gas from the block header.
     *
     * @example
     * await tx.fillTransaction()
     */
    async fillTransaction() {
        const isNotMaxPriorityFeePerGas = isNot(this.maxPriorityFeePerGas)
        const isNotMaxFeePerGas = isNot(this.maxFeePerGas)
        const [chainId, maxPriorityFeePerGas, nonce, baseFee] = await Promise.all([
            isNot(this.chainId) ? this.getChainId() : this.chainId,
            isNotMaxPriorityFeePerGas ? this.getMaxPriorityFeePerGas() : this.maxPriorityFeePerGas,
            isNot(this.nonce) ? this.getNonce(this.from) : this.nonce,
            isNotMaxPriorityFeePerGas || isNotMaxFeePerGas ? this.getBaseFee() : undefined,
        ])

        this.chainId = chainId
        this.nonce = nonce
        this.maxPriorityFeePerGas = maxPriorityFeePerGas

        // Set maxFeePerGas with `block.baseFeePerGas.mul(2).add(maxPriorityFeePerGas)`
        if (isNotMaxFeePerGas) {
            this.maxFeePerGas = utils.hexToNumber(baseFee) * 2 + utils.hexToNumber(this.maxPriorityFeePerGas)
        }
    }

    /**
     * Checks that member variables that can be defined by the user are defined.
     * If there is an undefined variable, an error occurs.
     *
     * @ignore
     */
    validateOptionalValues() {
        super.validateOptionalValues()
        if (this.maxPriorityFeePerGas === undefined)
            throw new Error(
                `maxPriorityFeePerGas is undefined. Define maxPriorityFeePerGas in transaction or use 'transaction.fillTransaction' to fill values.`
            )
        if (this.maxFeePerGas === undefined)
            throw new Error(
                `maxFeePerGas is undefined. Define maxFeePerGas in transaction or use 'transaction.fillTransaction' to fill values.`
            )
        if (this.chainId === undefined)
            throw new Error(`chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`)
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
        let encoded = this.getRLPEncoding()
        encoded = encoded.replace(TX_TYPE_TAG[this.type], getTypeTagWithoutEthereumTxTypeEnvelopeTag(this.type))
        return Hash.keccak256(encoded)
    }
}

module.exports = EthereumDynamicFee
