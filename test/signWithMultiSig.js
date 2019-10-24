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

const Caver = require('../index.js')
const testRPCURL = require('./testrpc')

const caver = new Caver(testRPCURL)

let sender
let multiSigAccount
let multiSigKeys

const createMultiSigAccount = async () => {
    multiSigAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
    multiSigKeys = [
        caver.klay.accounts.create().privateKey,
        caver.klay.accounts.create().privateKey,
        caver.klay.accounts.create().privateKey,
    ]

    const txObject = {
        from: sender.address,
        to: multiSigAccount.address,
        value: caver.utils.toPeb(10, 'KLAY'),
        gas: 900000,
    }

    await caver.klay.sendTransaction(txObject)

    // account update transaction object
    const accountUpdateObject = {
        type: 'ACCOUNT_UPDATE',
        from: multiSigAccount.address,
        multisig: {
            threshold: 2,
            keys: [
                { weight: 1, publicKey: caver.klay.accounts.privateKeyToPublicKey(multiSigKeys[0]) },
                { weight: 1, publicKey: caver.klay.accounts.privateKeyToPublicKey(multiSigKeys[1]) },
                { weight: 1, publicKey: caver.klay.accounts.privateKeyToPublicKey(multiSigKeys[2]) },
            ],
        },
        gas: 900000,
    }

    return caver.klay.sendTransaction(accountUpdateObject)
}

before(function(done) {
    this.timeout(200000)

    const senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey

    sender = caver.klay.accounts.wallet.add(senderPrvKey)

    createMultiSigAccount().then(() => done())
})

describe('sign transaction with multi sig account key', () => {
    it('CAVERJS-UNIT-TX-576 : signTransaction method should sign with private key array correctly', async () => {
        const accountKey = await caver.klay.getAccountKey(multiSigAccount.address)
        expect(accountKey.keyType).to.equals(4)
        expect(accountKey.key.threshold).to.equals(2)

        const txObj = {
            type: 'VALUE_TRANSFER',
            from: multiSigAccount.address,
            to: caver.klay.accounts.create().address,
            value: 1,
            gas: 900000,
        }
        const result = await caver.klay.accounts.signTransaction(txObj, multiSigKeys)

        const tx = await caver.klay.sendSignedTransaction(result.rawTransaction)

        expect(tx.signatures.length).to.equals(multiSigKeys.length)
    }).timeout(100000)
})
