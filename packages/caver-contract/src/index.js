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

    This file is derived from web3.js/packages/web3-eth-contract/src/index.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/**
 * @file contract.js
 *
 * To initialize a contract use:
 *
 *  let Contract = require('web3-eth-contract');
 *  Contract.setProvider('ws://localhost:8546');
 *  let contract = new Contract(abi, address, ...);
 *
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

const _ = require('lodash')
const core = require('../../caver-core')
const Method = require('../../caver-core-method')
const utils = require('../../caver-utils')
const Subscription = require('../../caver-core-subscriptions').subscription
const SmartContractDeploy = require('../../caver-transaction/src/transactionTypes/smartContractDeploy/smartContractDeploy')
const SmartContractExecution = require('../../caver-transaction/src/transactionTypes/smartContractExecution/smartContractExecution')
const FeeDelegatedSmartContractDeploy = require('../../caver-transaction/src/transactionTypes/smartContractDeploy/feeDelegatedSmartContractDeploy')
const FeeDelegatedSmartContractExecution = require('../../caver-transaction/src/transactionTypes/smartContractExecution/feeDelegatedSmartContractExecution')
const FeeDelegatedSmartContractDeployWithRatio = require('../../caver-transaction/src/transactionTypes/smartContractDeploy/feeDelegatedSmartContractDeployWithRatio')
const FeeDelegatedSmartContractExecutionWithRatio = require('../../caver-transaction/src/transactionTypes/smartContractExecution/feeDelegatedSmartContractExecutionWithRatio')
const KeyringContainer = require('../../caver-wallet')
const { formatters } = require('../../caver-core-helpers')
const { errors } = require('../../caver-core-helpers')
const abi = require('../../caver-abi')

/**
 * Should be called to create new contract instance
 *
 * @method Contract
 * @constructor
 * @param {Array} jsonInterface
 * @param {String} address
 * @param {Object} options
 */

/**
 * let myContract = new cav.klay.Contract([...], '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', {
 *   from: '0x1234567890123456789012345678901234567891', // default from address
 *   gasPrice: '20000000000', // default gas price in wei, 20 gwei in this case
 *   data: '',(bytecode, when contract deploy)
 *   gas: 200000, (gas limit)
 * });
 */
const Contract = function Contract(jsonInterface, address, options) {
    const _this = this
    const args = Array.prototype.slice.call(arguments)

    if (!(this instanceof Contract)) {
        throw new Error('Please use the "new" keyword to instantiate a caver.contract() or caver.klay.Contract() object!')
    }

    // sets _requestmanager
    core.packageInit(this, [this.constructor.currentProvider])

    this.clearSubscriptions = this._requestManager.clearSubscriptions

    if (!jsonInterface || !Array.isArray(jsonInterface)) {
        throw new Error('You must provide the json interface of the contract when instantiating a contract object.')
    }

    // create the options object
    this.options = {}

    const lastArg = args[args.length - 1]
    if (_.isObject(lastArg) && !_.isArray(lastArg)) {
        options = lastArg
        this.options = _.extend(this.options, this._getOrSetDefaultOptions(options))

        if (_.isObject(address)) {
            address = null
        }
    }

    Object.defineProperty(this, 'defaultSendOptions', {
        get() {
            return _this.options
        },
    })

    // set address
    Object.defineProperty(this.options, 'address', {
        set(value) {
            if (value) {
                _this._address = utils.toChecksumAddress(formatters.inputAddressFormatter(value))
            }
        },
        get() {
            return _this._address
        },
        enumerable: true,
    })

    // add method and event signatures, when the jsonInterface gets set
    Object.defineProperty(this.options, 'jsonInterface', {
        set(value) {
            _this.methods = {}
            _this.events = {}

            _this._jsonInterface = value.map(function(method) {
                let func
                let funcName
                if (method.name) {
                    funcName = utils._jsonInterfaceMethodToString(method)
                }

                // function
                if (method.type === 'function') {
                    method.signature = abi.encodeFunctionSignature(funcName)
                    func = _this._createTxObject.bind({
                        method,
                        parent: _this,
                    })

                    // add method only if not one already exists
                    if (!_this.methods[method.name]) {
                        _this.methods[method.name] = func
                    } else {
                        const cascadeFunc = _this._createTxObject.bind({
                            method,
                            parent: _this,
                            nextMethod: _this.methods[method.name],
                        })
                        _this.methods[method.name] = cascadeFunc
                    }

                    // definitely add the method based on its signature
                    _this.methods[method.signature] = func

                    // add method by name
                    _this.methods[funcName] = func

                    // event
                } else if (method.type === 'event') {
                    method.signature = abi.encodeEventSignature(funcName)
                    const event = _this._on.bind(_this, method.signature)

                    // add method only if not already exists
                    if (!_this.events[method.name] || _this.events[method.name].name === 'bound ') {
                        _this.events[method.name] = event
                    }

                    // definitely add the method based on its signature
                    _this.events[method.signature] = event

                    // add event by name
                    _this.events[funcName] = event
                }

                // Make transaction object for constructor and add to the `this.methods`
                const constructor = _.find(_this._jsonInterface, function(mth) {
                    return mth.type === 'constructor'
                }) || { type: 'constructor' }
                constructor.signature = 'constructor'
                const constructorFunc = _this._createTxObject.bind({ method: constructor, parent: _this })
                _this.methods[constructor.signature] = constructorFunc

                return method
            })

            // add allEvents
            _this.events.allEvents = _this._on.bind(_this, 'allevents')

            return _this._jsonInterface
        },
        get() {
            return _this._jsonInterface
        },
        enumerable: true,
    })

    // get default account from the Class
    let { defaultAccount } = this.constructor
    let defaultBlock = this.constructor.defaultBlock || 'latest'

    Object.defineProperty(this, 'defaultAccount', {
        get() {
            return defaultAccount
        },
        set(val) {
            if (val) {
                defaultAccount = utils.toChecksumAddress(formatters.inputAddressFormatter(val))
            }

            return val
        },
        enumerable: true,
    })
    Object.defineProperty(this, 'defaultBlock', {
        get() {
            return defaultBlock
        },
        set(val) {
            if (!utils.isValidBlockNumberCandidate(val)) {
                throw new Error('Invalid default block number.')
            }
            defaultBlock = val

            return val
        },
        enumerable: true,
    })

    // Check for setting options property.
    Object.defineProperty(this.options, 'from', {
        set(value) {
            if (value) {
                _this._from = utils.toChecksumAddress(formatters.inputAddressFormatter(value))
            }
        },
        get() {
            return _this._from
        },
        enumerable: true,
    })

    Object.defineProperty(this.options, 'feePayer', {
        set(value) {
            if (value) {
                _this._feePayer = utils.toChecksumAddress(formatters.inputAddressFormatter(value))
            }
        },
        get() {
            return _this._feePayer
        },
        enumerable: true,
    })

    Object.defineProperty(this.options, 'feeDelegation', {
        set(value) {
            if (value !== undefined) {
                _this._feeDelegation = value
            }
        },
        get() {
            return _this._feeDelegation
        },
        enumerable: true,
    })

    Object.defineProperty(this.options, 'feeRatio', {
        set(fr) {
            if (fr !== undefined) {
                if (!_.isNumber(fr) && !utils.isHex(fr))
                    throw new Error(`Invalid type fo feeRatio: feeRatio should be number type or hex number string.`)
                if (utils.hexToNumber(fr) <= 0 || utils.hexToNumber(fr) >= 100)
                    throw new Error(`Invalid feeRatio: feeRatio is out of range. [1, 99]`)

                _this._feeRatio = utils.numberToHex(fr)
            }
        },
        get() {
            return _this._feeRatio
        },
        enumerable: true,
    })

    Object.defineProperty(this.options, 'gasPrice', {
        set(value) {
            if (value) {
                if (!utils.isValidNSHSN(value)) {
                    throw errors.invalidGasPrice()
                }
                _this._gasPrice = value
            }
        },
        get() {
            return _this._gasPrice
        },
        enumerable: true,
    })

    Object.defineProperty(this.options, 'gas', {
        set(value) {
            if (value) {
                if (!utils.isValidNSHSN(value)) throw errors.invalidGasLimit()
                _this._gas = value
            }
        },
        get() {
            return _this._gas
        },
        enumerable: true,
    })

    Object.defineProperty(this.options, 'data', {
        set(value) {
            if (value) {
                if (!utils.isHexStrict(value)) throw errors.invalidData()
                _this._data = value
            }
        },
        get() {
            return _this._data
        },
        enumerable: true,
    })

    // properties
    this.methods = {}
    this.events = {}

    this._address = null
    this._jsonInterface = []

    // set getter/setter properties
    this.options.address = address
    this.options.jsonInterface = jsonInterface
}

