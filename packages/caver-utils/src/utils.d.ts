import _ from 'lodash'
import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import numberToBN from 'number-to-bn'
import utf8 from 'utf8'
import Hash from 'eth-lib/lib/hash'
import RLP from 'eth-lib/lib/rlp'
import Account from 'eth-lib/lib/account'

type secp256k1 = any

type txTypeToString = {
    '0x20': string
    '0x21': string
    '0x22': string
    '0x08': string
    '0x10': string
    '0x09': string
    '0x0a': string
    '0x11': string
    '0x12': string
    '0x28': string
    '0x29': string
    '0x2a': string
    '0x30': string
    '0x31': string
    '0x32': string
    '0x38': string
    '0x39': string
    '0x3a': string
    '0x48': string
}

type HASH_LENGTH = string

/**
 * Returns true if object is BN, otherwise false
 *
 * @method isBN
 * @param {Object} object
 * @return {Boolean}
 */
type isBN = (object: object) => boolean

/**
 * Returns true if object is BigNumber, otherwise false
 *
 * @method isBigNumber
 * @param {Object} object
 * @return {Boolean}
 */
type isBigNumber = (num: object) => boolean
/**
 * Takes an input and transforms it into an BN
 *
 * @method toBN
 * @param {Number|String|BN} number, string, HEX string or BN
 * @return {BN} BN
 */
type toBN = (number: number | string | BN) => BN

/**
 * Takes and input transforms it into BN and if it is negative value, into two's complement
 *
 * @method toTwosComplement
 * @param {Number|String|BN} number
 * @return {String}
 */
type toTwosComplement = (number: number | string | BN) => string

/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {String} address the given HEX address
 * @return {Boolean}
 */
type isAddress = (address: string) => boolean

/**
 * Checks if the given string is a checksummed address
 *
 * @method checkAddressChecksum
 * @param {String} address the given HEX address
 * @return {Boolean}
 */
type checkAddressChecksum = (address: string) => boolean

/**
 * Should be called to pad string to expected length
 *
 * @method leftPad
 * @param {String} string to be padded
 * @param {Number} chars that result string should have
 * @param {String} sign, by default 0
 * @returns {String} right aligned string
 */
type leftPad = (string: string, chars: number, sign?: string) => string

/**
 * Should be called to pad string to expected length
 *
 * @method rightPad
 * @param {String} string to be padded
 * @param {Number} chars that result string should have
 * @param {String} sign, by default 0
 * @returns {String} right aligned string
 */
type rightPad = (string: string, chars: number, sign?: string) => string

/**
 * Should be called to get hex representation (prefixed by 0x) of utf8 string
 *
 * @method utf8ToHex
 * @param {String} str
 * @returns {String} hex representation of input string
 */
type utf8ToHex = (str: string) => string

/**
 * Should be called to get utf8 from it's hex representation
 *
 * @method hexToUtf8
 * @param {String} hex
 * @returns {String} ascii string representation of hex value
 */
type hexToUtf8 = (hex: string) => string

/**
 * Converts value to it's number representation
 *
 * @method hexToNumber
 * @param {String|Number|BN} value
 * @return {String}
 */
type hexToNumber = (value: string | number | BN) => string

/**
 * Converts value to it's decimal representation in string
 *
 * @method hexToNumberString
 * @param {String|Number|BN} value
 * @return {String}
 */
type hexToNumberString = (value: string | number | BN) => string

/**
 * Converts value to it's hex representation
 *
 * @method numberToHex
 * @param {String|Number|BN} value
 * @return {String}
 */
type numberToHex = (value: string | number | BN) => string

/**
 * Convert a byte array to a hex string
 *
 * Note: Implementation from crypto-js
 *
 * @method bytesToHex
 * @param {Array} bytes
 * @return {String} the hex string
 */
type bytesToHex = (bytes: Array<string>) => string

/**
 * Convert a hex string to a byte array
 *
 * Note: Implementation from crypto-js
 *
 * @method hexToBytes
 * @param {number | string} hex
 * @return {Array} the byte array
 */
