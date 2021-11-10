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

import { ABI } from 'caver-js'

// $ExpectType typeof ABI
ABI

// $ExpectType ABI
const abiCoder = new ABI()

// $ExpectType string
abiCoder.encodeFunctionSignature('myMethod(uint256,string)')
// $ExpectType string
abiCoder.encodeFunctionSignature({
    name: 'myMethod',
    type: 'function',
    inputs: [
        {
            type: 'uint256',
            name: 'myNumber',
        },
        {
            type: 'string',
            name: 'myString',
        },
    ],
})

// $ExpectType string
abiCoder.encodeEventSignature('myEvent(uint256,bytes32)')
// $ExpectType string
abiCoder.encodeFunctionSignature({
    name: 'myEvent',
    type: 'event',
    inputs: [
        {
            type: 'uint256',
            name: 'myNumber',
        },
        {
            type: 'bytes32',
            name: 'myBytes',
        },
    ],
})

// $ExpectType string
abiCoder.encodeParameter('uint256', '2345675643')
// $ExpectType string
abiCoder.encodeParameter('uint256', ['0xdf3234', '0xfdfd'])
// $ExpectType string
abiCoder.encodeParameter(
    {
        ParentStruct: {
            propertyOne: 'uint256',
            propertyTwo: 'uint256',
            childStruct: {
                propertyOne: 'uint256',
                propertyTwo: 'uint256',
            },
        },
    },
    {
        propertyOne: 42,
        propertyTwo: 56,
        childStruct: {
            propertyOne: 45,
            propertyTwo: 78,
        },
    }
)

// $ExpectType string
abiCoder.encodeParameters(['uint256', 'string'], ['2345675643', 'Hello!%'])
// $ExpectType string
abiCoder.encodeParameters(['uint8[]', 'bytes32'], [['34', '434'], '0x324567fff'])
// $ExpectType string
abiCoder.encodeParameters(
    [
        'uint8[]',
        {
            ParentStruct: {
                propertyOne: 'uint256',
                propertyTwo: 'uint256',
                ChildStruct: {
                    propertyOne: 'uint256',
                    propertyTwo: 'uint256',
                },
            },
        },
    ],
    [
        ['34', '434'],
        {
            propertyOne: '42',
            propertyTwo: '56',
            ChildStruct: {
                propertyOne: '45',
                propertyTwo: '78',
            },
        },
    ]
)

// $ExpectType string
abiCoder.encodeFunctionCall(
    {
        name: 'myMethod',
        type: 'function',
        inputs: [
            {
                type: 'uint256',
                name: 'myNumber',
            },
            {
                type: 'string',
                name: 'myString',
            },
        ],
    },
    ['2345675643', 'Hello!%']
)

// $ExpectType string
abiCoder.decodeParameter('uint256', '0x0000000000000000000000000000000000000000000000000000000000000010')
// $ExpectType string
abiCoder.decodeParameter('uint256', '0x0000000000000000000000000000000000000000000000000000000000000010')
// $ExpectType string
abiCoder.decodeParameter(
    {
        ParentStruct: {
            propertyOne: 'uint256',
            propertyTwo: 'uint256',
            childStruct: {
                propertyOne: 'uint256',
                propertyTwo: 'uint256',
            },
        },
    },
    `0x000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000
    00000000000038000000000000000000000000000000000000000000000000000000000000002d00000000000000000000000000000000000000
    0000000000000000000000004e`
)

// $ExpectType Result
abiCoder.decodeParameters(['string', 'uint256'], '0x0000000000000000000000000000000000000000000000000000000000000010')
// $ExpectType Result
abiCoder.decodeParameters(
    [
        {
            type: 'string',
            name: 'myString',
        },
        {
            type: 'uint256',
            name: 'myNumber',
        },
    ],
    '0x0000000000000000000000000000000000000000000000000000000000000010'
)
// $ExpectType Result
abiCoder.decodeParameters(
    [
        'uint8[]',
        {
            ParentStruct: {
                propertyOne: 'uint256',
                propertyTwo: 'uint256',
                childStruct: {
                    propertyOne: 'uint256',
                    propertyTwo: 'uint256',
                },
            },
        },
    ],
    '0x0000000000000000000000000000000000000000000000000000000000000010'
)

// $ExpectType Result
abiCoder.decodeLog(
    [
        {
            type: 'string',
            name: 'myString',
        },
        {
            type: 'uint256',
            name: 'myNumber',
            indexed: true,
        },
        {
            type: 'uint8',
            name: 'mySmallNumber',
            indexed: true,
        },
    ],
    `0x0000000000000000000000000000000000000000000000000000000000000020000000000000000
     000000000000000000000000000000000000000000000000748656c6c6f2521000000000000000000
     00000000000000000000000000000000`,
    [
        '0x000000000000000000000000000000000000000000000000000000000000f310',
        '0x0000000000000000000000000000000000000000000000000000000000000010',
    ]
)
