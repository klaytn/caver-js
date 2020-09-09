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
 * Returns true if object is BN, otherwise false
 *
 * @method isBN
 * @param {Object} object
 * @return {Boolean}
 */
const isBN = function(object) {
    return BN.isBN(object)
}

/**
 * Returns true if object is BigNumber, otherwise false
 *
 * @method isBigNumber
 * @param {Object} object
 * @return {Boolean}
 */
const isBigNumber = function(num) {
    return BigNumber.isBigNumber(num)
}

/**
 * Takes an input and transforms it into an BN
 *
 * @method toBN
 * @param {Number|String|BN} number, string, HEX string or BN
 * @return {BN} BN
 */
function toBN(number) {
    try {
        return numberToBN.apply(null, arguments)
    } catch (e) {
        throw new Error(`${e} Given value: "${number}"`)
    }
}

/**
 * Takes and input transforms it into BN and if it is negative value, into two's complement
 *
 * @method toTwosComplement
 * @param {Number|String|BN} number
 * @return {String}
 */
const toTwosComplement = function(number) {
    return `0x${toBN(number)
        .toTwos(256)
        .toString(16, 64)}`
}

/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {String} address the given HEX address
 * @return {Boolean}
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
 * Checks if the given string is a checksummed address
 *
 * @method checkAddressChecksum
 * @param {String} address the given HEX address
 * @return {Boolean}
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
 * Should be called to pad string to expected length
 *
 * @method leftPad
 * @param {String} string to be padded
 * @param {Number} chars that result string should have
 * @param {String} sign, by default 0
 * @returns {String} right aligned string
 */
const leftPad = function(string, chars, sign) {
    const hasPrefix = /^0x/i.test(string) || typeof string === 'number'
    string = string.toString(16).replace(/^0x/i, '')

    const padding = chars - string.length + 1 >= 0 ? chars - string.length + 1 : 0

    return (hasPrefix ? '0x' : '') + new Array(padding).join(sign || '0') + string
}

/**
 * Should be called to pad string to expected length
 *
 * @method rightPad
 * @param {String} string to be padded
 * @param {Number} chars that result string should have
 * @param {String} sign, by default 0
 * @returns {String} right aligned string
 */
const rightPad = function(string, chars, sign) {
    const hasPrefix = /^0x/i.test(string) || typeof string === 'number'
    string = string.toString(16).replace(/^0x/i, '')

    const padding = chars - string.length + 1 >= 0 ? chars - string.length + 1 : 0

    return (hasPrefix ? '0x' : '') + string + new Array(padding).join(sign || '0')
}

/**
 * Should be called to get hex representation (prefixed by 0x) of utf8 string
 *
 * @method utf8ToHex
 * @param {String} str
 * @returns {String} hex representation of input string
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
 * Should be called to get utf8 from it's hex representation
 *
 * @method hexToUtf8
 * @param {String} hex
 * @returns {String} ascii string representation of hex value
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
 * Converts value to it's number representation
 *
 * @method hexToNumber
 * @param {String|Number|BN} value
 * @return {String}
 */
const hexToNumber = function(value) {
    if (!value) return value
    return toBN(value).toNumber()
}

/**
 * Converts value to it's decimal representation in string
 *
 * @method hexToNumberString
 * @param {String|Number|BN} value
 * @return {String}
 */
const hexToNumberString = function(value) {
    if (!value) return value

    return toBN(value).toString(10)
}

/**
 * Converts value to it's hex representation
 *
 * @method numberToHex
 * @param {String|Number|BN} value
 * @return {String}
 */
