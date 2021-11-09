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

const { expect } = require('./extendedChai')

const Caver = require('../index')
const testRPCURL = require('./testrpc')

const caver = new Caver(testRPCURL)

let sender
let payer
let testAccount
let txObj

before(() => {
    const senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey
    const payerPrvKey =
        process.env.privateKey2 && String(process.env.privateKey2).indexOf('0x') === -1
            ? `0x${process.env.privateKey2}`
            : process.env.privateKey2

    sender = caver.klay.accounts.wallet.add(senderPrvKey)
    payer = caver.klay.accounts.wallet.add(payerPrvKey)

    testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())

    txObj = {
        from: sender.address,
        to: testAccount.address,
        value: '0',
        gas: 30000,
        gasPrice: caver.utils.toPeb(25, 'Ston'),
    }
})

describe('caver.klay.accounts.signTransaction', () => {
    it('CAVERJS-UNIT-WALLET-396: should set nonce with pending block tag', async () => {
        // given
        const baseNonce = await caver.klay.getTransactionCount(sender.address)

        // when
        await sendTransactionTxHashHelper(txObj)
        const signed = await caver.klay.accounts.signTransaction({ ...txObj })
        const nonce2 = caver.utils.hexToNumber(caver.klay.decodeTransaction(signed.rawTransaction).nonce)

        // then
        expect(nonce2).to.equals(baseNonce + 1)
    }).timeout(20000)
})

describe('caver.klay.accounts.feePayerSignTransaction', () => {
    it('CAVERJS-UNIT-WALLET-397: should set nonce with pending block tag', async () => {
        const baseNonce = await caver.klay.getTransactionCount(sender.address, 'pending')

        const feeDelegated = { type: 'FEE_DELEGATED_VALUE_TRANSFER', ...txObj }

        await sendTransactionTxHashHelper(txObj)
        const feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(feeDelegated, payer.address)
        const nonce2 = caver.utils.hexToNumber(caver.klay.decodeTransaction(feePayerSigned.rawTransaction).nonce)

        expect(nonce2).to.equals(baseNonce + 1)
    }).timeout(20000)
})

describe('caver.klay.accounts.getRawTransactionWithSignatures', () => {
    it('CAVERJS-UNIT-WALLET-398: should set nonce with pending block tag', async () => {
        const baseNonce = await caver.klay.getTransactionCount(sender.address, 'pending')

        await sendTransactionTxHashHelper(txObj)
        const signed = await caver.klay.accounts.signTransaction({ ...txObj })

        const txWithSignatures = { signatures: signed.signatures, ...txObj }

        const rawTx = await caver.klay.accounts.getRawTransactionWithSignatures(txWithSignatures)
        const nonce2 = caver.utils.hexToNumber(caver.klay.decodeTransaction(rawTx.rawTransaction).nonce)

        expect(nonce2).to.equals(baseNonce + 1)
    }).timeout(20000)
})

function sendTransactionTxHashHelper(tx) {
    return new Promise(resolve => {
        caver.klay.sendTransaction({ ...tx }).on('transactionHash', transactionHash => {
            resolve(transactionHash)
        })
    })
}
