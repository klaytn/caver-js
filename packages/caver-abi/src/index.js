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

    This file is derived from web3.js/packages/web3-eth-abi/src/index.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/**
 * @file index.js
 * @author Marek Kotewicz <marek@parity.io>
 * @author Fabian Vogelsteller <fabian@frozeman.de>
 * @date 2017
 */

const _ = require('lodash')

const EthersAbiCoder = require('@ethersproject/abi').AbiCoder
const ParamType = require('@ethersproject/abi').ParamType
const utils = require('../../caver-utils')

const ethersAbiCoder = new EthersAbiCoder(function(type, value) {
    if (type.match(/^u?int/) && !_.isArray(value) && (!_.isObject(value) || value.constructor.name !== 'BN')) {
        return value.toString()
    }
    return value
})

// result method
function Result() {}

class ABI {
    /**
     * Encodes the function signature to its ABI signature, which are the first 4 bytes of the sha3 hash of the function name including parameter types.
     *
     * @example
     * caver.abi.encodeFunctionSignature({ name: 'myMethod', type: 'function', inputs: [{ type: 'uint256', name: 'myNumber' },{ type: 'string', name: 'mystring' }]})
     *
     * caver.abi.encodeFunctionSignature('myMethod(uint256,string)')
     *
     * @method encodeFunctionSignature
     * @memberof ABI
     * @instance
     * @param {string|object} functionSignature The function signature or the JSON interface object of the function to encode. If this is a string, it has to be in the form `function(type, type,...)`, e.g: `myFunction(uint256,uint32[],bytes10,bytes)`.
     * @return {string} function signature
     */
    encodeFunctionSignature(functionSignature) {
        if (_.isObject(functionSignature)) {
            functionSignature = utils._jsonInterfaceMethodToString(functionSignature)
        }

        return utils.sha3(functionSignature).slice(0, 10)
    }

    /**
     * Encodes the event signature to its ABI signature, which is the sha3 hash of the event name including input parameter types.
     *
     * @example
     * caver.abi.encodeEventSignature({ name: 'myEvent', type: 'event', inputs: [{ type: 'uint256', name: 'myNumber' },{ type: 'string', name: 'mystring' }]})
     *
     * caver.abi.encodeEventSignature('myEvent(uint256,bytes32)')
     *
     * @method encodeEventSignature
     * @memberof ABI
     * @instance
     * @param {string|object} eventSignature The event signature or the JSON interface object of the event to encode. If this is a string, it has to be in the form `event(type,type,...)`, e.g: `myEvent(uint256,uint32[],bytes10,bytes)`.
     * @return {string} event signature
     */
    encodeEventSignature(eventSignature) {
        if (_.isObject(eventSignature)) {
            eventSignature = utils._jsonInterfaceMethodToString(eventSignature)
        }

        return utils.sha3(eventSignature)
    }

    /**
     * Encodes a parameter based on its type to its ABI representation.
     *
     * @example
     * caver.abi.encodeParameter('uint256', '2345675643')
     * caver.abi.encodeParameter('bytes32[]', [caver.utils.rightPad('0xdf3234', 64), caver.utils.rightPad('0xfdfd', 64)])
     * caver.abi.encodeParameter('tuple(bytes32,bool)', ['0xabdef18710a18a18abdef18710a18a18abdef18710a18a18abdef18710a18a18', true])
     *
     * @method encodeParameter
     * @memberof ABI
     * @instance
     * @param {string|object} type The type of the parameter, see the {@link http://solidity.readthedocs.io/en/develop/types.html|solidity documentation}  for a list of types.
     * @param {*} param The actual parameter to encode.
     * @return {string} encoded plain param
     */
    encodeParameter(type, param) {
        return this.encodeParameters([type], [param])
    }

