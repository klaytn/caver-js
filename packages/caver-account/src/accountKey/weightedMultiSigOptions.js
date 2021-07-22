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

/**
 * Representing an options for AccountKeyWeightedMultiSig.
 * This class will define threshold and weights.
 * @class
 */
class WeightedMultiSigOptions {
    /**
     * Creates an instance of WeightedMultiSigOptions.
     *
     * @example
     * const options = caver.account.weightedMultiSigOptions.fromObject({ threshold: 2, weights: [1, 1] })
     *
     * @param {object} options - An object which defines 'threshold' and 'weights'.
     * @return {WeightedMultiSigOptions}
     */
    static fromObject(options) {
        // To support the previous options format(threshold and weight)
        if (options.weight && !options.weights) {
            options.weights = options.weight
            delete options.weight
        }

        // Returns empty WeightedMultiSigOptions if options not define threshold and weights like '{}'
        if (options.threshold === undefined && options.weights === undefined) return new WeightedMultiSigOptions()

        if (options.threshold === undefined || options.weights === undefined)
            throw new Error(`Invalid object for creating WeightedMultiSigOptions. 'threshold' and 'weights' should be defined.`)

        return new WeightedMultiSigOptions(options.threshold, options.weights)
    }

    /**
     * Creates an instance of WeightedMultiSigOptions.
     *
     * @example
     * const options = new caver.account.weightedMultiSigOptions(2, [1, 1])
     *
     * @param {number} threshold - a threshold
     * @param {Array.<number>} weights - an array of weight of key
     */
    constructor(threshold, weights) {
        if ((threshold !== undefined && weights === undefined) || (threshold === undefined && weights !== undefined)) {
            throw new Error(`For creating an WeightedMultiSigOptions, 'threshold' and 'weights' should be defined.`)
        }
        if (threshold !== undefined) this.threshold = threshold
        if (weights !== undefined) this.weights = weights
    }

    /**
     * @type {number}
     */
    get threshold() {
        return this._threshold
    }

    set threshold(th) {
        if (!_.isNumber(th)) throw new Error(`The threshold must be number type.`)

        if (!validateWeightedSum(th, this.weights))
            throw new Error('Invalid options for AccountKeyWeightedMultiSig: The sum of weights is less than the threshold.')

        this._threshold = th
    }

    /**
     * @type {Array.<number>}
     */
    get weights() {
        return this._weights
    }

    set weights(weightArr) {
        if (!_.isArray(weightArr)) throw new Error(`weight should be an array that stores the weight of each public key.`)
        for (const w of weightArr) {
            if (!_.isNumber(w)) throw new Error(`The weight of each key must be number type.`)
        }

        if (!validateWeightedSum(this.threshold, weightArr))
            throw new Error('Invalid options for AccountKeyWeightedMultiSig: The sum of weights is less than the threshold.')

        this._weights = weightArr
    }

    /**
     * Returns 'true' if WeightedMultiSigOptions is empty.
     *
     * @example
     * const isEmpty = options.isEmpty()
     *
     * @return {Boolean}
     */
    isEmpty() {
        return this.threshold === undefined && this.weights === undefined
    }
}

/**
 * validates threshold and sum of weights.
 * @ignore
 * @param {number} threshold - The threshold of the AccountKeyWeightedMultiSig.
 * @param {Array.<number>} weights - An array of weights.
 * @return {Boolean}
 */
function validateWeightedSum(threshold, weights) {
    if (threshold === undefined || weights === undefined) return true

    let weightSum = 0

    for (const w of weights) weightSum += w

    if (threshold > weightSum) return false

    return true
}

module.exports = WeightedMultiSigOptions
