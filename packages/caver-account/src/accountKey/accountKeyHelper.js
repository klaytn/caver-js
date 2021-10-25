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

/**
 * @module AccountKeyHelper
 * @ignore
 */

const _ = require('lodash')
const WeightedMultiSigOptions = require('./weightedMultiSigOptions')

const ACCOUNT_KEY_TAG = {
    ACCOUNT_KEY_NIL_TAG: '0x80',
    ACCOUNT_KEY_LEGACY_TAG: '0x01c0',
    ACCOUNT_KEY_PUBLIC_TAG: '0x02',
    ACCOUNT_KEY_FAIL_TAG: '0x03c0',
    ACCOUNT_KEY_WEIGHTED_MULTISIG_TAG: '0x04',
    ACCOUNT_KEY_ROLE_BASED_TAG: '0x05',
}

/**
 * Creates and returns the valid instance of WeightedMultiSigOptions for AccountKeyWeightedMultiSig.
 * If the user does not define the values of options(threshold, weights),
 * default options(threshold is 1 and the weight of each key is 1) are returned.
 *
 * @param {number} lengthOfKeys The lenght of keys.
 * @param {WeightedMultiSigOptions|object} [options] An instance of WeightedMultiSigOptions or an object that defines 'threshold' and 'weight'.
 * @return {WeightedMultiSigOptions}
 */
const fillWeightedMultiSigOptionsForMultiSig = (lengthOfKeys, options) => {
    if (_.isArray(options))
        throw new Error(`For AccountKeyWeightedMultiSig, options cannot be defined as an array of WeightedMultiSigOptions.`)

    if (!options) options = new WeightedMultiSigOptions(1, Array(lengthOfKeys).fill(1))
    if (!(options instanceof WeightedMultiSigOptions)) options = WeightedMultiSigOptions.fromObject(options)

    return options.isEmpty() ? new WeightedMultiSigOptions(1, Array(lengthOfKeys).fill(1)) : options
}

/**
 * Creates and returns the valid instance of WeightedMultiSigOptions for AccountKeyRoleBased.
 * If the user does not define the values of options(threshold, weights),
 * default options(threshold is 1 and the weight of each key is 1) will be used for each role key.
 *
 * @param {Array.<number>} lengthOfKeys The lenght of keys.
 * @param {Array.<WeightedMultiSigOptions>|Array.<object>} [options] An array of WeightedMultiSigOptions or object that defines 'threshold' and 'weight'.
 * @return {Array.<WeightedMultiSigOptions>}
 */
const fillWeightedMultiSigOptionsForRoleBased = (lengthOfKeys, options = []) => {
    if (!_.isArray(options)) throw new Error(`For AccountKeyRoleBased, options should be an array of WeightedMultiSigOptions.`)

    for (let i = 0; i < lengthOfKeys.length; i++) {
        if (options[i] && !(options[i] instanceof WeightedMultiSigOptions)) {
            options[i] = WeightedMultiSigOptions.fromObject(options[i])
        }
        // If the WeightedMultiSigOptions instance is not empty,
        // it means that the user has defined the option parameters needed when updating to AccountKeyWeightedMultiSig.
        if (options[i] && !options[i].isEmpty()) continue

        let optionToAdd
        if (lengthOfKeys[i] > 1) {
            // default option when option is not set
            optionToAdd = new WeightedMultiSigOptions(1, Array(lengthOfKeys[i]).fill(1))
        } else {
            // AccountKeyPublic does not need option
            optionToAdd = new WeightedMultiSigOptions()
        }

        if (options[i]) {
            options[i] = optionToAdd
        } else {
            options.push(optionToAdd)
        }
    }
    return options
}

module.exports = {
    ACCOUNT_KEY_TAG,
    fillWeightedMultiSigOptionsForMultiSig,
    fillWeightedMultiSigOptionsForRoleBased,
}
