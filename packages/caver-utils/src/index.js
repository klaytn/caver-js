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

 This file is derived from web3.js/packages/web3-utils/src/index.js (2019/06/12).
 Modified and improved for the caver-js development.
 */
/**
 * @file utils.js
 * @author Marek Kotewicz <marek@parity.io>
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

const _ = require('lodash')
const ethjsUnit = require('ethjs-unit')
const Account = require('eth-lib/lib/account')
const utils = require('./utils')
const soliditySha3 = require('./soliditySha3')
const randomHex = require('../randomhex')
const promiEvent = require('../promievent')
const Iban = require('../iban')
const SignatureData = require('../../caver-wallet/src/keyring/signatureData')

/**
 * Fires an error in an event emitter and callback and returns the eventemitter
 *
 * @ignore
 * @param {Object} error a string, a error, or an object with {message, data}
 * @param {Object} emitter
 * @param {Function} reject
 * @param {Function} callback
 * @return {Object} the emitter
 */
const _fireError = function(error, emitter, reject, callback) {
    // add data if given
    if (_.isObject(error) && !(error instanceof Error) && error.data) {
        if (_.isObject(error.data) || _.isArray(error.data)) {
            error.data = JSON.stringify(error.data, null, 2)
        }

        error = `${error.message}\n${error.data}`
    }

    if (_.isString(error)) {
        error = new Error(error)
    }

    if (_.isFunction(callback)) {
        callback(error)
    }
    if (_.isFunction(reject)) {
        // suppress uncatched error if an error listener is present
        // OR suppress uncatched error if an callback listener is present
        if ((emitter && (_.isFunction(emitter.listeners) && emitter.listeners('error').length)) || _.isFunction(callback)) {
            emitter.catch(function() {})
        }
        // reject later, to be able to return emitter
        setTimeout(function() {
            reject(error)
        }, 1)
    }

    if (emitter && _.isFunction(emitter.emit)) {
        // emit later, to be able to return emitter
        setTimeout(function() {
            emitter.emit('error', error)
            emitter.removeAllListeners()
        }, 1)
    }

    return emitter
}

/**
 * Should be used to create full function/event name from json abi
 *
 * @ignore
 * @param {Object} json
 * @return {String} full function/event name
 */
const _jsonInterfaceMethodToString = function(json) {
    if (_.isObject(json) && json.name && json.name.indexOf('(') !== -1) {
        return json.name
    }

    return `${json.name}(${_flattenTypes(false, json.inputs).join(',')})`
}

/**
 * Returns the ASCII string representation of a given HEX value.
 *
 * @example
 * const result = caver.utils.hexToAscii('0x4920686176652031303021') // 'I have 100!'
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} hex A HEX string to convert to an ASCII string.
 * @returns {string} The ASCII string.
 */
const hexToAscii = function(hex) {
    if (!utils.isHexStrict(hex)) {
        throw new Error('The parameter must be a valid HEX string.')
    }

    let str = ''
    let i = 0
    const l = hex.length
    if (hex.substring(0, 2) === '0x') {
        i = 2
    }
    for (; i < l; i += 2) {
        const code = parseInt(hex.substr(i, 2), 16)
        str += String.fromCharCode(code)
    }

    return str
}

/**
 * Returns the HEX representation of a given ASCII string.
 *
 * @example
 * const result = caver.utils.asciiToHex('I have 100!') // '0x4920686176652031303021'
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} str An ASCII string to convert to a HEX string.
 * @returns {string} The HEX string.
 */
const asciiToHex = function(str) {
    if (!str) {
        return '0x00'
    }
    let hex = ''
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i)
        const n = code.toString(16)
        hex += n.length < 2 ? `0${n}` : n
    }

    return `0x${hex}`
}

/**
 * Returns value of unit in Wei
 *
 * @ignore
 * @param {string} unit the unit to convert to, default ether
 * @returns {BN} value of the unit (in Wei)
 * @throws error if the unit is not correct:w
 */
