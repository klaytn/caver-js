/*
    Copyright 2022 The caver-js Authors
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

const FeeDelegatedCancelWithRatio = require('../cancel/feeDelegatedCancelWithRatio')

/**
 * Represents a fee delegated cancel with ratio transaction wrapper.
 * @class
 * @hideconstructor
 */
class FeeDelegatedCancelWithRatioWrapper {
    /**
     * Creates a fee delegated cancel with ratio transaction wrapper.
     * The wrapper plays an intermediate role for calling static functions of each transaction type in `caver.transaction`.
     * @constructor
     * @param {object} _klaytnCall - An object includes klay rpc calls.
     */
    constructor(klaytnCall) {
        this.klaytnCall = klaytnCall
    }

    /**
     * Calls `FeeDelegatedCancelWithRatio.create`.
     *
     * @param {object} obj - An object defines fields to create a tx.
     * @return {string} An RLP-encoded transaction string.
     */
    create(obj) {
        return FeeDelegatedCancelWithRatio.create(obj, this.klaytnCall)
    }

    /**
     * Calls `FeeDelegatedCancelWithRatioMemo.decode`.
     *
     * @param {string} encoded - RLP-encoded string.
     * @return {string} FeeDelegatedCancelWithRatioMemo instance.
     */
    decode(encoded) {
        return FeeDelegatedCancelWithRatio.decode(encoded, this.klaytnCall)
    }
}

module.exports = FeeDelegatedCancelWithRatioWrapper
