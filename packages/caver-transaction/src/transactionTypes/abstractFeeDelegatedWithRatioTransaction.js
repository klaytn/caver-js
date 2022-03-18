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
const AbstractFeeDelegatedTransaction = require('./abstractFeeDelegatedTransaction')
const utils = require('../../../caver-utils/src')

/**
 * Abstract class that implements common logic for each fee delegated with ratio transaction type.
 * @class
 * @hideconstructor
 * @abstract
 * @augments AbstractFeeDelegatedTransaction
 */
class AbstractFeeDelegatedWithRatioTransaction extends AbstractFeeDelegatedTransaction {
    /**
     * Abstract class that implements common logic for each fee-delegated with ratio transaction type.
     * In this constructor, feeRatio is set as transaction member variables.
     *
     * @constructor
     * @param {string} typeString - The type string of transaction.
     * @param {object} createTxObj - The parameters to create an instance of transaction.
     * @param {object} [klaytnCall] - An object includes klay rpc calls.
     */
    constructor(typeString, createTxObj, klaytnCall) {
        super(typeString, createTxObj, klaytnCall)
        this.feeRatio = createTxObj.feeRatio
    }

    /**
     * @type {string}
     */
    get feeRatio() {
        return this._feeRatio
    }

    set feeRatio(fr) {
        if (!_.isNumber(fr) && !utils.isHex(fr))
            throw new Error(`Invalid type fo feeRatio: feeRatio should be number type or hex number string.`)
        if (utils.hexToNumber(fr) <= 0 || utils.hexToNumber(fr) >= 100)
            throw new Error(`Invalid feeRatio: feeRatio is out of range. [1, 99]`)

        this._feeRatio = utils.numberToHex(fr)
    }
}

module.exports = AbstractFeeDelegatedWithRatioTransaction