    /**
     * Encodes function parameters based on its JSON interface object.
     *
     * @example
     * caver.abi.encodeParameters(['uint256','string'], ['2345675643', 'Hello!%'])
     *
     * caver.abi.encodeParameters(
     *      ['tuple(bytes32,bool)', 'tuple(bool,address)'],
     *      [['0xabdef18710a18a18abdef18710a18a18abdef18710a18a18abdef18710a18a18', true], [true, '0x77656c636f6d6520746f20657468657265756d2e']]
     * )
     *
     * caver.abi.encodeParameters(
     *   [
     *       {
     *           components: [{ name: 'a', type: 'bytes32' }, { name: 'b', type: 'bool' }],
     *           name: 'tupleExample',
     *           type: 'tuple',
     *       },
     *       {
     *           components: [{ name: 'c', type: 'bool' }, { name: 'd', type: 'address' }],
     *           name: 'tupleExample2',
     *          type: 'tuple',
     *      },
     *  ],
     *  [
     *      ['0xabdef18710a18a18abdef18710a18a18abdef18710a18a18abdef18710a18a18', true],
     *      [true, '0x77656c636f6d6520746f20657468657265756d2e']
     *  ]
     *)
     *
     * @method encodeParameters
     * @memberof ABI
     * @instance
     * @param {Array.<string|object>} types An array with types or a JSON interface of a function. See the {@link http://solidity.readthedocs.io/en/develop/types.html|solidity documentation} for a list of types.
     * @param {Array.<*>} params The parameters to encode.
     * @return {string} encoded list of params
     */
    encodeParameters(types, params) {
        const self = this
        types = self.mapTypes(types)

        params = params.map(function(param, index) {
            let type = types[index]

            // { components: [[Object], [Object]], name: 'b', type: 'tuple' }
            if (typeof type === 'object' && type.type) {
                // We may get a named type of shape {name, type}
                type = type.type
            }

            param = self.formatParam(type, param)

            // If the type is string but number comes in, ethersAbiCoder ignores the type and encodes successfully.
            // To avoid invalid encoding value, adding error handling.
            if (type === 'string' && typeof param !== 'string') throw new Error(`Invalid parameter: Parameter value and type do not match.`)

            // Format params for tuples
            if (typeof type === 'string' && type.includes('tuple')) {
                const coder = ethersAbiCoder._getCoder(ParamType.from(type))
                // eslint-disable-next-line no-shadow
                const modifyParams = (coder, param) => {
                    if (coder.name === 'array') {
                        return param.map(p => {
                            // `coder.type.replace('[]','')` can handle'tuple(string,string)[]', but cannot handle `tuple(string,string)[3]'.
                            // Therefore, in order to handle tuple arrays of fixed length, the logic is changed to handle strings using regular expression expressions.
                            const replacedType = coder.type.replace(/\[[1-9]*\]/g, '')
                            const parameterType = ParamType.from(replacedType)
                            const gotCoder = ethersAbiCoder._getCoder(parameterType)
                            modifyParams(gotCoder, p)
                        })
                    }
                    coder.coders.forEach((c, i) => {
                        if (c.name === 'tuple') {
                            modifyParams(c, param[i])
                        } else {
                            param[i] = self.formatParam(c.name, param[i])
                        }
                    })
                }
                modifyParams(coder, param)
            }

            return param
        })

        return ethersAbiCoder.encode(types, params)
    }

