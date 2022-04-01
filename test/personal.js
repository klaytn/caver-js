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

const Caver = require('../index')

const caver = new Caver(testRPCURL)

let senderPrvKey
let senderAddress
let password
const byteCode =
    '0x60806040526000805534801561001457600080fd5b5060405161016f38038061016f8339810180604052810190808051906020019092919080518201929190505050816000819055505050610116806100596000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd14605857806342cbb15c146080578063d14e62b81460a8575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b50609260d8565b6040518082815260200191505060405180910390f35b34801560b357600080fd5b5060d06004803603810190808035906020019092919050505060e0565b005b60005481565b600043905090565b80600081905550505600a165627a7a723058206d2bc553736581b6387f9a0410856ca490fcdc7045a8991ad63a1fd71b651c3a00290000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000013200000000000000000000000000000000000000000000000000000000000000'
const executeInput = '0xd14e62b80000000000000000000000000000000000000000000000000000000000000005'

before(() => {
    senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey

    const sender = caver.klay.accounts.privateKeyToAccount(senderPrvKey)
    senderAddress = sender.address

    password = process.env.password ? process.env.password : 'password'
})

describe('Personal RPC test', () => {
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
        const address = await caver.klay.personal.newAccount(password)
        expect(caver.utils.isAddress(address)).to.be.true
        testAddress = address

        const accounts = await caver.klay.personal.getAccounts()
        expect(acctLength + 1 === accounts.length).to.be.true
    }).timeout(50000)

    // unlockAccount
    it('CAVERJS-UNIT-ETC-080: unlockAccount should return boolean result of unlock(without duration).', async () => {
        const isUnlock = await caver.klay.personal.unlockAccount(testAddress, password)
        expect(typeof isUnlock).to.equals('boolean')
        expect(isUnlock).to.be.true
    }).timeout(50000)

    it('CAVERJS-UNIT-ETC-081: unlockAccount should return boolean result of unlock(with duration).', async () => {
        const isUnlock = await caver.klay.personal.unlockAccount(testAddress, password, 100)
        expect(typeof isUnlock).to.equals('boolean')
        expect(isUnlock).to.be.true
    }).timeout(50000)

    it('CAVERJS-UNIT-ETC-082: unlockAccount should return error with invalid address.', async () => {
        const invalidAddress = 'invalid'
        expect(() => caver.klay.personal.unlockAccount(invalidAddress, password, 100)).to.throws(
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
        const address = await caver.klay.personal.importRawKey(testAccount.privateKey, password)

        expect(address.toLowerCase()).to.equals(testAccount.address.toLowerCase())
    }).timeout(50000)

    it('CAVERJS-UNIT-ETC-085: importRawKey should return address of account(without 0x format).', async () => {
        const testAccount = caver.klay.accounts.create()
        const address = await caver.klay.personal.importRawKey(testAccount.privateKey.slice(2), password)

        expect(address.toLowerCase()).to.equals(testAccount.address.toLowerCase())
    }).timeout(50000)

    it('CAVERJS-UNIT-ETC-086: importRawKey with klaytnWalletKey format.', async () => {
        const testAccount = caver.klay.accounts.create()
        const decoupledAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create(), testAccount.address)
        const klaytnWalletKey = decoupledAccount.getKlaytnWalletKey()

        const address = await caver.klay.personal.importRawKey(klaytnWalletKey, password)

        expect(address.toLowerCase()).to.equals(testAccount.address.toLowerCase())
    }).timeout(50000)

    // sendTransaction
    it('CAVERJS-UNIT-ETC-087: sendTransaction should send a transaction using an account in the node.', async () => {
        try {
            // If account is already existed in node, return error.
            const address = await caver.klay.personal.importRawKey(senderPrvKey, password)
            expect(address.toLowerCase()).to.equals(senderAddress.toLowerCase())
        } catch (e) {}

        const receipt = await caver.klay.personal.sendTransaction(
            {
                from: senderAddress,
                to: caver.klay.accounts.create().address,
                value: 1,
                gas: 900000,
            },
            password
        )
        expect(receipt).not.to.be.null
        expect(receipt.type).to.equals('TxTypeLegacyTransaction')
    }).timeout(50000)

    // signTransaction
    it('CAVERJS-UNIT-ETC-088: signTransaction should send a signed transaction using an account in the node.', async () => {
        const testAccount = caver.klay.accounts.create()
        const address = await caver.klay.personal.importRawKey(testAccount.privateKey, password)
        expect(address.toLowerCase()).to.equals(testAccount.address.toLowerCase())

        const txObj = {
            from: testAccount.address,
            to: '0xd05c5926b0a2f31aadcc9a9cbd3868a50104d834',
            value: '0x1',
            gas: '0xdbba0',
            gasPrice: '0x5d21dba00',
            nonce: '0x9a',
        }
        const signedTx = await caver.klay.personal.signTransaction(txObj, password)
        const signedTxFromCaver = await caver.klay.accounts.signTransaction(txObj, testAccount.privateKey)
        expect(signedTx.raw).to.equals(signedTxFromCaver.rawTransaction)
    }).timeout(50000)

    // sign
    it('CAVERJS-UNIT-ETC-089: sign makes a signature of the data using an account in the node.', async () => {
        const testAccount = caver.klay.accounts.create()
        const address = await caver.klay.personal.importRawKey(testAccount.privateKey, password)
        expect(address.toLowerCase()).to.equals(testAccount.address.toLowerCase())

        const data = '0xdeadbeaf'
        const signedData = await caver.klay.personal.sign(data, testAccount.address, password)
        const signedDataromCaver = await caver.klay.accounts.sign(data, testAccount.privateKey)
        expect(signedData).to.equals(signedDataromCaver.signature)
    }).timeout(50000)

    // ecRecover
    it('CAVERJS-UNIT-ETC-090: ecRecover returns the address from the signature.', async () => {
        const testAccount = caver.klay.accounts.create()
        const address = await caver.klay.personal.importRawKey(testAccount.privateKey, password)
        expect(address.toLowerCase()).to.equals(testAccount.address.toLowerCase())

        const data = '0xdeadbeaf'
        const signedData = await caver.klay.personal.sign(data, testAccount.address, password)
        const recoveredAddress = await caver.klay.personal.ecRecover(data, signedData)
        expect(recoveredAddress.toLowerCase()).to.equals(testAccount.address.toLowerCase())
    }).timeout(50000)

    // replaceRawKey
    it('CAVERJS-UNIT-ETC-091: replaceRawKey should replace the private key of the account.', async () => {
        const testAccount = caver.klay.accounts.create()
        const address = await caver.klay.personal.importRawKey(testAccount.privateKey, password)
        expect(address.toLowerCase()).to.equals(testAccount.address.toLowerCase())

        const data = '0xdeadbeaf'
        const signedData = await caver.klay.personal.sign(data, testAccount.address, password)

        const decoupledAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create(), testAccount.address)
        const klaytnWalletKey = decoupledAccount.getKlaytnWalletKey()
        const updatedAddress = await caver.klay.personal.replaceRawKey(klaytnWalletKey, password, password)
        expect(updatedAddress.toLowerCase()).to.equals(testAccount.address.toLowerCase())

        const signedDataAfterUpdate = await caver.klay.personal.sign(data, testAccount.address, password)
        expect(signedData).not.to.equals(signedDataAfterUpdate)
    }).timeout(50000)

    // sendValueTransfer
    it('CAVERJS-UNIT-ETC-092: sendValueTransfer should send a value transfer transaction using an account in the node.', async () => {
        try {
            // If account is already existed in node, return error.
            const address = await caver.klay.personal.importRawKey(senderPrvKey, password)
            expect(address.toLowerCase()).to.equals(senderAddress.toLowerCase())
        } catch (e) {}

        const receipt = await caver.klay.personal.sendValueTransfer(
            {
                from: senderAddress,
                to: caver.klay.accounts.create().address,
                value: 1,
                gas: 900000,
            },
            password
        )
        expect(receipt).not.to.be.null
        expect(receipt.type).to.equals('TxTypeValueTransfer')
    }).timeout(50000)

    // sendAccountUpdate
    it('CAVERJS-UNIT-ETC-093: sendAccountUpdate should send account update transaction using account in node.', async () => {
        try {
            // If account is already existed in node, return error.
            const address = await caver.klay.personal.importRawKey(senderPrvKey, password)
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
            password
        )

        const addr = await caver.klay.personal.importRawKey(testAccount.privateKey, password)
        expect(addr.toLowerCase()).to.equals(testAccount.address.toLowerCase())

        receipt = await caver.klay.personal.sendAccountUpdate(
            {
                from: testAccount.address,
                gas: 9000000,
                key:
                    '0x04f86f03f86ce301a103501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fce302a10205274ea06b36a35f123400d3d95f3b460aa2ac069749582fd7322f1ff36c063be303a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2d',
            },
            password
        )
        expect(receipt).not.to.be.null
        expect(receipt.type).to.equals('TxTypeAccountUpdate')

        const key = await caver.klay.getAccountKey(testAccount.address)
        expect(key.keyType).to.equals(4)
    }).timeout(50000)

    // sendTransaction ethereumAccessList transaction
    it('CAVERJS-UNIT-ETC-399: sendTransaction should send an ethereumAccessList transaction using an account in the node.', async () => {
        try {
            // If account is already existed in node, return error.
            const address = await caver.klay.personal.importRawKey(senderPrvKey, password)
            expect(address.toLowerCase()).to.equals(senderAddress.toLowerCase())
        } catch (e) {}

        const chainId = await caver.rpc.klay.getChainId()
        // Send KLAY Tx
        let tx = caver.transaction.ethereumAccessList.create({
            from: senderAddress,
            to: caver.klay.accounts.create().address,
            value: 1,
            gas: 900000,
            chainId,
            accessList: [
                {
                    address: caver.klay.accounts.create().address,
                    storageKeys: [
                        '0x0000000000000000000000000000000000000000000000000000000000000003',
                        '0x0000000000000000000000000000000000000000000000000000000000000007',
                    ],
                },
            ],
        })
        let receipt = await caver.klay.personal.sendTransaction(tx, password)
        expect(receipt).not.to.be.null
        expect(receipt.type).to.equals('TxTypeEthereumAccessList')

        // Deploy Smart Contract Tx
        tx = caver.transaction.ethereumAccessList.create({
            from: senderAddress,
            value: 0,
            gas: 1000000,
            chainId,
            accessList: [
                {
                    address: caver.klay.accounts.create().address,
                    storageKeys: [
                        '0x0000000000000000000000000000000000000000000000000000000000000003',
                        '0x0000000000000000000000000000000000000000000000000000000000000007',
                    ],
                },
            ],
            input: byteCode,
        })
        receipt = await caver.klay.personal.sendTransaction(tx, password)
        expect(receipt).not.to.be.null
        expect(receipt.type).to.equals('TxTypeEthereumAccessList')
        expect(receipt.contractAddress).not.to.be.null

        // Execute Smart Contract Tx
        tx = caver.transaction.ethereumAccessList.create({
            from: senderAddress,
            to: receipt.contractAddress,
            value: 0,
            gas: 900000,
            chainId,
            accessList: [
                {
                    address: caver.klay.accounts.create().address,
                    storageKeys: [
                        '0x0000000000000000000000000000000000000000000000000000000000000003',
                        '0x0000000000000000000000000000000000000000000000000000000000000007',
                    ],
                },
            ],
            input: executeInput,
        })
        receipt = await caver.klay.personal.sendTransaction(tx, password)
        expect(receipt).not.to.be.null
        expect(receipt.type).to.equals('TxTypeEthereumAccessList')
        expect(receipt.contractAddress).to.be.null
    }).timeout(50000)

    // signTransaction
    it('CAVERJS-UNIT-ETC-400: signTransaction should send a signed transaction using an account in the node.', async () => {
        const testKeyring = caver.wallet.add(caver.wallet.keyring.generate())
        const address = await caver.klay.personal.importRawKey(testKeyring.key.privateKey, password)
        expect(address.toLowerCase()).to.equals(testKeyring.address.toLowerCase())

        const chainId = await caver.rpc.klay.getChainId()

        // Send KLAY Tx
        let tx = caver.transaction.ethereumAccessList.create({
            from: testKeyring.address,
            to: caver.klay.accounts.create().address,
            value: 1,
            gas: 900000,
            gasPrice: caver.utils.convertToPeb(25, 'ston'),
            chainId,
            accessList: [
                {
                    address: caver.klay.accounts.create().address,
                    storageKeys: [
                        '0x0000000000000000000000000000000000000000000000000000000000000003',
                        '0x0000000000000000000000000000000000000000000000000000000000000007',
                    ],
                },
            ],
        })
        let signedTx = await caver.klay.personal.signTransaction(tx, password)
        let signedTxFromCaver = await caver.wallet.sign(testKeyring.address, tx)
        expect(signedTx.raw).to.equals(signedTxFromCaver.getRLPEncoding())

        // Deploy Smart Contract Tx
        tx = caver.transaction.ethereumAccessList.create({
            from: testKeyring.address,
            value: 0,
            gas: 1000000,
            gasPrice: caver.utils.convertToPeb(25, 'ston'),
            chainId,
            accessList: [
                {
                    address: caver.klay.accounts.create().address,
                    storageKeys: [
                        '0x0000000000000000000000000000000000000000000000000000000000000003',
                        '0x0000000000000000000000000000000000000000000000000000000000000007',
                    ],
                },
            ],
            input: byteCode,
        })
        signedTx = await caver.klay.personal.signTransaction(tx, password)
        signedTxFromCaver = await caver.wallet.sign(testKeyring.address, tx)
        expect(signedTx.raw).to.equals(signedTxFromCaver.getRLPEncoding())

        // Execute Smart Contract Tx
        tx = caver.transaction.ethereumAccessList.create({
            from: testKeyring.address,
            to: caver.wallet.keyring.generate().address,
            value: 0,
            gas: 900000,
            gasPrice: caver.utils.convertToPeb(25, 'ston'),
            chainId,
            accessList: [
                {
                    address: caver.klay.accounts.create().address,
                    storageKeys: [
                        '0x0000000000000000000000000000000000000000000000000000000000000003',
                        '0x0000000000000000000000000000000000000000000000000000000000000007',
                    ],
                },
            ],
            input: executeInput,
        })
        signedTx = await caver.klay.personal.signTransaction(tx, password)
        signedTxFromCaver = await caver.wallet.sign(testKeyring.address, tx)
        expect(signedTx.raw).to.equals(signedTxFromCaver.getRLPEncoding())
    }).timeout(50000)

    // sendTransaction ethereumDynamicFee transaction
    it('CAVERJS-UNIT-ETC-401: sendTransaction should send an ethereumDynamicFee transaction using an account in the node.', async () => {
        try {
            // If account is already existed in node, return error.
            const address = await caver.klay.personal.importRawKey(senderPrvKey, password)
            expect(address.toLowerCase()).to.equals(senderAddress.toLowerCase())
        } catch (e) {}

        const chainId = await caver.rpc.klay.getChainId()

        // Send KLAY Tx
        let tx = caver.transaction.ethereumDynamicFee.create({
            from: senderAddress,
            to: caver.klay.accounts.create().address,
            value: 1,
            gas: 900000,
            chainId,
            maxPriorityFeePerGas: '0x5d21dba00',
            maxFeePerGas: '0x5d21dba00',
            accessList: [
                {
                    address: caver.klay.accounts.create().address,
                    storageKeys: [
                        '0x0000000000000000000000000000000000000000000000000000000000000003',
                        '0x0000000000000000000000000000000000000000000000000000000000000007',
                    ],
                },
            ],
        })
        let receipt = await caver.klay.personal.sendTransaction(tx, password)
        expect(receipt).not.to.be.null
        expect(receipt.type).to.equals('TxTypeEthereumDynamicFee')

        // Deploy Smart Contract Tx
        tx = caver.transaction.ethereumDynamicFee.create({
            from: senderAddress,
            value: 0,
            gas: 1000000,
            chainId,
            maxPriorityFeePerGas: '0x5d21dba00',
            maxFeePerGas: '0x5d21dba00',
            accessList: [
                {
                    address: caver.klay.accounts.create().address,
                    storageKeys: [
                        '0x0000000000000000000000000000000000000000000000000000000000000003',
                        '0x0000000000000000000000000000000000000000000000000000000000000007',
                    ],
                },
            ],
            input: byteCode,
        })
        receipt = await caver.klay.personal.sendTransaction(tx, password)
        expect(receipt).not.to.be.null
        expect(receipt.type).to.equals('TxTypeEthereumDynamicFee')
        expect(receipt.contractAddress).not.to.be.null

        // Execute Smart Contract Tx
        tx = caver.transaction.ethereumDynamicFee.create({
            from: senderAddress,
            to: receipt.contractAddress,
            value: 0,
            gas: 900000,
            chainId,
            maxPriorityFeePerGas: '0x5d21dba00',
            maxFeePerGas: '0x5d21dba00',
            accessList: [
                {
                    address: caver.klay.accounts.create().address,
                    storageKeys: [
                        '0x0000000000000000000000000000000000000000000000000000000000000003',
                        '0x0000000000000000000000000000000000000000000000000000000000000007',
                    ],
                },
            ],
            input: executeInput,
        })
        receipt = await caver.klay.personal.sendTransaction(tx, password)
        expect(receipt).not.to.be.null
        expect(receipt.type).to.equals('TxTypeEthereumDynamicFee')
        expect(receipt.contractAddress).to.be.null
    }).timeout(50000)

    // signTransaction with ethereumDynamicFee transaction
    it('CAVERJS-UNIT-ETC-402: signTransaction should send a signed transaction using an account in the node.', async () => {
        const testKeyring = caver.wallet.add(caver.wallet.keyring.generate())
        const address = await caver.klay.personal.importRawKey(testKeyring.key.privateKey, password)
        expect(address.toLowerCase()).to.equals(testKeyring.address.toLowerCase())

        const chainId = await caver.rpc.klay.getChainId()

        // Send KLAY Tx
        let tx = caver.transaction.ethereumDynamicFee.create({
            from: testKeyring.address,
            to: caver.klay.accounts.create().address,
            value: 1,
            gas: 900000,
            chainId,
            maxPriorityFeePerGas: '0x5d21dba00',
            maxFeePerGas: '0x5d21dba00',
            accessList: [
                {
                    address: caver.klay.accounts.create().address,
                    storageKeys: [
                        '0x0000000000000000000000000000000000000000000000000000000000000003',
                        '0x0000000000000000000000000000000000000000000000000000000000000007',
                    ],
                },
            ],
        })
        let signedTx = await caver.klay.personal.signTransaction(tx, password)
        let signedTxFromCaver = await caver.wallet.sign(testKeyring.address, tx)
        expect(signedTx.raw).to.equals(signedTxFromCaver.getRLPEncoding())

        // Deploy Smart Contract Tx
        tx = caver.transaction.ethereumDynamicFee.create({
            from: testKeyring.address,
            value: 0,
            gas: 1000000,
            chainId,
            maxPriorityFeePerGas: '0x5d21dba00',
            maxFeePerGas: '0x5d21dba00',
            accessList: [
                {
                    address: caver.klay.accounts.create().address,
                    storageKeys: [
                        '0x0000000000000000000000000000000000000000000000000000000000000003',
                        '0x0000000000000000000000000000000000000000000000000000000000000007',
                    ],
                },
            ],
            input: byteCode,
        })
        signedTx = await caver.klay.personal.signTransaction(tx, password)
        signedTxFromCaver = await caver.wallet.sign(testKeyring.address, tx)
        expect(signedTx.raw).to.equals(signedTxFromCaver.getRLPEncoding())

        // Execute Smart Contract Tx
        tx = caver.transaction.ethereumDynamicFee.create({
            from: testKeyring.address,
            to: caver.wallet.keyring.generate().address,
            value: 0,
            gas: 900000,
            chainId,
            maxPriorityFeePerGas: '0x5d21dba00',
            maxFeePerGas: '0x5d21dba00',
            accessList: [
                {
                    address: caver.klay.accounts.create().address,
                    storageKeys: [
                        '0x0000000000000000000000000000000000000000000000000000000000000003',
                        '0x0000000000000000000000000000000000000000000000000000000000000007',
                    ],
                },
            ],
            input: executeInput,
        })
        signedTx = await caver.klay.personal.signTransaction(tx, password)
        signedTxFromCaver = await caver.wallet.sign(testKeyring.address, tx)
        expect(signedTx.raw).to.equals(signedTxFromCaver.getRLPEncoding())
    }).timeout(50000)
})
