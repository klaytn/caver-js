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

const { expect } = require('chai')

const Caver = require('../index')
const testRPCURL = require('./testrpc')

const caver = new Caver(testRPCURL)

let sender
let contractAddress

const tupleSamepleByteCode =
    '0x60806040523480156200001157600080fd5b506040516200090538038062000905833981018060405262000037919081019062000231565b81600390805190602001906200004f92919062000091565b508060008082015181600001556020820151816001015560408201518160020160006101000a81548160ff021916908315150217905550905050505062000332565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10620000d457805160ff191683800117855562000105565b8280016001018555821562000105579182015b8281111562000104578251825591602001919060010190620000e7565b5b50905062000114919062000118565b5090565b6200013d91905b80821115620001395760008160009055506001016200011f565b5090565b90565b60006200014e8251620002e6565b905092915050565b600082601f8301126200016857600080fd5b81516200017f6200017982620002b9565b6200028b565b915080825260208301602083018583830111156200019c57600080fd5b620001a9838284620002fc565b50505092915050565b600060608284031215620001c557600080fd5b620001d160606200028b565b90506000620001e3848285016200021b565b6000830152506020620001f9848285016200021b565b60208301525060406200020f8482850162000140565b60408301525092915050565b6000620002298251620002f2565b905092915050565b600080608083850312156200024557600080fd5b600083015167ffffffffffffffff8111156200026057600080fd5b6200026e8582860162000156565b92505060206200028185828601620001b2565b9150509250929050565b6000604051905081810181811067ffffffffffffffff82111715620002af57600080fd5b8060405250919050565b600067ffffffffffffffff821115620002d157600080fd5b601f19601f8301169050602081019050919050565b60008115159050919050565b6000819050919050565b60005b838110156200031c578082015181840152602081019050620002ff565b838111156200032c576000848401525b50505050565b6105c380620003426000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c80636d4ce63c14610051578063a56dfe4a14610071578063a610237a1461008f578063c5d7802e146100ab575b600080fd5b6100596100cb565b6040516100689392919061045e565b60405180910390f35b6100796100f9565b604051610086919061043c565b60405180910390f35b6100a960048036036100a49190810190610391565b610197565b005b6100b36101eb565b6040516100c29392919061045e565b60405180910390f35b60008060008060000154600060010154600060020160009054906101000a900460ff16925092509250909192565b60038054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561018f5780601f106101645761010080835404028352916020019161018f565b820191906000526020600020905b81548152906001019060200180831161017257829003601f168201915b505050505081565b81600390805190602001906101ad929190610210565b508060008082015181600001556020820151816001015560408201518160020160006101000a81548160ff0219169083151502179055509050505050565b60008060000154908060010154908060020160009054906101000a900460ff16905083565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061025157805160ff191683800117855561027f565b8280016001018555821561027f579182015b8281111561027e578251825591602001919060010190610263565b5b50905061028c9190610290565b5090565b6102b291905b808211156102ae576000816000905550600101610296565b5090565b90565b60006102c18235610520565b905092915050565b600082601f8301126102da57600080fd5b81356102ed6102e8826104c2565b610495565b9150808252602083016020830185838301111561030957600080fd5b610314838284610536565b50505092915050565b60006060828403121561032f57600080fd5b6103396060610495565b905060006103498482850161037d565b600083015250602061035d8482850161037d565b6020830152506040610371848285016102b5565b60408301525092915050565b6000610389823561052c565b905092915050565b600080608083850312156103a457600080fd5b600083013567ffffffffffffffff8111156103be57600080fd5b6103ca858286016102c9565b92505060206103db8582860161031d565b9150509250929050565b6103ee8161050a565b82525050565b60006103ff826104ee565b61040981856104f9565b9350610419818560208601610545565b61042281610578565b840191505092915050565b61043681610516565b82525050565b6000602082019050818103600083015261045681846103f4565b905092915050565b6000606082019050610473600083018661042d565b610480602083018561042d565b61048d60408301846103e5565b949350505050565b6000604051905081810181811067ffffffffffffffff821117156104b857600080fd5b8060405250919050565b600067ffffffffffffffff8211156104d957600080fd5b601f19601f8301169050602081019050919050565b600081519050919050565b600082825260208201905092915050565b60008115159050919050565b6000819050919050565b60008115159050919050565b6000819050919050565b82818337600083830152505050565b60005b83811015610563578082015181840152602081019050610548565b83811115610572576000848401525b50505050565b6000601f19601f830116905091905056fea265627a7a723058208ae01297d1c51200928f3c51d50dbe8636ebc8b387874dc13eccbf33c4201b636c6578706572696d656e74616cf50037'
