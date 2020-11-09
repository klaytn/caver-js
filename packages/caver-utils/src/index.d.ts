import _ from 'lodash'
import { randomHex } from '../randomhex'
import promiEvent from '../promievent'
import utils from './utils'

/**
 * Fires an error in an event emitter and callback and returns the eventemitter
 *
 * @method _fireError
 * @param {Object} error a string, a error, or an object with {message, data}
 * @param {Object} emitter
 * @param {Function} reject
 * @param {Function} callback
 * @return {Object} the emitter
 */
const _fireError: (error: object, emitter: object, reject: Function, callback: Function) => object

/**
 * Should be used to create full function/event name from json abi
 *
 * @method _jsonInterfaceMethodToString
 * @param {Object} json
 * @return {String} full function/event name
 */
const _jsonInterfaceMethodToString: (json: object) => string

/**
 * Should be called to get ascii from it's hex representation
 *
 * @method hexToAscii
 * @param {String} hex
 * @returns {String} ascii string representation of hex value
 */
const hexToAscii: (hex: string) => string

/**
 * Should be called to get hex representation (prefixed by 0x) of ascii string
 *
 * @method asciiToHex
 * @param {String} str
 * @returns {String} hex representation of input string
 */
const asciiToHex: (str: string) => string

/**
 * Returns value of unit in Wei
 *
 * @method getUnitValue
 * @param {String} unit the unit to convert to, default ether
 * @returns {BN} value of the unit (in Wei)
 * @throws error if the unit is not correct:w
 */
const getUnitValue: (unit: string) => BN

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
 * @method fromWei
 * @param {Number|String} number can be a number, number string or a HEX of a decimal
 * @param {String} unit the unit to convert to, default ether
 * @return {String|Object} When given a BN object it returns one as well, otherwise a number
 */
const fromWei: (number: number | string, unit: string) => string | object

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
 * @method toWei
 * @param {Number|String|BN} number can be a number, number string or a HEX of a decimal
 * @param {String} unit the unit to convert from, default ether
 * @return {String|Object} When given a BN object it returns one as well, otherwise a number
 */
const toWei: (number: number | string | BN, unit: string) => string

// For Klay unit
type unitKlayMap = {
    [key: string]: string
    peb: string
    kpeb: string
    Mpeb: string
    Gpeb: string
    Ston: string
    ston: string
    uKLAY: string
    mKLAY: string
    KLAY: string
    kKLAY: string
    MKLAY: string
    GKLAY: string
    TKLAY: string
}

type KlayUnitInfo = {
    unit: string
    pebFactor: number
}

type KlayUnit = {
    peb: KlayUnitInfo
    kpeb: KlayUnitInfo
    Mpeb: KlayUnitInfo
    Gpeb: KlayUnitInfo
    ston: KlayUnitInfo
    uKLAY: KlayUnitInfo
    mKLAY: KlayUnitInfo
    KLAY: KlayUnitInfo
    kKLAY: KlayUnitInfo
    MKLAY: KlayUnitInfo
    GKLAY: KlayUnitInfo
    TKLAY: KlayUnitInfo
}

type unitKlayToEthMap = {
    peb: string
    kpeb: string
    Mpeb: string
    Gpeb: string
    Ston: string
    ston: string
    uKLAY: string
    mKLAY: string
    KLAY: string
    kKLAY: string
    MKLAY: string
    GKLAY: string
    TKLAY: string
}
const getKlayUnitValue: (unit: string) => string

const fromPeb: (number: number | string | BN, unit: string) => string

const toPeb: (number, unit) => string | BN

/**
 * Converts peb amount to specific unit amount.
 *
 * @method convertFromPeb
 * @param {number|string|BN|BigNumber} amount the peb amount
 * @param {string|KlayUnit} unitString the unit to convert to
 * @return {string}
 */
const convertFromPeb: (number: number | string | BN | BigNumber, unitString: string | KlayUnit) => string

/**
 * Converts amount to peb amount
 *
 * @method convertToPeb
 * @param {number|string|BN|BigNumber} amount the amount to convert
 * @param {string|KlayUnit} unitString the unit to convert from
 * @return {string|BN}
 */
const convertToPeb: (number: number | string | BN | BigNumber, unitString: string | KlayUnit) => string | BN

const tryNumberToString: (number: number) => string

/**
 * Converts to a checksum address
 *
 * @method toChecksumAddress
 * @param {String} address the given HEX address
 * @return {String}
 */
const toChecksumAddress: (address: string) => string

const isHexParameter: (a: any) => boolean

/**
 * Should be used to flatten json abi inputs/outputs into an array of type-representing-strings
 *
 * @method _flattenTypes
 * @param {bool} includeTuple
 * @param {Object} puts
 * @return {Array} parameters as strings
 */
