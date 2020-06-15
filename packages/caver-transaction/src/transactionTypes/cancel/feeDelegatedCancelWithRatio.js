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

const RLP = require('eth-lib/lib/rlp')
const Bytes = require('eth-lib/lib/bytes')
const _ = require('lodash')
const { TX_TYPE_STRING, TX_TYPE_TAG } = require('../../transactionHelper/transactionHelper')
const AbstractFeeDelegatedWithRatioTransaction = require('../abstractFeeDelegatedWithRatioTransaction')
const utils = require('../../../../caver-utils/src')

function _decode(rlpEncoded) {
    rlpEncoded = utils.addHexPrefix(rlpEncoded)
    if (!rlpEncoded.startsWith(TX_TYPE_TAG.TxTypeFeeDelegatedCancelWithRatio))
        throw new Error(
            `Cannot decode to FeeDelegatedCancelWithRatio. The prefix must be ${TX_TYPE_TAG.TxTypeFeeDelegatedCancelWithRatio}: ${rlpEncoded}`
        )

    const typeDettached = `0x${rlpEncoded.slice(4)}`
    const [nonce, gasPrice, gas, from, feeRatio, signatures, feePayer, feePayerSignatures] = RLP.decode(typeDettached)
    return {
        nonce: utils.trimLeadingZero(nonce),
        gasPrice: utils.trimLeadingZero(gasPrice),
        gas: utils.trimLeadingZero(gas),
        from,
        feeRatio: utils.trimLeadingZero(feeRatio),
        signatures,
        feePayer,
        feePayerSignatures,
    }
}

/**
 * Represents a fee delegated cancel with ratio transaction.
 * Please refer to https://docs.klaytn.com/klaytn/design/transactions/partial-fee-delegation#txtypefeedelegatedcancelwithratio to see more detail.
 * @class
 */
class FeeDelegatedCancelWithRatio extends AbstractFeeDelegatedWithRatioTransaction {
    /**
     * decodes the RLP-encoded string and returns a FeeDelegatedCancelWithRatio transaction instance.
     *
     * @param {string} rlpEncoded The RLP-encoded fee delegated cancel with ratio transaction.
     * @return {FeeDelegatedCancelWithRatio}
     */
    static decode(rlpEncoded) {
        return new FeeDelegatedCancelWithRatio(_decode(rlpEncoded))
    }

    /**
     * Creates a fee delegated cancel with ratio transaction.
     * @constructor
     * @param {object|string} createTxObj - The parameters to create a FeeDelegatedCancelWithRatio transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                               The object can define `from`, `nonce`, `gas`, `gasPrice`, `feeRatio`, `signatures`, `feePayer`, `feePayerSignatures` and `chainId`.
     */
    constructor(createTxObj) {
        if (_.isString(createTxObj)) createTxObj = _decode(createTxObj)
        super(TX_TYPE_STRING.TxTypeFeeDelegatedCancelWithRatio, createTxObj)
    }

    /**
     * Returns the RLP-encoded string of this transaction (i.e., rawTransaction).
     * @return {string}
     */
    getRLPEncoding() {
        this.validateOptionalValues()
        const signatures = this.signatures.map(sig => sig.encode())
        const feePayerSignatures = this.feePayerSignatures.map(sig => sig.encode())

        return (
            TX_TYPE_TAG.TxTypeFeeDelegatedCancelWithRatio +
            RLP.encode([
                Bytes.fromNat(this.nonce),
                Bytes.fromNat(this.gasPrice),
                Bytes.fromNat(this.gas),
                this.from.toLowerCase(),
                this.feeRatio,
                signatures,
                this.feePayer.toLowerCase(),
                feePayerSignatures,
            ]).slice(2)
        )
    }

    /**
     * Returns the RLP-encoded string to make the signature of this transaction.
     * @return {string}
     */
    getCommonRLPEncodingForSignature() {
        this.validateOptionalValues()

        return RLP.encode([
            TX_TYPE_TAG.TxTypeFeeDelegatedCancelWithRatio,
            Bytes.fromNat(this.nonce),
            Bytes.fromNat(this.gasPrice),
            Bytes.fromNat(this.gas),
            this.from.toLowerCase(),
            this.feeRatio,
        ])
    }
}

module.exports = FeeDelegatedCancelWithRatio