type hexToBytes = (hex: number | string) => Array<string>

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
type toHex = (value: string | number | BN | object, returnType?: boolean) => string

type bufferToHex = (buf: Buffer | Array<string> | string | number | BN | object) => string

/**
 * Convert a input into a Buffer.
 *
 * @method toBuffer
 * @param {Buffer|Array|String|Number|BN|Object|null} input
 * @return {Buffer}
 */
type toBuffer = (input?: Buffer | Array<string> | string | number | BN | object | null) => Buffer

/**
 * Convert a number to a Buffer.
 *
 * @method numberToBuffer
 * @param {Number|String|BN} num
 * @return {Buffer}
 */
type numberToBuffer = (num: string | number | BN) => Buffer

/**
 * Check if string is HEX, requires a 0x in front
 *
 * @method isHexStrict
 * @param {String} hex to be checked
 * @returns {Boolean}
 */
type isHexStrict = (hex: string) => boolean

/**
 * Check if string is HEX
 *
 * @method isHex
 * @param {String} hex to be checked
 * @returns {Boolean}
 */
type isHex = (hex: string) => boolean

/**
 * Checks if the given string is a hexadecimal transaction hash with or without prefix 0x
 * @deprecated since version v1.5.0
 * @method isTxHash
 * @param {String} txHash given hexadecimal transaction hash
 * @return {Boolean}
 */
type isTxHash = (txHash: string) => boolean

/**
 * Checks if the given string is a hexadecimal hash with or without prefix 0x
 * @method isValidHash
 * @param {String} hash given hexadecimal hash
 * @return {Boolean}
 */
type isValidHash = (hash: string) => boolean

/**
 * Checks if the given string is a hexadecimal transaction hash that starts with 0x
 * @deprecated since version v1.5.0
 * @method isTxHashStrict
 * @param {String} txHash given hexadecimal transaction hash
 * @return {Boolean}
 */
type isTxHashStrict = (txHash: string) => boolean

/**
 * Checks if the given string is a hexadecimal hash with prefix 0x
 * @method isValidHashStrict
 * @param {String} hash given hexadecimal hash
 * @return {Boolean}
 */
type isValidHashStrict = (hash: string) => boolean

/**
 * Returns true if given string is a valid Klaytn block header bloom.
 *
 * TODO UNDOCUMENTED
 *
 * @method isBloom
 * @param {String} hex encoded bloom filter
 * @return {Boolean}
 */
type isBloom = (bloom: string) => boolean

/**
 * Returns true if given string is a valid log topic.
 *
 * TODO UNDOCUMENTED
 *
 * @method isTopic
 * @param {String} hex encoded topic
 * @return {Boolean}
 */
type isTopic = (topic: string) => boolean

type parsePredefinedBlockNumber = (blockNumber: any) => any

type isPredefinedBlockNumber = (blockNumber: any) => boolean

/**
 * valid block number should be one of a type below:
 * 1) predefined block number ex:) 'latest', 'earliest', 'pending', 'genesis'
 * 2) hex
 * 3) finite number
 * @param  {String | Number}  blockNumber
 * @return {Boolean}
 */
type isValidBlockNumberCandidate = (blockNumber: string | number) => boolean

/**
 * Hashes values to a sha3 hash using keccak 256
 *
 * To hash a HEX string the hex must have 0x in front.
 *
 * @method sha3
 * @return {String} the sha3 string
 */
type sha3 = (value: string) => string

type parsePrivateKey = (
    privateKey: any
) => {
    privateKey: string
    address: any
    isHumanReadable: boolean
}

type parseKlaytnWalletKey = (key: string) => string[]

type isKlaytnWalletKey = (privateKey: string) => boolean

type isValidPrivateKey = (privateKey: string) => boolean

// Check is 1)Number string or 2)Hex string or 3)Number.
type isValidNSHSN = (value: any) => boolean

type rlpEncode = (data: any) => string

type rlpDecode = (encodedData: any) => any

type xyPointFromPublicKey = (pub: any) => string[]

type trimLeadingZero = (hex: any) => any

type makeEven = (hex: any) => any