/**
 * Creates an instance of Contract.
 *
 * @method create
 * @constructor
 * @param {Array} jsonInterface The Contract Application Binary Interface (ABI).
 * @param {string} [address] The contract address to call.
 * @param {object} [options] The options of the contract.
 */
Contract.create = function(jsonInterface, address, options) {
    return new Contract(jsonInterface, address, options)
}

Contract.setProvider = function(provider, accounts) {
    core.packageInit(this, [provider])

    this._klayAccounts = accounts
}

/**
 * Set _keyrings in contract instance.
 *
 * @param {KeyringContainer} keyrings
 */
Contract.prototype.setKeyrings = function(keyrings) {
    if (!(keyrings instanceof KeyringContainer)) throw new Error(`keyrings should be an instance of 'KeyringContainer'`)
    this._keyrings = keyrings
}

/**
 * Set _wallet in contract instance.
 * When _wallet exists, contract will use _wallet instead of _klayAccounts
 *
 * @param {IWallet} wallet
 */
Contract.prototype.setWallet = function(wallet) {
    this._wallet = wallet
}

Contract.prototype.addAccounts = function(accounts) {
    this._klayAccounts = accounts
}

/**
 * Get the callback and modiufy the array if necessary
 *
 * @method _getCallback
 * @param {Array} args
 * @return {Function} the callback
 */
Contract.prototype._getCallback = function getCallback(args) {
    if (args && _.isFunction(args[args.length - 1])) {
        return args.pop() // modify the args array!
    }
}

/**
 * Checks that no listener with name "newListener" or "removeListener" is added.
 *
 * @method _checkListener
 * @param {String} type
 * @param {String} event
 * @return {Object} the contract instance
 */
/**
 * this._checkListener('newListener', subOptions.event.name);
 * this._checkListener('removeListener', subOptions.event.name);
 */
Contract.prototype._checkListener = function(type, event) {
    if (event === type) {
        throw new Error(`The event "${type}" is a reserved event name, you can't use it.`)
    }
}

/**
 * Use default values, if options are not available
 *
 * @method _getOrSetDefaultOptions
 * @param {Object} options the options gived by the user
 * @return {Object} the options with gaps filled by defaults
 */
