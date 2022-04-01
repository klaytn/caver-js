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
const Bytes = require('eth-lib/lib/bytes')
const Hash = require('eth-lib/lib/hash')
const AbstractTransaction = require('../abstractTransaction')
const { TX_TYPE_STRING, isNot } = require('../../transactionHelper/transactionHelper')
const utils = require('../../../../caver-utils/src')

function _decode(rlpEncoded) {
    rlpEncoded = utils.addHexPrefix(rlpEncoded)
    const [nonce, gasPrice, gas, to, value, input, v, r, s] = RLP.decode(rlpEncoded)
    return {
        nonce: utils.trimLeadingZero(nonce),
        gasPrice: utils.trimLeadingZero(gasPrice),
        gas: utils.trimLeadingZero(gas),
        to,
        value: utils.trimLeadingZero(value),
        input: input,
        signatures: [v, r, s],
    }
}
/**
 * Represents a legacy transaction.
 * Please refer to {@link https://docs.klaytn.com/klaytn/design/transactions/basic#txtypelegacytransaction|LegacyTransaction} to see more detail.
 * @class
 * @hideconstructor
 * @augments AbstractTransaction
 */
class LegacyTransaction extends AbstractTransaction {
    /**
     * Creates a legacy transaction.
     * @method create
     * @param {object|string} createTxObj - The parameters to create a LegacyTransaction transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                                      The object can define `from`, `to`, `value`, `input`, `nonce`, `gas`, `gasPrice` and `chainId`.
     * @param {object} [klaytnCall] - An object includes klay rpc calls.
     * @return {LegacyTransaction}
     */
    static create(createTxObj, klaytnCall) {
        return new LegacyTransaction(createTxObj, klaytnCall)
    }

    /**
     * decodes the RLP-encoded string and returns a LegacyTransaction instance.
     *
     * @param {string} rlpEncoded The RLP-encoded legacy transaction.
     * @param {object} [klaytnCall] - An object includes klay rpc calls.
     * @return {LegacyTransaction}
     */
    static decode(rlpEncoded, klaytnCall) {
        return new LegacyTransaction(_decode(rlpEncoded), klaytnCall)
    }

    /**
     * Creates a legacy transaction.
     * @constructor
     * @param {object|string} createTxObj - The parameters to create a LegacyTransaction transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                                      The object can define `from`, `to`, `value`, `input`, `nonce`, `gas`, `gasPrice` and `chainId`.
     * @param {object} [klaytnCall] - An object includes klay rpc calls.
     */
    constructor(createTxObj, klaytnCall) {
        if (_.isString(createTxObj)) createTxObj = _decode(createTxObj)

        createTxObj.from = createTxObj.from || '0x0000000000000000000000000000000000000000'

        super(TX_TYPE_STRING.TxTypeLegacyTransaction, createTxObj, klaytnCall)
        this.to = createTxObj.to || '0x'

        if (createTxObj.input && createTxObj.data)
            throw new Error(`'input' and 'data' properties cannot be defined at the same time, please use either 'input' or 'data'.`)
        this.input = createTxObj.input || createTxObj.data || '0x'

        this.value = createTxObj.value || '0x0'
        if (createTxObj.gasPrice !== undefined) this.gasPrice = createTxObj.gasPrice
    }

    /**
     * @type {string}
     */
    get gasPrice() {
        return this._gasPrice
    }

    set gasPrice(g) {
        this._gasPrice = utils.numberToHex(g)
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
     * Appends signatures array to transaction.
     * Legacy transaction cannot have more than one signature, so an error will be occured if the transaction already has a signature or the `sig` parameter has more than one signatures.
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
     *
     * @example
     * const result = tx.getRLPEncoding()
     *
     * @return {string} An RLP-encoded transaction string.
     */
    getRLPEncoding() {
        this.validateOptionalValues()

        return RLP.encode([
            Bytes.fromNat(this.nonce),
            Bytes.fromNat(this.gasPrice),
            Bytes.fromNat(this.gas),
            this.to.toLowerCase(),
            Bytes.fromNat(this.value),
            this.input,
            this.signatures.v,
            this.signatures.r,
            this.signatures.s,
        ])
    }

    /**
     * Returns RLP-encoded string for making signature
     * @override
     * @return {string}
     */
    getRLPEncodingForSignature() {
        this.validateOptionalValues()
        if (this.chainId === undefined)
            throw new Error(`chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`)

        return RLP.encode([
            Bytes.fromNat(this.nonce),
            Bytes.fromNat(this.gasPrice),
            Bytes.fromNat(this.gas),
            this.to.toLowerCase(),
            Bytes.fromNat(this.value),
            this.input,
            Bytes.fromNat(this.chainId || '0x1'),
            '0x',
            '0x',
        ])
    }

    /**
     * LegacyTransaction does not have a common RLP encoding because no other type exists.
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
        const chainId = recovery < 35 ? Bytes.fromNat('0x1') : Bytes.fromNumber((recovery - 35) >> 1)
        if (!this.chainId) this.chainId = chainId
        const signingDataHex = this.getRLPEncodingForSignature()
        const hasedSigningData = Hash.keccak256(signingDataHex)

        const publicKeys = []
        publicKeys.push(utils.recoverPublicKey(hasedSigningData, this.signatures, true))

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
        const [chainId, gasPrice, nonce] = await Promise.all([
            isNot(this.chainId) ? this.getChainId() : this.chainId,
            isNot(this.gasPrice) ? this.getGasPrice() : this.gasPrice,
            isNot(this.nonce) ? this.getNonce(this.from) : this.nonce,
        ])

        this.chainId = chainId
        this.gasPrice = gasPrice
        this.nonce = nonce
    }

    /**
     * Checks that member variables that can be defined by the user are defined.
     * If there is an undefined variable, an error occurs.
     *
     * @ignore
     */
    validateOptionalValues() {
        super.validateOptionalValues()
        if (this.gasPrice === undefined)
            throw new Error(`gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`)
    }
}

module.exports = LegacyTransaction