/**
 * Returns an array of signatures.
 *
 * @param {string|object|Array.<string>} signature The address entered by the user for use in creating an account.
 * @return {Array.<string>} the sha3 string
 */
type resolveSignature = (signature: string | object | Array<string>) => Array<string>

type transformSignaturesToObject = (signatures: any) => any

type getTxTypeStringFromRawTransaction = (rawTransaction: any) => any

type isValidPublicKey = (publicKey: any) => boolean

type isCompressedPublicKey = (publicKey: any) => boolean

type compressPublicKey = (uncompressedPublicKey: any) => any

type decompressPublicKey = (compressedPublicKey: any) => any

type isContractDeployment = (txObject: any) => boolean

type isValidRole = (role: any) => boolean

// ['0x01', '0x', '0x]
// [['0x01', '0x', '0x]]
// '0x....'
// { v: '0x01', r: '0x', s:'0x' }
// SignatureData { _v: '0x01', _r: '0x', _s:'0x' }
// [SignatureData { _v: '0x01', _r: '0x', _s:'0x' }]
type isEmptySig = (sig: any) => boolean

type hashMessage = (data: any) => string

type recover = (message: any, signature: any, preFixed?: boolean) => string

const secp256k1: any

const txTypeToString: {
    '0x20': string
    '0x21': string
    '0x22': string
    '0x08': string
    '0x10': string
    '0x09': string
    '0x0a': string
    '0x11': string
    '0x12': string
    '0x28': string
    '0x29': string
    '0x2a': string
    '0x30': string
    '0x31': string
    '0x32': string
    '0x38': string
    '0x39': string
    '0x3a': string
    '0x48': string
}

const HASH_LENGTH: string

/**
 * Returns true if object is BN, otherwise false
 *
 * @method isBN
 * @param {Object} object
 * @return {Boolean}
 */
const isBN: (object: object) => boolean

/**
 * Returns true if object is BigNumber, otherwise false
 *
 * @method isBigNumber
 * @param {Object} object
 * @return {Boolean}
 */
const isBigNumber: (num: object) => boolean
/**
 * Takes an input and transforms it into an BN
 *
 * @method toBN
 * @param {Number|String|BN} number, string, HEX string or BN
 * @return {BN} BN
 */
const toBN: (number: number | string | BN) => BN

/**
 * Takes and input transforms it into BN and if it is negative value, into two's complement
 *
 * @method toTwosComplement
 * @param {Number|String|BN} number
 * @return {String}
 */
const toTwosComplement: (number: number | string | BN) => string

/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {String} address the given HEX address
 * @return {Boolean}
 */
const isAddress: (address: string) => boolean

/**
 * Checks if the given string is a checksummed address
 *
 * @method checkAddressChecksum
 * @param {String} address the given HEX address
 * @return {Boolean}
 */
const checkAddressChecksum: (address: string) => boolean

/**
 * Should be called to pad string to expected length
 *
 * @method leftPad
 * @param {String} string to be padded
 * @param {Number} chars that result string should have
 * @param {String} sign, by default 0
 * @returns {String} right aligned string
 */
const leftPad: (string: string, chars: number, sign?: string) => string

/**
 * Should be called to pad string to expected length
 *
 * @method rightPad
 * @param {String} string to be padded
 * @param {Number} chars that result string should have
 * @param {String} sign, by default 0
 * @returns {String} right aligned string
 */
const rightPad: (string: string, chars: number, sign?: string) => string

/**
 * Should be called to get hex representation (prefixed by 0x) of utf8 string
 *
 * @method utf8ToHex
 * @param {String} str
 * @returns {String} hex representation of input string
 */
const utf8ToHex: (str: string) => string

/**
 * Should be called to get utf8 from it's hex representation
 *
 * @method hexToUtf8
 * @param {String} hex
 * @returns {String} ascii string representation of hex value
 */
const hexToUtf8: (hex: string) => string

/**
 * Converts value to it's number representation
 *
 * @method hexToNumber
 * @param {String|Number|BN} value
 * @return {String}
 */
const hexToNumber: (value: string | number | BN) => string

