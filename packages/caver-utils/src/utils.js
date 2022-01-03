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

 This file is derived from web3.js/packages/web3-utils/src/utils.js (2019/06/12).
 Modified and improved for the caver-js development.
 */
/**
 * @file utils.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

const _ = require('lodash')
const BN = require('bn.js')
const BigNumber = require('bignumber.js')
const numberToBN = require('number-to-bn')
const utf8 = require('utf8')
const Hash = require('eth-lib/lib/hash')
const RLP = require('eth-lib/lib/rlp')
const Account = require('eth-lib/lib/account')

const elliptic = require('elliptic')

const secp256k1 = new elliptic.ec('secp256k1')

const txTypeToString = {
    '0x20': 'ACCOUNT_UPDATE',
    '0x21': 'FEE_DELEGATED_ACCOUNT_UPDATE',
    '0x22': 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO',
    '0x08': 'VALUE_TRANSFER',
    '0x10': 'VALUE_TRANSFER_MEMO',
    '0x09': 'FEE_DELEGATED_VALUE_TRANSFER',
    '0x0a': 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO',
    '0x11': 'FEE_DELEGATED_VALUE_TRANSFER_MEMO',
    '0x12': 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO',
    '0x28': 'SMART_CONTRACT_DEPLOY',
    '0x29': 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY',
    '0x2a': 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO',
    '0x30': 'SMART_CONTRACT_EXECUTION',
    '0x31': 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
    '0x32': 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO',
    '0x38': 'CANCEL',
    '0x39': 'FEE_DELEGATED_CANCEL',
    '0x3a': 'FEE_DELEGATED_CANCEL_WITH_RATIO',
    '0x48': 'CHAIN_DATA_ANCHORING',
}

const HASH_LENGTH = 66

/**
 * Returns `true` if parameter is a BN instance, otherwise `false`.
 *
 * @example
 * const bn = new caver.utils.BN(10)
 * const result = caver.utils.isBN(bn)
 *
 * @memberof module:utils
 * @inner
 *
 * @param {*} bn
 * @return {boolean} `true` if a given value is a `BN.js` instance.
 */
const isBN = function(bn) {
    return BN.isBN(bn)
}

/**
 * Returns `true` if object is a BigNumber instance, otherwise `false`.
 *
 * @example
 * const bigNumber = new caver.utils.BigNumber(10)
 * const result = caver.utils.isBigNumber(bigNumber)
 *
 * @memberof module:utils
 * @inner
 *
 * @param {*} bigNumber
 * @return {boolean} `true` if a given value is a `Bignumber.js` instance.
 */
const isBigNumber = function(bigNumber) {
    return BigNumber.isBigNumber(bigNumber)
}

/**
 * Safely converts any given value (including `Bignumber.js` instances) into a `BN.js` instance, for handling big numbers in JavaScript.
 *
 * @example
 * const result = caver.utils.toBN(num)
 *
 * @memberof module:utils
 * @inner
 *
 * @param {number|string|BN|BigNumber} number The number to convert to a BN.js instance.
 * @return {BN} The {@link https://github.com/indutny/bn.js/|BN.js} instance.
 */
function toBN(number) {
    try {
        return numberToBN.apply(null, arguments)
    } catch (e) {
        throw new Error(`${e} Given value: "${number}"`)
    }
}

/**
 * Converts a negative number into a two's complement.
 *
 * @example
 * const result = caver.utils.toTwosComplement(num)
 *
 * @memberof module:utils
 * @inner
 *
 * @param {number|string|BN|BigNumber} number The number to convert.
 * @return {string} The converted hex string.
 */
const toTwosComplement = function(number) {
    return `0x${toBN(number)
        .toTwos(256)
        .toString(16, 64)}`
}

/**
 * Checks if a given string is a valid Klaytn address.
 * It will also check the checksum if the address has upper and lowercase letters.
 *
 * @example
 * const result = caver.utils.isAddress('0x{address in hex}')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} address An address string.
 * @return {boolean} `true` if a given string is a valid Klaytn address.
 */
const isAddress = function(address) {
    // check if it has the basic requirements of an address
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        return false
        // If it's ALL lowercase or ALL upppercase
    }
    if (/^(0x|0X)?[0-9a-f]{40}$/.test(address) || /^(0x|0X)?[0-9A-F]{40}$/.test(address)) {
        return true
        // Otherwise check each case
    }
    return checkAddressChecksum(address)
}

/**
 * Checks the checksum of a given address.
 * Will also return `false` on non-checksum addresses.
 *
 * @example
 * const result = caver.utils.checkAddressChecksum('0x{address in hex}')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} address An address string.
 * @return {boolean}
 */
const checkAddressChecksum = function(address) {
    // Check each case
    address = address.replace(/^0x/i, '')
    const addressHash = sha3(address.toLowerCase()).replace(/^0x/i, '')

    for (let i = 0; i < 40; i++) {
        // the nth letter should be uppercase if the nth digit of casemap is 1
        if (
            (parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) ||
            (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])
        ) {
            return false
        }
    }
    return true
}

/**
 * Adds padding on the left of a string. Useful for adding paddings to HEX strings.
 *
 * @example
 * const result = caver.utils.padLeft('0x3456ff', 20) // '0x000000000000003456ff'
 * const result = caver.utils.padLeft('Hello', 20, 'x') // 'xxxxxxxxxxxxxxxHello'
 *
 * @memberof module:utils
 * @inner
 * @alias padLeft
 *
 * @param {string} string The string to add padding on the left.
 * @param {number} chars The number of characters the total string should have.
 * @param {string} [sign] The character sign to use, defaults to `0`.
 * @returns {string} The padded string.
 */
const leftPad = function(string, chars, sign) {
    const hasPrefix = /^0x/i.test(string) || typeof string === 'number'
    string = string.toString(16).replace(/^0x/i, '')

    const padding = chars - string.length + 1 >= 0 ? chars - string.length + 1 : 0

    return (hasPrefix ? '0x' : '') + new Array(padding).join(sign || '0') + string
}

/**
 * Adds padding on the right of a string, Useful for adding paddings to HEX strings.
 *
 * @example
 * const result = caver.utils.rightPad('0x3456ff', 20) // '0x3456ff00000000000000'
 * const result = caver.utils.rightPad('Hello', 20, 'x') // 'Helloxxxxxxxxxxxxxxx'
 *
 * @memberof module:utils
 * @inner
 * @alias padRight
 *
 * @param {string} string The string to add padding on the right.
 * @param {number} chars The number of characters the total string should have.
 * @param {string} [sign] The character sign to use, defaults to `0`.
 * @returns {string} The padded string.
 */
