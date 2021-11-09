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

const testRPCURL = require('../testrpc')
const { expect } = require('../extendedChai')

const Caver = require('../../index')

let caver

beforeEach(() => {
    caver = new Caver(testRPCURL)
})

describe('caver.abi', () => {
    context('caver.abi.decodeFunctionCall', () => {
        it('CAVERJS-UNIT-ETC-367: should validate function call string and decode parameters', async () => {
            const abi = {
                name: 'myMethod',
                type: 'function',
                inputs: [
                    {
                        type: 'uint256',
                        name: 'myNumber',
                    },
                    {
                        type: 'string',
                        name: 'mystring',
                    },
                ],
            }
            const encodedFunctionCall =
                '0x24ee0097000000000000000000000000000000000000000000000000000000008bd02b7b0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000748656c6c6f212500000000000000000000000000000000000000000000000000'
            const expectedParams = ['2345675643', 'Hello!%']

            const decoded = caver.abi.decodeFunctionCall(abi, encodedFunctionCall)

            expect(decoded.__length__).to.equal(expectedParams.length)
            for (let i = 0; i < expectedParams.length; i++) {
                expect(decoded[i]).to.equal(expectedParams[i])
            }
        })

        it('CAVERJS-UNIT-ETC-368: should validate function call string and decode parameters without hex prefix', async () => {
            const abi = {
                name: 'myMethod',
                type: 'function',
                inputs: [
                    {
                        type: 'uint256',
                        name: 'myNumber',
                    },
                    {
                        type: 'string',
                        name: 'mystring',
                    },
                ],
            }
            const encodedFunctionCall =
                '24ee0097000000000000000000000000000000000000000000000000000000008bd02b7b0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000748656c6c6f212500000000000000000000000000000000000000000000000000'
            const expectedParams = ['2345675643', 'Hello!%']

            const decoded = caver.abi.decodeFunctionCall(abi, encodedFunctionCall)

            expect(decoded.__length__).to.equal(expectedParams.length)
            for (let i = 0; i < expectedParams.length; i++) {
                expect(decoded[i]).to.equal(expectedParams[i])
            }
        })

        it('CAVERJS-UNIT-ETC-369: should throw an error when function signatures are not matched', async () => {
            const abi = {
                name: 'myMethod',
                type: 'function',
                inputs: [
                    {
                        type: 'uint256',
                        name: 'myNumber',
                    },
                    {
                        type: 'string',
                        name: 'mystring',
                    },
                ],
            }
            const encodedFunctionCall =
                '0x24ef0097000000000000000000000000000000000000000000000000000000008bd02b7b0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000748656c6c6f212500000000000000000000000000000000000000000000000000'

            const expectedError = `Invalid function signature: The function signature of the abi as a parameter and the function signatures extracted from the function call string do not match.`
            expect(() => {
                caver.abi.decodeFunctionCall(abi, encodedFunctionCall)
            }).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-ETC-370: should throw an error when function abi object does not have enough information', async () => {
            let abi = {
                type: 'function',
                inputs: [
                    {
                        type: 'uint256',
                        name: 'myNumber',
                    },
                    {
                        type: 'string',
                        name: 'mystring',
                    },
                ],
            }
            const encodedFunctionCall =
                '0x24ee0097000000000000000000000000000000000000000000000000000000008bd02b7b0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000748656c6c6f212500000000000000000000000000000000000000000000000000'

            let expectedError = `Insufficient info in abi object: The function name and inputs must be defined inside the abi function object.`
            expect(() => {
                caver.abi.decodeFunctionCall(abi, encodedFunctionCall)
            }).to.throw(expectedError)

            abi = {
                name: 'myMethod',
                type: 'function',
            }
            expect(() => {
                caver.abi.decodeFunctionCall(abi, encodedFunctionCall)
            }).to.throw(expectedError)

            expectedError = `Invalid abi parameter type: To decode function call, you need to pass an abi object of the function as a first parameter.`
            abi = [
                {
                    type: 'uint256',
                    name: 'myNumber',
                },
                {
                    type: 'string',
                    name: 'mystring',
                },
            ]
            expect(() => {
                caver.abi.decodeFunctionCall(abi, encodedFunctionCall)
            }).to.throw(expectedError)
        })
    })
})
