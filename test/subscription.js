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
const websocketURL = require('./testWebsocket')

const Caver = require('../index.js')

const caver = new Caver(websocketURL)

let senderPrvKey
let senderAddress
let receiver

// If you are using websocket provider, subscribe the 'newBlockHeaders' event through the subscriptions object after sending the transaction.
// When receiving the 'newBlockHeaders' event, it queries the transaction receipt.
// You can think 'Subscription' object that inherit 'EventEmitter' work well, meaning that receipt comes out as a result after you submit the transaction.
// Here we test the process of sending the transaction and receiving the receipt as the result value to ensure that the 'Subscription' inheriting 'EventEmitter' is working properly.

// Flow
//    [request] klay_sendRawTransaction
// -> [response] transactionHash
// -> [request] klay_getTransactionReceipt
// -> [response] null
// -> Add 'newBlockHeaders' event subscription
// -> [event] new block header event
// -> [request] klay_getTransactionReceipt
// -> [response] receipt

before(() => {
    senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey

    senderAddress = caver.klay.accounts.wallet.add(senderPrvKey).address

    receiver = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
})

describe('get transaction', () => {
    it('CAVERJS-UNIT-ETC-094: getTransaction should return information of transaction.', async () => {
        const txObj = {
            from: senderAddress,
            to: receiver.address,
            value: 1,
            gas: 900000,
        }
        const receipt = await caver.klay.sendTransaction(txObj)

        expect(receipt).not.to.null
        expect(receipt.blockHash).not.to.undefined
        expect(receipt.blockNumber).not.to.undefined
        expect(receipt.contractAddress).not.to.undefined
        expect(receipt.from).not.to.undefined
        expect(receipt.gas).not.to.undefined
        expect(receipt.gasPrice).not.to.undefined
        expect(receipt.gasUsed).not.to.undefined
        expect(receipt.logs).not.to.undefined
        expect(receipt.logsBloom).not.to.undefined
        expect(receipt.nonce).not.to.undefined
        expect(receipt.signatures).not.to.undefined
        expect(receipt.status).equals(true)
        expect(receipt.to).not.to.undefined
        expect(receipt.transactionHash).not.to.undefined
        expect(receipt.transactionIndex).not.to.undefined
        expect(receipt.type).not.to.undefined
        expect(receipt.typeInt).not.to.undefined
        expect(receipt.value).not.to.undefined

        caver.currentProvider.connection.close()
    }).timeout(10000)
})