const rightPad = function(string, chars, sign) {
    const hasPrefix = /^0x/i.test(string) || typeof string === 'number'
    string = string.toString(16).replace(/^0x/i, '')

    const padding = chars - string.length + 1 >= 0 ? chars - string.length + 1 : 0

    return (hasPrefix ? '0x' : '') + string + new Array(padding).join(sign || '0')
}

/**
 * Returns the HEX representation of a given UTF-8 string.
 *
 * @example
 * const result = caver.utils.utf8ToHex('I have 100€') // '0x49206861766520313030e282ac'
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} str A UTF-8 string to convert to a HEX string.
 * @returns {string} The HEX string.
 */
const utf8ToHex = function(str) {
    str = utf8.encode(str)
    let hex = ''

    // remove \u0000 padding from either side
    str = str.replace(/^(?:\u0000)*/, '')
    str = str
        .split('')
        .reverse()
        .join('')
    str = str.replace(/^(?:\u0000)*/, '')
    str = str
        .split('')
        .reverse()
        .join('')

    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i)
        // if (code !== 0) {
        const n = code.toString(16)
        hex += n.length < 2 ? `0${n}` : n
        // }
    }

    return `0x${hex}`
}

/**
 * Returns the UTF-8 string representation of a given HEX value.
 *
 * @example
 * const result = caver.utils.hexToUtf8('0x49206861766520313030e282ac') // 'I have 100€'
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} hex A HEX string to convert to a UTF-8 string.
 * @returns {string} The UTF-8 string.
 */
const hexToUtf8 = function(hex) {
    if (!isHexStrict(hex)) {
        throw new Error(`The parameter "${hex}" must be a valid HEX string.`)
    }

    let str = ''
    let code = 0
    hex = hex.replace(/^0x/i, '')

    // remove 00 padding from either side
    hex = hex.replace(/^(?:00)*/, '')
    hex = hex
        .split('')
        .reverse()
        .join('')
    hex = hex.replace(/^(?:00)*/, '')
    hex = hex
        .split('')
        .reverse()
        .join('')

    const l = hex.length

    for (let i = 0; i < l; i += 2) {
        code = parseInt(hex.substr(i, 2), 16)
        // if (code !== 0) {
        str += String.fromCharCode(code)
        // }
    }

    return utf8.decode(str)
}

/**
 * Returns the number representation of a given HEX value.
 * Please note that this function is not useful for big numbers, rather use `caver.utils.toBN`.
 *
 * @example
 * const result = caver.utils.hexToNumber('0xea') // 234
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} A HEX string to be converted.
 * @return {number} The number representation of a given HEX value.
 */
const hexToNumber = function(value) {
    if (!value) return value

    if (typeof value === 'string' && !isHexStrict(value)) {
        throw new Error(`Given value "${value}" is not a valid hex string.`)
    }

    return toBN(value).toNumber()
}

/**
 * Returns the number representation of a given HEX value as a string.
 *
 * @example
 * const result = caver.utils.hexToNumberString('0xea') // '234'
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} A HEX string to be converted.
 * @return {string} The number as a string.
 */
const hexToNumberString = function(value) {
    if (!value) return value

    if (_.isString(value) && !isHexStrict(value)) {
        throw new Error(`Given value "${value}" is not a valid hex string.`)
    }

    return toBN(value).toString(10)
}

/**
 * Returns the HEX representation of a given number value.
 *
 * @example
 * const result = caver.utils.numberToHex(234) // '0xea'
 * const result = caver.utils.numberToHex('234')
 * const result = caver.utils.numberToHex(new caver.utils.BN(234))
 * const result = caver.utils.numberToHex(new caver.utils.BigNumber(234))
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string|number|BN|BigNumber} value A number as string or number.
 * @return {string} The HEX value of the given number.
 */
const numberToHex = function(value) {
    if (_.isNumber(value)) {
        const bn = toBN(value)
        try {
            bn.toNumber()
        } catch (e) {
            throw new Error(`${e.message}: Number type cannot handle big number. Please use hex string or BigNumber/BN.`)
        }
    }

    if (_.isNull(value) || _.isUndefined(value)) {
        return value
    }

    if (!isFinite(value) && !isHexStrict(value)) {
        throw new Error(`Given input "${value}" is not a number.`)
    }

    const number = toBN(value)
    const result = number.toString(16)

    return number.lt(new BN(0)) ? `-0x${result.substr(1)}` : `0x${result}`
}

/**
 * Returns a HEX string from a byte array.
 *
 * @example
 * const result = caver.utils.bytesToHex([ 72, 101, 108, 108, 111, 33, 36 ]) // '0x48656c6c6f2124'
 *
 * @memberof module:utils
 * @inner
 *
 * @param {Array} bytes A byte array to convert.
 * @return {string} The HEX string.
 */
const bytesToHex = function(bytes) {
    const hex = []
    for (let i = 0; i < bytes.length; i++) {
        // eslint-disable-next-line no-bitwise
        hex.push((bytes[i] >>> 4).toString(16))

        // eslint-disable-next-line no-bitwise
        hex.push((bytes[i] & 0xf).toString(16))
    }
    return `0x${hex.join('')}`
}

/**
 * Returns a byte array from the given HEX string.
 *
 * @example
 * const result = caver.utils.hexToBytes('0x000000ea') // [ 0, 0, 0, 234 ]
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} hex A HEX string to be converted.
 * @return {Array.<number>} The byte array.
 */
const hexToBytes = function(hex) {
    hex = hex.toString(16)

    if (!isHexStrict(hex)) {
        throw new Error(`Given value "${hex}" is not a valid hex string.`)
    }

    hex = hex.replace(/^0x/i, '')

    const bytes = []
    for (let c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16))
    }
    return bytes
}

/**
 * Converts any given value to HEX.
 * The numeric strings will be interpreted as numbers.
 * Text strings will be interpreted as UTF-8 strings.
 *
 * @example
 * const result = caver.utils.toHex('234') // '0xea'
 * const result = caver.utils.toHex(234) // '0xea'
 * const result = caver.utils.toHex(new caver.utils.BN('234')) // '0xea'
 * const result = caver.utils.toHex(new caver.utils.Bignumber('234')) // '0xea'
 * const result = caver.utils.toHex('I have 100€') // '0x49206861766520313030e282ac'
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string|number|BN|BigNumber|Buffer} value The input to convert to HEX.
 * @return {string} The resulting HEX string.
 */
