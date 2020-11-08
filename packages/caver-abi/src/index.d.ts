/**
 * Encodes the function name to its ABI representation, which are the first 4 bytes of the sha3 of the function name including  types.
 *
 * @method encodeFunctionSignature
 * @param {String|Object} functionName
 * @return {String} encoded function name
 */
type encodeFunctionSignature = (functionName: string | object) => string

/**
 * Encodes the function name to its ABI representation, which are the first 4 bytes of the sha3 of the function name including  types.
 *
 * @method encodeEventSignature
 * @param {String|Object} functionName
 * @return {String} encoded function name
 */
type encodeEventSignature = (functionName: string | object) => string

/**
 * Should be used to encode plain param
 *
 * @method encodeParameter
 * @param {String} type
 * @param {Object} param
 * @return {String} encoded plain param
 */
type encodeParameter = (type: string, param: any) => string

/**
 * Should be used to encode list of params
 *
 * @method encodeParameters
 * @param {Array} types
 * @param {Array} params
 * @return {String} encoded list of params
 */
type encodeParameters = (types: Array<any>, params: Array<any>) => string

/**
 * Should be used to encode smart contract deployment with typeructor arguments
 *
 * @method encodeContractDeploy
 * @param {Array} types
 * @param {Array} params
 * @return {String} bytecode + args
 */
type encodeContractDeploy = (jsonInterface: object, bytecode, ...args) => string

/**
 * Map types if simplified format is used
 *
 * @method mapTypes
 * @param {Array} types
 * @return {Array}
 */
type mapTypes = (types: Array<any>) => Array<any>

/**
 * Check if type is simplified struct format
 *
 * @method isSimplifiedStructFormat
 * @param {string | Object} type
 * @returns {boolean}
 */
type isSimplifiedStructFormat = (type: string | object) => boolean

/**
 * Maps the correct tuple type and name when the simplified format in encode/decodeParameter is used
 *
 * @method mapStructNameAndType
 * @param {string} structName
 * @return {{type: string, name: *}}
 */
type mapStructNameAndType = (structName: string) => { type: string; name: any }

/**
 * Maps the simplified format in to the expected format of the ABICoder
 *
 * @method mapStructToCoderFormat
 * @param {Object} struct
 * @return {Array}
 */
type mapStructToCoderFormat = (struct: object) => Array<any>

/**
 * Encodes a function call from its json interface and parameters.
 *
 * @method encodeFunctionCall
 * @param {Array} jsonInterface
 * @param {Array} params
 * @return {String} The encoded ABI for this function call
 */
type encodeFunctionCall = (jsonInterface: object, params: Array<any>) => string

/**
 * Should be used to decode bytes to plain param
 *
 * @method decodeParameter
 * @param {String} type
 * @param {String} bytes
 * @return {Object} plain param
 */
type decodeParameter = (type: string, bytes: string) => object

/**
 * Should be used to decode list of params
 *
 * @method decodeParameter
 * @param {Array} outputs
 * @param {String} bytes
 * @return {Array} array of plain params
 */
type decodeParameters = (outputs: Array<any>, bytes: string) => Array<any>

/**
 * Decodes events non- and indexed parameters.
 *
 * @method decodeLog
 * @param {Object} inputs
 * @param {String} data
 * @param {Array} topics
 * @return {Array} array of plain params
 */
type decodeLog = (inputs: object, data: string, topics: Array<any>) => Array<any>

/**
 * Encodes the function name to its ABI representation, which are the first 4 bytes of the sha3 of the function name including  types.
 *
 * @method encodeFunctionSignature
 * @param {String|Object} functionName
 * @return {String} encoded function name
 */
const encodeFunctionSignature: (functionName: string | object) => string

/**
 * Encodes the function name to its ABI representation, which are the first 4 bytes of the sha3 of the function name including  types.
 *
 * @method encodeEventSignature
 * @param {String|Object} functionName
 * @return {String} encoded function name
 */
