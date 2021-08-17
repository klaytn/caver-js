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
const Account = require('../../../../caver-account/src')
const utils = require('../../../../caver-utils/src')

function _decode(rlpEncoded) {
    rlpEncoded = utils.addHexPrefix(rlpEncoded)
    if (!rlpEncoded.startsWith(TX_TYPE_TAG.TxTypeAccountUpdate))
        throw new Error(`Cannot decode to AccountUpdate. The prefix must be ${TX_TYPE_TAG.TxTypeAccountUpdate}: ${rlpEncoded}`)

    const typeDettached = `0x${rlpEncoded.slice(4)}`
    const [nonce, gasPrice, gas, from, rlpEncodedKey, signatures] = RLP.decode(typeDettached)
    return {
        nonce: utils.trimLeadingZero(nonce),
        gasPrice: utils.trimLeadingZero(gasPrice),
        gas: utils.trimLeadingZero(gas),
        from,
        rlpEncodedKey,
        signatures,
    }
}

/**
 * Represents an account update transaction.
 * Please refer to {@link https://docs.klaytn.com/klaytn/design/transactions/basic#txtypeaccountupdate|AccountUpdate} to see more detail.
 * @class
 * @hideconstructor
 * @augments AbstractTransaction
 */
class AccountUpdate extends AbstractTransaction {
    /**
     * Creates an account update transaction.
     * @method create
     * @param {object|string} createTxObj - The parameters to create an AccountUpdate transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                                      The object can define `from`, `account`, `nonce`, `gas`, `gasPrice`, `signatures` and `chainId`.
     * @return {AccountUpdate}
     */
    static create(createTxObj) {
        return new AccountUpdate(createTxObj)
    }

    /**
     * decodes the RLP-encoded string and returns an AccountUpdate transaction instance.
     *
     * @param {string} rlpEncoded The RLP-encoded account update transaction.
     * @return {AccountUpdate}
     */
    static decode(rlpEncoded) {
        const decoded = _decode(rlpEncoded)
        decoded.account = Account.createFromRLPEncoding(decoded.from, decoded.rlpEncodedKey)
        return new AccountUpdate(decoded)
    }

    /**
     * Creates an account update transaction.
     * @constructor
     * @param {object|string} createTxObj - The parameters to create an AccountUpdate transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                                      The object can define `from`, `account`, `nonce`, `gas`, `gasPrice`, `signatures` and `chainId`.
     */
    constructor(createTxObj) {
        if (_.isString(createTxObj)) {
            createTxObj = _decode(createTxObj)
            createTxObj.account = Account.createFromRLPEncoding(createTxObj.from, createTxObj.rlpEncodedKey)
        }

        super(TX_TYPE_STRING.TxTypeAccountUpdate, createTxObj)
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

        return (
            TX_TYPE_TAG.TxTypeAccountUpdate +
            RLP.encode([
                Bytes.fromNat(this.nonce),
                Bytes.fromNat(this.gasPrice),
                Bytes.fromNat(this.gas),
                this.from.toLowerCase(),
                this.account.getRLPEncodingAccountKey(),
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
            TX_TYPE_TAG.TxTypeAccountUpdate,
            Bytes.fromNat(this.nonce),
            Bytes.fromNat(this.gasPrice),
            Bytes.fromNat(this.gas),
            this.from.toLowerCase(),
            this.account.getRLPEncodingAccountKey(),
        ])
    }
}

module.exports = AccountUpdate
