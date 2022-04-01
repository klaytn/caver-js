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

const hasErrorMessage = result => !!result && !!result.error && !!result.error.message

const txErrorTable = {
    '0x2': 'VM error occurs while running smart contract',
    '0x3': 'max call depth exceeded',
    '0x4': 'contract address collision',
    '0x5': 'contract creation code storage out of gas',
    '0x6': 'evm: max code size exceeded',
    '0x7': 'out of gas',
    '0x8': 'evm: write protection',
    '0x9': 'evm: execution reverted',
    '0xa': 'reached the opcode count limit',
    '0xb': 'account already exists',
    '0xc': 'not a program account (e.g., an account having code and storage)',
    '0xd': 'Human-readable address is not supported now',
    '0xe': 'fee ratio is out of range [1, 99]',
    '0xf': 'AccountKeyFail is not updatable',
    '0x10': 'different account key type',
    '0x11': 'AccountKeyNil cannot be initialized to an account',
    '0x12': 'public key is not on curve',
    '0x13': 'key weight is zero',
    '0x14': 'key is not serializable',
    '0x15': 'duplicated key',
    '0x16': 'weighted sum overflow',
    '0x17': 'unsatisfiable threshold. Weighted sum of keys is less than the threshold.',
    '0x18': 'length is zero',
    '0x19': 'length too long',
    '0x1a': 'nested role-based key',
    '0x1b': 'a legacy transaction must be with a legacy account key',
    '0x1c': 'deprecated feature',
    '0x1d': 'not supported',
    '0x1e': 'smart contract code format is invalid',
}

module.exports = {
    InvalidConnection: host => new Error(`CONNECTION ERROR: Couldn't connect to node ${host}.`),
    RequestFailed: err => new Error(`Request failed: ${err}`),
    ConnectionTimeout: ms => new Error(`CONNECTION TIMEOUT: timeout of ${ms}ms achived`),
    ConnectionNotOpenError: event => {
        const error = new Error('connection not open on send()')
        if (event) {
            error.code = event.code
            error.reason = event.reason
        }

        return error
    },
    MaxAttemptsReachedOnReconnectingError: () => new Error('Maximum number of reconnect attempts reached!'),
    PendingRequestsOnReconnectingError: () =>
        new Error('CONNECTION ERROR: Provider started to reconnect before the response got received!'),
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
    invalidGasLimit: () => new Error('Invalid gas limit. Please provide valid gas.'),
    invalidData: () => new Error('Invalid data. Please provide valid hex-strict data.'),
    notAllowedZeroGas: () => new Error("gas can't be 0. Please provide more gas."),
    txErrorTable,
}