const getUnitValue = function(unit) {
    unit = unit ? unit.toLowerCase() : 'ether'
    if (!ethjsUnit.unitMap[unit]) {
        throw new Error(
            `This unit "${unit}" doesn't exist, please use the one of the following units${JSON.stringify(ethjsUnit.unitMap, null, 2)}`
        )
    }
    return unit
}

/**
 * Takes a number of wei and converts it to any other ether unit.
 *
 * Possible units are:
 *   SI Short   SI Full        Effigy       Other
 * - kwei       femtoether     babbage
 * - mwei       picoether      lovelace
 * - gwei       nanoether      shannon      nano
 * - --         microether     szabo        micro
 * - --         milliether     finney       milli
 * - ether      --             --
 * - kether                    --           grand
 * - mether
 * - gether
 * - tether
 *
 * @ignore
 * @param {Number|String} number can be a number, number string or a HEX of a decimal
 * @param {String} unit the unit to convert to, default ether
 * @return {String|Object} When given a BN object it returns one as well, otherwise a number
 */
const fromWei = function(number, unit) {
    unit = getUnitValue(unit)

    if (!utils.isBN(number) && !_.isString(number)) {
        throw new Error('Please pass numbers as strings or BigNumber objects to avoid precision errors.')
    }

    return utils.isBN(number) ? ethjsUnit.fromWei(number, unit) : ethjsUnit.fromWei(number, unit).toString(10)
}

/**
 * Takes a number of a unit and converts it to wei.
 *
 * Possible units are:
 *   SI Short   SI Full        Effigy       Other
 * - kwei       femtoether     babbage
 * - mwei       picoether      lovelace
 * - gwei       nanoether      shannon      nano
 * - --         microether     szabo        micro
 * - --         microether     szabo        micro
 * - --         milliether     finney       milli
 * - ether      --             --
 * - kether                    --           grand
 * - mether
 * - gether
 * - tether
 *
 * @ignore
 * @param {Number|String|BN} number can be a number, number string or a HEX of a decimal
 * @param {String} unit the unit to convert from, default ether
 * @return {String|Object} When given a BN object it returns one as well, otherwise a number
 */
const toWei = function(number, unit) {
    unit = getUnitValue(unit)

    if (!utils.isBN(number) && !_.isString(number)) {
        throw new Error('Please pass numbers as strings or BigNumber objects to avoid precision errors.')
    }

    return utils.isBN(number) ? ethjsUnit.toWei(number, unit) : ethjsUnit.toWei(number, unit).toString(10)
}

// For Klay unit
/**
 * Shows all possible KLAY values and their amount in peb.
 *
 * @example
 * caver.utils.unitMap
 *
 * @alias unitMap
 * @memberof module:utils
 * @inner
 *
 * @type {Map<string,string>}
 */
const unitKlayMap = {
    peb: '1',
    kpeb: '1000',
    Mpeb: '1000000',
    Gpeb: '1000000000',
    Ston: '1000000000',
    ston: '1000000000',
    uKLAY: '1000000000000',
    mKLAY: '1000000000000000',
    KLAY: '1000000000000000000',
    kKLAY: '1000000000000000000000',
    MKLAY: '1000000000000000000000000',
    GKLAY: '1000000000000000000000000000',
    TKLAY: '1000000000000000000000000000000',
}

/**
 * @example
 * { unit: 'peb', pebFactor: 0 }
 *
 * @typedef {object} module:utils.Unit
 * @property {string} unit - The unit string.
 * @property {number} pebFactor - The peb factor.
 */
/**
 * Shows all KLAY units.
 *
 * @example
 * caver.utils.klayUnit
 *
 * @alias klayUnit
 * @memberof module:utils
 * @inner
 *
 * @type {Map<string,module:utils.Unit>}
 */