/* eslint-disable complexity */
const toHex = function(value, returnType) {
    if (Buffer.isBuffer(value)) {
        return returnType ? 'buffer' : bufferToHex(value)
    }
    if (isAddress(value)) {
        return returnType ? 'address' : `0x${value.toLowerCase().replace(/^0x/i, '')}`
    }

    if (_.isBoolean(value)) {
        return returnType ? 'bool' : value ? '0x01' : '0x00'
    }

    if (_.isObject(value) && !isBigNumber(value) && !isBN(value)) {
        return returnType ? 'string' : utf8ToHex(JSON.stringify(value))
    }

    // if its a negative number, pass it through numberToHex
    if (_.isString(value)) {
        if (value.indexOf('-0x') === 0 || value.indexOf('-0X') === 0) {
            return returnType ? 'int256' : numberToHex(value)
        }
        if (value.indexOf('0x') === 0 || value.indexOf('0X') === 0) {
            return returnType ? 'bytes' : value
        }
        if (!isFinite(value)) {
            return returnType ? 'string' : utf8ToHex(value)
        }
    }

    return returnType ? (value < 0 ? 'int256' : 'uint256') : numberToHex(value)
}
/* eslint-enable complexity */

/**
 * Converts buffer to 0x-prefixed hex string.
 *
 * @example
 * const result = caver.utils.bufferToHex(Buffer.from('5b9ac8', 'hex')) // '0x5b9ac8'
 *
 * @memberof module:utils
 * @inner
 *
 * @param {Buffer} buf A buffer to convert to hex string.
 * @return {string} The 0x-prefixed hex string.
 */
const bufferToHex = function(buf) {
    buf = toBuffer(buf)
    return `0x${buf.toString('hex')}`
}

/**
 * This function converts the input to a Buffer.
 * To convert an object into a Buffer using `caver.utils.toBuffer`, the object must implement `toArray` function.
 * For string type input, this function only works with a 0x-prefixed hex string.
 *
 * @example
 * const result = caver.utils.toBuffer(Buffer.alloc(0))
 * const result = caver.utils.toBuffer('0x1234')
 * const result = caver.utils.toBuffer(1)
 * const result = caver.utils.toBuffer([1,2,3])
 * const result = caver.utils.toBuffer(new caver.utils.BN(255))
 * const result = caver.utils.toBuffer(new caver.utils.BigNumber(255))
 * const result = caver.utils.toBuffer({toArray: function() {return [1,2,3,4]}}) // An object that implements `toArray` function
 * const result = caver.utils.toBuffer(null)
 * const result = caver.utils.toBuffer(undefined)
 *
 * @memberof module:utils
 * @inner
 *
 * @param {Buffer|Array.<number>|string|number|BN|BigNumber|object} input The value to be converted to a Buffer.
 * @return {Buffer} The value converted to Buffer type is returned.
 */
const toBuffer = function(input) {
    if (Buffer.isBuffer(input)) return input
    if (input === null || input === undefined) return Buffer.alloc(0)
    if (Array.isArray(input)) return Buffer.from(input)
    if (isBigNumber(input)) input = toBN(input)
    if (isBN(input)) return input.toArrayLike(Buffer)
    if (_.isObject(input)) {
        if (input.toArray && _.isFunction(input.toArray)) return Buffer.from(input.toArray())
        throw new Error('To convert an object to a buffer, the toArray function must be implemented inside the object')
    }

    switch (typeof input) {
        case 'string':
            if (isHexStrict(input)) return Buffer.from(makeEven(input).replace('0x', ''), 'hex')
            throw new Error("Failed to convert string to Buffer. 'toBuffer' function only supports 0x-prefixed hex string")
        case 'number':
            return numberToBuffer(input)
    }
    throw new Error(`Not supported type with ${input}`)
}

/**
 * This function converts a number to a Buffer.
 * The {@link module:utils~toBuffer|caver.utils.toBuffer} has the same behavior as this function when the input is a number.
 *
 * @example
 * const result = caver.utils.numberToBuffer(1)
 * const result = caver.utils.numberToBuffer('2')
 * const result = caver.utils.numberToBuffer('0x3')
 * const result = caver.utils.numberToBuffer(new caver.utils.BN(4))
 * const result = caver.utils.numberToBuffer(new caver.utils.BigNumber(4))
 *
 * @memberof module:utils
 * @inner
 *
 * @param {number|string|BN|BigNumber} num A number to be converted to a Buffer.
 * @return {Buffer}
 */
const numberToBuffer = function(num) {
    return Buffer.from(makeEven(numberToHex(num)).replace('0x', ''), 'hex')
}

/**
 * Checks if a given string is a HEX string.
 * Difference to {@link module:utils~isHex|caver.utils.isHex} is that it expects HEX to be prefixed with `0x`.
 *
 * @example
 * const result = caver.utils.isHexStrict('0xc1912') // true
 * const result = caver.utils.isHexStrict('c1912') // false
 * const result = caver.utils.isHexStrict('Hello') // false
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} hex The given HEX string.
 * @returns {boolean} `true` if a given string is a HEX string.
 */
const isHexStrict = function(hex) {
    return (_.isString(hex) || _.isNumber(hex)) && /^(-)?0x[0-9a-f]*$/i.test(hex)
}

/**
 * Checks if a given string is a HEX string.
 *
 * @example
 * const result = caver.utils.isHex('0xc1912') // true
 * const result = caver.utils.isHex('c1912') // true
 * const result = caver.utils.isHex('Hello') // false
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} hex The given HEX string.
 * @returns {boolean} `true` if a given parameter is a HEX string.
 */
const isHex = function(hex) {
    return (_.isString(hex) || _.isNumber(hex)) && /^(-0x|0x)?[0-9a-f]*$/i.test(hex)
}

/**
 * Checks if the given string is a hexadecimal transaction hash with or without prefix 0x
 * @deprecated since version v1.5.0
 * @ignore
 * @method isTxHash
 * @param {String} txHash given hexadecimal transaction hash
 * @return {Boolean}
 */
const isTxHash = txHash => isValidHash(txHash)

/**
 * Returns `true` if the input is in 32-bytes hash format, otherwise it returns `false`.
 *
 * @example
 * const result = caver.utils.isValidHash('0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550') // true
 * const result = caver.utils.isValidHash('e9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550') // true
 * const result = caver.utils.isValidHash('0x1') // false
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} hash The value to be examined that if it is in 32-bytes hash format or not.
 * @return {boolean} `true` means the input is in the format of 32-bytes hash.
 */
