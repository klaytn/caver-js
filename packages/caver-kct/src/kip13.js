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

const _ = require('lodash')

const Contract = require('../../caver-contract')
const { kip13JsonInterface, interfaceIds } = require('./kctHelper')
const { isAddress } = require('../../caver-utils')

/**
 * The KIP13 class allows you to easily check whether a SmartContract implements the KIP-13 standard.
 * It also provides the ability to query whether an interface id is implemented as a parameter.
 *
 * @class
 */
class KIP13 extends Contract {
    /**
     * Checks if the contract implements the KIP-13 standard.
     *
     * @example
     * const isImplemented = await caver.kct.kip13.isImplementedKIP13Interface('0x{address in hex}')
     *
     * @param {string} contractAddress The address of the contract to check.
     * @return {Promise<boolean>}
     */
    static async isImplementedKIP13Interface(contractAddress) {
        const kip13 = new KIP13(contractAddress)
        const isTrue = await kip13.sendQuery(interfaceIds.preCondition.true)
        const isFalse = await kip13.sendQuery(interfaceIds.preCondition.false)
        return isTrue && !isFalse
    }

    /**
     * KIP13 class represents the KIP-13 contract.
     *
     * @example
     * const kip13 = new caver.kct.kip13('0x{address in hex}')
     *
     * @constructor
     * @param {string} [contractAddress] - The smart contract address.
     * @param {Array} [abi] - The Contract Application Binary Interface (ABI) of the KIP-13.
     */
    constructor(contractAddress, abi = kip13JsonInterface) {
        if (contractAddress) {
            if (_.isString(contractAddress)) {
                if (!isAddress(contractAddress)) throw new Error(`Invalid contract address ${contractAddress}`)
            } else {
                abi = contractAddress
                contractAddress = undefined
            }
        }

        super(abi, contractAddress)
    }

    /**
     * Sends query to check whether the interface is supported or not.
     * Using `supportsInterface` method supported in the each KCT class is recommended to use instead of the `kip13.sendQuery`.
     *
     * @example
     * const isImplemented = await kip13.sendQuery('0x{interface id}')
     *
     * @param {string} interfaceId The interface id to check.
     * @return {Promise<boolean>}
     */
    async sendQuery(interfaceId) {
        const supported = await this.methods.supportsInterface(interfaceId).call()
        return supported
    }
}

module.exports = KIP13