    /**
     * Should be used to encode smart contract deployment with constructor arguments.
     *
     * @example
     * // There is no argument for constructor
     * caver.abi.encodeContractDeploy([
     *     { "constant": true, "inputs": [], "name": "count", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" },
     *     { "constant": true, "inputs": [], "name": "getBlockNumber", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" },
     *     { "constant": false, "inputs": [ { "name": "_count", "type": "uint256" } ], "name": "setCount", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }
     * ],'0x{byte code}')
     *
     * // There is one argument for constructor
     * caver.abi.encodeContractDeploy([
     *     { "constant": true, "inputs": [], "name": "count", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" },
     *     { "constant": true, "inputs": [], "name": "getBlockNumber", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" },
     *     { "constant": false, "inputs": [ { "name": "_count", "type": "uint256" } ], "name": "setCount", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" },
     *     { "inputs": [ { "name": "_a", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }
     * ],'0x{byte code}', 1)
     *
     * @method encodeContractDeploy
     * @memberof ABI
     * @instance
     * @param {Array.<object>} jsonInterface The JSON interface of the contract.
     * @param {string} bytecode A bytecode of smart contract to be deployed.
     * @param {...*} [args] Arguments to pass to the constructor.
     * @return {string} bytecode + args
     */
    encodeContractDeploy(jsonInterface, bytecode, ...args) {
        if (!jsonInterface) {
            throw new Error('jsonInterface should be provided for encoding contract deployment.')
        }

        if (!bytecode) {
            throw new Error('bytecode should be provided for encoding contract deployment.')
        }

        const constructorInterface = jsonInterface.filter(({ type }) => type === 'constructor')[0]
        const constructorInputs = constructorInterface && constructorInterface.inputs

        // If constructor doesn't exist in smart contract, only bytecode is needed for deploying.
        if (!constructorInterface || !constructorInputs || _.isEmpty(constructorInputs)) {
            return bytecode
        }

        if (constructorInputs.length !== args.length) {
            throw new Error(`invalid number of parameters for deploying. Got ${args.length} expected ${constructorInputs.length}!`)
        }

        const constructorTypes = constructorInputs.map(({ type }) => type)

        return bytecode + this.encodeParameters(constructorTypes, args).replace('0x', '')
    }

    /**
     * Map types if simplified format is used
     *
     * @method mapTypes
     * @memberof ABI
     * @ignore
     * @instance
     * @param {Array} types
     * @return {Array}
     */
    mapTypes(types) {
        const self = this
        const mappedTypes = []
        types.forEach(function(type) {
            // Remap `function` type params to bytes24 since Ethers does not
            // recognize former type. Solidity docs say `Function` is a bytes24
            // encoding the contract address followed by the function selector hash.
            if (typeof type === 'object' && type.type === 'function') {
                type = { ...type, type: 'bytes24' }
            }
            if (self.isSimplifiedStructFormat(type)) {
                const structName = Object.keys(type)[0]
                mappedTypes.push(
                    Object.assign(self.mapStructNameAndType(structName), {
                        components: self.mapStructToCoderFormat(type[structName]),
                    })
                )

                return
            }

            mappedTypes.push(type)
        })
        return mappedTypes
    }

    /**
     * Check if type is simplified struct format
     *
     * @method isSimplifiedStructFormat
     * @memberof ABI
     * @ignore
     * @instance
     * @param {string|Object} type
     * @returns {boolean}
     */
    isSimplifiedStructFormat(type) {
        return typeof type === 'object' && typeof type.components === 'undefined' && typeof type.name === 'undefined'
    }

    /**
     * Maps the correct tuple type and name when the simplified format in encode/decodeParameter is used
     *
     * @method mapStructNameAndType
     * @memberof ABI
     * @ignore
     * @instance
     * @param {string} structName
     * @return {{type: string, name: *}}
     */
    mapStructNameAndType(structName) {
        let type = 'tuple'

        if (structName.indexOf('[]') > -1) {
            type = 'tuple[]'
            structName = structName.slice(0, -2)
        }

        return { type: type, name: structName }
    }

    /**
     * Maps the simplified format in to the expected format of the ABI
     *
     * @method mapStructToCoderFormat
     * @memberof ABI
     * @ignore
     * @instance
     * @param {object} struct
     * @return {Array}
     */
    mapStructToCoderFormat(struct) {
        const self = this
        const components = []
        Object.keys(struct).forEach(function(key) {
            if (typeof struct[key] === 'object') {
                components.push(
                    Object.assign(self.mapStructNameAndType(key), {
                        components: self.mapStructToCoderFormat(struct[key]),
                    })
                )

                return
            }

            components.push({
                name: key,
                type: struct[key],
            })
        })

        return components
    }