const isValidHash = hash => new RegExp(`^(0x|0X)?[0-9a-fA-F]{${HASH_LENGTH - 2}}$`).test(hash)

/**
 * Checks if the given string is a hexadecimal transaction hash that starts with 0x
 * @deprecated since version v1.5.0
 * @ignore
 * @method isTxHashStrict
 * @param {String} txHash given hexadecimal transaction hash
 * @return {Boolean}
 */
const isTxHashStrict = txHash => isValidHashStrict(txHash)

/**
 * Returns `true` if the input is in 0x-prefixed 32-bytes hash format, otherwise it returns `false`.
 * This function only looks at the input and determines if it is in the format of 0x-prefixed 32-bytes hash.
 * Difference to {@link module:utils~isValidHash|caver.utils.isValidHash} is that it expects HEX to be prefixed with 0x.
 *
 * @example
 * const result = caver.utils.isValidHashStrict('0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550') // true
 * const result = caver.utils.isValidHashStrict('e9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550') // false
 * const result = caver.utils.isValidHashStrict('0x1') // false
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} hash The value to be examined that if it is in the format of 0x-prefixed 32-bytes hash or not.
 * @return {boolean} `true` means the input is in the format of 0x-prefixed 32-bytes hash.
 */
const isValidHashStrict = hash => new RegExp(`^(0x|0X)[0-9a-fA-F]{${HASH_LENGTH - 2}}$`).test(hash)

/**
 * Returns `true` if the bloom is a valid bloom.
 *
 * @example
 * const result = caver.utils.isBloom('0x00000...')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} bloom An encoded bloom filter.
 * @return {boolean} `true` means the input bloom parameter is valid.
 */
const isBloom = function(bloom) {
    if (!/^(0x)?[0-9a-f]{512}$/i.test(bloom)) {
        return false
    }
    if (/^(0x)?[0-9a-f]{512}$/.test(bloom) || /^(0x)?[0-9A-F]{512}$/.test(bloom)) {
        return true
    }
    return false
}

/**
 * Returns `true` if the topic is valid.
 *
 * @example
 * const result = caver.utils.isBloom('0x00000...')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} hex An encoded topic.
 * @return {boolean}
 */
const isTopic = function(topic) {
    if (!/^(0x)?[0-9a-f]{64}$/i.test(topic)) {
        return false
    }
    if (/^(0x)?[0-9a-f]{64}$/.test(topic) || /^(0x)?[0-9A-F]{64}$/.test(topic)) {
        return true
    }
    return false
}

const parsePredefinedBlockNumber = blockNumber => {
    switch (blockNumber) {
        case 'genesis':
        case 'earliest':
            return '0x0'
        default:
            return blockNumber
    }
}

/**
 * Returns `true` if the parameter is predefined block tag.
 *
 * @example
 * const result = caver.utils.isPredefinedBlockNumber('latest') // true
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} predefinedBlock The predefined block.
 * @return {boolean} `true` means predefinedBlock is valid predefined block tag.
 */
const isPredefinedBlockNumber = function(predefinedBlock) {
    return predefinedBlock === 'latest' || predefinedBlock === 'pending' || predefinedBlock === 'earliest' || predefinedBlock === 'genesis'
}

/**
 * Validtes block number (or block tag string).
 *
 * The block number should be one of a type below:
 * 1) predefined block number ex:) 'latest', 'earliest', 'pending', 'genesis'
 * 2) hex
 * 3) finite number
 *
 * @example
 * const result = caver.utils.isValidBlockNumberCandidate('latest') // true
 * const result = caver.utils.isValidBlockNumberCandidate('0x1') // true
 * const result = caver.utils.isValidBlockNumberCandidate('1') // true
 * const result = caver.utils.isValidBlockNumberCandidate(1) // true
 *
 * @memberof module:utils
 * @inner
 *
 * @param  {string|number} blockNumber The block number to validate. This can be block number in number type or block tag(`latest`, `pending`, `earliest`, `genesis`) string.
 * @return {boolean} `true` means blockNumber is valid.
 */
const isValidBlockNumberCandidate = blockNumber => {
    return isPredefinedBlockNumber(blockNumber) || isHexStrict(blockNumber) || Number.isFinite(Number(blockNumber))
}

/**
 * Hashes values to a sha3 hash using keccak 256
 *
 * To hash a HEX string the hex must have 0x in front.
 *
 * @return {String} the sha3 string
 */
const SHA3_NULL_S = '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'

/**
 * Calculates the sha3 of the input.
 *
 * @example
 * const hash = caver.utils.sha3('234')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} str - A string to hash.
 * @return {string} The result hash.
 */
const sha3 = function(value) {
    // return null when value is not string type.
    if (typeof value === 'number') return null

    if (isHexStrict(value) && /^0x/i.test(value.toString())) {
        value = hexToBytes(value)
    }

    if (isBN(value)) {
        value = value.toString(10)
    }

    const returnValue = Hash.keccak256(value)

    if (returnValue === SHA3_NULL_S) {
        return null
    }
    return returnValue
}
// expose the under the hood keccak256
sha3._Hash = Hash

/**
 * An object defines the AccountKeyLegacy.
 *
 * @example
 * { privateKey: '0x{private key}', address: '0x{address in hex}', type: '0x00' }
 *
 * @typedef {object} module:utils.ParsedPrivateKey
 * @property {string} privateKey - The private key string.
 * @property {string} address - The address string.
 * @property {string} type - The type string. Currently only `0x00` is supported.
 */
/**
 * Parses private key string to { privateKey, address, type }.
 *
 * @example
 * const { privateKey, address, type } = caver.utils.parsePrivateKey('0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d8')
 * const { privateKey, address, type } = caver.utils.parsePrivateKey('0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} privateKey - A private key or KlaytnWalletKey string to parse.
 * @return {module:utils.ParsedPrivateKey} A parsed private key object.
 */
function parsePrivateKey(privateKey) {
    if (typeof privateKey !== 'string') throw new Error('The private key must be of type string')

    const has0xPrefix = privateKey.slice(0, 2) === '0x'
    privateKey = has0xPrefix ? privateKey.slice(2) : privateKey

    if (privateKey.length !== 110 && privateKey.length !== 64) {
        throw new Error(`Invalid private key(${privateKey})`)
    }

    const parsedPrivateKey = privateKey.slice(0, 64)

    if (!isHex(parsedPrivateKey)) {
        throw new Error('Invalid private key format : privateKey must be in hex format.')
    }

    if (privateKey.length !== 110) {
        return {
            privateKey: `0x${privateKey}`,
            address: '',
            type: '',
        }
    }

    const type = privateKey.slice(66, 68)
    if (type !== '00') throw new Error('Invalid type: Currently only type `0x00` is supported.')

    if (!isKlaytnWalletKey(privateKey)) throw new Error(`Invalid KlaytnWalletKey format.`)

    const parsedAddress = privateKey.slice(68)
    return {
        privateKey: `0x${parsedPrivateKey}`,
        address: parsedAddress,
        type: `0x${type}`,
    }
}