const KlayUnit = {
    peb: { unit: 'peb', pebFactor: 0 },
    kpeb: { unit: 'kpeb', pebFactor: 3 },
    Mpeb: { unit: 'Mpeb', pebFactor: 6 },
    Gpeb: { unit: 'Gpeb', pebFactor: 9 },
    ston: { unit: 'ston', pebFactor: 9 },
    uKLAY: { unit: 'uKLAY', pebFactor: 12 },
    mKLAY: { unit: 'mKLAY', pebFactor: 15 },
    KLAY: { unit: 'KLAY', pebFactor: 18 },
    kKLAY: { unit: 'kKLAY', pebFactor: 21 },
    MKLAY: { unit: 'MKLAY', pebFactor: 24 },
    GKLAY: { unit: 'GKLAY', pebFactor: 27 },
    TKLAY: { unit: 'TKLAY', pebFactor: 30 },
}

const unitKlayToEthMap = {
    peb: 'wei',
    kpeb: 'kwei',
    Mpeb: 'mwei',
    Gpeb: 'gwei',
    Ston: 'gwei',
    ston: 'gwei',
    uKLAY: 'microether',
    mKLAY: 'milliether',
    KLAY: 'ether',
    kKLAY: 'kether',
    MKLAY: 'mether',
    GKLAY: 'gether',
    TKLAY: 'tether',
}

const getKlayUnitValue = function(u) {
    let unit = u || 'KLAY'

    if (_.isObject(u) && u.unit) unit = u.unit

    if (!unitKlayMap[unit]) {
        throw new Error(
            `This unit "${unit}" doesn't exist, please use the one of the following units${JSON.stringify(unitKlayMap, null, 2)}`
        )
    }

    if (u && u.pebFactor !== undefined && KlayUnit[u.unit].pebFactor !== u.pebFactor) {
        throw new Error(`peb factor does not match with given unit`)
    }

    return unit
}

const fromPeb = function(number, unit) {
    // kaly unit to eth unit
    unit = getKlayUnitValue(unit)
    unit = unitKlayToEthMap[unit]

    unit = getUnitValue(unit)

    if (!utils.isBN(number) && !_.isString(number)) {
        number = tryNumberToString(number)
    }

    return ethjsUnit.fromWei(number, unit)
}

const toPeb = function(number, unit) {
    // kaly unit to eth unit
    unit = getKlayUnitValue(unit)
    unit = unitKlayToEthMap[unit]

    unit = getUnitValue(unit)

    // BigNumber can support decimal points but BN does not support.
    // So if BigNumber type number is came as a parameter,
    // use `toString` function of BigNumber to prevent error while converting BigNumber to BN.
    if (utils.isBigNumber(number)) number = number.toString()
    if (!utils.isBN(number) && !_.isString(number)) {
        number = tryNumberToString(number)
    }

    return utils.isBN(number) ? ethjsUnit.toWei(number, unit) : ethjsUnit.toWei(number, unit).toString(10)
}

/**
 * Converts `peb` amount to specific unit amount.
 * Please note that "peb" is the smallest KLAY unit, and you should always use "peb" as the unit of KLAY.
 * Convert to "KLAY" only for display reasons.
 *
 * @example
 * const result = caver.utils.convertFromPeb('1', 'KLAY') // '0.000000000000000001'
 * const result = caver.utils.convertFromPeb(1, 'KLAY') // '0.000000000000000001'
 * const result = caver.utils.convertFromPeb(1, caver.utils.klayUnit.KLAY) // '0.000000000000000001'
 *
 * @memberof module:utils
 * @inner
 *
 * @param {number|string|BN|BigNumber} amount The value in peb.
 * @param {string|KlayUnit} [unitString] (default, `'KLAY'`) The unit of KLAY to convert your "peb" into. `number` will be divided by one of the following denominators for the unit provided:<br>- `peb`: '1' <br> - `kpeb`: '1000' <br> - `Mpeb`: '1000000' <br> - `Gpeb`: '1000000000' <br> - `Ston`: '1000000000' <br> - `uKLAY`: '1000000000000' <br> - `mKLAY`: '1000000000000000' <br> - `KLAY`: '1000000000000000000' <br> - `kKLAY`: '1000000000000000000000' <br> - `MKLAY`: '1000000000000000000000000' <br> - `GKLAY`: '1000000000000000000000000000' <br>
 * @return {string} The string number.
 */
