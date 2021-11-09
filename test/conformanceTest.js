/*
    Copyright 2021 The caver-js Authors
    This file is part of the caver-js library.

    The caver-js library is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    The caver-js library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with the caver-js. If not, see <http://www.gnu.org/licenses/>.
*/

const path = require('path')
const fs = require('fs')
const _ = require('lodash')

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

const sandbox = sinon.createSandbox()

const Caver = require('../index')
const utils = require('../packages/caver-utils')

const comformanceTests = path.join(__dirname, '/../caver-conformance-tests')
const SignatureData = require('../packages/caver-wallet/src/keyring/signatureData')

describe('Caver Common Architecture Conformance Tests', () => {
    // caver-conformance-tests/LayerName/ClassName/functionName.json
    const layers = fs.readdirSync(comformanceTests, { withFileTypes: true })
    layers.forEach(function(layer) {
        if (layer.isDirectory() === false || layer.name.startsWith('.')) return

        describe(`${layer.name} Layer Testing`, () => {
            // To access each layer via `caver` instance (ex `caver.utils), format string.
            const packageName = formatPackageNaming(layer.name)
            const layerDirPath = path.join(comformanceTests, `${layer.name}`)
            const testDirectories = fs.readdirSync(layerDirPath, { withFileTypes: true })

            testDirectories.forEach(function(dir) {
                if (dir.isDirectory() === false) return

                const classDirPath = path.join(layerDirPath, `${dir.name}`)
                const testFiles = fs.readdirSync(classDirPath, { withFileTypes: true })

                testFiles.forEach(function(file) {
                    const functionName = file.name.replace('.json', '')

                    // The tests for each function are executed from below.
                    describe(`${packageName} - ${dir.name} - ${functionName} function`, () => {
                        if (file.name.endsWith('.json') === false) return

                        const caver = new Caver()

                        const filename = path.join(classDirPath, file.name)

                        // Convert an input filed in object format to array format.
                        const json = JSON.parse(fs.readFileSync(filename).toString())
                        const tcs = JSON.parse(modifyInputFormatToArray(functionName, json))
                        let preRequisites
                        const className = dir.name.replace(/\b[A-Z]/, letter => letter.toLowerCase())

                        // Prepare prerequisites instances before testing
                        // If the conformance test wants to use the instance created in the preRequisites step in advance,
                        // write the instance array index created in the preRequisites step in the JSON key called `useInstanceToTest`.
                        before(done => {
                            handlePreRequisites(caver, json[functionName].preRequisites).then(ret => {
                                preRequisites = ret
                                done()
                            })
                        })

                        afterEach(() => {
                            sandbox.restore()
                        })

                        // There are several TCs for each function.
                        for (const tc of tcs) {
                            if (tc.skipJs) {
                                console.log(`Skip ${tc.id} / ${tc.description}`)
                                continue
                            }
                            it(`${tc.id}: ${tc.description}`, async () => {
                                const inputs = getInputValues(tc.inputArray, preRequisites)

                                // Function calls should work normally without any errors.
                                if (tc.expectedResult.status === 'pass') {
                                    // The test of the RPC layer checks the form of the request that must be performed in the Klaytn SDK
                                    // without making an actual connection with the Node.
                                    if (packageName === 'rpc') {
                                        const method = caver[packageName][className][functionName].getMethod()

                                        // Check the parameters passed when making an RPC request to a node
                                        // by stubbing the `send` function that actually sends a request to the node.
                                        sandbox.stub(method.requestManager, 'send').callsFake((data, callback) => {
                                            compareResult({ method: data.method, params: data.params }, tc.expectedResult.output)
                                            callback(undefined, {})
                                        })

                                        // When a RPC request sends a transaction to a node,
                                        // a transactionReceipt query is requested by polling
                                        // using the transaction hash received as a result of the request.
                                        sandbox.stub(method, '_confirmTransaction').callsFake(defer => {
                                            return defer.resolve({})
                                        })

                                        // Send a RPC request (ex: `caver.rpc.klay.getBlockNumber`)
                                        await caver[packageName][className][functionName](...inputs)
                                    } else {
                                        // handleOuput returns formatted output to compare
                                        const output = await handleOuput(caver, tc.expectedResult)

                                        let result
                                        if (tc.useInstanceToTest !== undefined) {
                                            // Instance method test: useInstanceToTest is an array index
                                            result = await preRequisites[tc.useInstanceToTest][functionName](...inputs)
                                        } else {
                                            // static method test
                                            result = await getTargetClass(caver, packageName, className)[functionName](...inputs)
                                            // result = await caver[packageName][functionName](...inputs)
                                        }

                                        compareResult(result, output)
                                    }
                                } else {
                                    // If the status is not pass, an error should occur.
                                    const expectedError = tc.expectedResult.errorMessageJs || tc.expectedResult.errorMessage

                                    const targetClass = await getTargetClass(caver, packageName, className)
                                    // The logic to check the error message is different depending on the synchronous function and the asynchronous function, so it is handled by branching.
                                    if (targetClass.constructor.name === 'AsyncFunction') {
                                        await expect(targetClass[functionName](...inputs)).to.be.rejectedWith(expectedError)
                                    } else {
                                        expect(() => targetClass[functionName](...inputs)).to.throw(expectedError)
                                    }
                                }
                            })
                        }
                    })
                })
            })
        })
    })
})

