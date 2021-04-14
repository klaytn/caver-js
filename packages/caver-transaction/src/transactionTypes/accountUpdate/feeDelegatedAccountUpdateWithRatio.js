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
const AbstractFeeDelegatedWithRatioTransaction = require('../abstractFeeDelegatedWithRatioTransaction')
const { TX_TYPE_STRING, TX_TYPE_TAG } = require('../../transactionHelper/transactionHelper')
const utils = require('../../../../caver-utils/src')
const Account = require('../../../../caver-account')

function _decode(rlpEncoded) {
    rlpEncoded = utils.addHexPrefix(rlpEncoded)
    if (!rlpEncoded.startsWith(TX_TYPE_TAG.TxTypeFeeDelegatedAccountUpdateWithRatio))
        throw new Error(
            `Cannot decode to FeeDelegatedAccountUpdateWithRatio. The prefix must be ${TX_TYPE_TAG.TxTypeFeeDelegatedAccountUpdateWithRatio}: ${rlpEncoded}`
        )

    const typeDettached = `0x${rlpEncoded.slice(4)}`
    const [nonce, gasPrice, gas, from, rlpEncodedKey, feeRatio, signatures, feePayer, feePayerSignatures] = RLP.decode(typeDettached)
    return {
        nonce: utils.trimLeadingZero(nonce),
        gasPrice: utils.trimLeadingZero(gasPrice),
        gas: utils.trimLeadingZero(gas),
        from,
        rlpEncodedKey,
        feeRatio: utils.trimLeadingZero(feeRatio),
        signatures,
        feePayer,
        feePayerSignatures,
    }
}

/**
 * Represents a fee delegated account update with ratio transaction.
 * Please refer to https://docs.klaytn.com/klaytn/design/transactions/partial-fee-delegation#txtypefeedelegatedaccountupdatewithratio to see more detail.
 * @class
 */
class FeeDelegatedAccountUpdateWithRatio extends AbstractFeeDelegatedWithRatioTransaction {
    /**
     * Creates a fee delegated account update with ratio transaction.
     * @method create
     * @param {object|string} createTxObj - The parameters to create a FeeDelegatedAccountUpdateWithRatio transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                               The object can define `from`, `account`, `nonce`, `gas`, `gasPrice`, `feeRatio`, `signatures`, `feePayer`, `feePayerSignatures` and `chainId`.
     * @return {FeeDelegatedAccountUpdateWithRatio}
     */
    static create(createTxObj) {
        return new FeeDelegatedAccountUpdateWithRatio(createTxObj)
    }

    /**
     * decodes the RLP-encoded string and returns a FeeDelegatedAccountUpdateWithRatio transaction instance.
     *
     * @param {string} rlpEncoded The RLP-encoded fee delegated account update with ratio transaction.
     * @return {FeeDelegatedAccountUpdateWithRatio}
     */
    static decode(rlpEncoded) {
        const decoded = _decode(rlpEncoded)
        decoded.account = Account.createFromRLPEncoding(decoded.from, decoded.rlpEncodedKey)
        return new FeeDelegatedAccountUpdateWithRatio(decoded)
    }

    /**
     * Creates a fee delegated account update with ratio transaction.
     * @constructor
     * @param {object|string} createTxObj - The parameters to create a FeeDelegatedAccountUpdateWithRatio transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                               The object can define `from`, `account`, `nonce`, `gas`, `gasPrice`, `feeRatio`, `signatures`, `feePayer`, `feePayerSignatures` and `chainId`.
     */
    constructor(createTxObj) {
        if (_.isString(createTxObj)) {
            createTxObj = _decode(createTxObj)
            createTxObj.account = Account.createFromRLPEncoding(createTxObj.from, createTxObj.rlpEncodedKey)
        }

        super(TX_TYPE_STRING.TxTypeFeeDelegatedAccountUpdateWithRatio, createTxObj)
        this.account = createTxObj.account
    }

    /**
     * @type {Account}
     */
    get account() {
        return this._account
    }

    set account(acct) {
        if (!(acct instanceof Account)) throw new Error(`Invalid account. 'account' should be instance of 'Account'.`)
        if (this.from.toLowerCase() !== acct.address.toLowerCase())
            throw new Error(`Transaction from address(${this.from.toLowerCase()}) and account address(${acct.address}) do not match.`)

        this._account = acct
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
            TX_TYPE_TAG.TxTypeFeeDelegatedAccountUpdateWithRatio +
            RLP.encode([
                Bytes.fromNat(this.nonce),
                Bytes.fromNat(this.gasPrice),
                Bytes.fromNat(this.gas),
                this.from.toLowerCase(),
                this.account.getRLPEncodingAccountKey(),
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
            TX_TYPE_TAG.TxTypeFeeDelegatedAccountUpdateWithRatio,
            Bytes.fromNat(this.nonce),
            Bytes.fromNat(this.gasPrice),
            Bytes.fromNat(this.gas),
            this.from.toLowerCase(),
            this.account.getRLPEncodingAccountKey(),
            this.feeRatio,
        ])
    }
}

module.exports = FeeDelegatedAccountUpdateWithRatio