const convertFromPeb = function(amount, unitString) {
    const converted = fromPeb(amount, unitString)
    return utils.isBN(converted) ? converted.toString(10) : converted
}

/**
 * Converts any KLAY value into peb.
 * Please note that "peb" is the smallest KLAY unit, and you should always use "peb" as the unit of KLAY.
 *
 * @example
 * const result = caver.utils.convertToPeb('1', 'KLAY') // '1000000000000000000'
 * const result = caver.utils.convertToPeb(1, 'KLAY') // '1000000000000000000'
 * const result = caver.utils.convertToPeb(1, caver.utils.klayUnit.KLAY) // '1000000000000000000'
 *
 * @memberof module:utils
 * @inner
 *
 * @param {number|string|BN|BigNumber} amount the amount to convert
 * @param {string|KlayUnit} [unitString] (default, `'KLAY'`) The unit of KLAY to convert from. `number` will be divided by one of the following denominators for the unit provided:<br>- `peb`: '1' <br> - `kpeb`: '1000' <br> - `Mpeb`: '1000000' <br> - `Gpeb`: '1000000000' <br> - `Ston`: '1000000000' <br> - `uKLAY`: '1000000000000' <br> - `mKLAY`: '1000000000000000' <br> - `KLAY`: '1000000000000000000' <br> - `kKLAY`: '1000000000000000000000' <br> - `MKLAY`: '1000000000000000000000000' <br> - `GKLAY`: '1000000000000000000000000000' <br>
 * @return {string|BN}
 */
const convertToPeb = function(number, unitString) {
    const converted = toPeb(number, unitString)
    return utils.isBN(converted) ? converted.toString(10) : converted
}

function tryNumberToString(number) {
    try {
        return utils.toBN(number).toString(10)
    } catch (e) {
        throw new Error('Please pass numbers as strings or BigNumber objects to avoid precision errors.')
    }
}

/**
 * Converts an upper or lowercase Klaytn address to a checksum address.
 *
 * @example
 * const result = caver.utils.toChecksumAddress('0xc1912fee45d61c87cc5ea59dae31190fffff232d') // '0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d'
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} address An address string.
 * @return {string} The checksum address.
 */
const toChecksumAddress = function(address) {
    if (typeof address === 'undefined') return ''

    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        throw new Error(`Given address "${address}" is not a valid Klaytn address.`)
    }

    address = address.toLowerCase().replace(/^0x/i, '')
    const addressHash = utils.sha3(address).replace(/^0x/i, '')
    let checksumAddress = '0x'

    for (let i = 0; i < address.length; i++) {
        // If ith character is 9 to f then make it uppercase
        if (parseInt(addressHash[i], 16) > 7) {
            checksumAddress += address[i].toUpperCase()
        } else {
            checksumAddress += address[i]
        }
    }
    return checksumAddress
}

const isHexParameter = a => {
    if (!_.isString(a) || !a.match(/^0x[0-9A-Fa-f]*$/)) return false
    return true
}

/**
 * Should be used to flatten json abi inputs/outputs into an array of type-representing-strings
 *
 * @ignore
 * @param {bool} includeTuple
 * @param {Object} puts
 * @return {Array} parameters as strings
 */