/**
 * Parses KlatynWalletKey to [ '0x{privateKey}', '0x{type}', '0x{address}' ].
 *
 * @example
 * const parsed = caver.utils.parseKlaytnWalletKey('0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} key - A KlaytnWalletKey string to parse.
 * @return {Array.<string>} An array that includes parsed KlaytnWalletKey.
 */
function parseKlaytnWalletKey(key) {
    if (!isKlaytnWalletKey(key)) throw new Error(`Invalid KlaytnWalletKey format: ${key}`)
    const klaytnWalletKey = key.startsWith('0x') ? key.slice(2) : key
    const splitted = klaytnWalletKey.split('0x')
    return [`0x${splitted[0]}`, `0x${splitted[1]}`, `0x${splitted[2]}`]
}

/**
 * Validate a KlaytnWalletKey string.
 *
 * @example
 * const result = caver.utils.isKlaytnWalletKey('0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} privateKey - A KlaytnWalletKey string to validate.
 * @return {boolean} `true` means valid KlaytnWalletKey.
 */
const isKlaytnWalletKey = privateKey => {
    if (!_.isString(privateKey)) return false

    const has0xPrefix = privateKey.slice(0, 2) === '0x'
    privateKey = has0xPrefix ? privateKey.slice(2) : privateKey

    if (privateKey.length !== 110) {
        return false
    }

    const splited = privateKey.split('0x')
    if (splited.length !== 3) return false

    for (let i = 0; i < splited.length; i++) {
        if (!isHex(splited[i])) return false
        switch (i) {
            case 0:
                if (splited[i].length !== 64 || !isValidPrivateKey(splited[i])) return false
                break
            case 1:
                if (splited[i].length !== 2 || splited[i] !== '00') return false
                break
            case 2:
                if (splited[i].length !== 40 || !isAddress(splited[i])) return false
                break
        }
    }

    return true
}

/**
 * Validate a private key string.
 *
 * @example
 * const result = caver.utils.isValidPrivateKey('0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d8')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} privateKey - A private key string to validate.
 * @return {boolean} `true` means valid private key.
 */
function isValidPrivateKey(privateKey) {
    if (typeof privateKey !== 'string') return false

    const has0xPrefix = privateKey.slice(0, 2) === '0x'
    privateKey = has0xPrefix ? privateKey.slice(2) : privateKey
    // Private key validation 1: private key should be string and minimum length of it is 64.
    if (privateKey.length !== 64 || !isHex(privateKey)) return false

    // order n value in secp256k1. privateKey should be less than order n value.
    const VALID_PRIVATE_KEY_LIMIT = 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'
    const VALID_PRIVATE_LOWER_BOUND = '0000000000000000000000000000000000000000000000000000000000000000'
    return VALID_PRIVATE_LOWER_BOUND < privateKey.toUpperCase() && privateKey.toUpperCase() < VALID_PRIVATE_KEY_LIMIT
}

// Check is 1)Number string or 2)Hex string or 3)Number.
function isValidNSHSN(value) {
    switch (typeof value) {
        case 'number':
            if (value < 0) {
                return false
            }
            break
        case 'string':
            if (Number(value) != value && !isHexStrict(value)) {
                return false
            }
            break
        default:
            return false
    }

    return true
}

const rlpEncode = data => RLP.encode(data)

const rlpDecode = encodedData => RLP.decode(encodedData)

/**
 * Converts from public key to x, y points.
 *
 * @example
 * const result = caver.utils.xyPointFromPublicKey('0x04019b186993b620455077b6bc37bf61666725d8d87ab33eb113ac0414cd48d78ff46e5ea48c6f22e8f19a77e5dbba9d209df60cbcb841b7e3e81fe444ba829831')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} publicKey - A public key string.
 * @return {Array.<string>} An array with x, y points.
 */
const xyPointFromPublicKey = pub => {
    let publicKey = pub
    if (isCompressedPublicKey(publicKey)) publicKey = decompressPublicKey(pub)

    publicKey = publicKey.replace('0x', '')
    if (publicKey.length === 130 && publicKey.slice(0, 2) === '04') publicKey = publicKey.slice(2)
    if (publicKey.length !== 128) throw Error('Invalid public key') // + 2 means '0x'

    const pubX = `0x${publicKey.slice(0, 64).replace(/^0+/, '')}`
    const pubY = `0x${publicKey.slice(64).replace(/^0+/, '')}`
    return [pubX, pubY]
}

/**
 * Trims leading zero from 0x-prefixed hex string.
 *
 * @example
 * const result = caver.utils.trimLeadingZero('0x0000011') // '0x11'
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} hex - A hex string to trim.
 * @return {string} A hex string without leading zero.
 */
const trimLeadingZero = function(hex) {
    while (hex && hex.startsWith('0x0')) {
        hex = `0x${hex.slice(3)}`
    }
    return hex
}

/**
 * Returns a string to an even length.
 *
 * @example
 * const result = caver.utils.makeEven('0x011') // '0x0011'
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} hex - A hex string to make even.
 * @return {string} A string with even length.
 */
const makeEven = function(hex) {
    if (hex.length % 2 === 1) {
        hex = hex.replace('0x', '0x0')
    }
    return hex
}

/**
 * Converts the signature to an array format.
 *
 * @example
 * const result = caver.utils.resolveSignature({ v: '0x0fe9', r: '0x02aca...', s: '0x20502...' })
 * const result = caver.utils.resolveSignature({ V: '0x0fe9', R: '0x02aca...', S: '0x20502...' })
 * const result = caver.utils.resolveSignature('0x7e85aaff6a6ef0730308af49f6b512741e61f958a21df387a0d0e8973fb40ca0307a8b87f6ac249f7218b4ee1a1d2f7d764ec2d20d9824e7b7b842dd214f139c7f6')
 *
 * @ignore
 * @param {string|object|Array.<string>|SignatureData} signature A signature string, object or array.
 * @return {Array.<string>} A signature array.
 */
