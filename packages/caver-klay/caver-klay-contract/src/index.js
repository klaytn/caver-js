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

const _ = require('underscore')
const core = require('../../../caver-core')
const Method = require('../../../caver-core-method')
const utils = require('../../../caver-utils')
const Subscription = require('../../../caver-core-subscriptions').subscription
const { formatters } = require('../../../caver-core-helpers')
const { errors } = require('../../../caver-core-helpers')
const abi = require('../../caver-klay-abi')

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
        throw new Error('Please use the "new" keyword to instantiate a cav.klay.contract() object!')
    }

    // sets _requestmanager
    core.packageInit(this, [this.constructor.currentProvider])

    this.clearSubscriptions = this._requestManager.clearSubscriptions

    if (!jsonInterface || !Array.isArray(jsonInterface)) {
        throw new Error('You must provide the json interface of the contract when instantiating a contract object.')
    }

    // create the options object
    this.options = {}

    // For Object.defineProperty setter / getter
    let _from
    let _gasPrice
    let _gas
    let _data

    const lastArg = args[args.length - 1]
    if (_.isObject(lastArg) && !_.isArray(lastArg)) {
        options = lastArg
        this.options = _.extend(this.options, this._getOrSetDefaultOptions(options))

        if (_.isObject(address)) {
            address = null
        }
    }

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

Contract.setProvider = function(provider, accounts) {
    // Contract.currentProvider = provider;
    core.packageInit(this, [provider])

    this._klayAccounts = accounts
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
 * this._checkListener('newListener', subOptions.event.name, subOptions.callback);
 * this._checkListener('removeListener', subOptions.event.name, subOptions.callback);
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
 * Deploys a contract and fire events based on its state: transactionHash, receipt
 *
 * All event listeners will be removed, once the last possible event is fired ("error", or "receipt")
 *
 * @method deploy
 * @param {Object} options
 * @param {Function} callback
 * @return {Object} EventEmitter possible events are "error", "transactionHash" and "receipt"
 */

Contract.prototype.deploy = function(options, callback) {
    options = options || {}

    options.arguments = options.arguments || []
    options = this._getOrSetDefaultOptions(options)

    // return error, if no "data" is specified
    if (!options.data) {
        return utils._fireError(
            new Error('No "data" specified in neither the given options, nor the default options.'),
            null,
            null,
            callback
        )
    }

    const constructor =
        _.find(this.options.jsonInterface, function(method) {
            return method.type === 'constructor'
        }) || {}
    constructor.signature = 'constructor'

    return this._createTxObject.apply(
        {
            method: constructor,
            parent: this,
            deployData: options.data,
            _klayAccounts: this.constructor._klayAccounts,
        },
        options.arguments
    )
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
Contract.prototype.clone = function() {
    return new this.constructor(this.options.jsonInterface, this.options.address, this.options)
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
    this._checkListener('newListener', subOptions.event.name, subOptions.callback)
    this._checkListener('removeListener', subOptions.event.name, subOptions.callback)

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
    const args = Array.prototype.slice.call(arguments)
    const txObject = {}

    if (this.method.type === 'function') {
        txObject.call = this.parent._executeMethod.bind(txObject, 'call')
        txObject.call.request = this.parent._executeMethod.bind(txObject, 'call', true) // to make batch requests
    }

    txObject.send = this.parent._executeMethod.bind(txObject, 'send')
    txObject.send.request = this.parent._executeMethod.bind(txObject, 'send', true) // to make batch requests
    txObject.encodeABI = this.parent._encodeMethodABI.bind(txObject)
    txObject.estimateGas = this.parent._executeMethod.bind(txObject, 'estimate')

    if (args && this.method.inputs && args.length !== this.method.inputs.length) {
        if (this.nextMethod) {
            return this.nextMethod.apply(null, args)
        }
        throw errors.InvalidNumberOfParams(args.length, this.method.inputs.length, this.method.name)
    }

    txObject.arguments = args || []
    txObject._method = this.method
    txObject._parent = this.parent
    txObject._klayAccounts = this.parent.constructor._klayAccounts || this._klayAccounts

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

Contract.prototype._executeMethod = function _executeMethod() {
    const _this = this
    const args = this._parent._processExecuteArguments.call(this, Array.prototype.slice.call(arguments), defer)
    var defer = utils.promiEvent(args.type !== 'send') /* eslint-disable-line no-var */
    const klayAccounts = _this.constructor._klayAccounts || _this._klayAccounts

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

        case 'send':
            // return error, if no "from" is specified
            if (!utils.isAddress(args.options.from)) {
                return utils._fireError(
                    new Error('No "from" address specified in neither the given options, nor the default options.'),
                    defer.eventEmitter,
                    defer.reject,
                    args.callback
                )
            }

            if (_.isBoolean(this._method.payable) && !this._method.payable && args.options.value && args.options.value > 0) {
                return utils._fireError(
                    new Error('Can not send value to non-payable contract method or constructor'),
                    defer.eventEmitter,
                    defer.reject,
                    args.callback
                )
            }

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
                    const newContract = _this._parent.clone()
                    newContract.options.address = receipt.contractAddress
                    return newContract
                },
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

            const sendTransaction = new Method({
                name: 'sendTransaction',
                call: 'klay_sendTransaction',
                params: 1,
                inputFormatter: [formatters.inputTransactionFormatter],
                requestManager: _this._parent._requestManager,
                accounts: _this.constructor._klayAccounts || _this._klayAccounts, // is klay.accounts (necessary for wallet signing)
                defaultAccount: _this._parent.defaultAccount,
                defaultBlock: _this._parent.defaultBlock,
                extraFormatters,
            }).createFunction()

            const fromInWallet = sendTransaction.method.accounts.wallet[args.options.from.toLowerCase()]
            if (!fromInWallet || !fromInWallet.privateKey) {
                args.options.type = 'LEGACY'
            }

            return sendTransaction(args.options, args.callback)
    }
}

module.exports = Contract
