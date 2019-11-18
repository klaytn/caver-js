/*
    Modifications copyright 2018 The caver-js Authors
    This file is part of web3.js.

    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.

    This file is derived from web3.js/packages/web3-core-helpers/src/errors.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/**
 * @file errors.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @author Marek Kotewicz <marek@parity.io>
 * @date 2017
 */

const constants = require('./constants')

const hasErrorMessage = result => !!result && !!result.error && !!result.error.message

module.exports = {
    InvalidConnection: host => new Error(`CONNECTION ERROR: Couldn't connect to node ${host}.`),
    ConnectionTimeout: ms => new Error(`CONNECTION TIMEOUT: timeout of ${ms}ms achived`),
    InvalidProvider: () => new Error('Provider not set or invalid'),
    InvalidNumberOfParams: (got, expected, method) =>
        new Error(`
    Invalid number of parameters for "${method}". Got ${got} expected ${expected}!
    `),
    ErrorResponse: result => {
        const message = hasErrorMessage(result) ? result.error.message : JSON.stringify(result)
        return new Error(`Returned error: ${message}`)
    },
    InvalidResponse: result => {
        if (result === null) return new Error('Invalid response: null')
        const message = hasErrorMessage(result) ? result.error.message : `Invalid JSON RPC response: ${JSON.stringify(result)}`
        return new Error(message)
    },
    needNameCallPropertyToCreateMethod: new Error('When creating a method you need to provide at least the "name" and "call" property.'),
    blockHashNull: new Error('blockHash null'),
    contractCouldntBeStored: new Error("The contract code couldn't be stored, please check your gas limit."),
    receiptDidntContainContractAddress: new Error("The transaction receipt didn't contain a contract address."),
    transactionReverted: receiptJSON => new Error(`Transaction has been reverted by the EVM:\n${receiptJSON}`),
    transactionRanOutOfGas: receiptJSON => new Error(`Transaction ran out of gas. Please provide more gas:\n${receiptJSON}`),
    invalidGasPrice: () => new Error(`Invalid gas price. Please provide valid gas price: ${constants.VALID_GAS_PRICE}`),
    invalidGasLimit: () => new Error('Invalid gas limit. Please provide valid gas.'),
    invalidData: () => new Error('Invalid data. Please provide valid hex-strict data.'),
    notAllowedZeroGas: () => new Error("gas can't be 0. Please provide more gas."),
}
