/*
    Copyright 2019 The caver-js Authors
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

require('it-each')({ testPerIteration: true })
const { expect } = require('./extendedChai')

const testRPCURL = require('./testrpc')

const Caver = require('../index.js')

let caver

let senderPrvKey
let senderAddress

const byteCode =
    '0x60806040526000805534801561001457600080fd5b506101ea806100246000396000f30060806040526004361061006d576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd1461007257806342cbb15c1461009d578063767800de146100c8578063b22636271461011f578063d14e62b814610150575b600080fd5b34801561007e57600080fd5b5061008761017d565b6040518082815260200191505060405180910390f35b3480156100a957600080fd5b506100b2610183565b6040518082815260200191505060405180910390f35b3480156100d457600080fd5b506100dd61018b565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561012b57600080fd5b5061014e60048036038101908080356000191690602001909291905050506101b1565b005b34801561015c57600080fd5b5061017b600480360381019080803590602001909291905050506101b4565b005b60005481565b600043905090565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b50565b80600081905550505600a165627a7a7230582053c65686a3571c517e2cf4f741d842e5ee6aa665c96ce70f46f9a594794f11eb0029'
const abi = [
    {
        constant: true,
        inputs: [],
        name: 'count',
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'getBlockNumber',
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'addr',
        outputs: [
            {
                name: '',
                type: 'address',
            },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            {
                name: '_str',
                type: 'bytes32',
            },
        ],
        name: 'setAddress',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            {
                name: '_count',
                type: 'uint256',
            },
        ],
        name: 'setCount',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
]

before(() => {
    senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey
})

beforeEach(() => {
    caver = new Caver(testRPCURL)
})

describe('caver.klay.contract with using caver-js wallet account', () => {
    it('Deploy and execute contract with caver.klay.Contract instance', async () => {
        // When using account in caver-js wallet, then contract instance send transaction with
        // 'SMART_CONTRACT_DEPLOY' or 'SMART_CONTRACT_EXECUTION' type
        senderAddress = caver.klay.accounts.wallet.add(senderPrvKey).address

        const contractInst = new caver.klay.Contract(abi)
        let receipt
        const newInstance = await contractInst
            .deploy({ data: byteCode })
            .send({
                from: senderAddress,
                gas: 100000000,
                value: 0,
            })
            .on('receipt', r => (receipt = r))
        expect(receipt.type).to.equals('TxTypeSmartContractDeploy')

        const execReceipt = await newInstance.methods.getBlockNumber().send({
            from: senderAddress,
            gas: 30000,
        })

        expect(execReceipt.type).to.equals('TxTypeSmartContractExecution')
    }).timeout(200000)
})

describe('caver.klay.contract with using account exists in Node', () => {
    it('Deploy and execute contract with caver.klay.Contract instance', async () => {
        // When using account in node, then contract instance send transaction with 'LEGACY' type
        senderAddress = caver.klay.accounts.privateKeyToAccount(senderPrvKey).address

        try {
            await caver.klay.personal.importRawKey(senderPrvKey, 'passphrase')
        } catch (e) {}
        const isUnlock = await caver.klay.personal.unlockAccount(senderAddress, 'passphrase')
        expect(isUnlock).to.be.true

        const contractInst = new caver.klay.Contract(abi)
        let receipt
        const newInstance = await contractInst
            .deploy({ data: byteCode })
            .send({
                from: senderAddress,
                gas: 100000000,
                value: 0,
            })
            .on('receipt', r => (receipt = r))
        expect(receipt.type).to.equals('TxTypeLegacyTransaction')

        const execReceipt = await newInstance.methods.getBlockNumber().send({
            from: senderAddress,
            gas: 30000,
        })

        expect(execReceipt.type).to.equals('TxTypeLegacyTransaction')
    }).timeout(200000)
})

describe('caver.klay.contract with using caver-js wallet account', () => {
    it('padEnd should work for solidity method parameter.', async () => {
        senderAddress = caver.klay.accounts.wallet.add(senderPrvKey).address

        const contractInst = new caver.klay.Contract(abi)
        const newInstance = await contractInst.deploy({ data: byteCode }).send({
            from: senderAddress,
            gas: 100000000,
            value: 0,
        })

        let execReceipt = await newInstance.methods.setAddress(caver.utils.toHex('WemixToken').padEnd(66, '0')).send({
            from: senderAddress,
            gas: 100000000,
        })
        expect(execReceipt.status).to.be.true

        execReceipt = await newInstance.methods.setAddress(caver.utils.fromAscii('WemixToken').padEnd(66, '0')).send({
            from: senderAddress,
            gas: 100000000,
        })
        expect(execReceipt.status).to.be.true

        execReceipt = await newInstance.methods.setAddress(caver.utils.asciiToHex('WemixToken').padEnd(66, '0')).send({
            from: senderAddress,
            gas: 100000000,
        })
        expect(execReceipt.status).to.be.true
    }).timeout(200000)
})

describe('caver.klay.contract with using account exists in Node', () => {
    it("When there is account information inside the wallet of caver-js, the node's account is used to deploy and execute the smart contract", async () => {
        caver.klay.accounts.wallet.add(caver.klay.accounts.create())

        // When using account in node, then contract instance send transaction with 'LEGACY' type
        senderAddress = caver.klay.accounts.privateKeyToAccount(senderPrvKey).address

        try {
            await caver.klay.personal.importRawKey(senderPrvKey, 'passphrase')
        } catch (e) {}
        const isUnlock = await caver.klay.personal.unlockAccount(senderAddress, 'passphrase')
        expect(isUnlock).to.be.true

        const contractInst = new caver.klay.Contract(abi)
        let receipt
        const newInstance = await contractInst
            .deploy({ data: byteCode })
            .send({
                from: senderAddress,
                gas: 100000000,
                value: 0,
            })
            .on('receipt', r => (receipt = r))
        expect(receipt.type).to.equals('TxTypeLegacyTransaction')

        const execReceipt = await newInstance.methods.getBlockNumber().send({
            from: senderAddress,
            gas: 30000,
        })

        expect(execReceipt.type).to.equals('TxTypeLegacyTransaction')
    }).timeout(200000)
})
