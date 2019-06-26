/*
    Copyright 2018 The caver-js Authors
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

const testRPCURL = require('./testrpc')
var Caver = require('../index.js')
const caver = new Caver(testRPCURL)

var senderPrvKey
var senderAddress
var receiver

before(() => {
    senderPrvKey = process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
        ? '0x' + process.env.privateKey
        : process.env.privateKey

    caver.klay.accounts.wallet.add(senderPrvKey)

    const sender = caver.klay.accounts.privateKeyToAccount(senderPrvKey)
    senderAddress = sender.address

    receiver = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
})

describe('caver.klay.sendSignedTransaction', (done) => {
  it('should send successfully with valid rawTransaction', async () => {
    const txObj = {
      from: senderAddress,
      to: receiver.address,
      value: 1,
      gas: 900000,
    }

    const {rawTransaction} = await caver.klay.accounts.signTransaction(txObj, senderPrvKey)
    const receipt = await caver.klay.sendSignedTransaction(rawTransaction)

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
  }).timeout(100000)
})
