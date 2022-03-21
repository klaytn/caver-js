/*
    Copyright 2021 The caver-js Authors
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

const utils = require('../../caver-utils')
const { KEY_ROLE } = require('../../caver-wallet/src/keyring/keyringHelper')
const { refineSignatures } = require('../../caver-transaction/src/transactionHelper/transactionHelper')
const AbstractTransaction = require('../../caver-transaction/src/transactionTypes/abstractTransaction')
const AbstractFeeDelegatedTransaction = require('../../caver-transaction/src/transactionTypes/abstractFeeDelegatedTransaction')

/**
 * Representing a class to support validation functions.
 * @class
 * @hideconstructor
 */
class Validator {
    /**
     * Creates a Validator.
     *
     * @constructor
     * @param {object} klaytnCall - An object includes klay rpc calls.
     */
    constructor(klaytnCall) {
        this.klaytnCall = klaytnCall
    }

    /**
     * Validates a signed message by comparing the public key recovered from the signature with the account key of the Klaytn account.
     *
     * @example
     * const address = '0x...'
     * const message = 'Some data'
     * const signature = { v: '0x1c', r: '0xd0b8d...', s: '0x5472e...' } // You can get a signature via `keyring.signMessage(...).signatures[0]`.
     * const isValid = caver.validator.validateSignedMessage(message, signature, address)
     *
     * @memberof Validator
     * @inner
     *
     * @param {string} message The raw message string. If this message is hased with Klaytn specific prefix, the third parameter should be passed as `true`.
     * @param {SignatureData|Array.<SignatureData>} signatures An instance of `SignatureData` or an array of `SignatureData`.
     * @param {string} address The address of the account that signed the message.
     * @param {boolean} [isHashed] (optional, default: `false`) If the `isHashed` is true, the given message will NOT automatically be prefixed with "\x19Klaytn Signed Message:\n" + message.length + message, and be assumed as already prefixed.
     * @return {Promise<boolean>} The promise will be resolved with a boolean value of whether the signature on the message is valid or not.
     */
    async validateSignedMessage(message, signatures, address, isHashed = false) {
        const getAccountKeyResult = await this.klaytnCall.getAccountKey(address)

        // Remove duplicate and format to `Array.<SignatureData>` type.
        signatures = refineSignatures(signatures)

        const publicKeys = []
        for (const sig of signatures) {
            const recovered = utils.recoverPublicKey(message, sig, isHashed)
            const pub = recovered.toString()
            publicKeys.push(pub)
        }

        return validateWithAccountKeyAndRole(address, getAccountKeyResult, publicKeys, KEY_ROLE.roleTransactionKey)
    }

    /**
     * Validates a transaction.
     * This function compares the public keys from the account key of the Klaytn account with the public keys recovered from `signatures`.
     * If the transaction is fee-delegated with the `feePayerSignatures` variable inside, this function compares the public keys recovered from `feePayerSignatures` with the public keys of the fee payer.
     *
     * @example
     * const tx = caver.transaction.valueTransfer.create({...})
     * const isValid = caver.validator.validateTransaction(tx)
     *
     * @memberof Validator
     * @inner
     *
     * @param {module:Transaction.Transaction} tx An instance of transaction to validate.
     * @return {boolean}
     */
    async validateTransaction(tx) {
        let isValid = await this.validateSender(tx)

        if (isValid === true && tx instanceof AbstractFeeDelegatedTransaction) {
            isValid = this.validateFeePayer(tx)
        }

        return isValid
    }

    /**
     * Validates the sender of the transaction.
     * This function compares the public keys of the account key of the Klaytn account with the public keys recovered from `signatures`.
     *
     * @example
     * const tx = caver.transaction.valueTransfer.create({...})
     * const isValid = caver.validator.validateSender(tx)
     *
     * @memberof Validator
     * @inner
     *
     * @param {module:Transaction.Transaction} tx An instance of transaction to validate.
     * @return {boolean}
     */
    async validateSender(tx) {
        if (!(tx instanceof AbstractTransaction))
            throw new Error(
                'Invalid parameter type: To validate `signatures` field in the transaction, you need to pass the transaction instance.'
            )
        const fromAccountKey = await this.klaytnCall.getAccountKey(tx.from)
        const publicKeys = tx.recoverPublicKeys()

        const role = tx.type.includes('AccountUpdate') ? KEY_ROLE.roleAccountUpdateKey : KEY_ROLE.roleTransactionKey

        return validateWithAccountKeyAndRole(tx.from, fromAccountKey, publicKeys, role)
    }