const tupleSampleABI = [
    {
        constant: true,
        inputs: [],
        name: 'get',
        outputs: [{ name: '', type: 'uint256' }, { name: '', type: 'uint256' }, { name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'y',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            { name: 's', type: 'string' },
            {
                components: [{ name: 'a', type: 'uint256' }, { name: 'b', type: 'uint256' }, { name: 'c', type: 'bool' }],
                name: 'b',
                type: 'tuple',
            },
        ],
        name: 'set',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'z',
        outputs: [{ name: 'a', type: 'uint256' }, { name: 'b', type: 'uint256' }, { name: 'c', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { name: 's', type: 'string' },
            {
                components: [{ name: 'a', type: 'uint256' }, { name: 'b', type: 'uint256' }, { name: 'c', type: 'bool' }],
                name: 'b',
                type: 'tuple',
            },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
]

before(() => {
    const senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey

    sender = caver.wallet.keyring.createFromPrivateKey(senderPrvKey)
    caver.wallet.add(sender)
})

describe('Smart contract with tuple test', () => {
    it('CAVERJS-UNIT-ETC-263: should encode and decode tuple type', async () => {
        const str = 'stringValue'
        const tuple = {
            uint256_1: '1',
            uint256_2: '2',
            bool: true,
        }
        const encoded = caver.abi.encodeParameters(
            [
                { name: 's', type: 'string' },
                {
                    components: [{ name: 'a', type: 'uint256' }, { name: 'b', type: 'uint256' }, { name: 'c', type: 'bool' }],
                    name: 'b',
                    type: 'tuple',
                },
            ],
            [str, Object.values(tuple)]
        )

        // Result { '0': 'stringValue', '1': [ '1', '2', true ], __length__: 2 }
        const decoded = caver.abi.decodeParameters(['string', 'tuple(uint256,uint256,bool)'], encoded)

        expect(decoded[0]).to.equal(str)
        expect(decoded[1]).to.deep.equal(Object.values(tuple))
    }).timeout(100000)

    it('CAVERJS-UNIT-ETC-264: should deploy smart contract with tuple type of constructor parameter', async () => {
        const c = new caver.contract(tupleSampleABI)
        const str = 'stringValue'
        const tuple = {
            uint256_1: '1',
            uint256_2: '2',
            bool: true,
        }
        const deployed = await c
            .deploy({
                data: tupleSamepleByteCode,
                arguments: [str, Object.values(tuple)],
            })
            .send({
                from: sender.address,
                gas: 10000000,
            })
        const getResult = await deployed.methods.get().call()

        expect(getResult[0]).to.equal(Object.values(tuple)[0])
        expect(getResult[1]).to.equal(Object.values(tuple)[1])
        expect(getResult[2]).to.equal(Object.values(tuple)[2])

        contractAddress = deployed.options.address
    }).timeout(10000000)

    it('CAVERJS-UNIT-ETC-265: should send tuple type parameter', async () => {
        const c = new caver.contract(tupleSampleABI, contractAddress)
        const str = 'another string value'
        const tuple = {
            uint256_1: '3',
            uint256_2: '4',
            bool: false,
        }
        const setResult = await c.methods.set(str, Object.values(tuple)).send({
            from: sender.address,
            gas: 1000000,
        })
        expect(setResult.status).to.be.true

        const getResult = await c.methods.get().call()

        expect(getResult[0]).to.equal(Object.values(tuple)[0])
        expect(getResult[1]).to.equal(Object.values(tuple)[1])
        expect(getResult[2]).to.equal(Object.values(tuple)[2])
    }).timeout(10000000)
})

// pragma solidity ^0.5.0;
// pragma experimental ABIEncoderV2;

// contract C {
//     struct Bar {
//         uint a;
//         uint b;
//         bool c;
//     }

//     Bar public z;
//     string public y;

// 	constructor (string memory s, Bar memory b) public {
//         y = s;
// 		z = b;
//     }

//     function set(string memory s, Bar memory b) public {
//         y = s;
// 		z = b;
//     }

//     function get() public view returns (uint, uint, bool) {
//         return (z.a, z.b, z.c);
//     }
// }
