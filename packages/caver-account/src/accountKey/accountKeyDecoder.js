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

const utils = require('../../../caver-utils')
const { ACCOUNT_KEY_TAG } = require('./accountKeyHelper')
const AccountKeyLegacy = require('./accountKeyLegacy')
const AccountKeyPublic = require('./accountKeyPublic')
const AccountKeyFail = require('./accountKeyFail')
const AccountKeyWeightedMultiSig = require('./accountKeyWeightedMultiSig')
const AccountKeyRoleBased = require('./accountKeyRoleBased')

/**
 * Representing an AccountKeyDecoder which can decode RLP-encoded accountKey string.
 * @class
 * @hideconstructor
 */
class AccountKeyDecoder {
    /**
     * decodes an RLP-encoded account key string.
     *
     * @example
     * const accountKey = caver.account.accountKey.decode('0x{encoded account key}')
     *
     * @param {string} rlpEncodedKey An RLP-encoded account key string.
     * @return {IAccountKey}
     */
    static decode(rlpEncodedKey) {
        rlpEncodedKey = utils.addHexPrefix(rlpEncodedKey)

        if (rlpEncodedKey.startsWith(ACCOUNT_KEY_TAG.ACCOUNT_KEY_LEGACY_TAG)) {
            return AccountKeyLegacy.decode(rlpEncodedKey)
        }
        if (rlpEncodedKey.startsWith(ACCOUNT_KEY_TAG.ACCOUNT_KEY_PUBLIC_TAG)) {
            return AccountKeyPublic.decode(rlpEncodedKey)
        }
        if (rlpEncodedKey.startsWith(ACCOUNT_KEY_TAG.ACCOUNT_KEY_FAIL_TAG)) {
            return AccountKeyFail.decode(rlpEncodedKey)
        }
        if (rlpEncodedKey.startsWith(ACCOUNT_KEY_TAG.ACCOUNT_KEY_WEIGHTED_MULTISIG_TAG)) {
            return AccountKeyWeightedMultiSig.decode(rlpEncodedKey)
        }
        if (rlpEncodedKey.startsWith(ACCOUNT_KEY_TAG.ACCOUNT_KEY_ROLE_BASED_TAG)) {
            return AccountKeyRoleBased.decode(rlpEncodedKey)
        }

        throw new Error(`Invalid RLP-encoded account key string: ${rlpEncodedKey}`)
    }
}

module.exports = AccountKeyDecoder