function _flattenTypes(includeTuple, puts) {
    const types = []
    puts.forEach(function(param) {
        if (typeof param.components === 'object') {
            if (param.type.substring(0, 5) !== 'tuple') {
                throw new Error('components found but type is not tuple; report on GitHub')
            }
            let suffix = ''
            const arrayBracket = param.type.indexOf('[')
            if (arrayBracket >= 0) {
                suffix = param.type.substring(arrayBracket)
            }
            const result = _flattenTypes(includeTuple, param.components)

            if (_.isArray(result) && includeTuple) {
                types.push(`tuple(${result.join(',')})${suffix}`)
            } else if (!includeTuple) {
                types.push(`(${result.join(',')})${suffix}`)
            } else {
                types.push(`(${result})`)
            }
        } else {
            types.push(param.type)
        }
    })
    return types
}

/**
 * Returns `true` if the input is a 0x-prefixed hex string, otherwise it returns `false`.
 *
 * @example
 * const result = caver.utils.isHexPrefixed('0xa5b0cd8c87e77879d64cc064ee239ed6f71cacf9')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} string The value to be determined if the parameter is 0x-prefixed hex string or not.
 * @return {boolean} `true` means the input is 0x-prefixed hex string.
 */
const isHexPrefixed = function(str) {
    if (typeof str !== 'string') return false
    return str.slice(0, 2) === '0x' || str.slice(0, 2) === '0X'
}

/**
 * Returns a 0x-prefixed hex string.
 * If the input is already 0x-prefixed or a non-hex string, the input value is returned as-is.
 *
 * @example
 * const result = caver.utils.addHexPrefix('a5b0cd8c87e77879d64cc064ee239ed6f71cacf9')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} string string value to be prefixed with 0x.
 * @return {string} 0x-prefixed hex string is returned.
 */
const addHexPrefix = function(str) {
    if (typeof str !== 'string') return str

    return isHexPrefixed(str) ? `0x${str.slice(2)}` : `0x${str}`
}

/**
 * Returns the result with 0x prefix stripped from input.
 *
 * @example
 * const result = caver.utils.stripHexPrefix('0xa5b0cd8c87e77879d64cc064ee239ed6f71cacf9')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} string string to remove 0x prefix.
 * @return {string} A string stripped of 0x is returned.
 */
const stripHexPrefix = function(str) {
    if (typeof str !== 'string') return str

    return isHexPrefixed(str) ? str.slice(2) : str
}

/**
 * Decodes a raw signature data that composed of R(32 byte) + S(32 byte) + V(1byte).
 *
 * @example
 * const decoded = caver.utils.decodeSignature('0xb9146...')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} signature The signature string to decode. It composed of R(32 byte) + S(32 byte) + V(1byte).
 * @return {SignatureData}
 */
const decodeSignature = signature => {
    if (Buffer.byteLength(stripHexPrefix(signature), 'hex') !== 65)
        throw new Error(`Invalid signature: The length of raw signature must be 65 byte.`)

    const ret = Account.decodeSignature(signature).map(sig => utils.makeEven(utils.trimLeadingZero(sig)))
    return new SignatureData(ret)
}

/**
 * The util module.
 * @module utils
 *
 * @example
 * caver.utils
 */