    /**
     * Handle some formatting of params for backwards compatability with Ethers V4
     *
     * @method formatParam
     * @memberof ABI
     * @ignore
     * @param {string} - type
     * @param {any} - param
     * @return {string|Array.<string>} - The formatted param
     */
    formatParam(type, param) {
        const paramTypeBytes = /^bytes([0-9]*)$/
        const paramTypeBytesArray = /^bytes([0-9]*)\[\]$/
        const paramTypeNumber = /^(u?int)([0-9]*)$/
        const paramTypeNumberArray = /^(u?int)([0-9]*)\[\]$/

        // Format BN to string
        if (utils.isBN(param) || utils.isBigNumber(param)) {
            return param.toString(10)
        }

        if (type.match(paramTypeBytesArray) || type.match(paramTypeNumberArray)) {
            return param.map(p => this.formatParam(type.replace('[]', ''), p))
        }

        // Format correct width for u?int[0-9]*
        let match = type.match(paramTypeNumber)
        if (match) {
            const size = parseInt(match[2] || '256')
            if (size / 8 < param.length) {
                // pad to correct bit width
                param = utils.leftPad(param, size)
            }
        }

        // Format correct length for bytes[0-9]+
        match = type.match(paramTypeBytes)
        if (match) {
            if (Buffer.isBuffer(param)) {
                param = utils.toHex(param)
            }

            // format to correct length
            const size = parseInt(match[1])
            if (size) {
                let maxSize = size * 2
                if (param.substring(0, 2) === '0x') {
                    maxSize += 2
                }
                if (param.length < maxSize) {
                    // pad to correct length
                    param = utils.rightPad(param, size * 2)
                }
            }

            // format odd-length bytes to even-length
            if (param.length % 2 === 1) {
                param = `0x0${param.substring(2)}`
            }
        }

        return param
    }

    /**
     * Encodes a function call from its json interface and parameters.
     *
     * @example
     * caver.abi.encodeFunctionCall({
     *     name: 'myMethod',
     *     type: 'function',
     *     inputs: [{
     *         type: 'uint256',
     *         name: 'myNumber'
     * },{
     *         type: 'string',
     *         name: 'mystring'
     *     }]
     * }, ['2345675643', 'Hello!%'])
     *
     * @method encodeFunctionCall
     * @memberof ABI
     * @instance
     * @param {object} jsonInterface The JSON interface object of a function.
     * @param {Array.<*>} [params] The parameters to encode.
     * @return {string} The encoded ABI for this function call
     */
    encodeFunctionCall(jsonInterface, params) {
        params = params || []
        return this.encodeFunctionSignature(jsonInterface) + this.encodeParameters(jsonInterface.inputs, params).replace('0x', '')
    }

    /**
     * Decodes a function call from its abi object of a function and returns parameters.
     * If the function signature of the `abi` passed as a parameter does not match the function signature of the `functionCall`, an error is returned.
     *
     * @example
     * const abi = {
     *    name: 'myMethod',
     *    type: 'function',
     *    inputs: [
     *        {
     *            type: 'uint256',
     *           name: 'myNumber',
     *       },
     *       {
     *           type: 'string',
     *           name: 'mystring',
     *       },
     *   ],
     * }
     * const functionCall = '0x24ef0...'
     * caver.abi.decodeFunctionCall(abi, functionCall)
     *
     * @method decodeFunctionCall
     * @memberof ABI
     * @instance
     * @param {object} abi The abi object of a function.
     * @param {string} functionCall The encoded function call string.
     * @return {object} An object which includes plain params. You can use `result[0]` as it is provided to be accessed like an array in the order of the parameters.
     */
    decodeFunctionCall(abi, functionCall) {
        functionCall = utils.addHexPrefix(functionCall)

        if (!_.isObject(abi) || _.isArray(abi))
            throw new Error(
                `Invalid abi parameter type: To decode function call, you need to pass an abi object of the function as a first parameter.`
            )
        if (!abi.name || !abi.inputs)
            throw new Error(`Insufficient info in abi object: The function name and inputs must be defined inside the abi function object.`)

        const funcSig = this.encodeFunctionSignature(abi)
        const extractFuncSig = functionCall.slice(0, funcSig.length)

        if (funcSig !== extractFuncSig)
            throw new Error(
                `Invalid function signature: The function signature of the abi as a parameter and the function signatures extracted from the function call string do not match.`
            )

        return this.decodeParameters(abi.inputs, `0x${functionCall.slice(funcSig.length)}`)
    }