Contract.prototype._getOrSetDefaultOptions = function getOrSetDefaultOptions(options) {
    const gasPrice = options.gasPrice ? String(options.gasPrice) : null
    const from = options.from ? utils.toChecksumAddress(formatters.inputAddressFormatter(options.from)) : null

    options.data = options.data || this.options.data

    options.from = from || this.options.from
    options.gasPrice = gasPrice || this.options.gasPrice

    const feePayer = options.feePayer ? utils.toChecksumAddress(formatters.inputAddressFormatter(options.feePayer)) : null
    const feeRatio = options.feeRatio ? options.feeRatio : null
    const feeDelegation = options.feeDelegation !== undefined ? options.feeDelegation : null
    options.feePayer = feePayer || this.options.feePayer
    options.feeRatio = feeRatio || this.options.feeRatio
    options.feeDelegation = feeDelegation || this.options.feeDelegation

    // If options.gas isn't set manually, use options.gasLimit, this.options.gas instead.
    if (typeof options.gas === 'undefined') {
        options.gas = options.gasLimit || this.options.gas
    }

    // TODO replace with only gasLimit?
    delete options.gasLimit

    return options
}

/**
 * Should be used to encode indexed params and options to one final object
 *
 * @method _encodeEventABI
 * @param {Object} event
 * @param {Object} options
 * @return {Object} everything combined together and encoded
 */

/**
 * _encodeEventABI
 * 1. options
 * options = {
 *   filter: {...},
 *   topics: [...],
 * }
 *   cf. topics
 *   - This allows you to manually set the topics for the event filter.
 *   - If given the filter property and event signature, (topic[0]) will not
 *   - be set automatically.
 *
 * 2. event
 * {
 *   anonymous: Bool,
 *   signature:
 *   name: String,
 *   inputs: [...],
 * }
 * cf) signature
 * - The signature’s hash of the event is one of the topics,
 * - unless you used the anonymous specifier to declare the event.
 * - This would mean filtering for anonymous, specific events by name is not possible.
 * - keccak256("burned(address,uint)") = 0x0970ce1235167a71...
 */
Contract.prototype._encodeEventABI = function(event, options) {
    options = options || {}
    const filter = options.filter || {}
    const result = {}

    ;['fromBlock', 'toBlock']
        .filter(function(f) {
            return options[f] !== undefined
        })
        .forEach(function(f) {
            result[f] = formatters.inputBlockNumberFormatter(options[f])
        })

    // use given topics
    if (_.isArray(options.topics)) {
        result.topics = options.topics
        // create topics based on filter
    } else {
        result.topics = []

        // add event signature
        if (event && !event.anonymous && event.name !== 'ALLEVENTS') {
            result.topics.push(event.signature)
        }

        // add event topics (indexed arguments)
        if (event.name !== 'ALLEVENTS') {
            const indexedTopics = event.inputs
                .filter(i => i.indexed === true)
                .map(i => {
                    const value = filter[i.name]
                    if (!value) return null

                    // TODO: https://github.com/ethereum/web3.js/issues/344

                    if (_.isArray(value)) {
                        return value.map(v => abi.encodeParameter(i.type, v))
                    }
                    return abi.encodeParameter(i.type, value)
                })

            result.topics = result.topics.concat(indexedTopics)
        }
        if (!result.topics.length) delete result.topics
    }
    if (this.options.address) {
        result.address = this.options.address.toLowerCase()
    }

    return result
}

/**
 * Should be used to decode indexed params and options
 *
 * @method _decodeEventABI
 * @param {Object} data
 * @return {Object} result object with decoded indexed && not indexed params
 */

Contract.prototype._decodeEventABI = function(data) {
    let event = this

    data.data = data.data || ''
    data.topics = data.topics || []
    const result = formatters.outputLogFormatter(data)

    // if allEvents get the right event
    if (event.name === 'ALLEVENTS') {
        event = event.jsonInterface.find(function(intf) {
            return intf.signature === data.topics[0]
        }) || { anonymous: true }
    }

    // create empty inputs if none are present (e.g. anonymous events on allEvents)
    event.inputs = event.inputs || []

    const argTopics = event.anonymous ? data.topics : data.topics.slice(1)

    result.returnValues = abi.decodeLog(event.inputs, data.data, argTopics)
    delete result.returnValues.__length__

    // add name
    result.event = event.name

    // add signature
    result.signature = event.anonymous || !data.topics[0] ? null : data.topics[0]

    // move the data and topics to "raw"
    result.raw = {
        data: result.data,
        topics: result.topics,
    }
    delete result.data
    delete result.topics

    return result
}

/**
 * Encodes an ABI for a method, including signature or the method.
 * Or when constructor encodes only the constructor parameters.
 *
 * @method _encodeMethodABI
 * @param {Mixed} args the arguments to encode
 * @param {String} the encoded ABI
 */
Contract.prototype._encodeMethodABI = function _encodeMethodABI() {
    const methodSignature = this._method.signature
    const args = this.arguments || []

    let signature = false
    const paramsABI =
        this._parent.options.jsonInterface
            .filter(function(json) {
                return (
                    (methodSignature === 'constructor' && json.type === methodSignature) ||
                    ((json.signature === methodSignature ||
                        json.signature === methodSignature.replace('0x', '') ||
                        json.name === methodSignature) &&
                        json.type === 'function')
                )
            })
            .map(function(json) {
                const inputLength = _.isArray(json.inputs) ? json.inputs.length : 0

                if (inputLength !== args.length) {
                    throw new Error(
                        `The number of arguments is not matching the methods required number. You need to pass ${inputLength} arguments.`
                    )
                }
                if (json.type === 'function') {
                    signature = json.signature
                }
                return _.isArray(json.inputs) ? json.inputs : []
            })
            .map(function(inputs) {
                return abi.encodeParameters(inputs, args).replace('0x', '')
            })[0] || ''

    // return constructor
    if (methodSignature === 'constructor') {
        if (!this._deployData) {
            throw new Error('The contract has no contract data option set. This is necessary to append the constructor parameters.')
        }

        return this._deployData + paramsABI

        // return method
    }
    const returnValue = signature ? signature + paramsABI : paramsABI

    if (!returnValue) {
        throw new Error(`Couldn't find a matching contract method named "${this._method.name}".`)
    } else {
        return returnValue
    }
}

