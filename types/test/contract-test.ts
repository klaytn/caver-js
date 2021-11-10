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

import Caver, { Contract, KIP7 } from 'caver-js'
import { KeyringContainer } from 'packages/caver-wallet/src'

const caver = new Caver()

// $ExpectType typeof Contract
caver.contract

let contract = new Contract(KIP7.abi)

// $ExpectType string | null
contract.defaultAccount

// $ExpectType BlockNumber
contract.defaultBlock

// $ExpectType string
contract.options.address

// $ExpectType AbiItem[]
contract.options.jsonInterface

// $ExpectType string | undefined
contract.options.from

// $ExpectType string | number | undefined
contract.options.gas

// $ExpectType string | number | undefined
contract.options.gasPrice

// $ExpectType string | undefined
contract.options.data

// $ExpectType boolean | undefined
contract.options.feeDelegation

// $ExpectType string | undefined
contract.options.feePayer

// $ExpectType string | number | undefined
contract.options.feeRatio

// $ExpectType Contract
contract.clone()

const keyringContainer = new KeyringContainer()

// $ExpectType void
contract.setKeyrings(keyringContainer)

// $ExpectType void
contract.setWallet(keyringContainer)

const functionCall =
    '0x23b872dd000000000000000000000000ff3fa88510da46b1a43181534ea998903cbd9127000000000000000000000000b7da2419482f8b9d530134464aca1ae64944691c0000000000000000000000000000000000000000000000000000000000000258'
// $ExpectType Result
contract.decodeFunctionCall(functionCall)

// $ExpectType void
contract.once(
    'Transfer',
    {
        filter: {
            myIndexedParam: [20, 23],
            myOtherIndexedParam: '0xb68b53fc45966f9fe606f8ae44e70cf68bb01bff',
        },
        fromBlock: 0,
    },
    (error, event) => {}
)
// $ExpectType void
contract.once('Transfer', (error, event) => {})

// $ExpectType Promise<EventData<Record<string, string>>[]>
contract.getPastEvents('MyEvent')
// $ExpectType Promise<EventData<Record<string, string>>[]>
contract.getPastEvents('Transfer', {
    filter: { from: '0xb68b53fc45966f9fe606f8ae44e70cf68bb01bff' },
    fromBlock: 0,
    toBlock: 'latest',
})
// $ExpectType Promise<EventData<Record<string, string>>[]>
contract.getPastEvents('MyEvent', {})
// $ExpectType Promise<EventData<Record<string, string>>[]>
contract.getPastEvents(
    'MyEvent',
    {
        filter: {
            from: '0xb68b53fc45966f9fe606f8ae44e70cf68bb01bff',
        },
        fromBlock: 0,
        toBlock: 'latest',
    },
    (error, events) => {}
)
// $ExpectType Promise<EventData<Record<string, string>>[]>
contract.getPastEvents('MyEvent', (error, events) => {})
// $ExpectType Promise<EventData<Record<string, string>>[]>
contract.getPastEvents('MyEvent')

// $ExpectType Promise<Contract>
contract.deploy({ from: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe' }, KIP7.byteCode, 'Jasmine', 'JAS', 18, '10')
// $ExpectType Promise<any>
contract.deploy({ contractDeployFormatter: () => {} }, KIP7.byteCode, 'Jasmine', 'JAS', 18, '10')
// $ExpectType ContractMethod
contract.deploy({
    data: KIP7.byteCode,
    arguments: ['Jasmine', 'JAS', 18, '10'],
})
// $ExpectType Promise<number>
contract
    .deploy({
        data: KIP7.byteCode,
        arguments: ['Jasmine', 'JAS', 18, '10'],
    })
    .estimateGas()

// $ExpectType Promise<number>
contract
    .deploy({
        data: KIP7.byteCode,
        arguments: ['Jasmine', 'JAS', 18, '10'],
    })
    .estimateGas({ from: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe' })

// $ExpectType Promise<number>
contract
    .deploy({
        data: KIP7.byteCode,
        arguments: ['Jasmine', 'JAS', 18, '10'],
    })
    .estimateGas((err: Error, gas: number) => {})

// $ExpectType string
contract
    .deploy({
        data: KIP7.byteCode,
        arguments: ['Jasmine', 'JAS', 18, '10'],
    })
    .encodeABI()
// $ExpectType PromiEvent<Contract>
contract
    .deploy({
        data: KIP7.byteCode,
        arguments: ['Jasmine', 'JAS', 18, '10'],
    })
    .send({ from: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe' })
// $ExpectType PromiEvent<Contract>
contract
    .deploy({
        data: KIP7.byteCode,
        arguments: ['Jasmine', 'JAS', 18, '10'],
    })
    .send({ from: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe' }, (err: Error, transactionHash: string) => {})

contract = Contract.create(KIP7.abi, '0x71b5f6fdbb58a26c8873f14bcb4bd21a6ab56ad9')

// $ExpectType Promise<TransactionReceipt>
contract.send({ from: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe' }, 'approve', '0xbffd75309ba66e2bf0de47b1be417e7814b13081', 10)

// $ExpectType Promise<any>
contract.call('name')
// $ExpectType Promise<any>
contract.call('balanceOf', '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe')
// $ExpectType Promise<any>
contract.call({ from: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe' }, 'balanceOf', '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe')

// $ExpectType Promise<Transaction>
contract.sign({ from: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe' }, 'approve', '0xbffd75309ba66e2bf0de47b1be417e7814b13081', 10)
// $ExpectType Promise<Transaction>
contract.sign(
    { from: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', feeDelegation: true, feeRatio: 10 },
    'approve',
    '0xbffd75309ba66e2bf0de47b1be417e7814b13081',
    10
)

// $ExpectType Promise<FeeDelegatedTransaction>
contract.signAsFeePayer(
    {
        from: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
        feePayer: '0x106f3ef5f7d1cb348a725922eff30f2d9e83377e',
        feeDelegation: true,
        feeRatio: 10,
    },
    'approve',
    '0xbffd75309ba66e2bf0de47b1be417e7814b13081',
    10
)
