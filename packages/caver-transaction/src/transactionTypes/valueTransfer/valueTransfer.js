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
const { TX_TYPE_STRING, TX_TYPE_TAG } = require('../../transactionHelper/transactionHelper')
const utils = require('../../../../caver-utils')

function _decode(rlpEncoded) {
    rlpEncoded = utils.addHexPrefix(rlpEncoded)
    if (!rlpEncoded.startsWith(TX_TYPE_TAG.TxTypeValueTransfer))
        throw new Error(`Cannot decode to ValueTransfer. The prefix must be ${TX_TYPE_TAG.TxTypeValueTransfer}: ${rlpEncoded}`)

    const typeDettached = `0x${rlpEncoded.slice(4)}`
    const [nonce, gasPrice, gas, to, value, from, signatures] = RLP.decode(typeDettached)
    return {
        nonce: utils.trimLeadingZero(nonce),
        gasPrice: utils.trimLeadingZero(gasPrice),
        gas: utils.trimLeadingZero(gas),
        to,
        value: utils.trimLeadingZero(value),
        from,
        signatures,
    }
}

/**
 * Represents a value transfer transaction.
 * Please refer to {@link https://docs.klaytn.com/klaytn/design/transactions/basic#txtypevaluetransfer|ValueTransfer} to see more detail.
 * @class
 * @hideconstructor
 * @augments AbstractTransaction
 */
class ValueTransfer extends AbstractTransaction {
    /**
     * Creates a value transfer transaction.
     * @method create
     * @param {object|string} createTxObj - The parameters to create a ValueTransfer transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                                      The object can define `from`, `to`, `value`, `nonce`, `gas`, `gasPrice`, `signatures` and `chainId`.
     * @return {ValueTransfer}
     */
    static create(createTxObj) {
        return new ValueTransfer(createTxObj)
    }

    /**
     * decodes the RLP-encoded string and returns a ValueTransfer transaction instance.
     *
     * @param {string} rlpEncoded The RLP-encoded value transfer transaction.
     * @return {ValueTransfer}
     */
    static decode(rlpEncoded) {
        return new ValueTransfer(_decode(rlpEncoded))
    }

    /**
     * Creates a value transfer transaction.
     * @constructor
     * @param {object|string} createTxObj - The parameters to create a ValueTransfer transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                                      The object can define `from`, `to`, `value`, `nonce`, `gas`, `gasPrice`, `signatures` and `chainId`.
     */
    constructor(createTxObj) {
        if (_.isString(createTxObj)) createTxObj = _decode(createTxObj)
        super(TX_TYPE_STRING.TxTypeValueTransfer, createTxObj)

        this.to = createTxObj.to
        this.value = createTxObj.value
    }

    /**
     * @type {string}
     */
    get to() {
        return this._to
    }

    set to(address) {
        if (!utils.isAddress(address)) throw new Error(`Invalid address of to: ${address}`)
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
     * Returns the RLP-encoded string of this transaction (i.e., rawTransaction).
     *
     * @example
     * const result = tx.getRLPEncoding()
     *
     * @return {string} An RLP-encoded transaction string.
     */
    getRLPEncoding() {
        this.validateOptionalValues()
        const signatures = this.signatures.map(sig => sig.encode())

        return (
            TX_TYPE_TAG.TxTypeValueTransfer +
            RLP.encode([
                Bytes.fromNat(this.nonce),
                Bytes.fromNat(this.gasPrice),
                Bytes.fromNat(this.gas),
                this.to.toLowerCase(),
                Bytes.fromNat(this.value),
                this.from.toLowerCase(),
                signatures,
            ]).slice(2)
        )
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
        this.validateOptionalValues()

        return RLP.encode([
            TX_TYPE_TAG.TxTypeValueTransfer,
            Bytes.fromNat(this.nonce),
            Bytes.fromNat(this.gasPrice),
            Bytes.fromNat(this.gas),
            this.to.toLowerCase(),
            Bytes.fromNat(this.value),
            this.from.toLowerCase(),
        ])
    }
}

module.exports = ValueTransfer