/**
 * Decodes a function call from its abi object of a function or function abi string and returns parameters.
 *
 * @example
 * const abi = [...]
 * const contract = caver.contract.create(abi)
 * const decodedFunctionCall = contract.decodeFunctionCall('0x{encoded function call}')
 *
 * @method decodeFunctionCall
 * @param {string} functionCall The encoded function call string.
 * @return {Array} An array of plain params
 */
Contract.prototype.decodeFunctionCall = function decodeFunctionCall(functionCall) {
    functionCall = utils.addHexPrefix(functionCall)

    let methodABI
    const funcSigLength = 10
    const extractFuncSig = functionCall.slice(0, funcSigLength)
    for (const itf of this._jsonInterface) {
        if (itf.type && itf.type === 'function' && extractFuncSig === itf.signature) {
            methodABI = itf
            break
        }
    }

    return abi.decodeFunctionCall(methodABI, functionCall)
}

/**
 * Decode method return values
 *
 * @method _decodeMethodReturn
 * @param {Array} outputs
 * @param {String} returnValues
 * @return {Object} decoded output return values
 */
Contract.prototype._decodeMethodReturn = function(outputs, returnValues) {
    if (!returnValues) {
        return null
    }

    returnValues = returnValues.length >= 2 ? returnValues.slice(2) : returnValues
    const result = abi.decodeParameters(outputs, returnValues)

    if (result.__length__ === 1) {
        return result[0]
    }
    delete result.__length__
    return result
}

/**
 * Deploys the contract to the Klaytn.
 * After a successful deployment, the promise will be resolved with a new contract instance.
 *
 * @method deploy
 * @param {Object} options An object in which data, which is the byte code of the smart contract to be deployed, and arguments, which are parameters to be passed to the constructor of the smart contract, are defined.
 * @param {Function} [callback] The callback function.
 * @return {object} An object in which arguments and functions for contract deployment are defined
 */
/**
 * Deploys the contract to the Klaytn.
 * After a successful deployment, the promise will be resolved with a new contract instance.
 *
 * @method deploy
 * @param {object} sendOptions An object holding parameters that are required for sending a transaction.
 * @param {string} byteCode The byte code of the contract.
 * @param {...*} parameters The parameters to be passed to the constructor of the smart contract.
 * @return {object} Promise will be resolved with a new contract instance. EventEmitter possible events are "error", "transactionHash" and "receipt"
 */
Contract.prototype.deploy = function(options, callback) {
    const args = Array.prototype.slice.call(arguments)

    // This if condition will handle original usage
    // contract.deploy({ data, arguments })
    // contract.deploy({ data, arguments }, callback)
    if (args.length === 1 || (args.length === 2 && _.isFunction(args[args.length - 1]))) {
        options = options || {}

        options.arguments = options.arguments || []
        options = this._getOrSetDefaultOptions(options)

        // return error, if no "data" is specified
        if (!options.data) {
            const error = new Error('No "data" specified in neither the given options, nor the default options.')
            if (callback) callback(error)
            throw error
        }

        return this.methods.constructor(options.data, ...options.arguments)
    }

    // contract.deploy({from, gas, ...}, byteCode, parameters)
    const sendOptions = args[0]
    const byteCode = args[1]
    const params = args.slice(2)

    return this.methods.constructor(byteCode, ...params).send(sendOptions)
}

/**
 * Sends a SmartContractExecution transaction to execute the function of the contract deployed in the Klaytn.
 * After a successful deployment, the promise will be resolved with a transaction receipt.
 *
 * @method send
 * @param {object} sendOptions An object holding parameters that are required for sending a transaction.
 * @param {string} functionName The function name to execute.
 * @param {...*} parameters The parameters to be passed to the smart contract function.
 * @return {object} Promise will be resolved with a transaction receipt. EventEmitter possible events are "error", "transactionHash" and "receipt"
 */
Contract.prototype.send = function() {
    const args = Array.prototype.slice.call(arguments)

    // contract.send({from, gas, ...}, 'functionName', parameters)
    const sendOptions = args[0]
    const functionName = args[1]
    const params = args.slice(2)

    return this.methods[functionName](...params).send(sendOptions)
}

/**
 * Calls a "constant" method and execute its smart contract method in the Klaytn Virtual Machine without sending any transaction.
 *
 * @method call
 * @param {object} [callObject] The options used for calling.
 * @param {string} functionName The function name to execute.
 * @param {...*} parameters The parameters to be passed to the smart contract function.
 * @return {object} Promise will be resolved with a transaction receipt. EventEmitter possible events are "error", "transactionHash" and "receipt"
 */
Contract.prototype.call = function() {
    let args = Array.prototype.slice.call(arguments)

    // contract.call('functionName', parameters)
    // contract.call({from, gas, ...}, 'functionName', parameters)
    let callObject = {}
    if (_.isObject(args[0])) {
        callObject = args[0]
        args = args.slice(1)
    }
    const functionName = args[0]
    const params = args.slice(1)

    return this.methods[functionName](...params).call(callObject)
}