const resolveSignature = signature => {
    if (_.isArray(signature)) {
        const [v, r, s] = signature
        return [v, r, s]
    }

    if (_.isObject(signature)) {
        const v = signature.V || signature.v
        const r = signature.R || signature.r
        const s = signature.S || signature.s
        if (!v || !r || !s) throw new Error('v, r, s fields should exist in signature')

        return [v, r, s]
    }

    if (_.isString(signature)) {
        const v = `0x${signature.slice(64 * 2 + 2)}`
        const decoded = Account.decodeSignature(signature)
        return [v, decoded[1], decoded[2]]
    }
}

/**
 * Converts the signature to an `{ V, R, S }` format.
 * Klaytn Node uses `{ V, R, S }` format, so you can use this function to convert caver signature format to `{ V, R, S }`.
 *
 * @example
 * const result = caver.utils.transformSignaturesToObject([
 *     '0x7f6',
 *     '0x7e85aaff6a6ef0730308af49f6b512741e61f958a21df387a0d0e8973fb40ca0',
 *     '0x307a8b87f6ac249f7218b4ee1a1d2f7d764ec2d20d9824e7b7b842dd214f139c'
 * ])
 *
 * @ignore
 * @param {string|object|Array.<string>|SignatureData} signature A signature string, object or array.
 * @return {Klay.SignatureData} A signature object.
 */
const transformSignaturesToObject = signatures => {
    let isSingular = false

    if (!signatures) throw new Error(`Failed to transform signatures to object: invalid signatures ${signatures}`)

    // Input cases
    // case 1. '0xf1998...'
    // case 2. {V: '0x4e44', R: '0x1692a...', S: '0x277b9...'} or {v: '0x4e44', r: '0x1692a...', s: '0x277b9...'}
    // case 3. ['0xf1998...', '0x53fe7...']
    // case 4. ['0x4e44', '0x1692a...', '0x277b9...']
    // case 5. [{V: '0x4e44', R: '0x1692a...', S: '0x277b9...'}, {v: '0x4e44', r: '0x1692a...', s: '0x277b9...'}]
    // case 6. [['0x4e44', '0x1692a...', '0x277b9...'], ['0x4e44', '0x1692a...', '0x277b9...']]

    // Transform a signature to an array of signatures to execute the same logic in the for loop below.
    if (!_.isArray(signatures)) {
        signatures = [signatures]
        isSingular = true
    } else if (_.isString(signatures[0])) {
        // This logic is performed for case 3 and case 4.
        // In case 3, the signature string is in the array.
        // In case 4, v, r, and s are separately included in the array.
        // The signature string is a combination of v, r, and s, so the length of the signature string will be longer than 64.
        // Hence, only case 4 will perform the below logic to form an array of signatures.
        const stripped = signatures[0].replace('0x', '')
        if (stripped.length <= 64) {
            signatures = [signatures]
            isSingular = true
        }
    }

    const ret = []

    for (const sig of signatures) {
        const sigObj = {}
        if (_.isArray(sig)) {
            if (sig.length !== 3) throw new Error(`Failed to transform signatures to object: invalid length of signature (${sig.length})`)
            if (isEmptySig(sig)) continue
            const [V, R, S] = sig
            sigObj.V = V
            sigObj.R = R
            sigObj.S = S
        } else if (_.isString(sig)) {
            const decoded = Account.decodeSignature(sig).map(s => makeEven(trimLeadingZero(s)))
            sigObj.V = decoded[0]
            sigObj.R = decoded[1]
            sigObj.S = decoded[2]
        } else if (_.isObject(sig)) {
            Object.keys(sig).map(key => {
                if (key === 'v' || key === 'V' || key === '_v') {
                    sigObj.V = sig[key]
                } else if (key === 'r' || key === 'R' || key === '_r') {
                    sigObj.R = sig[key]
                } else if (key === 's' || key === 'S' || key === '_s') {
                    sigObj.S = sig[key]
                } else {
                    throw new Error(`Failed to transform signatures to object: invalid key(${key}) is defined in signature object.`)
                }
            })
        } else {
            throw new Error(`Unsupported signature type: ${typeof sig}`)
        }

        if (!sigObj.V || !sigObj.R || !sigObj.S) {
            throw new Error(`Failed to transform signatures to object: invalid signature ${sig}`)
        }

        Object.keys(sigObj).map(k => {
            sigObj[k] = trimLeadingZero(sigObj[k])
        })
        ret.push(sigObj)
    }

    return isSingular ? ret[0] : ret
}

/**
 * Returns tx type string.
 * This function uses an old type string.
 *
 * @example
 * const result = caver.utils.getTxTypeStringFromRawTransaction('0x08f83a808505d21dba00824e20945b2840bcbc2be07fb12d9129ed3a02d8e446594401945b2840bcbc2be07fb12d9129ed3a02d8e4465944c4c3018080')
 *
 * @deprecated
 * @ignore
 * @param {string} rawTransaction An RLP-encoded transaction string.
 * @return {string} A transaction type string.
 */
const getTxTypeStringFromRawTransaction = rawTransaction => {
    if (typeof rawTransaction !== 'string') throw new Error('Invalid raw Tx', rawTransaction)

    const type = rawTransaction.slice(0, 4)

    const typeString = txTypeToString[type]

    return typeString
}

/**
 * Returns tx type string.
 * This function uses an old type string.
 *
 * @example
 * const result = caver.utils.isValidPublicKey('0x3a06fcf2eb4f096e01bc70ab2c81ba79e82af9c62a3ef5fe1fef329c3ad89e8622aed245899ffa530ddd8ebf1a0a66f157b75a38a715f82ad6061af36cbd9cd8')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} rawTransaction An RLP-encoded transaction string.
 * @return {string} A transaction type string.
 */
const isValidPublicKey = publicKey => {
    let pubString = publicKey.replace('0x', '')

    if (pubString.length === 130 && pubString.slice(0, 2) === '04') pubString = pubString.slice(2)

    if (pubString.length !== 66 && pubString.length !== 128) return false

    if (pubString.length === 66 && !isCompressedPublicKey(pubString)) return false

    if (pubString.length === 66) pubString = decompressPublicKey(pubString)

    const xyPoints = xyPointFromPublicKey(pubString)
    if (xyPoints === undefined || !xyPoints.length || xyPoints.length !== 2) return false

    const point = secp256k1.curve.point(xyPoints[0].slice(2), xyPoints[1].slice(2), true)
    return secp256k1.keyFromPublic(point).validate().result
}

/**
 * Return `true` is public key is compressed, otherwise `false`.
 *
 * @example
 * const result = caver.utils.isCompressedPublicKey('0x023a06fcf2eb4f096e01bc70ab2c81ba79e82af9c62a3ef5fe1fef329c3ad89e86')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} publicKey A public key string.
 * @return {boolean} `true` means compressed.
 */
