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

class KIP13 extends Contract {
    /**
     * isImplementedKIP13Interface checks if the contract implements KIP-13.
     *
     * @method isImplementedKIP13Interface
     * @param {string} contractAddress The address of the contract to check.
     * @return {boolean}
     */
    static async isImplementedKIP13Interface(contractAddress) {
        const kip13 = new KIP13(contractAddress)
        const isTrue = await kip13.sendQuery(interfaceIds.preCondition.true)
        const isFalse = await kip13.sendQuery(interfaceIds.preCondition.false)
        return isTrue && !isFalse
    }

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
     * sendQuery sends query to check whether interface is supported or not.
     *
     * @method sendQuery
     * @param {string} interfaceId The interface id to check.
     * @return {boolean}
     */
    async sendQuery(interfaceId) {
        const supported = await this.methods.supportsInterface(interfaceId).call()
        return supported
    }
}

module.exports = KIP13