/**
 * Converts value to it's decimal representation in string
 *
 * @method hexToNumberString
 * @param {String|Number|BN} value
 * @return {String}
 */
const hexToNumberString: (value: string | number | BN) => string

/**
 * Converts value to it's hex representation
 *
 * @method numberToHex
 * @param {String|Number|BN} value
 * @return {String}
 */
const numberToHex: (value: string | number | BN) => string

/**
 * Convert a byte array to a hex string
 *
 * Note: Implementation from crypto-js
 *
 * @method bytesToHex
 * @param {Array} bytes
 * @return {String} the hex string
 */
const bytesToHex: (bytes: Array<string>) => string

/**
 * Convert a hex string to a byte array
 *
 * Note: Implementation from crypto-js
 *
 * @method hexToBytes
 * @param {number | string} hex
 * @return {Array} the byte array
 */
const hexToBytes: (hex: number | string) => Array<string>

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
const toHex: (value: string | number | BN | object, returnType?: boolean) => string

const bufferToHex: (buf: Buffer | Array<string> | string | number | BN | object) => string

/**
 * Convert a input into a Buffer.
 *
 * @method toBuffer
 * @param {Buffer|Array|String|Number|BN|Object|null} input
 * @return {Buffer}
 */
const toBuffer: (input?: Buffer | Array<string> | string | number | BN | object | null) => Buffer

/**
 * Convert a number to a Buffer.
 *
 * @method numberToBuffer
 * @param {Number|String|BN} num
 * @return {Buffer}
 */
const numberToBuffer: (num: string | number | BN) => Buffer

/**
 * Check if string is HEX, requires a 0x in front
 *
 * @method isHexStrict
 * @param {String} hex to be checked
 * @returns {Boolean}
 */
const isHexStrict: (hex: string) => boolean

/**
 * Check if string is HEX
 *
 * @method isHex
 * @param {String} hex to be checked
 * @returns {Boolean}
 */
const isHex: (hex: string) => boolean

/**
 * Checks if the given string is a hexadecimal transaction hash with or without prefix 0x
 * @deprecated since version v1.5.0
 * @method isTxHash
 * @param {String} txHash given hexadecimal transaction hash
 * @return {Boolean}
 */
const isTxHash: (txHash: string) => boolean

/**
 * Checks if the given string is a hexadecimal hash with or without prefix 0x
 * @method isValidHash
 * @param {String} hash given hexadecimal hash
 * @return {Boolean}
 */
const isValidHash: (hash: string) => boolean

/**
 * Checks if the given string is a hexadecimal transaction hash that starts with 0x
 * @deprecated since version v1.5.0
 * @method isTxHashStrict
 * @param {String} txHash given hexadecimal transaction hash
 * @return {Boolean}
 */
const isTxHashStrict: (txHash: string) => boolean

/**
 * Checks if the given string is a hexadecimal hash with prefix 0x
 * @method isValidHashStrict
 * @param {String} hash given hexadecimal hash
 * @return {Boolean}
 */
const isValidHashStrict: (hash: string) => boolean

/**
 * Returns true if given string is a valid Klaytn block header bloom.
 *
 * TODO UNDOCUMENTED
 *
 * @method isBloom
 * @param {String} hex encoded bloom filter
 * @return {Boolean}
 */
const isBloom: (bloom: string) => boolean

/**
 * Returns true if given string is a valid log topic.
 *
 * TODO UNDOCUMENTED
 *
 * @method isTopic
 * @param {String} hex encoded topic
 * @return {Boolean}
 */
const isTopic: (topic: string) => boolean

const parsePredefinedBlockNumber: (blockNumber: any) => any

const isPredefinedBlockNumber: (blockNumber: any) => boolean

/**
 * valid block number should be one of a type below:
 * 1) predefined block number ex:) 'latest', 'earliest', 'pending', 'genesis'
 * 2) hex
 * 3) finite number
 * @param  {String | Number}  blockNumber
 * @return {Boolean}
 */
const isValidBlockNumberCandidate: (blockNumber: string | number) => boolean

/**
 * Hashes values to a sha3 hash using keccak 256
 *
 * To hash a HEX string the hex must have 0x in front.
 *
 * @method sha3
 * @return {String} the sha3 string
 */