module.exports = {
    _fireError: _fireError,
    _jsonInterfaceMethodToString: _jsonInterfaceMethodToString,
    _flattenTypes: _flattenTypes,
    // extractDisplayName: extractDisplayName,
    // extractTypeName: extractTypeName,
    randomHex: randomHex,
    _: _,
    soliditySha3: soliditySha3,
    toChecksumAddress: toChecksumAddress,
    hexToAscii: hexToAscii,
    toAscii: hexToAscii,
    asciiToHex: asciiToHex,
    fromAscii: asciiToHex,

    unitMap: unitKlayMap,
    klayUnit: KlayUnit,
    toWei: toWei,
    fromWei: fromWei,

    // For Klay unit
    unitKlayMap: unitKlayMap,
    toPeb: toPeb,
    fromPeb: fromPeb,
    convertFromPeb: convertFromPeb,
    convertToPeb: convertToPeb,

    BN: utils.BN,
    isBN: utils.isBN,
    BigNumber: utils.BigNumber,
    isBigNumber: utils.isBigNumber,
    isHex: utils.isHex,
    isHexStrict: utils.isHexStrict,
    sha3: utils.sha3,
    keccak256: utils.sha3,
    isAddress: utils.isAddress,
    checkAddressChecksum: utils.checkAddressChecksum,
    toHex: utils.toHex,
    toBN: utils.toBN,

    toBuffer: utils.toBuffer,
    numberToBuffer: utils.numberToBuffer,
    bufferToHex: utils.bufferToHex,

    bytesToHex: utils.bytesToHex,
    hexToBytes: utils.hexToBytes,

    hexToNumberString: utils.hexToNumberString,

    hexToNumber: utils.hexToNumber,
    toDecimal: utils.hexToNumber, // alias

    numberToHex: utils.numberToHex,
    fromDecimal: utils.numberToHex, // alias

    hexToUtf8: utils.hexToUtf8,
    hexToString: utils.hexToUtf8,
    toUtf8: utils.hexToUtf8,

    utf8ToHex: utils.utf8ToHex,
    stringToHex: utils.utf8ToHex,
    fromUtf8: utils.utf8ToHex,
    padLeft: utils.leftPad,
    leftPad: utils.leftPad,
    padRight: utils.rightPad,
    rightPad: utils.rightPad,
    toTwosComplement: utils.toTwosComplement,
    isTxHash: utils.isTxHash,
    isTxHashStrict: utils.isTxHashStrict,
    isValidHash: utils.isValidHash,
    isValidHashStrict: utils.isValidHashStrict,

    // Moved promiEvent to utils,
    /** @type {typeof PromiEvent} */
    promiEvent: promiEvent,
    Iban: Iban,
    // Newly added for supporting rpc.js
    isHexParameter: isHexParameter,
    isHexPrefixed: isHexPrefixed,
    addHexPrefix: addHexPrefix,
    stripHexPrefix: stripHexPrefix,

    // Newly added for supporting of setting default block.
    parsePredefinedBlockNumber: utils.parsePredefinedBlockNumber,
    isPredefinedBlockNumber: utils.isPredefinedBlockNumber,
    isValidBlockNumberCandidate: utils.isValidBlockNumberCandidate,
    isValidPrivateKey: utils.isValidPrivateKey,
    isValidNSHSN: utils.isValidNSHSN,
    parsePrivateKey: utils.parsePrivateKey,
    parseKlaytnWalletKey: utils.parseKlaytnWalletKey,
    isKlaytnWalletKey: utils.isKlaytnWalletKey,
    isContractDeployment: utils.isContractDeployment,
    // RLP
    rlpEncode: utils.rlpEncode,
    rlpDecode: utils.rlpDecode,
    xyPointFromPublicKey: utils.xyPointFromPublicKey,
    resolveSignature: utils.resolveSignature,
    transformSignaturesToObject: utils.transformSignaturesToObject,
    getTxTypeStringFromRawTransaction: utils.getTxTypeStringFromRawTransaction,
    txTypeToString: utils.txTypeToString,
    trimLeadingZero: utils.trimLeadingZero,
    makeEven: utils.makeEven,
    isValidPublicKey: utils.isValidPublicKey,
    isCompressedPublicKey: utils.isCompressedPublicKey,
    compressPublicKey: utils.compressPublicKey,
    decompressPublicKey: utils.decompressPublicKey,

    // For account key
    isValidRole: utils.isValidRole,

    isEmptySig: utils.isEmptySig,

    hashMessage: utils.hashMessage,
    recover: utils.recover,
    recoverPublicKey: utils.recoverPublicKey,
    publicKeyToAddress: utils.publicKeyToAddress,

    decodeSignature: decodeSignature,

    isBloom: utils.isBloom,
    isTopic: utils.isTopic,
}