/**
 * Signs a transaction as a sender to deploy or execute the contract.
 * After signing, the promise will be resolved with the signed transaction.
 *
 * If you want to use fee delegation, `feeDelegation` should be defined as `true` in the `sendOptions` parameter.
 * Also if you want to use partial fee delegation, you can define `feeRatio` in the `sendOptions` parameter.
 *
 * @method sign
 * @param {object} sendOptions An object holding parameters that are required for sending a transaction.
 * @param {string} functionName The function name to execute. If you want to sign for deployig, please send 'constructor' here.
 * @param {...*} parameters The parameters to be passed to the smart contract constructor or function.
 * @return {object} Promise will be resolved with a transaction receipt. EventEmitter possible events are "error", "transactionHash" and "receipt"
 */
Contract.prototype.sign = function() {
    const args = Array.prototype.slice.call(arguments)

    // contract.sign({from, gas, ...}, 'constructor', arguments)
    // contract.sign({from, gas, ...}, 'functionName', arguments)
    // contract.sign({from, gas, feeDelegation: true ...}, 'constructor', arguments)
    // contract.sign({from, gas, feeDelegation: true, feeRatio: 30, ...}, 'functionName', arguments)
    const sendOptions = args[0]
    const functionName = args[1]
    const params = args.slice(2)

    return this.methods[functionName](...params).sign(sendOptions)
}

/**
 * Signs a transaction as a fee payer to deploy or execute the contract.
 * After signing, the promise will be resolved with the signed transaction.
 *
 * To sign as a fee payer, `feeDelegation` and `feePayer` should be defined in the `sendOptions` parameter.
 * `feeDelegation` field should be true.
 * Also if you want to use partial fee delegation, you can define `feeRatio` in the `sendOptions` parameter.
 *
 * @method sign
 * @param {object} sendOptions An object holding parameters that are required for sending a transaction.
 * @param {string} functionName The function name to execute. If you want to sign for deployig, please send 'constructor' here.
 * @param {...*} parameters The parameters to be passed to the smart contract constructor or function.
 * @return {object} Promise will be resolved with a transaction receipt. EventEmitter possible events are "error", "transactionHash" and "receipt"
 */
Contract.prototype.signAsFeePayer = function() {
    const args = Array.prototype.slice.call(arguments)

    // contract.signAsFeePayer({from, gas, feeDelegation: true ...}, 'constructor', arguments)
    // contract.signAsFeePayer({from, gas, feeDelegation: true, feeRatio: 30, ...}, 'functionName', arguments)
    const sendOptions = args[0]
    const functionName = args[1]
    const params = args.slice(2)

    return this.methods[functionName](...params).signAsFeePayer(sendOptions)
}

/**
 * Gets the event signature and outputformatters
 *
 * @method _generateEventOptions
 * @param {Object} event
 * @param {Object} options
 * @param {Function} callback
 * @return {Object} the event options object
 */
Contract.prototype._generateEventOptions = function() {
    const args = Array.prototype.slice.call(arguments)

    // get the callback
    const callback = this._getCallback(args)

    // get the options
    const options = _.isObject(args[args.length - 1]) ? args.pop() : {}

    let event = _.isString(args[0]) ? args[0] : 'allevents'
    event =
        event.toLowerCase() === 'allevents'
            ? {
                  name: 'ALLEVENTS',
                  jsonInterface: this.options.jsonInterface,
              }
            : this.options.jsonInterface.find(function(json) {
                  return json.type === 'event' && (json.name === event || json.signature === `0x${event.replace('0x', '')}`)
              })

    if (!event) {
        throw new Error(`Event "${event.name}" doesn't exist in this contract.`)
    }

    if (!utils.isAddress(this.options.address)) {
        throw new Error("This contract object doesn't have address set yet, please set an address first.")
    }

    return {
        params: this._encodeEventABI(event, options),
        event,
        callback,
    }
}

/**
 * Adds event listeners and creates a subscription, and remove it once its fired.
 *
 * @method clone
 * @return {Object} the event subscription
 */
Contract.prototype.clone = function(contractAddress = this.options.address) {
    const cloned = new this.constructor(this.options.jsonInterface, contractAddress, this.options)
    cloned.setWallet(this._wallet)
    return cloned
}

/**
 * Adds event listeners and creates a subscription, and remove it once its fired.
 * (Subscribes to an event and unsubscribes immediately after the first event or error. Will only fire for a single event.)
 *
 *
 * @method once
 * @param {String} event
 * @param {Object} options
 * @param {Function} callback
 * @return {Object} the event subscription
 *
 * myContract.once('MyEvent', {
      filter: {myIndexedParam: [20,23], myOtherIndexedParam: '0x123456789...'}, // Using an array means OR: e.g. 20 or 23
      fromBlock: 0
  }, function(error, event){ console.log(event); });

  // event output example
  > {
      returnValues: {
          myIndexedParam: 20,
          myOtherIndexedParam: '0x123456789...',
          myNonIndexParam: 'My String'
      },
      raw: {
          data: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
          topics: ['0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7', '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385']
      },
      event: 'MyEvent',
      signature: '0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7',
      logIndex: 0,
      transactionIndex: 0,
      transactionHash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
      blockHash: '0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7',
      blockNumber: 1234,
      address: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'
  }
 */
Contract.prototype.once = function(event, options, callback) {
    const args = Array.prototype.slice.call(arguments)

    // get the callback
    callback = this._getCallback(args)

    if (!callback) {
        throw new Error('Once requires a callback as the second parameter.')
    }

    // don't allow fromBlock
    if (options) {
        delete options.fromBlock
    }

    // don't return as once shouldn't provide "on"
    this._on(event, options, function(err, res, sub) {
        sub.unsubscribe()
        if (_.isFunction(callback)) {
            callback(err, res, sub)
        }
    })

    return undefined
}

