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
const AbstractTransaction = require('../abstractTransaction')
const { TX_TYPE_STRING } = require('../../transactionHelper/transactionHelper')
const utils = require('../../../../caver-utils/src')

/**
 * Represents a legacy transaction.
 * Please refer https://docs.klaytn.com/klaytn/design/transactions/basic#txtypelegacytransaction to see more detail.
 * @class
 */
class LegacyTransaction extends AbstractTransaction {
    static decode(rlpEncoded) {
        const [nonce, gasPrice, gas, to, value, input, v, r, s] = RLP.decode(rlpEncoded)
        return new LegacyTransaction({
            nonce: utils.trimLeadingZero(nonce),
            gasPrice: utils.trimLeadingZero(gasPrice),
            gas: utils.trimLeadingZero(gas),
            to,
            value: utils.trimLeadingZero(value),
            input: utils.trimLeadingZero(input),
            signatures: [v, r, s],
        })
    }

    /**
     * Creates a legacy transaction.
     * @constructor
     * @param {object|string} createTxObj - The parameters to create a LegacyTransaction transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                               The object can define `from`, `to`, `value`, `input`, `nonce`, `gas`, `gasPrice`, `feeRatio`, `signatures`, `feePayer`, `feePayerSignatures` and `chainId`.
     */
    constructor(createTxObj) {
        if (_.isString(createTxObj)) createTxObj = LegacyTransaction.decode(createTxObj)
        super(TX_TYPE_STRING.TxTypeLegacyTransaction, createTxObj)
        this.from = createTxObj.from || '0x'
        this.to = createTxObj.to || '0x'

        if (createTxObj.input && createTxObj.data)
            throw new Error(`'input' and 'data' properties cannot be defined at the same time, please use either 'input' or 'data'.`)
        this.input = createTxObj.input || createTxObj.data || '0x'

        this.value = createTxObj.value || '0x0'
    }

    /**
     * @type {string}
     */
    get from() {
        return this._from
    }

    set from(address) {
        if (address !== '0x' && !utils.isAddress(address)) throw new Error(`Invalid address ${address}`)
        this._from = address.toLowerCase()
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
        this._input = utils.toHex(input)
    }

    /**
     * @type {string}
     */
    get data() {
        return this._input
    }

    set data(data) {
        this.input = data
    }

    /**
     * Appends signatures array to transaction.
     * Legacy transaction cannot have more than one signature, so an error occurs if the transaction already has a signature.
     *
     * @override
     * @param {Array.<string>|Array.<Array.<string>>} sig - An array of signatures to append.
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
     * Returns RLP-encoded transaction string(rawTransaction).
     * @return {string}
     */
    getRLPEncoding() {
        this.validateOptionalValues()

        return RLP.encode([
            Bytes.fromNat(this.nonce),
            Bytes.fromNat(this.gasPrice),
            Bytes.fromNat(this.gas),
            this.to,
            Bytes.fromNat(this.value),
            this.input,
            this.signatures[0],
            this.signatures[1],
            this.signatures[2],
        ])
    }

    /**
     * Returns RLP-encoded transaction string for making signature
     * @override
     * @return {string}
     */
    getRLPEncodingForSignature() {
        this.validateOptionalValues()

        return RLP.encode([
            Bytes.fromNat(this.nonce),
            Bytes.fromNat(this.gasPrice),
            Bytes.fromNat(this.gas),
            this.to,
            Bytes.fromNat(this.value),
            this.input,
            Bytes.fromNat(this.chainId || '0x1'),
            '0x',
            '0x',
        ])
    }
}

module.exports = LegacyTransaction