// When testing functions provided lower than each layer, the location provided varies depending on the implementation method. This is a function to handle it.
function getTargetClass(caver, packagName, className) {
    if (className.startsWith('accountKey')) {
        if (className === 'accountKeyDecoder') return caver[packagName].accountKey // caver.account.accountKey.decode

        return caver[packagName].accountKey[className] // caver.account.accountKey.accountKeyLegacy
    }

    // If path is duplicated (for example, utils), then ignore duplicated className.
    return packagName.toLowerCase() === className.toLowerCase() ? caver[packagName] : caver[packagName][className]
}

async function createInstanceToTest(caver, obj, params) {
    let packageUnits = obj.layer.split('.')
    packageUnits = packageUnits[0] === 'caver' ? packageUnits.slice(1) : packageUnits

    // caver.wallet.kerying.xxx
    let targetClass = caver
    for (const pkg of packageUnits) {
        targetClass = targetClass[pkg]
    }

    let className
    // In case layer: 'caver.account', class: 'AccountKeyFail', then targetClass should be `caver.account.accountKey.accountKeyFail`.
    if (obj.class) {
        // To access correct variable, modify first letter to lowercase.
        className = obj.class.replace(/\b[A-Z]/, letter => letter.toLowerCase())

        // This means that the target class has not yet been reached.
        if (packageUnits[packageUnits.length - 1] !== className) {
            // AccountKey classes are supported by `caver.account.accountKey`, so adding one more step.
            if (className.startsWith('accountKey')) targetClass = targetClass.accountKey
            targetClass = targetClass[className]
        }
    }

    let instance
    // Parsing the parameters to array format.
    const parameters = convertObjectToArray(caver, params)

    if (obj.static && obj.method) {
        // Using static class
        instance = await targetClass[obj.method](...parameters)
    } else if (obj.method && obj.method === 'constructor') {
        instance = new targetClass(...parameters)
    } else if (className && className.startsWith('accountKey')) {
        instance = createAccountKeyInstance(caver, params)
    } else {
        // Using constructor
        instance = new targetClass(...parameters)
    }

    return instance
}

function convertObjectToArray(caver, obj) {
    const params = []

    const keys = Object.keys(obj)
    for (const k of keys) {
        // If `accountKey` is a key string, then create an AccountKey instance
        // using account key object defined in JSON file.
        if (_.isObject(obj[k]) && k === 'accountKey') {
            obj[k] = createAccountKeyInstance(caver, obj[k])
        }
        params.push(obj[k])
    }
    return params
}

async function handlePreRequisites(caver, preRequisites) {
    const preRequisitesArray = []
    if (!preRequisites) return preRequisitesArray

    // Create preRequisites instances before testing
    for (const preRequisite of preRequisites) {
        const instance = await createInstanceToTest(caver, preRequisite, preRequisite.parameters)
        preRequisitesArray.push(instance)
    }

    return preRequisitesArray
}

async function handleOuput(caver, expectedResult) {
    let output = expectedResult.output

    // In expectedResult if there are layer and class fields, it means expected result is an instance.
    if (expectedResult.layer && expectedResult.class) {
        output = await createInstanceToTest(caver, expectedResult, expectedResult.output)
    }

    return output
}

function createAccountKeyInstance(caver, keyObj) {
    let accountKey

    switch (keyObj.keyType) {
        case 0: // accountKeyNil
            accountKey = undefined
            break
        case 1: // accountKeyLegacy
            accountKey = new caver.account.accountKey.accountKeyLegacy()
            break
        case 2: // accountKeyPublic
            if (keyObj.publicKey === undefined) throw new Error(`Missing publicKey in accountKey of expected output.`)
            accountKey = new caver.account.accountKey.accountKeyPublic(keyObj.publicKey)
            break
        case 3: // accountKeyFail
            accountKey = new caver.account.accountKey.accountKeyFail()
            break
        case 4: // accountKeyWeightedMultiSig
            if (keyObj.threshold === undefined || keyObj.weightedPublicKeys === undefined)
                throw new Error(`Missing threshold and weightedPublicKeys in accountKey of expected output.`)
            const weightedPublicKeys = []
            for (const key of keyObj.weightedPublicKeys) {
                const weightedKey = new caver.account.accountKey.weightedPublicKey(key.weight, key.publicKey)
                weightedPublicKeys.push(weightedKey)
            }
            accountKey = new caver.account.accountKey.accountKeyWeightedMultiSig(keyObj.threshold, weightedPublicKeys)
            break
        case 5: // accountKeyRoleBased
            if (keyObj.accountKeys === undefined) throw new Error(`Missing accountKeys in accountKey of expected output.`)
            const roleKeys = []
            for (const r of keyObj.accountKeys) {
                roleKeys.push(createAccountKeyInstance(caver, r))
            }
            accountKey = new caver.account.accountKey.accountKeyRoleBased(roleKeys)
            break
        default:
            throw new Error(`Invalid account key object.`)
    }
    return accountKey
}