/**
 * Adds event listeners and creates a subscription.
 *
 * @method _on
 * @param {String} event
 * @param {Object} options
 * @param {Function} callback
 * @return {Object} the event subscription
 */
Contract.prototype._on = function() {
    const subOptions = this._generateEventOptions.apply(this, arguments)

    // prevent the event "newListener" and "removeListener" from being overwritten
    this._checkListener('newListener', subOptions.event.name)
    this._checkListener('removeListener', subOptions.event.name)

    // TODO check if listener already exists? and reuse subscription if options are the same.

    const subscription = new Subscription({
        subscription: {
            params: 1,
            inputFormatter: [formatters.inputLogFormatter],
            outputFormatter: this._decodeEventABI.bind(subOptions.event),
            // DUBLICATE, also in caver-klay
            subscriptionHandler(output) {
                this.emit('data', output)

                if (_.isFunction(this.callback)) {
                    this.callback(null, output, this)
                }
            },
        },
        type: 'klay',
        requestManager: this._requestManager,
    })
    subscription.subscribe('logs', subOptions.params, subOptions.callback || function() {})

    return subscription
}

/**
 * Get past events from contracts
 *
 * @method getPastEvents
 * @param {String} event
 * @param {Object} options
 * @param {Function} callback
 * @return {Object} the promievent
 */

/**
 * myContract.getPastEvents('MyEvent', {
      filter: {myIndexedParam: [20,23], myOtherIndexedParam: '0x123456789...'}, // Using an array means OR: e.g. 20 or 23
      fromBlock: 0,
      toBlock: 'latest'
  }, function(error, events){ console.log(events); })
  .then(function(events){
      console.log(events) // same results as the optional callback above
  });

  > [{
      returnValues: {
          myIndexedParam: 20,
          myOtherIndexedParam: '0x123456789...',
          myNonIndexParam: 'My String'
      },
      raw: {
          data: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
          topics: ['0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7', '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385']
      },
      event: 'MyEvent',
      signature: '0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7',
      logIndex: 0,
      transactionIndex: 0,
      transactionHash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
      blockHash: '0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7',
      blockNumber: 1234,
      address: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'
  },{
      ...
  }]
 */
Contract.prototype.getPastEvents = function() {
    const subOptions = this._generateEventOptions.apply(this, arguments)

    let getPastLogs = new Method({
        name: 'getPastLogs',
        call: 'klay_getLogs',
        params: 1,
        inputFormatter: [formatters.inputLogFormatter],
        outputFormatter: this._decodeEventABI.bind(subOptions.event),
    })
    getPastLogs.setRequestManager(this._requestManager)
    const call = getPastLogs.buildCall()

    getPastLogs = null

    return call(subOptions.params, subOptions.callback)
}

/**
 * returns the an object with call, send, estimate functions
 *
 * @method _createTxObject
 * @returns {Object} an object with functions to call the methods
 */

Contract.prototype._createTxObject = function _createTxObject() {
    let args = Array.prototype.slice.call(arguments)
    const txObject = {}

    if (this.method.type === 'function') {
        txObject.call = this.parent._executeMethod.bind(txObject, 'call')
        txObject.call.request = this.parent._executeMethod.bind(txObject, 'call', true) // to make batch requests
    }

    txObject.sign = this.parent._executeMethod.bind(txObject, 'sign')
    txObject.signAsFeePayer = this.parent._executeMethod.bind(txObject, 'signAsFeePayer')

    txObject.send = this.parent._executeMethod.bind(txObject, 'send')
    txObject.send.request = this.parent._executeMethod.bind(txObject, 'send', true) // to make batch requests

    txObject.encodeABI = this.parent._encodeMethodABI.bind(txObject)
    txObject.estimateGas = this.parent._executeMethod.bind(txObject, 'estimate')

    // When deploying a smart contract, if a parameter is passed by directly accessing the tx object,
    // the byte code is transferred as the first parameter.
    // (i.e. `contract.methods['constructor'](byteCode, arguments...).send({from, ...})`)
    // To handle such a case, when `method.type` is a "constructor" and `this.deployData` is empty,
    // the byte code received as a parameter is allocated to `this.deployData`,
    // and the args after that are used as parameter arguments.
    if (this.method.type === 'constructor' && !this.deployData) {
        this.deployData = args[0]
        args = args.slice(1)
    }

    txObject.arguments = args || []
    txObject._method = this.method
    txObject._parent = this.parent

    if (args && this.method.inputs) {
        if (args.length !== this.method.inputs.length) {
            if (this.nextMethod) {
                return this.nextMethod.apply(null, args)
            }
            throw errors.InvalidNumberOfParams(args.length, this.method.inputs.length, this.method.name)
        } else if (this.nextMethod) {
            // If the number of parameters of the function is the same, but the types of parameters are different,
            // determine whether the function is an appropriate function through encoding operation with the input parameter.
            // If an encoding error occurs, check by using to the next method.
            try {
                txObject.encodeABI(args)
            } catch (e) {
                return this.nextMethod.apply(null, args)
            }
        }
    }

    txObject._klayAccounts = this.parent.constructor._klayAccounts || this._klayAccounts
    txObject._wallet = this.parent._wallet || this._wallet

    if (this.deployData) {
        txObject._deployData = this.deployData
    }

    return txObject
}

/**
 * Generates the options for the execute call
 *
 * @method _processExecuteArguments
 * @param {Array} args
 * @param {Promise} defer
 */
