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
const AbstractFeeDelegatedTransaction = require('../abstractFeeDelegatedTransaction')
const { TX_TYPE_STRING, TX_TYPE_TAG } = require('../../transactionHelper/transactionHelper')
const utils = require('../../../../caver-utils/src')
const Account = require('../../../../caver-account')

function _decode(rlpEncoded) {
    rlpEncoded = utils.addHexPrefix(rlpEncoded)
    if (!rlpEncoded.startsWith(TX_TYPE_TAG.TxTypeFeeDelegatedAccountUpdate))
        throw new Error(
            `Cannot decode to FeeDelegatedAccountUpdate. The prefix must be ${TX_TYPE_TAG.TxTypeFeeDelegatedAccountUpdate}: ${rlpEncoded}`
        )

    const typeDettached = `0x${rlpEncoded.slice(4)}`
    const [nonce, gasPrice, gas, from, rlpEncodedKey, signatures, feePayer, feePayerSignatures] = RLP.decode(typeDettached)
    return {
        nonce: utils.trimLeadingZero(nonce),
        gasPrice: utils.trimLeadingZero(gasPrice),
        gas: utils.trimLeadingZero(gas),
        from,
        rlpEncodedKey,
        signatures,
        feePayer,
        feePayerSignatures,
    }
}

/**
 * Represents a fee delegated account update transaction.
 * Please refer to {@link https://docs.klaytn.com/klaytn/design/transactions/fee-delegation#txtypefeedelegatedaccountupdate|FeeDelegatedAccountUpdate} to see more detail.
 * @class
 * @hideconstructor
 */
class FeeDelegatedAccountUpdate extends AbstractFeeDelegatedTransaction {
    /**
     * Creates a fee delegated account update transaction.
     * @method create
     * @param {object|string} createTxObj - The parameters to create a FeeDelegatedAccountUpdate transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                               The object can define `from`, `account`, `nonce`, `gas`, `gasPrice`, `signatures`, `feePayer`, `feePayerSignatures` and `chainId`.
     * @return {FeeDelegatedAccountUpdate}
     */
    static create(createTxObj) {
        return new FeeDelegatedAccountUpdate(createTxObj)
    }

    /**
     * decodes the RLP-encoded string and returns a FeeDelegatedAccountUpdate transaction instance.
     *
     * @param {string} rlpEncoded The RLP-encoded fee delegated account update transaction.
     * @return {FeeDelegatedAccountUpdate}
     */
    static decode(rlpEncoded) {
        const decoded = _decode(rlpEncoded)
        decoded.account = Account.createFromRLPEncoding(decoded.from, decoded.rlpEncodedKey)
        return new FeeDelegatedAccountUpdate(decoded)
    }

    /**
     * Creates a fee delegated account update transaction.
     * @constructor
     * @param {object|string} createTxObj - The parameters to create a FeeDelegatedAccountUpdate transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                               The object can define `from`, `account`, `nonce`, `gas`, `gasPrice`, `signatures`, `feePayer`, `feePayerSignatures` and `chainId`.
     */
    constructor(createTxObj) {
        if (_.isString(createTxObj)) {
            createTxObj = _decode(createTxObj)
            createTxObj.account = Account.createFromRLPEncoding(createTxObj.from, createTxObj.rlpEncodedKey)
        }

        super(TX_TYPE_STRING.TxTypeFeeDelegatedAccountUpdate, createTxObj)
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
     *
     * @example
     * const result = tx.getRLPEncoding()
     *
     * @return {string} An RLP-encoded transaction string.
     */
    getRLPEncoding() {
        this.validateOptionalValues()
        const signatures = this.signatures.map(sig => sig.encode())
        const feePayerSignatures = this.feePayerSignatures.map(sig => sig.encode())

        return (
            TX_TYPE_TAG.TxTypeFeeDelegatedAccountUpdate +
            RLP.encode([
                Bytes.fromNat(this.nonce),
                Bytes.fromNat(this.gasPrice),
                Bytes.fromNat(this.gas),
                this.from.toLowerCase(),
                this.account.getRLPEncodingAccountKey(),
                signatures,
                this.feePayer.toLowerCase(),
                feePayerSignatures,
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
            TX_TYPE_TAG.TxTypeFeeDelegatedAccountUpdate,
            Bytes.fromNat(this.nonce),
            Bytes.fromNat(this.gasPrice),
            Bytes.fromNat(this.gas),
            this.from.toLowerCase(),
            this.account.getRLPEncodingAccountKey(),
        ])
    }
}

module.exports = FeeDelegatedAccountUpdate
