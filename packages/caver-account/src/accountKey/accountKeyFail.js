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

/**
 * Representing an AccountKeyFail.
 * @class
 * @hideconstructor
 */
class AccountKeyFail {
    /**
     * Decodes an RLP-encoded AccountKeyFail string.
     *
     * @example
     * const accountKey = caver.account.accountKey.accountKeyFail.decode('0x{encoded account key}')
     *
     * @param {string} rlpEncodedKey - An RLP-encoded AccountKeyFail string.
     * @return {AccountKeyFail}
     */
    static decode(rlpEncodedKey) {
        rlpEncodedKey = utils.addHexPrefix(rlpEncodedKey)
        if (!rlpEncodedKey.startsWith(ACCOUNT_KEY_TAG.ACCOUNT_KEY_FAIL_TAG))
            throw new Error(`Cannot decode to AccountKeyFail. The prefix must be ${ACCOUNT_KEY_TAG.ACCOUNT_KEY_FAIL_TAG}: ${rlpEncodedKey}`)

        return new AccountKeyFail()
    }

    /**
     * Returns an RLP-encoded AccountKeyFail string.
     *
     * @example
     * const encoding = accountKeyFail.getRLPEncoding()
     *
     * @return {string}
     */
    // eslint-disable-next-line class-methods-use-this
    getRLPEncoding() {
        return ACCOUNT_KEY_TAG.ACCOUNT_KEY_FAIL_TAG
    }
}

module.exports = AccountKeyFail
