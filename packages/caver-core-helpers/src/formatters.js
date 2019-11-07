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

    This file is derived from web3.js/packages/web3-core-helpers/src/formatters.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/**
 * @file formatters.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @author Marek Kotewicz <marek@parity.io>
 * @date 2017
 */

const _ = require('underscore')
const utils = require('../../caver-utils')
const validateParams = require('../../caver-core-helpers/src/validateFunction').validateParams

/**
 * Should the format output to a big number
 *
 * @method outputBigNumberFormatter
 * @param {String|Number|BigNumber} number
 * @returns {BigNumber} object
 */
const outputBigNumberFormatter = function(number) {
    return utils.toBN(number).toString(10)
}

const inputDefaultBlockNumberFormatter = function(blockNumber) {
    if (this && (blockNumber === undefined || blockNumber === null)) {
        return utils.parsePredefinedBlockNumber(this.defaultBlock) || 'latest'
    }
    return inputBlockNumberFormatter(blockNumber)
}

const inputBlockNumberFormatter = function(blockNumber) {
    if (blockNumber === undefined) {
        return undefined
    }
    if (utils.isPredefinedBlockNumber(blockNumber)) {
        return utils.parsePredefinedBlockNumber(blockNumber)
    }
    return utils.isHexStrict(blockNumber)
        ? _.isString(blockNumber)
            ? blockNumber.toLowerCase()
            : blockNumber
        : utils.numberToHex(blockNumber)
}

/**
 * Formats the input of a transaction and converts all values to HEX
 *
 * @method _txInputFormatter
 * @param {Object} transaction options
 * @returns object
 */
const _txInputFormatter = function(options) {
    if (options.from) {
        options.from = inputAddressFormatter(options.from)
    }

    if (options.to) {
        options.humanReadable = options.humanReadable !== undefined ? options.humanReadable : false
        if (options.humanReadable) throw new Error('HumanReadableAddress is not supported yet.')
        if (!utils.isContractDeployment(options) || options.to !== '0x') {
            options.to = inputAddressFormatter(options.to)
        }
    }

    if (options.data && options.input) {
        throw new Error(
            'You can\'t have "data" and "input" as properties of transactions at the same time, please use either "data" or "input" instead.'
        )
    }

    if (!options.data && options.input) {
        options.data = options.input
        delete options.input
    }

    if (options.data && !utils.isHex(options.data)) {
        options.data = utils.toHex(options.data)
    }

    // allow both
    if (options.gas || options.gasLimit) {
        options.gas = options.gas || options.gasLimit
    }

    const fieldToBeHex = ['gasPrice', 'gas', 'value', 'nonce', 'feeRatio']

    fieldToBeHex
        .filter(function(key) {
            return options[key] !== undefined
        })
        .forEach(function(key) {
            options[key] = utils.numberToHex(options[key])
        })

    return options
}

/**
 * Formats the input of a transaction and converts all values to HEX
 *
 * @method inputCallFormatter
 * @param {Object} transaction options
 * @returns object
 */
const inputCallFormatter = function(options) {
    options = _txInputFormatter(options)

    const from = options.from || (this ? this.defaultAccount : null)

    if (from) {
        options.from = inputAddressFormatter(from)
    }

    return options
}

/**
 * Formats the input of a transaction and converts all values to HEX
 *
 * @method inputTransactionFormatter
 * @param {Object} options
 * @returns object
 */
const inputTransactionFormatter = function(options) {
    options = _txInputFormatter(options)

    // If senderRawTransaction' exist in transaction, it means object is fee payer transaction format like below
    // { senderRawTransaction: '', feePayer: '' }
    if (options.senderRawTransaction) {
        if (options.feePayer === undefined) {
            throw new Error('The "feePayer" field must be defined for signing with feePayer!')
        }
        options.feePayer = inputAddressFormatter(options.feePayer)
        return options
    }

    // check from, only if not number, or object
    if (!_.isNumber(options.from) && !_.isObject(options.from)) {
        options.from = options.from || (this ? this.defaultAccount : null)

        if (!options.from && !_.isNumber(options.from)) {
            throw new Error('The send transactions "from" field must be defined!')
        }

        options.from = inputAddressFormatter(options.from)
    }

    if (options.data) {
        options.data = utils.addHexPrefix(options.data)
    }

    const err = validateParams(options)
    if (err) {
        throw err
    }

    return options
}

/**
 * Formats the input of a transaction and converts all values to HEX
 *
 * @method inputPersonalTransactionFormatter
 * @param {Object} options
 * @returns object
 */
const inputPersonalTransactionFormatter = function(options) {
    options = _txInputFormatter(options)

    // check from, only if not number, or object
    if (!_.isNumber(options.from) && !_.isObject(options.from)) {
        options.from = options.from || (this ? this.defaultAccount : null)

        if (!options.from && !_.isNumber(options.from)) {
            throw new Error('The send transactions "from" field must be defined!')
        }

        options.from = inputAddressFormatter(options.from)
    }

    if (options.data) {
        options.data = utils.addHexPrefix(options.data)
    }

    return options
}