const sha3: (value: string) => string

const parsePrivateKey: (
    privateKey: any
) => {
    privateKey: string
    address: any
    isHumanReadable: boolean
}

function parseKlaytnWalletKey(key: string): string[]

const isKlaytnWalletKey: (privateKey: string) => boolean

function isValidPrivateKey(privateKey: string): boolean

// Check is 1)Number string or 2)Hex string or 3)Number.
function isValidNSHSN(value: any): boolean

const rlpEncode: (data: any) => string

const rlpDecode: (encodedData: any) => any

const xyPointFromPublicKey: (pub: any) => string[]

const trimLeadingZero: (hex: any) => any

const makeEven: (hex: any) => any

/**
 * Returns an array of signatures.
 *
 * @param {string|object|Array.<string>} signature The address entered by the user for use in creating an account.
 * @return {Array.<string>} the sha3 string
 */
const resolveSignature: (signature: string | object | Array<string>) => Array<string>

const transformSignaturesToObject: (signatures: any) => any

const getTxTypeStringFromRawTransaction: (rawTransaction: any) => any

const isValidPublicKey: (publicKey: any) => boolean

const isCompressedPublicKey: (publicKey: any) => boolean

const compressPublicKey: (uncompressedPublicKey: any) => any

const decompressPublicKey: (compressedPublicKey: any) => any

const isContractDeployment: (txObject: any) => boolean

const isValidRole: (role: any) => boolean

// ['0x01', '0x', '0x]
// [['0x01', '0x', '0x]]
// '0x....'
// { v: '0x01', r: '0x', s:'0x' }
// SignatureData { _v: '0x01', _r: '0x', _s:'0x' }
// [SignatureData { _v: '0x01', _r: '0x', _s:'0x' }]
const isEmptySig: (sig: any) => boolean

const hashMessage: (data: any) => string

const recover: (message: any, signature: any, preFixed?: boolean) => string

export type utils = {
    BN: BN
    isBN: isBN
    isBigNumber: isBigNumber
    toBN: toBN
    isAddress: isAddress
    isBloom: isBloom // TODO UNDOCUMENTED
    isTopic: isTopic // TODO UNDOCUMENTED
    checkAddressChecksum: checkAddressChecksum
    utf8ToHex: utf8ToHex
    hexToUtf8: hexToUtf8
    hexToNumber: hexToNumber
    hexToNumberString: hexToNumberString
    numberToHex: numberToHex
    toHex: toHex
    bufferToHex: bufferToHex
    toBuffer: toBuffer
    numberToBuffer: numberToBuffer
    hexToBytes: hexToBytes
    bytesToHex: bytesToHex
    isHex: isHex
    isHexStrict: isHexStrict
    leftPad: leftPad
    rightPad: rightPad
    toTwosComplement: toTwosComplement
    sha3: sha3
    parsePredefinedBlockNumber: parsePredefinedBlockNumber
    isPredefinedBlockNumber: isPredefinedBlockNumber
    isValidBlockNumberCandidate: isValidBlockNumberCandidate
    isValidPrivateKey: isValidPrivateKey
    isValidNSHSN: isValidNSHSN
    parsePrivateKey: parsePrivateKey
    parseKlaytnWalletKey: parseKlaytnWalletKey
    isKlaytnWalletKey: isKlaytnWalletKey
    isContractDeployment: isContractDeployment

    rlpEncode: rlpEncode
    rlpDecode: rlpDecode
    xyPointFromPublicKey: xyPointFromPublicKey
    resolveSignature: resolveSignature
    transformSignaturesToObject: transformSignaturesToObject
    getTxTypeStringFromRawTransaction
    trimLeadingZero
    makeEven
    txTypeToString
    isValidPublicKey
    isCompressedPublicKey
    compressPublicKey
    decompressPublicKey
    isTxHash
    isTxHashStrict
    isValidHash
    isValidHashStrict

    isValidRole: isValidRole

    isEmptySig: isEmptySig

    hashMessage: hashMessage
    recover: recover
}