const encodeEventSignature: (functionName: string | object) => string

/**
 * Should be used to encode plain param
 *
 * @method encodeParameter
 * @param {String} type
 * @param {Object} param
 * @return {String} encoded plain param
 */
const encodeParameter: (type: string, param: any) => string

/**
 * Should be used to encode list of params
 *
 * @method encodeParameters
 * @param {Array} types
 * @param {Array} params
 * @return {String} encoded list of params
 */
const encodeParameters: (types: Array<any>, params: Array<any>) => string

/**
 * Should be used to encode smart contract deployment with constructor arguments
 *
 * @method encodeContractDeploy
 * @param {Array} types
 * @param {Array} params
 * @return {String} bytecode + args
 */
const encodeContractDeploy: (jsonInterface: object, bytecode, ...args) => string

/**
 * Map types if simplified format is used
 *
 * @method mapTypes
 * @param {Array} types
 * @return {Array}
 */
const mapTypes: (types: Array<any>) => Array<any>

/**
 * Check if type is simplified struct format
 *
 * @method isSimplifiedStructFormat
 * @param {string | Object} type
 * @returns {boolean}
 */
const isSimplifiedStructFormat: (type: string | object) => boolean

/**
 * Maps the correct tuple type and name when the simplified format in encode/decodeParameter is used
 *
 * @method mapStructNameAndType
 * @param {string} structName
 * @return {{type: string, name: *}}
 */
const mapStructNameAndType: (structName: string) => { type: string; name: any }

/**
 * Maps the simplified format in to the expected format of the ABICoder
 *
 * @method mapStructToCoderFormat
 * @param {Object} struct
 * @return {Array}
 */
const mapStructToCoderFormat: (struct: object) => Array<any>

/**
 * Encodes a function call from its json interface and parameters.
 *
 * @method encodeFunctionCall
 * @param {Array} jsonInterface
 * @param {Array} params
 * @return {String} The encoded ABI for this function call
 */
const encodeFunctionCall: (jsonInterface: object, params: Array<any>) => string

/**
 * Should be used to decode bytes to plain param
 *
 * @method decodeParameter
 * @param {String} type
 * @param {String} bytes
 * @return {Object} plain param
 */
const decodeParameter: (type: string, bytes: string) => object

/**
 * Should be used to decode list of params
 *
 * @method decodeParameter
 * @param {Array} outputs
 * @param {String} bytes
 * @return {Array} array of plain params
 */
const decodeParameters: (outputs: Array<any>, bytes: string) => Array<any>

/**
 * Decodes events non- and indexed parameters.
 *
 * @method decodeLog
 * @param {Object} inputs
 * @param {String} data
 * @param {Array} topics
 * @return {Array} array of plain params
 */
const decodeLog: (inputs: object, data: string, topics: Array<any>) => Array<any>

export interface ABI_I {
    encodeFunctionSignature: encodeFunctionSignature,
    encodeEventSignature: encodeEventSignature,
    encodeParameter: encodeParameter,
    encodeParameters: encodeParameters,
    encodeContractDeploy: encodeContractDeploy,
    mapTypes: mapTypes,
    isSimplifiedStructFormat: isSimplifiedStructFormat,
    mapStructNameAndType: mapStructNameAndType,
    mapStructToCoderFormat: mapStructToCoderFormat,
    encodeFunctionCall: encodeFunctionCall,
    decodeParameter: decodeParameter,
    decodeParameters: decodeParameters,
    decodeLog: decodeLog,
}

export default {
    encodeFunctionSignature,
    encodeEventSignature,
    encodeParameter,
    encodeParameters,
    encodeContractDeploy,
    mapTypes,
    isSimplifiedStructFormat,
    mapStructNameAndType,
    mapStructToCoderFormat,
    encodeFunctionCall,
    decodeParameter,
    decodeParameters,
    decodeLog,
}