/**
 * Hex encodes the data passed to klay_sign and personal_sign
 *
 * @method inputSignFormatter
 * @param {String} data
 * @returns {String}
 */
const inputSignFormatter = function(data) {
    return utils.isHexStrict(data) ? data : utils.utf8ToHex(data)
}

/**
 * Formats the output of a transaction to its proper values
 *
 * @method outputTransactionFormatter
 * @param {Object} tx
 * @returns {Object}
 */
const outputTransactionFormatter = function(tx) {
    if (!tx) return null

    if (tx.blockNumber !== undefined) {
        tx.blockNumber = utils.hexToNumber(tx.blockNumber)
    }
    if (tx.transactionIndex !== undefined) {
        tx.transactionIndex = utils.hexToNumber(tx.transactionIndex)
    }
    tx.nonce = utils.hexToNumber(tx.nonce)
    tx.gas = utils.hexToNumber(tx.gas)
    tx.gasPrice = outputBigNumberFormatter(tx.gasPrice)
    if (tx.value) {
        tx.value = outputBigNumberFormatter(tx.value)
    }

    if (tx.to && utils.isAddress(tx.to)) {
        // tx.to could be `0x0` or `null` while contract creation
        tx.to = utils.toChecksumAddress(tx.to)
    } else {
        tx.to = null // set to `null` if invalid address
    }

    if (tx.from) {
        tx.from = utils.toChecksumAddress(tx.from)
    }

    return tx
}

/**
 * Formats the output of a transaction receipt to its proper values
 *
 * @method outputTransactionReceiptFormatter
 * @param {Object} receipt
 * @returns {Object}
 */
const outputTransactionReceiptFormatter = function(receipt) {
    if (typeof receipt !== 'object' || receipt === null) {
        throw new Error(`Received receipt is invalid: ${receipt}`)
    }

    if (receipt.blockNumber !== undefined) {
        receipt.blockNumber = utils.hexToNumber(receipt.blockNumber)
    }
    if (receipt.transactionIndex !== undefined) {
        receipt.transactionIndex = utils.hexToNumber(receipt.transactionIndex)
    }
    receipt.gasUsed = utils.hexToNumber(receipt.gasUsed)

    if (_.isArray(receipt.logs)) {
        receipt.logs = receipt.logs.map(outputLogFormatter)
    }

    if (receipt.contractAddress) {
        receipt.contractAddress = utils.toChecksumAddress(receipt.contractAddress)
    }

    if (typeof receipt.status !== 'undefined') {
        receipt.status = parseInt(receipt.status) === 1
    }

    return receipt
}

/**
 * Formats the output of a block to its proper values
 *
 * @method outputBlockFormatter
 * @param {Object} block
 * @returns {Object}
 */
const outputBlockFormatter = function(block) {
    // transform to number
    block.gasLimit = utils.hexToNumber(block.gasLimit)
    block.gasUsed = utils.hexToNumber(block.gasUsed)
    block.size = utils.hexToNumber(block.size)
    block.timestamp = utils.hexToNumber(block.timestamp)
    if (block.number !== undefined) {
        block.number = utils.hexToNumber(block.number)
    }

    if (block.difficulty) {
        block.difficulty = outputBigNumberFormatter(block.difficulty)
    }
    if (block.totalDifficulty) {
        block.totalDifficulty = outputBigNumberFormatter(block.totalDifficulty)
    }

    if (_.isArray(block.transactions)) {
        block.transactions.forEach(function(item) {
            if (!_.isString(item)) {
                return outputTransactionFormatter(item)
            }
        })
    }

    if (block.miner) {
        block.miner = utils.toChecksumAddress(block.miner)
    }

    return block
}

/**
 * inputLogFormatter's inner function
 * format topic values
 */
const toTopic = function(value) {
    if (value === null || typeof value === 'undefined') {
        return null
    }

    value = String(value)

    // If value is not hex string, return it
    if (value.indexOf('0x') === 0) {
        return value
    }
    return utils.fromUtf8(value)
}

/**
 * Formats the input of a log
 *
 * @method inputLogFormatter
 * @param {Object} log object
 * @returns {Object} log
 */
const inputLogFormatter = function(options) {
    // make sure topics, get converted to hex
    options.topics = (options.topics || []).map(topic => (_.isArray(topic) ? topic.map(toTopic) : toTopic(topic)))

    if (options.address) {
        options.address = _.isArray(options.address)
            ? options.address.map(addr => inputAddressFormatter(addr))
            : inputAddressFormatter(options.address)
    }

    // if `fromBlock`, `toBlock` type is number, convert it to hex string.

    options.fromBlock = typeof options.fromBlock === 'number' ? utils.numberToHex(options.fromBlock) : options.fromBlock

    options.toBlock = typeof options.toBlock === 'number' ? utils.numberToHex(options.toBlock) : options.toBlock

    return options
}

/**
 * Formats the output of a log
 *
 * @method outputLogFormatter
 * @param {Object} log object
 * @returns {Object} log
 */