const isCompressedPublicKey = publicKey => {
    const compressedIndicators = ['02', '03']
    const withoutPrefix = publicKey.replace('0x', '')
    return withoutPrefix.length === 66 && compressedIndicators.includes(withoutPrefix.slice(0, 2))
}

/**
 * Compresses the uncompressed public key.
 *
 * @example
 * const result = caver.utils.compressPublicKey('0x62cef87819b82f62e9c0a38c1fa7dfa089084959df86aca19ff2f6c903db2248b45dc23220ee6bcd8753bb9df8ce7d58e56eabebb14479f3a0ca5ccd4bdea632')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} publicKey A public key string.
 * @return {string} A compressed public key.
 */
const compressPublicKey = uncompressedPublicKey => {
    const isAlreadyCompressed = isCompressedPublicKey(uncompressedPublicKey)

    if (isAlreadyCompressed) return uncompressedPublicKey

    const xyPoints = xyPointFromPublicKey(uncompressedPublicKey)

    if (xyPoints === undefined || !xyPoints.length || xyPoints.length !== 2) {
        throw new Error('invalid public key')
    }

    const [x, y] = xyPoints

    const keyPair = secp256k1.keyPair({
        pub: {
            x: x.replace('0x', ''),
            y: y.replace('0x', ''),
        },
        pubEnc: 'hex',
    })

    const compressedPublicKey = `0x${keyPair.getPublic(true, 'hex')}`

    return compressedPublicKey
}

/**
 * Decompresses the compressed public key.
 *
 * @example
 * const result = caver.utils.decompressPublicKey('0x0262cef87819b82f62e9c0a38c1fa7dfa089084959df86aca19ff2f6c903db2248')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} publicKey A public key string.
 * @return {string} A uncompressed public key.
 */
const decompressPublicKey = compressedPublicKey => {
    if (!isCompressedPublicKey(compressedPublicKey)) {
        if (!isValidPublicKey(compressedPublicKey)) throw new Error(`Invalid public key`)
        return compressedPublicKey
    }

    const compressedWithoutPrefix = compressedPublicKey.replace('0x', '')

    const curve = secp256k1.curve
    const decoded = curve.decodePoint(compressedWithoutPrefix, 'hex')
    const hexEncoded = decoded.encode('hex').slice(2)

    return `0x${hexEncoded}`
}

const isContractDeployment = txObject => {
    if (txObject.type) {
        if (txObject.type.includes('SMART_CONTRACT_DEPLOY') || txObject.type.includes('SmartContractDeploy')) return true
        if (txObject.type !== 'LEGACY' && txObject.type !== 'TxTypeLegacyTransaction') return false
    }

    if (txObject.data && txObject.data !== '0x' && (!txObject.to || txObject.to === '0x')) return true

    return false
}

const isValidRole = role => {
    switch (role) {
        case 'roleTransactionKey':
        case 'roleAccountUpdateKey':
        case 'roleFeePayerKey':
        case 'transactionKey':
        case 'updateKey':
        case 'feePayerKey':
            return true
    }
    return false
}

// ['0x01', '0x', '0x]
// [['0x01', '0x', '0x]]
// '0x....'
// { v: '0x01', r: '0x', s:'0x' }
// SignatureData { _v: '0x01', _r: '0x', _s:'0x' }
// [SignatureData { _v: '0x01', _r: '0x', _s:'0x' }]
/**
 * Returns `true` if sig is in the format of empty signature (`SignatureData { _v: '0x01', _r: '0x', _s: '0x' }` or `[SignatureData { _v: '0x01', _r: '0x', _s: '0x' }]`), otherwise it returns `false`.
 *
 * In caver-js, if signatures or feePayerSignatures is empty, the value representing an empty signature, `[SignatureData { _v: '0x01', _r: '0x', _s: '0x' }]`, is returned for the property.
 * This function is used to check whether the given signature is `[SignatureData { _v: '0x01', _r: '0x', _s: '0x' }]` (or `SignatureData { _v: '0x01', _r: '0x', _s: '0x' }` in the 'LEGACY' transaction).
 *
 * @example
 * const result = caver.utils.isEmptySig(['0x01', '0x', '0x'])
 * const result = caver.utils.isEmptySig({ v: '0x01', r: '0x', s: '0x' })
 * const result = caver.utils.isEmptySig({ V: '0x01', R: '0x', S: '0x' })
 * const result = caver.utils.isEmptySig(new caver.wallet.keyring.signatureData(['0x01', '0x', '0x']))
 *
 * const result = caver.utils.isEmptySig([['0x01', '0x', '0x']])
 * const result = caver.utils.isEmptySig([{ v: '0x01', r: '0x', s: '0x' }])
 * const result = caver.utils.isEmptySig([{ V: '0x01', R: '0x', S: '0x' }])
 * const result = caver.utils.isEmptySig([new caver.wallet.keyring.signatureData(['0x01', '0x', '0x'])])
 *
 * @memberof module:utils
 * @inner
 *
 * @param {object|Array.<object>|Array.<string>|Array.<Array.<string>>|SignatureData|Array.<SignatureData>} sig An instance of {@link SignatureData} or array of {@link SignatureData} to check empty or not.
 * @return {boolean} `true` means the sig is empty.
 */
const isEmptySig = sig => {
    let sigs = sig

    // Convert to array format
    if (!_.isArray(sig)) sigs = resolveSignature(sigs)
    // Format to two-dimentional array
    if (_.isString(sigs[0])) sigs = [sigs]

    for (let s of sigs) {
        if (!_.isArray(s)) s = resolveSignature(s)
        if (s.length !== 3) throw new Error(`Invalid signatures length: ${s.length}`)
        if (s[0] !== '0x01' || s[1] !== '0x' || s[2] !== '0x') return false
    }

    return true
}

/**
 * Hashes message with Klaytn specific prefix: `keccak256("\x19Klaytn Signed Message:\n" + len(message) + message))`
 *
 * @example
 * const result = caver.utils.hashMessage('Hello') // '0x640bfab59b6e27468abd367888f4ab1a1c77aa2b45e76a1d3adcbd039c305917'
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} data A message to hash. If it is a HEX string, it will be UTF-8 decoded first.
 * @return {string} The hashed message with Klaytn specific prefix.
 */
