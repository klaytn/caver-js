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
const utils = require('../../../../caver-utils/src')

function _decode(rlpEncoded) {
    rlpEncoded = utils.addHexPrefix(rlpEncoded)
    if (!rlpEncoded.startsWith(TX_TYPE_TAG.TxTypeCancel))
        throw new Error(`Cannot decode to Cancel. The prefix must be ${TX_TYPE_TAG.TxTypeCancel}: ${rlpEncoded}`)

    const typeDettached = `0x${rlpEncoded.slice(4)}`
    const [nonce, gasPrice, gas, from, signatures] = RLP.decode(typeDettached)
    return {
        nonce: utils.trimLeadingZero(nonce),
        gasPrice: utils.trimLeadingZero(gasPrice),
        gas: utils.trimLeadingZero(gas),
        from,
        signatures,
    }
}

/**
 * Represents a cancel transaction.
 * Please refer https://docs.klaytn.com/klaytn/design/transactions/basic#txtypecancel to see more detail.
 * @class
 */
class Cancel extends AbstractTransaction {
    /**
     * decodes an RLP-encoded transation string and returns a Cancel transaction instance.
     *
     * @param {string} rlpEncoded The RLP-encoded cancel transaction.
     * @return {Cancel}
     */
    static decode(rlpEncoded) {
        return new Cancel(_decode(rlpEncoded))
    }

    /**
     * Creates a cancel transaction.
     * @constructor
     * @param {object|string} createTxObj - The parameters to create a Cancel transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                                      The object can define `from`, `nonce`, `gas`, `gasPrice`, `signatures` and `chainId`.
     */
    constructor(createTxObj) {
        if (_.isString(createTxObj)) createTxObj = _decode(createTxObj)
        super(TX_TYPE_STRING.TxTypeCancel, createTxObj)

        this.from = createTxObj.from
    }

    /**
     * @type {string}
     */
    get from() {
        return this._from
    }

    set from(address) {
        if (!utils.isAddress(address)) throw new Error(`Invalid address of from: ${address}`)
        this._from = address
    }

    /**
     * Returns RLP-encoded transaction string(rawTransaction).
     * @return {string}
     */
    getRLPEncoding() {
        this.validateOptionalValues()

        return (
            TX_TYPE_TAG.TxTypeCancel +
            RLP.encode([
                Bytes.fromNat(this.nonce),
                Bytes.fromNat(this.gasPrice),
                Bytes.fromNat(this.gas),
                this.from.toLowerCase(),
                this.signatures,
            ]).slice(2)
        )
    }

    /**
     * Returns common RLP-encoded transaction string for making signature.
     * @return {string}
     */
    getCommonRLPEncodingForSignature() {
        this.validateOptionalValues()

        return RLP.encode([
            TX_TYPE_TAG.TxTypeCancel,
            Bytes.fromNat(this.nonce),
            Bytes.fromNat(this.gasPrice),
            Bytes.fromNat(this.gas),
            this.from.toLowerCase(),
        ])
    }
}

module.exports = Cancel
