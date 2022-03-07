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
const utils = require('../../../caver-utils/src/utils')

const emptySigArray = ['0x01', '0x', '0x']

/**
 * Representing a SignatureData class that includes ECDSA signature data string.
 *
 * @example
 * caver.wallet.keyring.signatureData
 *
 * @class
 */
class SignatureData {
    /**
     * creates a SignatureData.
     *
     * @example
     * const signature = new caver.wallet.keyring.signatureData([
     *     '0x0fea',
     *     '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
     *     '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
     * ])
     *
     * @param {Array.<string>|SignatureData} key - The ECDSA signatureData
     */
    constructor(signature) {
        if (!signature) signature = emptySigArray
        if (signature instanceof SignatureData) {
            this.v = signature.v
            this.r = signature.r
            this.s = signature.s
        }
        if (!_.isArray(signature)) signature = utils.resolveSignature(signature)

        const [v, r, s] = signature
        this.v = v
        this.r = r
        this.s = s
    }

    /**
     * @type {string}
     */
    get v() {
        return this._v
    }

    set v(v) {
        v = v.slice(0, 2) === '0x' ? v : `0x${v}`
        // If v of Signature is 0, '0x' is returned when RLP decoded.
        // However, the Bytes.toNumber function used for recover public key cannot convert '0x' to 0,
        // so to handle this case, v is converted to '0x0' in case of '0x' (makeEven converts '0x0' to '0x00').
        v = v === '0x' ? '0x0' : v
        this._v = utils.makeEven(v)
    }

    /**
     * @type {string}
     */
    get V() {
        return this.v
    }

    set V(v) {
        this.v = utils.makeEven(v)
    }

    /**
     * @type {string}
     */
    get r() {
        return this._r
    }

    set r(r) {
        r = r.slice(0, 2) === '0x' ? r : `0x${r}`
        this._r = utils.makeEven(r)
    }

    /**
     * @type {string}
     */
    get R() {
        return this.r
    }

    set R(r) {
        this.r = r
    }

    /**
     * @type {string}
     */
    get s() {
        return this._s
    }

    set s(s) {
        s = s.slice(0, 2) === '0x' ? s : `0x${s}`
        this._s = utils.makeEven(s)
    }

    /**
     * @type {string}
     */
    get S() {
        return this.s
    }

    set S(s) {
        this.s = s
    }

    /**
     * Returns `true` if signature is same with emptySig.
     *
     * @example
     * const isEmpty = signatureData.isEmpty()
     *
     * @return {boolean} `ture` means the signatureData is empty.
     */
    isEmpty() {
        if (this.v === '0x01' && this.r === '0x' && this.s === '0x') return true
        return false
    }

    /**
     * Convert to array and return.
     *
     * @example
     * const arrayFormat = signatureData.encode()
     *
     * @return {Array.<string>} An array format of signature.
     */
    encode() {
        return [utils.makeEven(utils.trimLeadingZero(this.v)), this.r, this.s]
    }

    /**
     * Converts to combined string.
     *
     * @example
     * const sig = signatureData.toString()
     *
     * @return {string}
     */
    toString() {
        return this.v + this.r + this.s
    }

    /**
     * Checks that the signature data is the same.
     *
     * @example
     * const isEqual = signatureData.isEqual([ '0x1b', '0xc6901...', '0x642d8...' ])
     *
     * @param {Array.<string>|SignatureData} sig - The ECDSA signatureData to compare
     * @return {boolean}
     */
    isEqual(sig) {
        sig = new SignatureData(sig)
        return this.toString() === sig.toString()
    }
}

/**
 * @type {SignatureData}
 *
 * @example
 * caver.wallet.keyring.signatureData.emtpySig
 */
SignatureData.emtpySig = new SignatureData(emptySigArray)

module.exports = SignatureData