const numberToHex = function(value) {
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
 * Convert a byte array to a hex string
 *
 * Note: Implementation from crypto-js
 *
 * @method bytesToHex
 * @param {Array} bytes
 * @return {String} the hex string
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
 * Convert a hex string to a byte array
 *
 * Note: Implementation from crypto-js
 *
 * @method hexToBytes
 * @param {string} hex
 * @return {Array} the byte array
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
 * Auto converts any given value into it's hex representation.
 *
 * And even stringifys objects before.
 *
 * @method toHex
 * @param {String|Number|BN|Object} value
 * @param {Boolean} returnType
 * @return {String}
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

const bufferToHex = function(buf) {
    buf = toBuffer(buf)
    return `0x${buf.toString('hex')}`
}

/**
 * Convert a input into a Buffer.
 *
 * @method toBuffer
 * @param {Buffer|Array|String|Number|BN|Object} input
 * @return {Buffer}
 */
const toBuffer = function(input) {
    if (Buffer.isBuffer(input)) return input
    if (input === null || input === undefined) return Buffer.alloc(0)
    if (Array.isArray(input)) return Buffer.from(input)
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
 * Convert a number to a Buffer.
 *
 * @method numberToBuffer
 * @param {Number|String|BN} num
 * @return {Buffer}
 */
const numberToBuffer = function(num) {
    return Buffer.from(makeEven(numberToHex(num)).replace('0x', ''), 'hex')
}

/**
 * Check if string is HEX, requires a 0x in front
 *
 * @method isHexStrict
 * @param {String} hex to be checked
 * @returns {Boolean}
 */
const isHexStrict = function(hex) {
    return (_.isString(hex) || _.isNumber(hex)) && /^(-)?0x[0-9a-f]*$/i.test(hex)
}

/**
 * Check if string is HEX
 *
 * @method isHex
 * @param {String} hex to be checked
 * @returns {Boolean}
 */
const isHex = function(hex) {
    return (_.isString(hex) || _.isNumber(hex)) && /^(-0x|0x)?[0-9a-f]*$/i.test(hex)
}

/**
 * Checks if the given string is a hexadecimal transaction hash with or without prefix 0x
 * @deprecated since version v1.5.0
 * @method isTxHash
 * @param {String} txHash given hexadecimal transaction hash
 * @return {Boolean}
 */
const isTxHash = txHash => isValidHash(txHash)

/**
 * Checks if the given string is a hexadecimal hash with or without prefix 0x
 * @method isValidHash
 * @param {String} hash given hexadecimal hash
 * @return {Boolean}
 */
const isValidHash = hash => new RegExp(`^(0x|0X)?[0-9a-fA-F]{${HASH_LENGTH - 2}}$`).test(hash)

/**
 * Checks if the given string is a hexadecimal transaction hash that starts with 0x
 * @deprecated since version v1.5.0
 * @method isTxHashStrict
 * @param {String} txHash given hexadecimal transaction hash
 * @return {Boolean}
 */
const isTxHashStrict = txHash => isValidHashStrict(txHash)

/**
 * Checks if the given string is a hexadecimal hash with prefix 0x
 * @method isValidHashStrict
 * @param {String} hash given hexadecimal hash
 * @return {Boolean}
 */
const isValidHashStrict = hash => new RegExp(`^(0x|0X)[0-9a-fA-F]{${HASH_LENGTH - 2}}$`).test(hash)

/**
 * Returns true if given string is a valid Klaytn block header bloom.
 *
 * TODO UNDOCUMENTED
 *
 * @method isBloom
 * @param {String} hex encoded bloom filter
 * @return {Boolean}
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
 * Returns true if given string is a valid log topic.
 *
 * TODO UNDOCUMENTED
 *
 * @method isTopic
 * @param {String} hex encoded topic
 * @return {Boolean}
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

const isPredefinedBlockNumber = function(blockNumber) {
    return blockNumber === 'latest' || blockNumber === 'pending' || blockNumber === 'earliest' || blockNumber === 'genesis'
}

/**
 * valid block number should be one of a type below:
 * 1) predefined block number ex:) 'latest', 'earliest', 'pending', 'genesis'
 * 2) hex
 * 3) finite number
 * @param  {String | Number}  blockNumber
 * @return {Boolean}
 */
const isValidBlockNumberCandidate = blockNumber => {
    return isPredefinedBlockNumber(blockNumber) || isHexStrict(blockNumber) || Number.isFinite(Number(blockNumber))
}

/**
 * Hashes values to a sha3 hash using keccak 256
 *
 * To hash a HEX string the hex must have 0x in front.
 *
 * @method sha3
 * @return {String} the sha3 string
 */
const SHA3_NULL_S = '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'

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
            isHumanReadable: false,
        }
    }

    if (!isKlaytnWalletKey(privateKey)) throw new Error(`Invalid KlaytnWalletKey format.`)

    const humanReadableFlag = privateKey.slice(66, 68)
    if (humanReadableFlag === '01') throw new Error('HumanReadableAddress is not supported yet.')
    const parsedAddress = privateKey.slice(68)
    return {
        privateKey: `0x${parsedPrivateKey}`,
        address: parsedAddress,
        isHumanReadable: false,
    }
}

function parseKlaytnWalletKey(key) {
    if (!isKlaytnWalletKey(key)) throw new Error(`Invalid KlaytnWalletKey format: ${key}`)
    const klaytnWalletKey = key.startsWith('0x') ? key.slice(2) : key
    const splitted = klaytnWalletKey.split('0x')
    return [`0x${splitted[0]}`, `0x${splitted[1]}`, `0x${splitted[2]}`]
}

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
                if (splited[i].length !== 2 || (splited[i] !== '00' && splited[i] !== '01')) return false
                break
            case 2:
                if (splited[i].length !== 40 || !isAddress(splited[i])) return false
                break
        }
    }

    return true
}

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

const trimLeadingZero = function(hex) {
    while (hex && hex.startsWith('0x0')) {
        hex = `0x${hex.slice(3)}`
    }
    return hex
}

const makeEven = function(hex) {
    if (hex.length % 2 === 1) {
        hex = hex.replace('0x', '0x0')
    }
    return hex
}

/**
 * Returns an array of signatures.
 *
 * @param {string|object|Array.<string>} signature The address entered by the user for use in creating an account.
 * @return {Array.<string>} the sha3 string
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

const getTxTypeStringFromRawTransaction = rawTransaction => {
    if (typeof rawTransaction !== 'string') throw new Error('Invalid raw Tx', rawTransaction)

    const type = rawTransaction.slice(0, 4)

    const typeString = txTypeToString[type]

    return typeString
}

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

const isCompressedPublicKey = publicKey => {
    const compressedIndicators = ['02', '03']
    const withoutPrefix = publicKey.replace('0x', '')
    return withoutPrefix.length === 66 && compressedIndicators.includes(withoutPrefix.slice(0, 2))
}

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

const recover = (message, signature, preFixed = false) => {
    if (!preFixed) {
        message = hashMessage(message)
    }

    return Account.recover(message, Account.encodeSignature(signature.encode())).toLowerCase()
}

module.exports = {
    BN: BN,
    isBN: isBN,
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
}