const _flattenTypes: (includeTuple: boolean, puts: object) => string[]

/**
 *
 * @method isHexPrefixed
 * @param {String} string
 * @return {bool}
 */
const isHexPrefixed: (str: string) => boolean

/**
 *
 * @method addHexPrefix
 * @param {String} string
 * @return {String}
 */
const addHexPrefix: (str: string) => string

/**
 *
 * @method stripHexPrefix
 * @param {String} string
 * @return {String}
 */
const stripHexPrefix: (str: string) => string

type Utils = {
    _fireError: _fireError
    _jsonInterfaceMethodToString: _jsonInterfaceMethodToString
    _flattenTypes: _flattenTypes
    randomHex: randomHex
    _: _
    soliditySha3: soliditySha3
    toChecksumAddress: toChecksumAddress
    hexToAscii: hexToAscii
    toAscii: hexToAscii
    asciiToHex: asciiToHex
    fromAscii: asciiToHex

    unitMap: unitKlayMap
    klayUnit: KlayUnit
    toWei: toWei
    fromWei: fromWei

    // For Klay unit
    unitKlayMap: unitKlayMap
    toPeb: toPeb
    fromPeb: fromPeb
    convertFromPeb: convertFromPeb
    convertToPeb: convertToPeb

    BN: utils.BN
    isBN: utils.isBN
    isBigNumber: utils.isBigNumber
    isHex: utils.isHex
    isHexStrict: utils.isHexStrict
    sha3: utils.sha3
    keccak256: utils.sha3
    isAddress: utils.isAddress
    checkAddressChecksum: utils.checkAddressChecksum
    toHex: utils.toHex
    toBN: utils.toBN

    toBuffer: utils.toBuffer
    numberToBuffer: utils.numberToBuffer
    bufferToHex: utils.bufferToHex

    bytesToHex: utils.bytesToHex
    hexToBytes: utils.hexToBytes

    hexToNumberString: utils.hexToNumberString

    hexToNumber: utils.hexToNumber
    toDecimal: utils.hexToNumber // alias

    numberToHex: utils.numberToHex
    fromDecimal: utils.numberToHex // alias

    hexToUtf8: utils.hexToUtf8
    hexToString: utils.hexToUtf8
    toUtf8: utils.hexToUtf8

    utf8ToHex: utils.utf8ToHex
    stringToHex: utils.utf8ToHex
    fromUtf8: utils.utf8ToHex
    padLeft: utils.leftPad
    leftPad: utils.leftPad
    padRight: utils.rightPad
    rightPad: utils.rightPad
    toTwosComplement: utils.toTwosComplement
    isTxHash: utils.isTxHash
    isTxHashStrict: utils.isTxHashStrict
    isValidHash: utils.isValidHash
    isValidHashStrict: utils.isValidHashStrict

    // Moved promiEvent to utils,
    promiEvent: promiEvent
    Iban: Iban
    // Newly added for supporting rpc.js
    isHexParameter: isHexParameter
    isHexPrefixed: isHexPrefixed
    addHexPrefix: addHexPrefix
    stripHexPrefix: stripHexPrefix

    // Newly added for supporting of setting default block.
    parsePredefinedBlockNumber: utils.parsePredefinedBlockNumber
    isPredefinedBlockNumber: utils.isPredefinedBlockNumber
    isValidBlockNumberCandidate: utils.isValidBlockNumberCandidate
    isValidPrivateKey: utils.isValidPrivateKey
    isValidNSHSN: utils.isValidNSHSN
    parsePrivateKey: utils.parsePrivateKey
    parseKlaytnWalletKey: utils.parseKlaytnWalletKey
    isKlaytnWalletKey: utils.isKlaytnWalletKey
    isContractDeployment: utils.isContractDeployment
    // RLP
    rlpEncode: utils.rlpEncode
    rlpDecode: utils.rlpDecode
    xyPointFromPublicKey: utils.xyPointFromPublicKey
    resolveSignature: utils.resolveSignature
    transformSignaturesToObject: utils.transformSignaturesToObject
    getTxTypeStringFromRawTransaction: utils.getTxTypeStringFromRawTransaction
    txTypeToString: utils.txTypeToString
    trimLeadingZero: utils.trimLeadingZero
    makeEven: utils.makeEven
    isValidPublicKey: utils.isValidPublicKey
    isCompressedPublicKey: utils.isCompressedPublicKey
    compressPublicKey: utils.compressPublicKey
    decompressPublicKey: utils.decompressPublicKey

    // For account key
    isValidRole: utils.isValidRole

    isEmptySig: utils.isEmptySig

    hashMessage: utils.hashMessage
    recover: utils.recover
}

export default Utils