    /**
     * Decodes an ABI encoded parameter to its JavaScript type.
     *
     * @example
     * caver.abi.decodeParameter('uint256', '0x0000000000000000000000000000000000000000000000000000000000000010')
     *
     * caver.abi.decodeParameter('string', '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000848656c6c6f212521000000000000000000000000000000000000000000000000')
     *
     * caver.abi.decodeParameter('tuple(bytes32,bool)', '0xabdef18710a18a18abdef18710a18a18abdef18710a18a18abdef18710a18a180000000000000000000000000000000000000000000000000000000000000001')
     *
     * caver.abi.decodeParameter(
     *     {
     *         components: [{ name: 'a', type: 'bytes32' }, { name: 'b', type: 'bool' }],
     *         name: 'tupleExample',
     *         type: 'tuple',
     *     }, '0xabdef18710a18a18abdef18710a18a18abdef18710a18a18abdef18710a18a180000000000000000000000000000000000000000000000000000000000000001'
     * )
     *
     * @method decodeParameter
     * @memberof ABI
     * @instance
     * @param {string|object} type The type of the parameter, see the {@link http://solidity.readthedocs.io/en/develop/types.html|solidity documentation} for a list of types.
     * @param {string} encodedString The ABI byte code to decode.
     * @return {string} plain param
     */
    decodeParameter(type, encodedString) {
        return this.decodeParameters([type], encodedString)[0]
    }

    /**
     * Decodes ABI encoded parameters to its JavaScript types.
     *
     * @example
     * caver.abi.decodeParameters(['string', 'uint256'], '0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000ea000000000000000000000000000000000000000000000000000000000000000848656c6c6f212521000000000000000000000000000000000000000000000000')
     *
     * caver.abi.decodeParameters(
     *  ['tuple(bytes32,bool)', 'tuple(bool,address)'],
     *  '0xabdef18710a18a18abdef18710a18a18abdef18710a18a18abdef18710a18a180000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000077656c636f6d6520746f20657468657265756d2e'
     * )
     *
     * caver.abi.decodeParameters([{
     *     type: 'string',
     *     name: 'mystring'
     * },{
     *     type: 'uint256',
     *     name: 'myNumber'
     * }], '0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000ea000000000000000000000000000000000000000000000000000000000000000848656c6c6f212521000000000000000000000000000000000000000000000000')
     *
     * caver.abi.decodeParameters(
     *     [
     *         {
     *             components: [{ name: 'a', type: 'bytes32' }, { name: 'b', type: 'bool' }],
     *             name: 'tupleExample',
     *             type: 'tuple',
     *         },
     *         {
     *             components: [{ name: 'c', type: 'bool' }, { name: 'd', type: 'address' }],
     *             name: 'tupleExample2',
     *             type: 'tuple',
     *         },
     *     ],
     *     '0xabdef18710a18a18abdef18710a18a18abdef18710a18a18abdef18710a18a180000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000077656c636f6d6520746f20657468657265756d2e'
     * )
     *
     * @method decodeParameters
     * @memberof ABI
     * @instance
     * @param {Array.<string|object>} typesArray An array with types or an array of JSON interface outputs. See the {@link http://solidity.readthedocs.io/en/develop/types.html|solidity documentation} for a list of types.
     * @param {string} encodedString The ABI byte code to decode.
     * @return {object} An object which includes plain params. You can use `result[0]` as it is provided to be accessed like an array in the order of the parameters.
     */
    decodeParameters(outputs, encodedString) {
        return this.decodeParametersWith(outputs, encodedString, false)
    }