    /**
     * Validates a fee payer in the transaction.
     * This function compares the public keys of the account key of the fee payer with the public keys recovered from `feePayerSignatures`.
     *
     * @example
     * const tx = caver.transaction.feeDelegatedValueTransfer.create({...})
     * const isValid = caver.validator.validateFeePayer(tx)
     *
     * @memberof Validator
     * @inner
     *
     * @param {module:Transaction.FeeDelegatedTransaction} tx An instance of transaction to validate.
     * @return {boolean}
     */
    async validateFeePayer(tx) {
        if (!(tx instanceof AbstractFeeDelegatedTransaction))
            throw new Error(
                'Invalid parameter type: To validate `feePayerSignatures` field in the transaction, you need to pass the fee-delegated transaction instance.'
            )
        const feePayerAccountKey = await this.klaytnCall.getAccountKey(tx.feePayer)
        const publicKeys = tx.recoverFeePayerPublicKeys()

        const role = KEY_ROLE.roleFeePayerKey

        return validateWithAccountKeyAndRole(tx.feePayer, feePayerAccountKey, publicKeys, role)
    }
}

function validateWithAccountKeyAndRole(address, accountKey, publicKeys, role) {
    let isValid = false

    // For accounts that have not yet been applied in Klaytn's state, the return value of `caver.rpc.klay.getAccountKey` is null.
    // In this case, the account's key has never been updated, so the logic is the same as in AccountKeyLegacy.
    if (accountKey === null) accountKey = { keyType: 1, key: {} }

    switch (accountKey.keyType) {
        case 1:
            // TODO: If an invalid signature is included, it should be changed to return false.
            // if (signatures.length > 1) return isValid
            for (const pub of publicKeys) {
                const recoveredAddress = utils.publicKeyToAddress(pub)

                if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
                    isValid = true
                    break
                }
            }
            break
        case 2:
            // TODO: If an invalid signature is included, it should be changed to return false.
            // if (signatures.length > 1) return isValid
            for (const pub of publicKeys) {
                const xyPoints = utils.xyPointFromPublicKey(pub)
                if (
                    xyPoints[0].toLowerCase() === accountKey.key.x.toLowerCase() &&
                    xyPoints[1].toLowerCase() === accountKey.key.y.toLowerCase()
                ) {
                    isValid = true
                    break
                }
            }
            break
        case 3:
            break
        case 4:
            // TODO: If an invalid signature is included, it should be changed to return false.
            // if (signatures.length > accountKey.key.keys.length) return isValid
            let weightSum = 0
            const threshold = accountKey.key.threshold

            for (const pub of publicKeys) {
                for (const pubKey of accountKey.key.keys) {
                    const xyPoints = utils.xyPointFromPublicKey(pub)
                    if (
                        xyPoints[0].toLowerCase() === pubKey.key.x.toLowerCase() &&
                        xyPoints[1].toLowerCase() === pubKey.key.y.toLowerCase()
                    ) {
                        weightSum += pubKey.weight
                        break
                    }
                }

                // If sum of weight is satisfied threshold, signatures are valid.
                if (weightSum >= threshold) {
                    isValid = true
                    break
                }
            }
            break
        case 5:
            // If the AccountKey of the account is AccountKeyRoleBased,
            // it is judged as valid only if the signature is signed using valid role key.
            const roleKey = accountKey.key[role]
            if (accountKey.key[role].keyType === 5) throw new Error(`Invalid account key type: nested composite type`)
            isValid = validateWithAccountKeyAndRole(address, roleKey, publicKeys)
            break
        default:
            throw new Error(`Invalid account key type`)
    }

    return isValid
}

module.exports = Validator
