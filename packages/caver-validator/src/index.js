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
const { refineSignatures } = require('../../caver-transaction/src/transactionHelper/transactionHelper')

class Validator {
    /**
     * Validate signed message.
     * This function will compare public key in account key information from Klaytn and public key recovered from signature.
     *
     * @example
     * const address = '0x...'
     * const message = 'Some data'
     * const signature = { v: '0x1c', r: '0xd0b8d...', s: '0x5472e...' } // You can get a signature via `keyring.signMessage(...).signatures[0]`.
     * const isValid = caver.validator.validateSignedMessage(message, signature, address)
     *
     * @method recoverPublicKey
     * @param {string} message The raw message string. If this message is hased with Klaytn specific prefix, the third parameter should be passed as `true`.
     * @param {SignatureData|Array.<SignatureData>} signatures An instance of `SignatureData` or an array of `SignatureData`.
     * @param {string} address The address of the account that signed the message.
     * @param {boolean} [isHashed] (optional, default: `false`) If the `isHashed` is true, the given message will NOT automatically be prefixed with "\x19Klaytn Signed Message:\n" + message.length + message, and be assumed as already prefixed.
     * @return {boolean}
     */
    async validateSignedMessage(message, signatures, address, isHashed = false) {
        const getAccountKeyResult = await Validator._klaytnCall.getAccountKey(address)

        // Remove duplicate and format to `Array.<SignatureData>` type.
        signatures = refineSignatures(signatures)

        // In case of `AccontKeyRoleBased`, validation must be performed using AccountKey corresponding to roleTransactionKey.
        // Therefore, to call the function recursively and to share variables, the `compareRecoveredPublicKeyAndAccountKey` function is defined inside.
        function validateSignaturesWithAccountKey(accountKey) {
            let isValid = false

            switch (accountKey.keyType) {
                case 1:
                    // TODO: If an invalid signature is included, it should be changed to return false.
                    // if (signatures.length > 1) return isValid
                    for (const sig of signatures) {
                        const recovered = utils.recoverPublicKey(message, sig, isHashed)
                        const pub = recovered.toString()
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
                    for (const sig of signatures) {
                        const recovered = utils.recoverPublicKey(message, sig, isHashed)
                        const pub = recovered.toString()
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

                    for (const sig of signatures) {
                        const recovered = utils.recoverPublicKey(message, sig, isHashed)
                        const pub = recovered.toString()

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
                    // it is judged as valid only if the signature is signed using roleTransactionKey.
                    isValid = validateSignaturesWithAccountKey(accountKey.key[0])
                    break
                default:
                    throw new Error(`Invalid account key type`)
            }

            return isValid
        }

        return validateSignaturesWithAccountKey(getAccountKeyResult)
    }
}

module.exports = Validator