const hashMessage = data => {
    const message = isHexStrict(data) ? hexToBytes(data) : data
    const messageBuffer = Buffer.from(message)
    const preamble = `\x19Klaytn Signed Message:\n${message.length}`
    const preambleBuffer = Buffer.from(preamble)
    // klayMessage is concatenated buffer (preambleBuffer + messageBuffer)
    const klayMessage = Buffer.concat([preambleBuffer, messageBuffer])
    // Finally, run keccak256 on klayMessage.
    return Hash.keccak256(klayMessage)
}

/**
 * Recovers the public key that was used to sign the given data.
 *
 * @example
 * const message = 'Some data'
 * const signature = { v: '0x1c', r: '0xd0b8d...', s: '0x5472e...' } // You can get a signature via `keyring.signMessage(...).signatures[0]`.
 * const recoveredPublicKey = caver.utils.recoverPublicKey(message, signature)
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} message The raw message string. If this message is hased with Klaytn specific prefix, the third parameter should be passed as `true`.
 * @param {SignatureData|Array.<string>|object} signature An instance of `SignatureData`, `[v, r, s]` or `{v, r, s}`.
 * @param {boolean} [isHashed] (optional, default: `false`) If the `isHashed` is true, the given message will NOT automatically be prefixed with "\x19Klaytn Signed Message:\n" + message.length + message, and be assumed as already prefixed.
 * @return {string}
 */
const recoverPublicKey = (message, signature, isHashed = false) => {
    if (!isHashed) message = hashMessage(message)

    if (_.isArray(signature)) signature = { v: signature[0], r: signature[1], s: signature[2] }
    const vrs = { v: parseInt(signature.v.slice(2), 16), r: signature.r.slice(2), s: signature.s.slice(2) }

    const ecPublicKey = secp256k1.recoverPubKey(Buffer.from(message.slice(2), 'hex'), vrs, vrs.v < 2 ? vrs.v : 1 - (vrs.v % 2))
    return `0x${ecPublicKey.encode('hex', false).slice(2)}`
}

/**
 * Recovers the Klaytn address that was used to sign the given data.
 *
 * @example
 * const message = 'Some data'
 * const signature = { v: '0x1c', r: '0xd0b8d...', s: '0x5472e...' } // You can get a signature via `keyring.signMessage(...).signatures[0]`.
 * const recoveredPublicKey = caver.utils.recover(message, signature)
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} message The raw message string. If this message is hased with Klaytn specific prefix, the third parameter should be passed as `true`.
 * @param {SignatureData|Array.<string>|object} signature An instance of `SignatureData`, `[v, r, s]` or `{v, r, s}`.
 * @param {boolean} [isHashed] (optional, default: `false`) If the `isHashed` is true, the given message will NOT automatically be prefixed with "\x19Klaytn Signed Message:\n" + message.length + message, and be assumed as already prefixed.
 * @return {string}
 */
const recover = (message, signature, isHashed = false) => {
    if (!isHashed) {
        message = hashMessage(message)
    }

    return Account.recover(message, Account.encodeSignature(resolveSignature(signature))).toLowerCase()
}

/**
 * Returns an address which is derived by a public key.
 * This function simply converts the public key string into address form by hashing it.
 * It has nothing to do with the actual account in the Klaytn.
 *
 * @example
 * const address = caver.utils.publicKeyToAddress('0x{public key}')
 *
 * @memberof module:utils
 * @inner
 *
 * @method publicKeyToAddress
 * @param {string} pubKey The public key string to get the address.
 * @return {string}
 */
const publicKeyToAddress = pubKey => {
    let publicKey = pubKey.slice(0, 2) === '0x' ? pubKey : `0x${pubKey}`

    if (isCompressedPublicKey(publicKey)) publicKey = decompressPublicKey(publicKey)

    // With '0x' prefix, 65 bytes in uncompressed format.
    if (Buffer.byteLength(publicKey, 'hex') !== 65) throw new Error(`Invalid public key: ${pubKey}`)

    const publicHash = Hash.keccak256(publicKey)
    const address = `0x${publicHash.slice(-40)}`

    const addressHash = Hash.keccak256s(address.slice(2))
    let checksumAddress = '0x'
    for (let i = 0; i < 40; i++) checksumAddress += parseInt(addressHash[i + 2], 16) > 7 ? address[i + 2].toUpperCase() : address[i + 2]
    return checksumAddress
}

module.exports = {
    BN: BN,
    isBN: isBN,
    BigNumber: BigNumber,
    isBigNumber: isBigNumber,
    toBN: toBN,
    isAddress: isAddress,
    isBloom: isBloom, // TODO UNDOCUMENTED
    isTopic: isTopic, // TODO UNDOCUMENTED
    checkAddressChecksum: checkAddressChecksum,
    utf8ToHex: utf8ToHex,
    hexToUtf8: hexToUtf8,
    hexToNumber: hexToNumber,
    hexToNumberString: hexToNumberString,
    numberToHex: numberToHex,
    toHex: toHex,
    bufferToHex: bufferToHex,
    toBuffer: toBuffer,
    numberToBuffer: numberToBuffer,
    hexToBytes: hexToBytes,
    bytesToHex: bytesToHex,
    isHex: isHex,
    isHexStrict: isHexStrict,
    leftPad: leftPad,
    rightPad: rightPad,
    toTwosComplement: toTwosComplement,
    sha3: sha3,
    parsePredefinedBlockNumber: parsePredefinedBlockNumber,
    isPredefinedBlockNumber: isPredefinedBlockNumber,
    isValidBlockNumberCandidate: isValidBlockNumberCandidate,
    isValidPrivateKey: isValidPrivateKey,
    isValidNSHSN: isValidNSHSN,
    parsePrivateKey: parsePrivateKey,
    parseKlaytnWalletKey: parseKlaytnWalletKey,
    isKlaytnWalletKey: isKlaytnWalletKey,
    isContractDeployment: isContractDeployment,

    rlpEncode: rlpEncode,
    rlpDecode: rlpDecode,
    xyPointFromPublicKey: xyPointFromPublicKey,
    resolveSignature: resolveSignature,
    transformSignaturesToObject: transformSignaturesToObject,
    getTxTypeStringFromRawTransaction,
    trimLeadingZero,
    makeEven,
    txTypeToString,
    isValidPublicKey,
    isCompressedPublicKey,
    compressPublicKey,
    decompressPublicKey,
    isTxHash,
    isTxHashStrict,
    isValidHash,
    isValidHashStrict,

    isValidRole: isValidRole,

    isEmptySig: isEmptySig,

    hashMessage: hashMessage,
    recover: recover,
    recoverPublicKey: recoverPublicKey,
    publicKeyToAddress: publicKeyToAddress,
}
