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

const { expect } = require('chai')
const testRPCURL = require('./testrpc')

var Caver = require('../index.js')
const caver = new Caver(testRPCURL)

var sender, payer, receiver

before(() => {
    sender = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
    payer = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
    receiver = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
})

describe('Decode Transaction', () => {
    it('Decode transaction from raw transaction', async () => {
        // This test code is for testing the decodeTransaction for the scenario if it is a feeDelegated transaction type.
        // Check the transaction / decodeTransaction test for test / transactionType.
        const txObj = {
            type: 'FEE_DELEGATED_VALUE_TRANSFER',
            from: sender.address,
            to: receiver.address,
            value: 1,
            gas: 900000,
            nonce: 44,
            chainId: 10000,
            gasPrice: 25000000000,
        }
        let ret = await caver.klay.accounts.signTransaction(txObj, sender.privateKey)

        let decodedTx = await caver.klay.decodeTransaction(ret.rawTransaction)

        expect(decodedTx.type).to.equals(txObj.type)
        expect(decodedTx.nonce).to.equals(txObj.nonce)
        expect(caver.utils.hexToNumber(decodedTx.gasPrice)).to.equals(caver.utils.hexToNumber(txObj.gasPrice))
        expect(caver.utils.hexToNumber(decodedTx.gas)).to.equals(caver.utils.hexToNumber(txObj.gas))
        expect(decodedTx.to).to.equals(txObj.to)
        expect(caver.utils.hexToNumber(decodedTx.value)).to.equals(caver.utils.hexToNumber(txObj.value))
        expect(decodedTx.from).to.equals(txObj.from)
        expect(decodedTx.v).not.to.undefined
        expect(decodedTx.r).not.to.undefined
        expect(decodedTx.s).not.to.undefined
        expect(decodedTx.feePayer).to.equals('0x')
        expect(decodedTx.payerV).to.equals('0x01')
        expect(decodedTx.payerR).to.equals('0x')
        expect(decodedTx.payerS).to.equals('0x')

        ret = await caver.klay.accounts.signTransaction({
            senderRawTransaction: ret.rawTransaction,
            feePayer: payer.address,
        }, payer.privateKey)

        decodedTx = await caver.klay.decodeTransaction(ret.rawTransaction)

        expect(decodedTx.type).to.equals(txObj.type)
        expect(decodedTx.nonce).to.equals(txObj.nonce)
        expect(caver.utils.hexToNumber(decodedTx.gasPrice)).to.equals(caver.utils.hexToNumber(txObj.gasPrice))
        expect(caver.utils.hexToNumber(decodedTx.gas)).to.equals(caver.utils.hexToNumber(txObj.gas))
        expect(decodedTx.to).to.equals(txObj.to)
        expect(caver.utils.hexToNumber(decodedTx.value)).to.equals(caver.utils.hexToNumber(txObj.value))
        expect(decodedTx.from).to.equals(txObj.from)
        expect(decodedTx.v).not.to.undefined
        expect(decodedTx.r).not.to.undefined
        expect(decodedTx.s).not.to.undefined
        expect(decodedTx.feePayer).to.equals(payer.address)
        expect(decodedTx.payerV).not.to.undefined
        expect(decodedTx.payerR).not.to.undefined
        expect(decodedTx.payerS).not.to.undefined
    }).timeout(10000)
})