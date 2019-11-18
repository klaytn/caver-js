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

const { expect } = require('chai')
const testRPCURL = require('./testrpc')

const Caver = require('../index.js')

const caver = new Caver(testRPCURL)

let senderPrvKey
let senderAddress

before(() => {
    senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey

    const sender = caver.klay.accounts.privateKeyToAccount(senderPrvKey)
    senderAddress = sender.address
})

describe('Personal RPC test', () => {
    const passphrase = 'passphrase'
    let acctLength
    let testAddress

    // getAccounts
    it('CAVERJS-UNIT-ETC-078: getAccounts should return list of wallet in Node.', async () => {
        const accounts = await caver.klay.personal.getAccounts()
        acctLength = accounts.length
        expect(Array.isArray(accounts)).to.be.true
    }).timeout(50000)

    // newAccount
    it('CAVERJS-UNIT-ETC-079: newAccount should make new account in node and return address.', async () => {
        const address = await caver.klay.personal.newAccount(passphrase)
        expect(caver.utils.isAddress(address)).to.be.true
        testAddress = address

        const accounts = await caver.klay.personal.getAccounts()
        expect(acctLength + 1 === accounts.length).to.be.true
    }).timeout(50000)

    // unlockAccount
    it('CAVERJS-UNIT-ETC-080: unlockAccount should return boolean result of unlock(without duration).', async () => {
        const isUnlock = await caver.klay.personal.unlockAccount(testAddress, passphrase)
        expect(typeof isUnlock).to.equals('boolean')
        expect(isUnlock).to.be.true
    }).timeout(50000)

    it('CAVERJS-UNIT-ETC-081: unlockAccount should return boolean result of unlock(with duration).', async () => {
        const isUnlock = await caver.klay.personal.unlockAccount(testAddress, passphrase, 100)
        expect(typeof isUnlock).to.equals('boolean')
        expect(isUnlock).to.be.true
    }).timeout(50000)

    it('CAVERJS-UNIT-ETC-082: unlockAccount should return error with invalid address.', async () => {
        const invalidAddress = 'invalid'
        expect(() => caver.klay.personal.unlockAccount(invalidAddress, passphrase, 100)).to.throws(
            `Provided address "${invalidAddress}" is invalid, the capitalization checksum test failed.`
        )
    }).timeout(50000)

    // lockAccount
    it('CAVERJS-UNIT-ETC-083: lockAccount should return boolean result of lock.', async () => {
        const isLock = await caver.klay.personal.lockAccount(testAddress)
        expect(typeof isLock).to.equals('boolean')
        expect(isLock).to.be.true
    }).timeout(50000)

    // importRawKey
    it('CAVERJS-UNIT-ETC-084: importRawKey should return address of account(0x format).', async () => {
        const testAccount = caver.klay.accounts.create()
        const address = await caver.klay.personal.importRawKey(testAccount.privateKey, passphrase)

        expect(address.toLowerCase()).to.equals(testAccount.address.toLowerCase())
    }).timeout(50000)

    it('CAVERJS-UNIT-ETC-085: importRawKey should return address of account(without 0x format).', async () => {
        const testAccount = caver.klay.accounts.create()
        const address = await caver.klay.personal.importRawKey(testAccount.privateKey.slice(2), passphrase)

        expect(address.toLowerCase()).to.equals(testAccount.address.toLowerCase())
    }).timeout(50000)

    it('CAVERJS-UNIT-ETC-086: importRawKey with klaytnWalletKey format.', async () => {
        const testAccount = caver.klay.accounts.create()
        const decoupledAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create(), testAccount.address)
        const klaytnWalletKey = decoupledAccount.getKlaytnWalletKey()

        const address = await caver.klay.personal.importRawKey(klaytnWalletKey, passphrase)

        expect(address.toLowerCase()).to.equals(testAccount.address.toLowerCase())
    }).timeout(50000)

    // sendTransaction
    it('CAVERJS-UNIT-ETC-087: sendTransaction should send a transaction using an account in the node.', async () => {
        try {
            // If account is already existed in node, return error.
            const address = await caver.klay.personal.importRawKey(senderPrvKey, passphrase)
            expect(address.toLowerCase()).to.equals(senderAddress.toLowerCase())
        } catch (e) {}

        const receipt = await caver.klay.personal.sendTransaction(
            {
                from: senderAddress,
                to: caver.klay.accounts.create().address,
                value: 1,
                gas: 900000,
            },
            passphrase
        )
        expect(receipt).not.to.be.null
        expect(receipt.type).to.equals('TxTypeLegacyTransaction')
    }).timeout(50000)

    // signTransaction
    it('CAVERJS-UNIT-ETC-088: signTransaction should send a signed transaction using an account in the node.', async () => {
        const testAccount = caver.klay.accounts.create()
        const address = await caver.klay.personal.importRawKey(testAccount.privateKey, passphrase)
        expect(address.toLowerCase()).to.equals(testAccount.address.toLowerCase())

        const txObj = {
            from: testAccount.address,
            to: '0xd05c5926b0a2f31aadcc9a9cbd3868a50104d834',
            value: '0x1',
            gas: '0xdbba0',
            gasPrice: '0x5d21dba00',
            nonce: '0x9a',
        }
        const signedTx = await caver.klay.personal.signTransaction(txObj, passphrase)
        const signedTxFromCaver = await caver.klay.accounts.signTransaction(txObj, testAccount.privateKey)
        expect(signedTx.raw).to.equals(signedTxFromCaver.rawTransaction)
    }).timeout(50000)

    // sign
    it('CAVERJS-UNIT-ETC-089: sign makes a signature of the data using an account in the node.', async () => {
        const testAccount = caver.klay.accounts.create()
        const address = await caver.klay.personal.importRawKey(testAccount.privateKey, passphrase)
        expect(address.toLowerCase()).to.equals(testAccount.address.toLowerCase())

        const data = '0xdeadbeaf'
        const signedData = await caver.klay.personal.sign(data, testAccount.address, passphrase)
        const signedDataromCaver = await caver.klay.accounts.sign(data, testAccount.privateKey)
        expect(signedData).to.equals(signedDataromCaver.signature)
    }).timeout(50000)

    // ecRecover
    it('CAVERJS-UNIT-ETC-090: ecRecover returns the address from the signature.', async () => {
        const testAccount = caver.klay.accounts.create()
        const address = await caver.klay.personal.importRawKey(testAccount.privateKey, passphrase)
        expect(address.toLowerCase()).to.equals(testAccount.address.toLowerCase())

        const data = '0xdeadbeaf'
        const signedData = await caver.klay.personal.sign(data, testAccount.address, passphrase)
        const recoveredAddress = await caver.klay.personal.ecRecover(data, signedData)
        expect(recoveredAddress.toLowerCase()).to.equals(testAccount.address.toLowerCase())
    }).timeout(50000)

    // replaceRawKey
    it('CAVERJS-UNIT-ETC-091: replaceRawKey should replace the private key of the account.', async () => {
        const testAccount = caver.klay.accounts.create()
        const address = await caver.klay.personal.importRawKey(testAccount.privateKey, passphrase)
        expect(address.toLowerCase()).to.equals(testAccount.address.toLowerCase())

        const data = '0xdeadbeaf'
        const signedData = await caver.klay.personal.sign(data, testAccount.address, passphrase)

        const decoupledAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create(), testAccount.address)
        const klaytnWalletKey = decoupledAccount.getKlaytnWalletKey()
        const updatedAddress = await caver.klay.personal.replaceRawKey(klaytnWalletKey, passphrase, passphrase)
        expect(updatedAddress.toLowerCase()).to.equals(testAccount.address.toLowerCase())

        const signedDataAfterUpdate = await caver.klay.personal.sign(data, testAccount.address, passphrase)
        expect(signedData).not.to.equals(signedDataAfterUpdate)
    }).timeout(50000)

    // sendValueTransfer
    it('CAVERJS-UNIT-ETC-092: sendValueTransfer should send a value transfer transaction using an account in the node.', async () => {
        try {
            // If account is already existed in node, return error.
            const address = await caver.klay.personal.importRawKey(senderPrvKey, passphrase)
            expect(address.toLowerCase()).to.equals(senderAddress.toLowerCase())
        } catch (e) {}

        const receipt = await caver.klay.personal.sendValueTransfer(
            {
                from: senderAddress,
                to: caver.klay.accounts.create().address,
                value: 1,
                gas: 900000,
            },
            passphrase
        )
        expect(receipt).not.to.be.null
        expect(receipt.type).to.equals('TxTypeValueTransfer')
    }).timeout(50000)

    // sendAccountUpdate
    it('CAVERJS-UNIT-ETC-093: sendAccountUpdate should send account update transaction using account in node.', async () => {
        try {
            // If account is already existed in node, return error.
            const address = await caver.klay.personal.importRawKey(senderPrvKey, passphrase)
            expect(address.toLowerCase()).to.equals(senderAddress.toLowerCase())
        } catch (e) {}

        const testAccount = caver.klay.accounts.create()

        let receipt = await caver.klay.personal.sendValueTransfer(
            {
                from: senderAddress,
                to: testAccount.address,
                value: caver.utils.toPeb(1, 'KLAY'),
                gas: 900000,
            },
            passphrase
        )

        const addr = await caver.klay.personal.importRawKey(testAccount.privateKey, passphrase)
        expect(addr.toLowerCase()).to.equals(testAccount.address.toLowerCase())

        receipt = await caver.klay.personal.sendAccountUpdate(
            {
                from: testAccount.address,
                gas: 9000000,
                key:
                    '0x04f86f03f86ce301a103501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fce302a10205274ea06b36a35f123400d3d95f3b460aa2ac069749582fd7322f1ff36c063be303a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2d',
            },
            passphrase
        )
        expect(receipt).not.to.be.null
        expect(receipt.type).to.equals('TxTypeAccountUpdate')

        const key = await caver.klay.getAccountKey(testAccount.address)
        expect(key.keyType).to.equals(4)
    }).timeout(50000)
})
