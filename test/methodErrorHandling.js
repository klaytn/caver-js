/*
    Copyright 2020 The caver-js Authors
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

const { expect } = require('./extendedChai')

const Caver = require('../index')
const testRPCURL = require('./testrpc')

const caver = new Caver(testRPCURL)

let sender

const deployedData =
    '0x60806040526000805534801561001457600080fd5b5060405161016f38038061016f8339810180604052810190808051906020019092919080518201929190505050816000819055505050610116806100596000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd14605857806342cbb15c146080578063d14e62b81460a8575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b50609260d8565b6040518082815260200191505060405180910390f35b34801560b357600080fd5b5060d06004803603810190808035906020019092919050505060e0565b005b60005481565b600043905090565b80600081905550505600a165627a7a723058206d2bc553736581b6387f9a0410856ca490fcdc7045a8991ad63a1fd71b651c3a00290000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000013200000000000000000000000000000000000000000000000000000000000000'

before(() => {
    const senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey

    sender = caver.klay.accounts.wallet.add(senderPrvKey)
})

describe('Error handling in Method package', () => {
    it('CAVERJS-UNIT-TX-729: should reject correct errors when fail to deploy contract', async () => {
        const tx = {
            type: 'SMART_CONTRACT_DEPLOY',
            from: sender.address,
            data: deployedData,
            gas: 140000,
            value: 0,
        }
        const expectedError = `contract creation code storage out of gas`
        await expect(caver.klay.sendTransaction(tx)).to.be.rejectedWith(expectedError)
    }).timeout(200000)

    it('CAVERJS-UNIT-TX-730: should throw expected errors when fail to execute contract', async () => {
        const receipt = await caver.klay.sendTransaction({
            type: 'SMART_CONTRACT_DEPLOY',
            from: sender.address,
            data: deployedData,
            gas: 200000,
            value: 0,
        })

        let tx = {
            type: 'SMART_CONTRACT_EXECUTION',
            from: sender.address,
            to: receipt.contractAddress,
            data: '0xd14e62b80000000000000000000000000000000000000000000000000000000000000005',
            gas: 25000,
            value: 0,
        }
        let expectedError = `out of gas`
        await expect(caver.klay.sendTransaction(tx)).to.be.rejectedWith(expectedError)

        tx = {
            type: 'SMART_CONTRACT_EXECUTION',
            from: sender.address,
            to: receipt.contractAddress,
            data: '0x6353586b00000000000000000000000090b3e9a3770481345a7f17f22f16d020bccfd33e',
            gas: 40000,
            value: 0,
        }
        expectedError = `evm: execution reverted`
        await expect(caver.klay.sendTransaction(tx)).to.be.rejectedWith(expectedError)
    }).timeout(200000)
})