const outputLogFormatter = function(log) {
    // `removed` field is unnecessary,
    // since it isn't possible for block to be removed in Klaytn consensus scenario.
    delete log.removed

    // generate a custom log id
    if (typeof log.blockHash === 'string' && typeof log.transactionHash === 'string' && typeof log.logIndex === 'string') {
        const shaId = utils.sha3(log.blockHash.replace('0x', '') + log.transactionHash.replace('0x', '') + log.logIndex.replace('0x', ''))
        log.id = `log_${shaId.replace('0x', '').substr(0, 8)}`
    } else if (!log.id) {
        log.id = null
    }

    if (log.blockNumber !== undefined) {
        log.blockNumber = utils.hexToNumber(log.blockNumber)
    }
    if (log.transactionIndex !== undefined) {
        log.transactionIndex = utils.hexToNumber(log.transactionIndex)
    }
    if (log.logIndex !== undefined) {
        log.logIndex = utils.hexToNumber(log.logIndex)
    }
    if (log.address) {
        log.address = utils.toChecksumAddress(log.address)
    }

    return log
}

/**
 * Formats the input of a whisper post and converts all values to HEX
 *
 * @method inputPostFormatter
 * @param {Object} transaction object
 * @returns {Object}
 */
const inputPostFormatter = function(post) {
    // post.payload = utils.toHex(post.payload);

    if (post.ttl) {
        post.ttl = utils.numberToHex(post.ttl)
    }
    if (post.workToProve) {
        post.workToProve = utils.numberToHex(post.workToProve)
    }
    if (post.priority) {
        post.priority = utils.numberToHex(post.priority)
    }

    // fallback
    if (!_.isArray(post.topics)) {
        post.topics = post.topics ? [post.topics] : []
    }

    // format the following options
    post.topics = post.topics.map(function(topic) {
        // convert only if not hex
        return topic.indexOf('0x') === 0 ? topic : utils.fromUtf8(topic)
    })

    return post
}

/**
 * Formats the output of a received post message
 *
 * @method outputPostFormatter
 * @param {Object}
 * @returns {Object}
 */
const outputPostFormatter = function(post) {
    post.expiry = utils.hexToNumber(post.expiry)
    post.sent = utils.hexToNumber(post.sent)
    post.ttl = utils.hexToNumber(post.ttl)
    post.workProved = utils.hexToNumber(post.workProved)
    // post.payloadRaw = post.payload;
    // post.payload = utils.hexToAscii(post.payload);

    // if (utils.isJson(post.payload)) {
    //     post.payload = JSON.parse(post.payload);
    // }

    // format the following options
    if (!post.topics) {
        post.topics = []
    }
    post.topics = post.topics.map(function(topic) {
        return utils.toUtf8(topic)
    })

    return post
}

const inputAddressFormatter = function(address) {
    const iban = new utils.Iban(address)
    if (iban.isValid() && iban.isDirect()) {
        return iban.toAddress().toLowerCase()
    }
    if (utils.isAddress(address)) {
        return `0x${address.toLowerCase().replace('0x', '')}`
    }

    throw new Error(`Provided address "${address}" is invalid, the capitalization checksum test failed.`)
}

const outputSyncingFormatter = function(result) {
    result.startingBlock = utils.hexToNumber(result.startingBlock)
    result.currentBlock = utils.hexToNumber(result.currentBlock)
    result.highestBlock = utils.hexToNumber(result.highestBlock)
    if (result.knownStates) {
        result.knownStates = utils.hexToNumber(result.knownStates)
        result.pulledStates = utils.hexToNumber(result.pulledStates)
    }

    return result
}

const inputRawKeyFormatter = function(rawKey) {
    if (rawKey.slice(0, 2) === '0x') rawKey = rawKey.slice(2)
    return rawKey
}

const toBoolean = v => !!v

module.exports = {
    inputDefaultBlockNumberFormatter: inputDefaultBlockNumberFormatter,
    inputBlockNumberFormatter: inputBlockNumberFormatter,
    inputCallFormatter: inputCallFormatter,
    inputTransactionFormatter: inputTransactionFormatter,
    inputPersonalTransactionFormatter: inputPersonalTransactionFormatter,
    inputAddressFormatter: inputAddressFormatter,
    inputPostFormatter: inputPostFormatter,
    inputLogFormatter: inputLogFormatter,
    inputSignFormatter: inputSignFormatter,
    inputRawKeyFormatter: inputRawKeyFormatter,
    outputBigNumberFormatter: outputBigNumberFormatter,
    outputTransactionFormatter: outputTransactionFormatter,
    outputTransactionReceiptFormatter: outputTransactionReceiptFormatter,
    outputBlockFormatter: outputBlockFormatter,
    outputLogFormatter: outputLogFormatter,
    outputPostFormatter: outputPostFormatter,
    outputSyncingFormatter: outputSyncingFormatter,
    // moved from util
    toChecksumAddress: utils.toChecksumAddress,
    hexToNumber: utils.hexToNumber,
    numberToHex: utils.numberToHex,
    toBoolean: toBoolean,
}
