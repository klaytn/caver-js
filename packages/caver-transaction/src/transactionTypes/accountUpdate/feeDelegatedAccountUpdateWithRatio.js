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
const AbstractTransaction = require('../abstractTransaction')
const AbstractFeeDelegatedWithRatioTransaction = require('../abstractFeeDelegatedWithRatioTransaction')
const { TX_TYPE_STRING, TX_TYPE_TAG, isNot } = require('../../transactionHelper/transactionHelper')
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
 * Please refer to {@link https://docs.klaytn.com/klaytn/design/transactions/partial-fee-delegation#txtypefeedelegatedaccountupdatewithratio|FeeDelegatedAccountUpdateWithRatio} to see more detail.
 * @class
 * @hideconstructor
 * @augments AbstractFeeDelegatedWithRatioTransaction
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
            TX_TYPE_TAG.TxTypeFeeDelegatedAccountUpdateWithRatio +
            RLP.encode([
                Bytes.fromNat(this.nonce),
                Bytes.fromNat(this.gasPrice),
                Bytes.fromNat(this.gas),
                this.from.toLowerCase(),
                this.account.getRLPEncodingAccountKey(),
                Bytes.fromNat(this.feeRatio),
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
            TX_TYPE_TAG.TxTypeFeeDelegatedAccountUpdateWithRatio,
            Bytes.fromNat(this.nonce),
            Bytes.fromNat(this.gasPrice),
            Bytes.fromNat(this.gas),
            this.from.toLowerCase(),
            this.account.getRLPEncodingAccountKey(),
            Bytes.fromNat(this.feeRatio),
        ])
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
            isNot(this.chainId) ? AbstractTransaction.getChainId() : this.chainId,
            isNot(this.gasPrice) ? AbstractTransaction.getGasPrice() : this.gasPrice,
            isNot(this.nonce) ? AbstractTransaction.getNonce(this.from) : this.nonce,
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

module.exports = FeeDelegatedAccountUpdateWithRatio
