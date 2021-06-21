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
 * @class
 */
class SignatureData {
    /**
     * creates a SignatureData.
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
        this._v = utils.makeEven(v)
    }

    /**
     * @type {string}
     */
    get V() {
        return this.v
    }

    set V(v) {
        this.v = v
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
     * Return `true` if signature is same with emptySig.
     *
     * @return {boolean}
     */
    isEmpty() {
        if (this.v === '0x01' && this.r === '0x' && this.s === '0x') return true
        return false
    }

    /**
     * Convert to array and return
     *
     * @return {Array.<string>}
     */
    encode() {
        return [this.v, this.r, this.s]
    }

    /**
     * Convert to string
     *
     * @return {string}
     */
    toString() {
        return this.v + this.r + this.s
    }
}

SignatureData.emtpySig = new SignatureData(emptySigArray)

module.exports = SignatureData