    /**
     * Should be used to decode list of params
     *
     * @method decodeParametersWith
     * @memberof ABI
     * @instance
     * @ignore
     * @param {Array} outputs
     * @param {string} bytes
     * @param {Boolean} loose must be passed for decoding bytes and string parameters for logs emitted with solc 0.4.x
     *                        Please refer to https://github.com/ChainSafe/web3.js/commit/e80337e16e5c04683fc40148378775234c28e0fb.
     * @return {object} An object which includes plain params. You can use `result[0]` as it is provided to be accessed like an array in the order of the parameters.
     */
    decodeParametersWith(outputs, bytes, loose) {
        if (outputs.length > 0 && (!bytes || bytes === '0x' || bytes === '0X')) {
            throw new Error(
                "Returned values aren't valid, did it run Out of Gas? " +
                    'You might also see this error if you are not using the ' +
                    'correct ABI for the contract you are retrieving data from, ' +
                    'requesting data from a block number that does not exist, ' +
                    'or querying a node which is not fully synced.'
            )
        }

        const res = ethersAbiCoder.decode(this.mapTypes(outputs), `0x${bytes.replace(/0x/i, '')}`, loose)
        const returnValue = new Result()
        returnValue.__length__ = 0

        outputs.forEach(function(output, i) {
            let decodedValue = res[returnValue.__length__]
            decodedValue = decodedValue === '0x' ? null : decodedValue

            returnValue[i] = decodedValue

            if (_.isObject(output) && output.name) {
                returnValue[output.name] = decodedValue
            }

            returnValue.__length__++
        })

        return returnValue
    }

    /**
     * Decodes ABI encoded log data and indexed topic data.
     *
     * @example
     * caver.abi.decodeLog(
     *     [
     *         {
     *             type: 'string',
     *             name: 'mystring'
     *         },{
     *             type: 'uint256',
     *             name: 'myNumber',
     *             indexed: true
     *         },{
     *             type: 'uint8',
     *             name: 'mySmallNumber',
     *             indexed: true
     *          }
     *     ],
     *     '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000748656c6c6f252100000000000000000000000000000000000000000000000000',
     *      ['0x000000000000000000000000000000000000000000000000000000000000f310', '0x0000000000000000000000000000000000000000000000000000000000000010']
     * )
     *
     *
     * @method decodeLog
     * @memberof ABI
     * @instance
     * @param {Array.<object>} inputs An array of JSON interface inputs. See the solidity documentation for a list of types.
     * @param {string} data The ABI byte code in the data field of a log.
     * @param {*} topics An array of the index parameter topics of the log. This array doesn't have topic[0] if it is a non-anonymous event, or otherwise, it has topic[0].
     * @return {object} An object which includes plain params. You can use `result[0]` as it is provided to be accessed like an array in the order of the parameters.
     */
    decodeLog(inputs, data, topics) {
        const _this = this
        topics = _.isArray(topics) ? topics : [topics]

        data = data || ''

        const notIndexedInputs = []
        const indexedParams = []
        let topicCount = 0

        // TODO check for anonymous logs?

        inputs.forEach(function(input, i) {
            if (input.indexed) {
                indexedParams[i] = ['bool', 'int', 'uint', 'address', 'fixed', 'ufixed'].find(function(staticType) {
                    return input.type.indexOf(staticType) !== -1
                })
                    ? _this.decodeParameter(input.type, topics[topicCount])
                    : topics[topicCount]
                topicCount++
            } else {
                notIndexedInputs[i] = input
            }
        })

        const nonIndexedData = data
        const notIndexedParams = nonIndexedData ? this.decodeParametersWith(notIndexedInputs, nonIndexedData, true) : []

        const returnValue = new Result()
        returnValue.__length__ = 0

        inputs.forEach(function(res, i) {
            returnValue[i] = res.type === 'string' ? '' : null

            if (typeof notIndexedParams[i] !== 'undefined') {
                returnValue[i] = notIndexedParams[i]
            }
            if (typeof indexedParams[i] !== 'undefined') {
                returnValue[i] = indexedParams[i]
            }

            if (res.name) {
                returnValue[res.name] = returnValue[i]
            }

            returnValue.__length__++
        })

        return returnValue
    }
}

/** @instance */
const abi = new ABI()

module.exports = abi
