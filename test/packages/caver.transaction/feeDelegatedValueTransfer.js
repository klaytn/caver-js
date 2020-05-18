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

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

const RLP = require('eth-lib/lib/rlp')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

const { propertiesForUnnecessary } = require('../utils')

const testRPCURL = require('../../testrpc')
const Caver = require('../../../index.js')
const Keyring = require('../../../packages/caver-wallet/src/keyring/keyring')
const TransactionHasher = require('../../../packages/caver-transaction/src/transactionHasher/transactionHasher')

const { generateRoleBasedKeyring, checkSignature, checkFeePayerSignature } = require('../utils')

const AbstractTransaction = require('../../../packages/caver-transaction/src/transactionTypes/abstractTransaction')

let caver
let sender
let testKeyring
let roleBasedKeyring

const txWithExpectedValues = {}

const sandbox = sinon.createSandbox()

before(() => {
    caver = new Caver(testRPCURL)
    AbstractTransaction._klaytnCall = {
        getGasPrice: () => {},
        getTransactionCount: () => {},
        getChainId: () => {},
    }

    sender = caver.wallet.add(caver.wallet.keyring.generate())
    testKeyring = caver.wallet.add(caver.wallet.keyring.generate())
    roleBasedKeyring = generateRoleBasedKeyring([3, 3, 3])

    txWithExpectedValues.tx = {
        from: '0xa94f5374Fce5edBC8E2a8697C15331677e6EbF0B',
        to: '0x7b65B75d204aBed71587c9E519a89277766EE1d0',
        value: '0xa',
        gas: '0xf4240',
        gasPrice: '0x19',
        chainId: '0x1',
        nonce: 1234,
        signatures: [
            [
                '0x25',
                '0x9f8e49e2ad84b0732984398749956e807e4b526c786af3c5f7416b293e638956',
                '0x6bf88342092f6ff9fabe31739b2ebfa1409707ce54a54693e91a6b9bb77df0e7',
            ],
        ],
        feePayer: '0x5A0043070275d9f6054307Ee7348bD660849D90f',
        feePayerSignatures: [
            [
                '0x26',
                '0xf45cf8d7f88c08e6b6ec0b3b562f34ca94283e4689021987abb6b0772ddfd80a',
                '0x298fe2c5aeabb6a518f4cbb5ff39631a5d88be505d3923374f65fdcf63c2955b',
            ],
        ],
    }
    txWithExpectedValues.rlpEncodingForSigning =
        '0xf839b5f4098204d219830f4240947b65b75d204abed71587c9e519a89277766ee1d00a94a94f5374fce5edbc8e2a8697c15331677e6ebf0b018080'
    txWithExpectedValues.rlpEncodingForFeePayerSigning =
        '0xf84eb5f4098204d219830f4240947b65b75d204abed71587c9e519a89277766ee1d00a94a94f5374fce5edbc8e2a8697c15331677e6ebf0b945a0043070275d9f6054307ee7348bd660849d90f018080'
    txWithExpectedValues.senderTxHash = '0x40f8c94e01e07eb5353f6cd4cd3eabd5893215dd53a50ba4b8ff9a447ac51731'
    txWithExpectedValues.transactionHash = '0xe1e07f9971153499fc8c7bafcdaf7abc20b37aa4c18fb1e53a9bfcc259e3644c'
    txWithExpectedValues.rlpEncoding =
        '0x09f8d68204d219830f4240947b65b75d204abed71587c9e519a89277766ee1d00a94a94f5374fce5edbc8e2a8697c15331677e6ebf0bf845f84325a09f8e49e2ad84b0732984398749956e807e4b526c786af3c5f7416b293e638956a06bf88342092f6ff9fabe31739b2ebfa1409707ce54a54693e91a6b9bb77df0e7945a0043070275d9f6054307ee7348bd660849d90ff845f84326a0f45cf8d7f88c08e6b6ec0b3b562f34ca94283e4689021987abb6b0772ddfd80aa0298fe2c5aeabb6a518f4cbb5ff39631a5d88be505d3923374f65fdcf63c2955b'
})