function modifyInputFormatToArray(functionName, parsed) {
    // Since there are multiple tc in one json file, `count` acts as an index for the tc.
    let count = 0

    const tc = parsed[functionName]
    const data = tc.testCases

    let dataString = JSON.stringify(data)
    // When the input object is changed to an array format, the key name is changed from `"input"` to `"inputArray"`.
    // So try to convert until `"input"` is no longer found in jsonString.
    while (dataString.indexOf('"input"') !== -1) {
        const inputIndex = dataString.indexOf('"input"')
        // Find the index of "expectedResult" after "input".
        const expectedResultIndex = dataString.slice(inputIndex).indexOf('"expectedResult"') + inputIndex

        // inputString contains the input of one TC defined in json in the form of string.
        const inputString = dataString.slice(inputIndex, expectedResultIndex)

        // After parsing with `JSON.parse`, object keys will be sorted.
        // But we shouldn't change the order because inputs are defined in the order of the parameters of the function.
        // The idea here is to easily get the `key` and `value` of the input from the parsed object,
        // and to sort them in the order of the function parameters,
        // find the index by the key of the input in the jsonString and sort them in order.
        const parsedInputObject = data[count].input
        const inputKeyArray = Object.keys(parsedInputObject)
        let params = new Map()

        // To find the parameter order, store the index of the corresponding key in the jsonString.
        for (const key of inputKeyArray) {
            params.set(inputString.indexOf(`"${key}"`), key)
        }
        // The logic below sorts the entries of the map in ascending order
        // based on the index in the Map that has the index in the jsonString as the key.
        params = [...params].sort((a, b) => a[0] - b[0])

        // With the parameter sequence obtained from the json string,
        // find the value in the parsed object and add it to the inputs array.
        const inputs = []
        for (const p of params.values()) {
            // p is an array, p[0] is the key of the map containing the index,
            // and p[1] is the value of the map that is the name of the actual input parameter.
            inputs.push(parsedInputObject[p[1]])
        }

        // Add a `inputArray` field instead of `input` in array format.
        const frontString = dataString.slice(0, inputIndex)
        const endString = dataString.slice(expectedResultIndex)

        dataString = `${frontString}"inputArray": ${JSON.stringify(inputs)},\n${endString}`
        count++
    }

    return dataString
}

function formatPackageNaming(name) {
    // Convert `Utils` to `utils`. This will be used to access `caver.utils`.
    return name[0].toLowerCase() + name.slice(1)
}

function compareResult(result, expectedResult) {
    if (_.isArray(result)) {
        if (result.length > 0) {
            if (!_.isObject(result[0])) {
                expect(result.toString()).to.equal(expectedResult.toString())
            } else {
                for (let i = 0; i < result.length; i++) {
                    compareResult(result[i], expectedResult[i])
                }
            }
        }
    } else if (_.isObject(result)) {
        if (result instanceof SignatureData) return result.isEqual(expectedResult)

        expect(result.constructor.name).to.equal(expectedResult.constructor.name)
        for (let key of Object.keys(result)) {
            if (key.startsWith('_')) key = key.slice(1)
            if (key === 'publicKey') {
                compareResult(utils.decompressPublicKey(result[key]), utils.decompressPublicKey(expectedResult[key]))
                continue
            }
            compareResult(result[key], expectedResult[key])
        }
    } else if (_.isString(result)) {
        expect(result.toLowerCase()).to.equal(expectedResult.toLowerCase())
    } else {
        expect(result).to.equal(expectedResult)
    }
}

function getInputValues(inputArray, preRequisites) {
    const inputs = []

    for (let i = 0; i < inputArray.length; i++) {
        // If the instance created in the preRequisites step is used as a parameter of the function,
        // the parameter is defined in the form of 'preRequisites[index]'.
        // In this case, instead of the 'preRequisites[index]' string,
        // the index-th instance of preRequisites should be transmitted as a parameter.
        if (_.isString(inputArray[i]) && inputArray[i].includes('preRequisites')) {
            const index = Number(inputArray[i].slice(inputArray[i].indexOf('[') + 1, inputArray[i].indexOf(']')))
            inputs.push(preRequisites[index])
            continue
        }
        inputs.push(inputArray[i])
    }

    return inputs
}