Contract.prototype._processExecuteArguments = function _processExecuteArguments(args, defer) {
    const processedArgs = {}

    processedArgs.type = args.shift()

    // get the callback
    processedArgs.callback = this._parent._getCallback(args)

    // get block number to use for call
    if (
        processedArgs.type === 'call' &&
        args[args.length - 1] !== true &&
        (_.isString(args[args.length - 1]) || isFinite(args[args.length - 1]))
    ) {
        processedArgs.defaultBlock = args.pop()
    }

    // get the options
    processedArgs.options = _.isObject(args[args.length - 1]) ? args.pop() : {}

    // get the generateRequest argument for batch requests
    processedArgs.generateRequest = args[args.length - 1] === true ? args.pop() : false

    processedArgs.options = this._parent._getOrSetDefaultOptions(processedArgs.options)
    processedArgs.options.data = this.encodeABI()

    // add contract address
    if (!this._deployData && !utils.isAddress(this._parent.options.address)) {
        throw new Error("This contract object doesn't have address set yet, please set an address first.")
    }

    if (!this._deployData) {
        processedArgs.options.to = this._parent.options.address
    }

    // return error, if no "data" is specified
    if (!processedArgs.options.data) {
        return utils._fireError(
            new Error("Couldn't find a matching contract method, or the number of parameters is wrong."),
            defer.eventEmitter,
            defer.reject,
            processedArgs.callback
        )
    }

    return processedArgs
}

/**
 * Executes a call, transact or estimateGas on a contract function
 *
 * @method _executeMethod
 * @param {String} type the type this execute function should execute
 * @param {Boolean} makeRequest if true, it simply returns the request parameters, rather than executing it
 */

Contract.prototype._executeMethod = async function _executeMethod() {
    const _this = this
    const args = this._parent._processExecuteArguments.call(this, Array.prototype.slice.call(arguments), defer)
    var defer = utils.promiEvent(args.type !== 'send') /* eslint-disable-line no-var */
    const klayAccounts = _this.constructor._klayAccounts || _this._klayAccounts
    const wallet = _this._parent._wallet || _this._wallet

    // Not allow to specify options.gas to 0.
    if (args.options && args.options.gas === 0) {
        throw errors.notAllowedZeroGas()
    }

    // simple return request for batch requests
    if (args.generateRequest) {
        const payload = {
            params: [formatters.inputCallFormatter.call(this._parent, args.options)],
            callback: args.callback,
        }

        if (args.type === 'call') {
            payload.params.push(formatters.inputDefaultBlockNumberFormatter.call(this._parent, args.defaultBlock))
            payload.method = 'klay_call'
            payload.format = this._parent._decodeMethodReturn.bind(null, this._method.outputs)
        } else {
            payload.method = 'klay_sendTransaction'
        }

        return payload
    }
    switch (args.type) {
        case 'estimate':
            const estimateGas = new Method({
                name: 'estimateGas',
                call: 'klay_estimateGas',
                params: 1,
                inputFormatter: [formatters.inputCallFormatter],
                outputFormatter: utils.hexToNumber,
                requestManager: _this._parent._requestManager,
                accounts: klayAccounts, // is klay.accounts (necessary for wallet signing)
                defaultAccount: _this._parent.defaultAccount,
                defaultBlock: _this._parent.defaultBlock,
            }).createFunction()

            return estimateGas(args.options, args.callback)

        case 'call':
            // TODO check errors: missing "from" should give error on deploy and send, call ?

            const call = new Method({
                name: 'call',
                call: 'klay_call',
                params: 2,
                inputFormatter: [formatters.inputCallFormatter, formatters.inputDefaultBlockNumberFormatter],
                // add output formatter for decoding
                outputFormatter(result) {
                    return _this._parent._decodeMethodReturn(_this._method.outputs, result)
                },
                requestManager: _this._parent._requestManager,
                accounts: klayAccounts, // is klay.accounts (necessary for wallet signing)
                defaultAccount: _this._parent.defaultAccount,
                defaultBlock: _this._parent.defaultBlock,
            }).createFunction()

            return call(args.options, args.defaultBlock, args.callback)

        case 'sign':
        case 'signAsFeePayer':
            const tx = await createTransactionFromArgs(args, this._method, this._deployData, defer)

            if (!wallet) {
                return utils._fireError(
                    new Error(
                        `Contract sign/signAsFeePayer works with 'caver.wallet'. Set to use'caver.wallet' by calling'contract.setWallet'.`
                    ),
                    defer.eventEmitter,
                    defer.reject,
                    args.callback
                )
            }

            const signer = args.type === 'signAsFeePayer' ? args.options.feePayer : args.options.from
            const signFunction = args.type === 'signAsFeePayer' ? wallet.signAsFeePayer.bind(wallet) : wallet.sign.bind(wallet)
            const isExisted = await wallet.isExisted(signer)

            if (!isExisted) {
                throw new Error(`Failed to find ${signer}. Please check that the corresponding account or keyring exists.`)
            }

            return signFunction(signer, tx).then(signedTx => {
                return signedTx
            })

        case 'send':
            const transaction = await createTransactionFromArgs(args, this._method, this._deployData, defer)
            // make sure receipt logs are decoded
            const extraFormatters = {
                receiptFormatter(receipt) {
                    if (_.isArray(receipt.logs)) {
                        // decode logs
                        const events = _.map(receipt.logs, function(log) {
                            return _this._parent._decodeEventABI.call(
                                {
                                    name: 'ALLEVENTS',
                                    jsonInterface: _this._parent.options.jsonInterface,
                                },
                                log
                            )
                        })

                        // make log names keys
                        receipt.events = {}
                        let count = 0
                        events.forEach(function(ev) {
                            if (ev.event) {
                                // if > 1 of the same event, don't overwrite any existing events
                                if (receipt.events[ev.event]) {
                                    if (Array.isArray(receipt.events[ev.event])) {
                                        receipt.events[ev.event].push(ev)
                                    } else {
                                        receipt.events[ev.event] = [receipt.events[ev.event], ev]
                                    }
                                } else {
                                    receipt.events[ev.event] = ev
                                }
                            } else {
                                receipt.events[count] = ev
                                count++
                            }
                        })

                        delete receipt.logs
                    }
                    return receipt
                },
                contractDeployFormatter(receipt) {
                    const newContract = _this._parent.clone(receipt.contractAddress)
                    return newContract
                },
            }

            // This is the logic for testing to check the transaction type used when deploying the smart contract.
            // You can define and use a custom formatter in this way: `contract.deploy({ ... }).send({ ..., contractDeployFormatter })`
            extraFormatters.contractDeployFormatter = args.options.contractDeployFormatter
                ? args.options.contractDeployFormatter
                : extraFormatters.contractDeployFormatter

            const sendTransaction = new Method({
                name: 'sendTransaction',
                call: 'klay_sendTransaction',
                params: 1,
                inputFormatter: [formatters.inputTransactionFormatter],
                requestManager: _this._parent._requestManager,
                accounts: klayAccounts, // is klay.accounts (necessary for wallet signing)
                defaultAccount: _this._parent.defaultAccount,
                defaultBlock: _this._parent.defaultBlock,
                extraFormatters,
            }).createFunction()

            if (wallet) {
                const isExistedInWallet = await wallet.isExisted(args.options.from)
                if (!isExistedInWallet) {
                    if (wallet instanceof KeyringContainer) {
                        return sendTransaction(args.options, args.callback)
                    }
                    throw new Error(`Failed to find ${args.options.from}. Please check that the corresponding account or keyring exists.`)
                }

                const sendRawTransaction = new Method({
                    name: 'sendRawTransaction',
                    call: 'klay_sendRawTransaction',
                    params: 1,
                    requestManager: _this._parent._requestManager,
                    defaultAccount: _this._parent.defaultAccount,
                    defaultBlock: _this._parent.defaultBlock,
                    extraFormatters,
                }).createFunction()

                return wallet.sign(transaction.from, transaction).then(signedTx => {
                    if (signedTx.feePayer) {
                        return wallet.signAsFeePayer(transaction.feePayer, transaction).then(feePayerSignedTx => {
                            return sendRawTransaction(feePayerSignedTx)
                        })
                    }
                    return sendRawTransaction(signedTx)
                })
            }

            if (args.options.type === undefined) {
                if (this._deployData !== undefined) {
                    args.options.type = 'SMART_CONTRACT_DEPLOY'
                } else {
                    args.options.type = 'SMART_CONTRACT_EXECUTION'
                }
            }

            if (args.options.type !== 'SMART_CONTRACT_EXECUTION' && args.options.type !== 'SMART_CONTRACT_DEPLOY') {
                throw new Error('Unsupported transaction type. Please use SMART_CONTRACT_EXECUTION or SMART_CONTRACT_DEPLOY.')
            }

            const fromInWallet = sendTransaction.method.accounts.wallet[args.options.from.toLowerCase()]
            if (!fromInWallet || !fromInWallet.privateKey) {
                args.options.type = 'LEGACY'
            }

            return sendTransaction(args.options, args.callback)
    }
}