describe('TxTypeFeeDelegatedValueTransfer', () => {
    let transactionObj
    let getGasPriceSpy
    let getNonceSpy
    let getChainIdSpy
    beforeEach(() => {
        transactionObj = {
            from: sender.address,
            to: testKeyring.address,
            value: 1,
            gas: '0x3b9ac9ff',
        }

        getGasPriceSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getGasPrice')
        getGasPriceSpy.returns('0x5d21dba00')
        getNonceSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionCount')
        getNonceSpy.returns('0x3a')
        getChainIdSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getChainId')
        getChainIdSpy.returns('0x7e3')
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('create feeDelegatedValueTransfer instance', () => {
        it('CAVERJS-UNIT-TRANSACTION-390: If feeDelegatedValueTransfer not define from, return error', () => {
            delete transactionObj.from

            const expectedError = '"from" is missing'
            expect(() => new caver.transaction.feeDelegatedValueTransfer(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-391: If feeDelegatedValueTransfer not define to, return error', () => {
            delete transactionObj.to

            const expectedError = '"to" is missing'
            expect(() => new caver.transaction.feeDelegatedValueTransfer(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-392: If feeDelegatedValueTransfer not define value, return error', () => {
            delete transactionObj.value

            const expectedError = '"value" is missing'
            expect(() => new caver.transaction.feeDelegatedValueTransfer(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-393: If feeDelegatedValueTransfer not define gas, return error', () => {
            delete transactionObj.gas

            const expectedError = '"gas" is missing'
            expect(() => new caver.transaction.feeDelegatedValueTransfer(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-394: If feeDelegatedValueTransfer define from property with invalid address, return error', () => {
            transactionObj.from = 'invalid'

            const expectedError = `Invalid address of from: ${transactionObj.from}`
            expect(() => new caver.transaction.feeDelegatedValueTransfer(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-395: If feeDelegatedValueTransfer define feePayer property with invalid address, return error', () => {
            transactionObj.feePayer = 'invalid'

            const expectedError = `Invalid address of fee payer: ${transactionObj.feePayer}`
            expect(() => new caver.transaction.feeDelegatedValueTransfer(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-396: If feeDelegatedValueTransfer define to property with invalid address, return error', () => {
            transactionObj.to = 'invalid address'

            const expectedError = `Invalid address of to: ${transactionObj.to}`
            expect(() => new caver.transaction.feeDelegatedValueTransfer(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-397: If feeDelegatedValueTransfer define feePayerSignatures property without feePayer, return error', () => {
            transactionObj.feePayerSignatures = [
                [
                    '0x26',
                    '0xf45cf8d7f88c08e6b6ec0b3b562f34ca94283e4689021987abb6b0772ddfd80a',
                    '0x298fe2c5aeabb6a518f4cbb5ff39631a5d88be505d3923374f65fdcf63c2955b',
                ],
            ]

            const expectedError = '"feePayer" is missing: feePayer must be defined with feePayerSignatures.'
            expect(() => new caver.transaction.feeDelegatedValueTransfer(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-398: If feeDelegatedValueTransfer define unnecessary property, return error', () => {
            const unnecessaries = [
                propertiesForUnnecessary.data,
                propertiesForUnnecessary.input,
                propertiesForUnnecessary.codeFormat,
                propertiesForUnnecessary.failKey,
                propertiesForUnnecessary.feeRatio,
                propertiesForUnnecessary.account,
                propertiesForUnnecessary.key,
                propertiesForUnnecessary.legacyKey,
                propertiesForUnnecessary.publicKey,
                propertiesForUnnecessary.failKey,
                propertiesForUnnecessary.multisig,
                propertiesForUnnecessary.roleTransactionKey,
                propertiesForUnnecessary.roleAccountUpdateKey,
                propertiesForUnnecessary.roleFeePayerKey,
                propertiesForUnnecessary.humanReadable,
            ]

            for (let i = 0; i < unnecessaries.length; i++) {
                if (i > 0) delete transactionObj[unnecessaries[i - 1].name]
                transactionObj[unnecessaries[i].name] = unnecessaries[i].value

                const expectedError = `"${unnecessaries[i].name}" cannot be used with ${caver.transaction.type.TxTypeFeeDelegatedValueTransfer} transaction`
                // eslint-disable-next-line no-loop-func
                expect(() => new caver.transaction.feeDelegatedValueTransfer(transactionObj)).to.throw(expectedError)
            }
        })
    })

    context('feeDelegatedValueTransfer.getRLPEncoding', () => {
        it('CAVERJS-UNIT-TRANSACTION-399: Returns RLP-encoded string', () => {
            const tx = new caver.transaction.feeDelegatedValueTransfer(txWithExpectedValues.tx)

            expect(tx.getRLPEncoding()).to.equal(txWithExpectedValues.rlpEncoding)
        })

        it('CAVERJS-UNIT-TRANSACTION-400: getRLPEncoding should throw error when nonce is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.gasPrice = '0x5d21dba00'
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-401: getRLPEncoding should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-402: getRLPEncoding should throw error when chainId is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })
    })

    context('feeDelegatedValueTransfer.signWithKey', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeySpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            createFromPrivateKeySpy = sandbox.spy(Keyring, 'createFromPrivateKey')
            senderSignWithKeySpy = sandbox.spy(sender, 'signWithKey')
            appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            hasherSpy = sandbox.stub(TransactionHasher, 'getHashForSignature')
            hasherSpy.returns(txHash)
        })

        afterEach(() => {
            sandbox.restore()
        })

        function checkFunctionCall(customHasher = false) {
            expect(fillTransactionSpy).to.have.been.calledOnce
            expect(appendSignaturesSpy).to.have.been.calledOnce
            if (!customHasher) expect(hasherSpy).to.have.been.calledWith(tx)
        }

        it('CAVERJS-UNIT-TRANSACTION-403: input: keyring. should sign transaction.', async () => {
            await tx.signWithKey(sender)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeySpy).to.have.been.calledWith(txHash, '0x7e3', 0, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-404: input: private key string. should sign transaction.', async () => {
            const signWithKeyProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKey')
            await tx.signWithKey(sender.keys[0][0].privateKey)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeyProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-405: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signWithKeyProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKey')
            await tx.signWithKey(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeyProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-406: input: keyring, index. should sign transaction with specific index.', async () => {
            const roleBasedSignWithKeySpy = sandbox.spy(roleBasedKeyring, 'signWithKey')

            tx.from = roleBasedKeyring.address

            await tx.signWithKey(roleBasedKeyring, 1)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeySpy).to.have.been.calledWith(txHash, '0x7e3', 0, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-407: input: keyring, custom hasher. should throw error.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            const expectedError = `In order to pass a custom hasher, use the third parameter.`
            await expect(tx.signWithKey(sender, customHasher)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-408: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            const roleBasedSignWithKeySpy = sandbox.spy(roleBasedKeyring, 'signWithKey')

            tx.from = roleBasedKeyring.address

            await tx.signWithKey(roleBasedKeyring, 1, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeySpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-409: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signWithKey(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-410: input: rolebased keyring, index out of range. should throw error.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
            await expect(tx.signWithKey(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('feeDelegatedValueTransfer.signFeePayerWithKey', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeySpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)
            tx.feePayer = sender.address

            fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            createFromPrivateKeySpy = sandbox.spy(Keyring, 'createFromPrivateKey')
            senderSignWithKeySpy = sandbox.spy(sender, 'signWithKey')
            appendSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            hasherSpy = sandbox.stub(TransactionHasher, 'getHashForFeePayerSignature')
            hasherSpy.returns(txHash)
        })

        afterEach(() => {
            sandbox.restore()
        })

        function checkFunctionCall(customHasher = false) {
            expect(fillTransactionSpy).to.have.been.calledOnce
            expect(appendSignaturesSpy).to.have.been.calledOnce
            if (!customHasher) expect(hasherSpy).to.have.been.calledWith(tx)
        }

        it('CAVERJS-UNIT-TRANSACTION-411: input: keyring. If feePayer is not defined, should be set with keyring address.', async () => {
            tx.feePayer = '0x'
            await tx.signFeePayerWithKey(sender)

            expect(tx.feePayer.toLowerCase()).to.equal(sender.address.toLowerCase())
            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeySpy).to.have.been.calledWith(txHash, '0x7e3', 2, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-412: input: keyring. should sign transaction.', async () => {
            await tx.signFeePayerWithKey(sender)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeySpy).to.have.been.calledWith(txHash, '0x7e3', 2, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-413: input: private key string. should sign transaction.', async () => {
            const signWithKeyProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKey')
            await tx.signFeePayerWithKey(sender.keys[0][0].privateKey)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeyProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-414: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signWithKeyProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKey')
            await tx.signFeePayerWithKey(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeyProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-145: input: keyring, index. should sign transaction with specific index.', async () => {
            const roleBasedSignWithKeySpy = sandbox.spy(roleBasedKeyring, 'signWithKey')

            tx.feePayer = roleBasedKeyring.address

            await tx.signFeePayerWithKey(roleBasedKeyring, 1)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeySpy).to.have.been.calledWith(txHash, '0x7e3', 2, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-416: input: keyring, custom hasher. should throw error.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            const expectedError = `In order to pass a custom hasher, use the third parameter.`
            await expect(tx.signFeePayerWithKey(sender, customHasher)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-417: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            const roleBasedSignWithKeySpy = sandbox.spy(roleBasedKeyring, 'signWithKey')

            tx.feePayer = roleBasedKeyring.address

            await tx.signFeePayerWithKey(roleBasedKeyring, 1, customHasher)

            checkFunctionCall(true)
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeySpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 2, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-418: input: keyring. should throw error when feePayer is different.', async () => {
            tx.feePayer = roleBasedKeyring.address

            const expectedError = `The feePayer address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signFeePayerWithKey(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-419: input: rolebased keyring, index out of range. should throw error.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
            await expect(tx.signFeePayerWithKey(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('feeDelegatedValueTransfer.signWithKeys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeysSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            createFromPrivateKeySpy = sandbox.spy(Keyring, 'createFromPrivateKey')
            senderSignWithKeysSpy = sandbox.spy(sender, 'signWithKeys')
            appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            hasherSpy = sandbox.stub(TransactionHasher, 'getHashForSignature')
            hasherSpy.returns(txHash)
        })

        afterEach(() => {
            sandbox.restore()
        })

        function checkFunctionCall(customHasher = false) {
            expect(fillTransactionSpy).to.have.been.calledOnce
            expect(appendSignaturesSpy).to.have.been.calledOnce
            if (!customHasher) expect(hasherSpy).to.have.been.calledWith(tx)
        }

        it('CAVERJS-UNIT-TRANSACTION-420: input: keyring. should sign transaction.', async () => {
            await tx.signWithKeys(sender)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-421: input: private key string. should sign transaction.', async () => {
            const signWithKeysProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKeys')
            await tx.signWithKeys(sender.keys[0][0].privateKey)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeysProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-422: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signWithKeysProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKeys')
            await tx.signWithKeys(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeysProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-423: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.signWithKeys(sender, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-424: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signWithKeys(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-425: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'signWithKeys')

            tx.from = roleBasedKeyring.address

            await tx.signWithKeys(roleBasedKeyring)

            checkFunctionCall(true)
            checkSignature(tx, { expectedLength: roleBasedKeyring.keys[0].length })
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)
    })

    context('feeDelegatedValueTransfer.signFeePayerWithKeys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeysSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            createFromPrivateKeySpy = sandbox.spy(Keyring, 'createFromPrivateKey')
            senderSignWithKeysSpy = sandbox.spy(sender, 'signWithKeys')
            appendSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            hasherSpy = sandbox.stub(TransactionHasher, 'getHashForFeePayerSignature')
            hasherSpy.returns(txHash)
        })

        afterEach(() => {
            sandbox.restore()
        })

        function checkFunctionCall(customHasher = false) {
            expect(fillTransactionSpy).to.have.been.calledOnce
            expect(appendSignaturesSpy).to.have.been.calledOnce
            if (!customHasher) expect(hasherSpy).to.have.been.calledWith(tx)
        }

        it('CAVERJS-UNIT-TRANSACTION-426: input: keyring. If feePayer is not defined, should be set with keyring address.', async () => {
            tx.feePayer = '0x'
            await tx.signFeePayerWithKeys(sender)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-427: input: keyring. should sign transaction.', async () => {
            await tx.signFeePayerWithKeys(sender)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-428: input: private key string. should sign transaction.', async () => {
            const signWithKeysProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKeys')
            await tx.signFeePayerWithKeys(sender.keys[0][0].privateKey)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeysProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-429: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signWithKeysProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKeys')
            await tx.signFeePayerWithKeys(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeysProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-430: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.signFeePayerWithKeys(sender, customHasher)

            checkFunctionCall(true)
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-431: input: keyring. should throw error when feePayer is different.', async () => {
            tx.feePayer = roleBasedKeyring.address

            const expectedError = `The feePayer address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signFeePayerWithKeys(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-432: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'signWithKeys')

            tx.feePayer = roleBasedKeyring.address

            await tx.signFeePayerWithKeys(roleBasedKeyring)

            checkFunctionCall(true)
            checkFeePayerSignature(tx, { expectedLength: roleBasedKeyring.keys[2].length })
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)
    })

    context('feeDelegatedValueTransfer.appendSignatures', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-433: If signatures is empty, appendSignatures append signatures in transaction', () => {
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            tx.appendSignatures(sig)
            checkSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTION-434: If signatures is empty, appendSignatures append signatures with two-dimensional signature array', () => {
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const sig = [
                [
                    '0x0fea',
                    '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                    '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                ],
            ]
            tx.appendSignatures(sig)
            checkSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTION-435: If signatures is not empty, appendSignatures should append signatures', () => {
            transactionObj.signatures = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const sig = [
                '0x0fea',
                '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
            ]

            tx.appendSignatures(sig)
            checkSignature(tx, { expectedLength: 2 })
        })

        it('CAVERJS-UNIT-TRANSACTION-436: appendSignatures should append multiple signatures', () => {
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const sig = [
                [
                    '0x0fea',
                    '0xbde66cceed35a576010966338b7ded961f2c160c96f928e193b47aaf4480aa07',
                    '0x546eb193ec138523b7fd34c4f12a1a04d0f74470e8f3bbe91ce0b4ec16e7f0d2',
                ],
                [
                    '0x0fea',
                    '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                    '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                ],
            ]

            tx.appendSignatures(sig)
            checkSignature(tx, { expectedLength: 2 })
        })
    })

    context('feeDelegatedValueTransfer.appendFeePayerSignatures', () => {
        beforeEach(() => {
            transactionObj.feePayer = '0x90b3e9a3770481345a7f17f22f16d020bccfd33e'
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-437: If feePayerSignatures is empty, appendFeePayerSignatures append feePayerSignatures in transaction', () => {
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            tx.appendFeePayerSignatures(sig)
            checkFeePayerSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTION-438: If feePayerSignatures is empty, appendFeePayerSignatures append feePayerSignatures with two-dimensional signature array', () => {
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const sig = [
                [
                    '0x0fea',
                    '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                    '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                ],
            ]
            tx.appendFeePayerSignatures(sig)
            checkFeePayerSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTION-439: If feePayerSignatures is not empty, appendFeePayerSignatures should append feePayerSignatures', () => {
            transactionObj.feePayerSignatures = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const sig = [
                '0x0fea',
                '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
            ]

            tx.appendFeePayerSignatures(sig)
            checkFeePayerSignature(tx, { expectedLength: 2 })
        })

        it('CAVERJS-UNIT-TRANSACTION-440: appendFeePayerSignatures should append multiple feePayerSignatures', () => {
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const sig = [
                [
                    '0x0fea',
                    '0xbde66cceed35a576010966338b7ded961f2c160c96f928e193b47aaf4480aa07',
                    '0x546eb193ec138523b7fd34c4f12a1a04d0f74470e8f3bbe91ce0b4ec16e7f0d2',
                ],
                [
                    '0x0fea',
                    '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                    '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                ],
            ]

            tx.appendFeePayerSignatures(sig)
            checkFeePayerSignature(tx, { expectedLength: 2 })
        })
    })

    context('feeDelegatedValueTransfer.combineSignatures', () => {
        beforeEach(() => {
            transactionObj = {
                from: '0x04bb86a1b16113ebe8f57071f839b002cbcbf7d0',
                to: '0x7b65b75d204abed71587c9e519a89277766ee1d0',
                value: '0xa',
                gas: '0xf4240',
                nonce: '0x1',
                gasPrice: '0x5d21dba00',
                chainId: '0x7e3',
            }
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-441: combineSignatures combines single signature and sets signatures in transaction', () => {
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x09f885018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9404bb86a1b16113ebe8f57071f839b002cbcbf7d0f847f845820feaa068e56f3da7fbe7a86543eb4b244ddbcb13b2d1cb9adb3ee8a4c8b046821bc492a068c29c057055f68a7860b54184bba7967bcf42b6aae12beaf9f30933e6e730c280c4c3018080'
            const combined = tx.combineSignatures([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fea',
                    '0x68e56f3da7fbe7a86543eb4b244ddbcb13b2d1cb9adb3ee8a4c8b046821bc492',
                    '0x68c29c057055f68a7860b54184bba7967bcf42b6aae12beaf9f30933e6e730c2',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTION-442: combineSignatures combines multiple signatures and sets signatures in transaction', () => {
            transactionObj.signatures = [
                [
                    '0x0fea',
                    '0x68e56f3da7fbe7a86543eb4b244ddbcb13b2d1cb9adb3ee8a4c8b046821bc492',
                    '0x68c29c057055f68a7860b54184bba7967bcf42b6aae12beaf9f30933e6e730c2',
                ],
            ]
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const rlpEncodedStrings = [
                '0x09f885018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9404bb86a1b16113ebe8f57071f839b002cbcbf7d0f847f845820feaa007337912a1855c1b3ca511eb44099350590e54aa611069058a9b739945ad97eaa037dfa221d29bc6d418ade23456de937993885b77cde5bc265739f278deebbc3980c4c3018080',
                '0x09f885018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9404bb86a1b16113ebe8f57071f839b002cbcbf7d0f847f845820fe9a0799f833aa487296b11988650c9a63dc2a850715de4a29c8ab2b7c648718205a6a005a5fbad245cceccb4c08dd4a1cc6e26dc4fda06d0f49b248f83329623e3bee880c4c3018080',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignatures(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x09f90113018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9404bb86a1b16113ebe8f57071f839b002cbcbf7d0f8d5f845820feaa068e56f3da7fbe7a86543eb4b244ddbcb13b2d1cb9adb3ee8a4c8b046821bc492a068c29c057055f68a7860b54184bba7967bcf42b6aae12beaf9f30933e6e730c2f845820feaa007337912a1855c1b3ca511eb44099350590e54aa611069058a9b739945ad97eaa037dfa221d29bc6d418ade23456de937993885b77cde5bc265739f278deebbc39f845820fe9a0799f833aa487296b11988650c9a63dc2a850715de4a29c8ab2b7c648718205a6a005a5fbad245cceccb4c08dd4a1cc6e26dc4fda06d0f49b248f83329623e3bee880c4c3018080'

            const expectedSignatures = [
                [
                    '0x0fea',
                    '0x68e56f3da7fbe7a86543eb4b244ddbcb13b2d1cb9adb3ee8a4c8b046821bc492',
                    '0x68c29c057055f68a7860b54184bba7967bcf42b6aae12beaf9f30933e6e730c2',
                ],
                [
                    '0x0fea',
                    '0x07337912a1855c1b3ca511eb44099350590e54aa611069058a9b739945ad97ea',
                    '0x37dfa221d29bc6d418ade23456de937993885b77cde5bc265739f278deebbc39',
                ],
                [
                    '0x0fe9',
                    '0x799f833aa487296b11988650c9a63dc2a850715de4a29c8ab2b7c648718205a6',
                    '0x05a5fbad245cceccb4c08dd4a1cc6e26dc4fda06d0f49b248f83329623e3bee8',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTION-443: combineSignatures combines single feePayerSignature and sets feePayerSignatures in transaction', () => {
            transactionObj.feePayer = '0xb85f01a3b0b6aaa2e487c9ed541e27b75b3eba95'
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x09f899018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9404bb86a1b16113ebe8f57071f839b002cbcbf7d0c4c301808094b85f01a3b0b6aaa2e487c9ed541e27b75b3eba95f847f845820fe9a0388a4beb8a27fe3c3631eb66278f0a756da13562af5fa1c33345eccf742555dda065b829314f8e91f2ee0266d4f4936d3f3bdc7ef1364a931a068742834c2519f2'
            const combined = tx.combineSignatures([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0x388a4beb8a27fe3c3631eb66278f0a756da13562af5fa1c33345eccf742555dd',
                    '0x65b829314f8e91f2ee0266d4f4936d3f3bdc7ef1364a931a068742834c2519f2',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkFeePayerSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTION-444: combineSignatures combines multiple feePayerSignatures and sets feePayerSignatures in transaction', () => {
            transactionObj.feePayer = '0xb85f01a3b0b6aaa2e487c9ed541e27b75b3eba95'
            transactionObj.feePayerSignatures = [
                [
                    '0x0fe9',
                    '0x388a4beb8a27fe3c3631eb66278f0a756da13562af5fa1c33345eccf742555dd',
                    '0x65b829314f8e91f2ee0266d4f4936d3f3bdc7ef1364a931a068742834c2519f2',
                ],
            ]
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const rlpEncodedStrings = [
                '0x09f899018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9404bb86a1b16113ebe8f57071f839b002cbcbf7d0c4c301808094b85f01a3b0b6aaa2e487c9ed541e27b75b3eba95f847f845820fe9a00585c73b60072ebb22bcc38b08e318dc88fc074435c3fa5d345219f1962098b7a06adcc5a1bc49d1c465412628bf8782aa8254af7fae8763d834a3f1711b22474a',
                '0x09f899018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9404bb86a1b16113ebe8f57071f839b002cbcbf7d0c4c301808094b85f01a3b0b6aaa2e487c9ed541e27b75b3eba95f847f845820feaa0d432bdce799828530d89d14b4406ccb0446852a51f13e365123eac9375d7e629a04f73deb5343ff7d587a5affb14196a79c522b9a67c7d895762c6758258ac247b',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignatures(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x09f90127018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9404bb86a1b16113ebe8f57071f839b002cbcbf7d0c4c301808094b85f01a3b0b6aaa2e487c9ed541e27b75b3eba95f8d5f845820fe9a0388a4beb8a27fe3c3631eb66278f0a756da13562af5fa1c33345eccf742555dda065b829314f8e91f2ee0266d4f4936d3f3bdc7ef1364a931a068742834c2519f2f845820fe9a00585c73b60072ebb22bcc38b08e318dc88fc074435c3fa5d345219f1962098b7a06adcc5a1bc49d1c465412628bf8782aa8254af7fae8763d834a3f1711b22474af845820feaa0d432bdce799828530d89d14b4406ccb0446852a51f13e365123eac9375d7e629a04f73deb5343ff7d587a5affb14196a79c522b9a67c7d895762c6758258ac247b'

            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0x388a4beb8a27fe3c3631eb66278f0a756da13562af5fa1c33345eccf742555dd',
                    '0x65b829314f8e91f2ee0266d4f4936d3f3bdc7ef1364a931a068742834c2519f2',
                ],
                [
                    '0x0fe9',
                    '0x0585c73b60072ebb22bcc38b08e318dc88fc074435c3fa5d345219f1962098b7',
                    '0x6adcc5a1bc49d1c465412628bf8782aa8254af7fae8763d834a3f1711b22474a',
                ],
                [
                    '0x0fea',
                    '0xd432bdce799828530d89d14b4406ccb0446852a51f13e365123eac9375d7e629',
                    '0x4f73deb5343ff7d587a5affb14196a79c522b9a67c7d895762c6758258ac247b',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkFeePayerSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTION-445: combineSignatures combines multiple signatures and feePayerSignatures', () => {
            let tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            // RLP encoding with only signatures
            const rlpEncodedStrings = [
                '0x09f90113018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9404bb86a1b16113ebe8f57071f839b002cbcbf7d0f8d5f845820feaa068e56f3da7fbe7a86543eb4b244ddbcb13b2d1cb9adb3ee8a4c8b046821bc492a068c29c057055f68a7860b54184bba7967bcf42b6aae12beaf9f30933e6e730c2f845820feaa007337912a1855c1b3ca511eb44099350590e54aa611069058a9b739945ad97eaa037dfa221d29bc6d418ade23456de937993885b77cde5bc265739f278deebbc39f845820fe9a0799f833aa487296b11988650c9a63dc2a850715de4a29c8ab2b7c648718205a6a005a5fbad245cceccb4c08dd4a1cc6e26dc4fda06d0f49b248f83329623e3bee880c4c3018080',
            ]
            const expectedSignatures = [
                [
                    '0x0fea',
                    '0x68e56f3da7fbe7a86543eb4b244ddbcb13b2d1cb9adb3ee8a4c8b046821bc492',
                    '0x68c29c057055f68a7860b54184bba7967bcf42b6aae12beaf9f30933e6e730c2',
                ],
                [
                    '0x0fea',
                    '0x07337912a1855c1b3ca511eb44099350590e54aa611069058a9b739945ad97ea',
                    '0x37dfa221d29bc6d418ade23456de937993885b77cde5bc265739f278deebbc39',
                ],
                [
                    '0x0fe9',
                    '0x799f833aa487296b11988650c9a63dc2a850715de4a29c8ab2b7c648718205a6',
                    '0x05a5fbad245cceccb4c08dd4a1cc6e26dc4fda06d0f49b248f83329623e3bee8',
                ],
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            let combined = tx.combineSignatures(rlpEncodedStrings)
            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)

            const rlpEncodedStringsWithFeePayerSignatures = [
                '0x09f90127018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9404bb86a1b16113ebe8f57071f839b002cbcbf7d0c4c301808094b85f01a3b0b6aaa2e487c9ed541e27b75b3eba95f8d5f845820fe9a0388a4beb8a27fe3c3631eb66278f0a756da13562af5fa1c33345eccf742555dda065b829314f8e91f2ee0266d4f4936d3f3bdc7ef1364a931a068742834c2519f2f845820fe9a00585c73b60072ebb22bcc38b08e318dc88fc074435c3fa5d345219f1962098b7a06adcc5a1bc49d1c465412628bf8782aa8254af7fae8763d834a3f1711b22474af845820feaa0d432bdce799828530d89d14b4406ccb0446852a51f13e365123eac9375d7e629a04f73deb5343ff7d587a5affb14196a79c522b9a67c7d895762c6758258ac247b',
            ]
            const expectedFeePayerSignatures = [
                [
                    '0x0fe9',
                    '0x388a4beb8a27fe3c3631eb66278f0a756da13562af5fa1c33345eccf742555dd',
                    '0x65b829314f8e91f2ee0266d4f4936d3f3bdc7ef1364a931a068742834c2519f2',
                ],
                [
                    '0x0fe9',
                    '0x0585c73b60072ebb22bcc38b08e318dc88fc074435c3fa5d345219f1962098b7',
                    '0x6adcc5a1bc49d1c465412628bf8782aa8254af7fae8763d834a3f1711b22474a',
                ],
                [
                    '0x0fea',
                    '0xd432bdce799828530d89d14b4406ccb0446852a51f13e365123eac9375d7e629',
                    '0x4f73deb5343ff7d587a5affb14196a79c522b9a67c7d895762c6758258ac247b',
                ],
            ]

            const appendFeePayerSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            combined = tx.combineSignatures(rlpEncodedStrings)
            expect(appendFeePayerSignaturesSpy).to.have.been.callCount(rlpEncodedStringsWithFeePayerSignatures.length)

            // combine multiple signatures and feePayerSignatures
            tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)
            const combinedWithMultiple = tx.combineSignatures([combined])

            expect(combined).to.equal(combinedWithMultiple)
            checkSignature(tx, { expectedSignatures })
            checkFeePayerSignature(tx, { expectedFeePayerSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTION-446: If decode transaction has different values, combineSignatures should throw error', () => {
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)
            tx.value = 10000

            const rlpEncoded =
                '0x09f899018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9404bb86a1b16113ebe8f57071f839b002cbcbf7d0c4c301808094b85f01a3b0b6aaa2e487c9ed541e27b75b3eba95f847f845820feaa0d432bdce799828530d89d14b4406ccb0446852a51f13e365123eac9375d7e629a04f73deb5343ff7d587a5affb14196a79c522b9a67c7d895762c6758258ac247b'
            const expectedError = `Transactions containing different information cannot be combined.`

            expect(() => tx.combineSignatures([rlpEncoded])).to.throw(expectedError)
        })
    })

    context('feeDelegatedValueTransfer.getRawTransaction', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-447: getRawTransaction should call getRLPEncoding function', () => {
            const tx = new caver.transaction.feeDelegatedValueTransfer(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rawTransaction = tx.getRawTransaction()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(rawTransaction).to.equal(txWithExpectedValues.rlpEncoding)
        })
    })

    context('feeDelegatedValueTransfer.getTransactionHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-448: getTransactionHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = new caver.transaction.feeDelegatedValueTransfer(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const txHash = tx.getTransactionHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(txHash).to.equal(txWithExpectedValues.transactionHash)
            expect(caver.utils.isValidHashStrict(txHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTION-449: getTransactionHash should throw error when nonce is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.gasPrice = '0x5d21dba00'
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-450: getTransactionHash should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-451: getTransactionHash should throw error when chainId is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })
    })

    context('feeDelegatedValueTransfer.getSenderTxHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-452: getSenderTxHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = new caver.transaction.feeDelegatedValueTransfer(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const senderTxHash = tx.getSenderTxHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(senderTxHash).to.equal(txWithExpectedValues.senderTxHash)
            expect(caver.utils.isValidHashStrict(senderTxHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTION-453: getSenderTxHash should throw error when nonce is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.gasPrice = '0x5d21dba00'
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-454: getSenderTxHash should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-455: getSenderTxHash should throw error when chainId is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })
    })

    context('feeDelegatedValueTransfer.getRLPEncodingForSignature', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-456: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = new caver.transaction.feeDelegatedValueTransfer(txWithExpectedValues.tx)

            const commonRLPForSigningSpy = sandbox.spy(tx, 'getCommonRLPEncodingForSignature')

            const rlpEncodingForSign = tx.getRLPEncodingForSignature()

            expect(rlpEncodingForSign).to.equal(txWithExpectedValues.rlpEncodingForSigning)
            expect(commonRLPForSigningSpy).to.have.been.calledOnce
        })

        it('CAVERJS-UNIT-TRANSACTION-457: getRLPEncodingForSignature should throw error when nonce is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-458: getRLPEncodingForSignature should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-459: getRLPEncodingForSignature should throw error when chainId is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })
    })

    context('feeDelegatedValueTransfer.getCommonRLPEncodingForSignature', () => {
        it('CAVERJS-UNIT-TRANSACTION-460: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = new caver.transaction.feeDelegatedValueTransfer(txWithExpectedValues.tx)

            const commonRLPForSign = tx.getCommonRLPEncodingForSignature()
            const decoded = RLP.decode(txWithExpectedValues.rlpEncodingForSigning)

            expect(commonRLPForSign).to.equal(decoded[0])
        })
    })

    context('feeDelegatedValueTransfer.fillTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTION-461: fillTransaction should call klay_getGasPrice to fill gasPrice when gasPrice is undefined', async () => {
            transactionObj.nonce = '0x3a'
            transactionObj.chainId = 2019
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-462: fillTransaction should call klay_getTransactionCount to fill nonce when nonce is undefined', async () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-463: fillTransaction should call klay_getChainid to fill chainId when chainId is undefined', async () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransfer(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).to.have.been.calledOnce
        }).timeout(200000)
    })
})
