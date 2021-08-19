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

require('it-each')({ testPerIteration: true })
const { expect } = require('./extendedChai')

const Caver = require('../index.js')

const comformanceTests = path.join(__dirname, '/../caver-conformance-tests')
const SignatureData = require('../packages/caver-wallet/src/keyring/signatureData')

describe('Caver Common Architecture Conformance Tests', () => {
    // caver-conformance-tests/LayerName/ClassName/functionName.json
    const layers = fs.readdirSync(comformanceTests, { withFileTypes: true })
    layers.forEach(function(layer) {
        if (layer.isDirectory() === false) return
        if (layer.name.startsWith('.')) return

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
                    describe(`caver.${packageName}.${functionName}`, () => {
                        if (file.name.endsWith('.json') === false) return

                        const filename = path.join(classDirPath, file.name)

                        // Convert an input filed in object format to array format.
                        const converted = modifyInputFormatToArray(fs.readFileSync(filename).toString())
                        const json = JSON.parse(converted)

                        // There are several TCs for each function.
                        const tcs = json[functionName]

                        for (const tc of tcs) {
                            if (json.skipJs) {
                                console.log(`Skip ${json.id} / ${json.description}`)
                                return
                            }

                            it(`${tc.id}: ${tc.description}`, async () => {
                                const caver = new Caver()
                                const inputs = tc.inputArray

                                // Function calls should work normally without any errors.
                                if (tc.expectedResult.status === 'pass') {
                                    const output = tc.expectedResult.output
                                    const result = await caver[packageName][functionName](...inputs)

                                    compareResult(result, output)
                                } else {
                                    // If the status is not pass, an error should occur.
                                    const expectedError = tc.expectedResult.errorMessageJs || tc.expectedResult.errorMessage

                                    // The logic to check the error message is different depending on the synchronous function and the asynchronous function, so it is handled by branching.
                                    if (caver[packageName][functionName].constructor.name === 'AsyncFunction') {
                                        await expect(caver[packageName][functionName](...inputs)).to.be.rejectedWith(expectedError)
                                    } else {
                                        expect(() => caver[packageName][functionName](...inputs)).to.throw(expectedError)
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

function modifyInputFormatToArray(jsonString) {
    const parsed = JSON.parse(jsonString)

    // Since there are multiple tc in one json file, `count` acts as an index for the tc.
    let count = 0

    // When the input object is changed to an array format, the key name is changed from `"input"` to `"inputArray"`.
    // So try to convert until `"input"` is no longer found in jsonString.
    while (jsonString.indexOf('"input"') !== -1) {
        const inputIndex = jsonString.indexOf('"input"')
        // Find the index of "expectedResult" after "input".
        const expectedResultIndex = jsonString.slice(inputIndex).indexOf('"expectedResult"') + inputIndex

        // inputString contains the input of one TC defined in json in the form of string.
        const inputString = jsonString.slice(inputIndex, expectedResultIndex)

        // After parsing with `JSON.parse`, object keys will be sorted.
        // But we shouldn't change the order because inputs are defined in the order of the parameters of the function.
        // The idea here is to easily get the `key` and `value` of the input from the parsed object,
        // and to sort them in the order of the function parameters,
        // find the index by the key of the input in the jsonString and sort them in order.
        const parsedInputObject = parsed[Object.keys(parsed)[0]][count].input
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
        const frontString = jsonString.slice(0, inputIndex)
        const endString = jsonString.slice(expectedResultIndex)

        jsonString = `${frontString}"inputArray": ${JSON.stringify(inputs)},\n${endString}`
        count++
    }

    return jsonString
}

function formatPackageNaming(name) {
    // Convert `Utils` to `utils`. This will be used to access `caver.utils`.
    return name[0].toLowerCase() + name.slice(1)
}

function compareResult(result, expectedResult) {
    if (_.isArray(result)) {
        expect(result.toString()).to.equal(expectedResult.toString())
    } else if (_.isObject(result)) {
        if (result instanceof SignatureData) return result.isEqual(expectedResult)

        for (let key of Object.keys(result)) {
            if (key.startsWith('_')) key = key.slice(1)
            compareResult(result[key], expectedResult[key])
        }
    } else if (_.isString(result)) {
        expect(result.toLowerCase()).to.equal(expectedResult.toLowerCase())
    } else {
        expect(result).to.equal(expectedResult)
    }
}