function createTransactionFromArgs(args, method, deployData, defer) {
    // Not to affect original data, copy args.options
    const options = Object.assign({}, args.options)

    options.value = options.value || 0

    if (!utils.isAddress(options.from)) {
        return utils._fireError(
            new Error('No "from" address specified in neither the given options, nor the default options.'),
            defer.eventEmitter,
            defer.reject,
            args.callback
        )
    }

    if (_.isBoolean(method.payable) && !method.payable && options.value && options.value > 0) {
        return utils._fireError(
            new Error('Can not send value to non-payable contract method or constructor'),
            defer.eventEmitter,
            defer.reject,
            args.callback
        )
    }

    // If the transaction is fee delegated tx,
    // feeDelegation field must be unconditionally defined with true.
    if (options.feeDelegation) {
        if (args.type === 'signAsFeePayer' || (args.type === 'send' && options.feePayer)) {
            if (!utils.isAddress(options.feePayer)) {
                return utils._fireError(
                    new Error(`Invalid fee payer: ${options.feePayer}`),
                    defer.eventEmitter,
                    defer.reject,
                    args.callback
                )
            }
        }
    } else if (args.type === 'signAsFeePayer') {
        return utils._fireError(
            new Error(`feeDelegation field should be defined as 'true' to sign as a fee payer`),
            defer.eventEmitter,
            defer.reject,
            args.callback
        )
    } else if (options.feeRatio !== undefined) {
        return utils._fireError(
            new Error(`feeDelegation field should be defined as 'true' to use feeRatio`),
            defer.eventEmitter,
            defer.reject,
            args.callback
        )
    } else if (options.feePayer) {
        return utils._fireError(
            new Error(`feeDelegation field should be defined as 'true' to use feePayer`),
            defer.eventEmitter,
            defer.reject,
            args.callback
        )
    }

    let transaction
    if (deployData !== undefined) {
        if (options.feeDelegation) {
            transaction =
                options.feeRatio !== undefined
                    ? new FeeDelegatedSmartContractDeployWithRatio(options)
                    : new FeeDelegatedSmartContractDeploy(options)
        } else {
            transaction = new SmartContractDeploy(options)
        }
    } else if (options.feeDelegation) {
        transaction =
            options.feeRatio !== undefined
                ? new FeeDelegatedSmartContractExecutionWithRatio(options)
                : new FeeDelegatedSmartContractExecution(options)
    } else {
        transaction = new SmartContractExecution(options)
    }

    return transaction
}

module.exports = Contract
