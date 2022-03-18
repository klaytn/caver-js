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
const Caver = require('../../../index')
const Keyring = require('../../../packages/caver-wallet/src/keyring/keyringFactory')
const SingleKeyring = require('../../../packages/caver-wallet/src/keyring/singleKeyring')
const TransactionHasher = require('../../../packages/caver-transaction/src/transactionHasher/transactionHasher')

const { generateRoleBasedKeyring, checkSignature, checkFeePayerSignature } = require('../utils')

let caver
let sender
let roleBasedKeyring

const txWithExpectedValues = {}

const sandbox = sinon.createSandbox()
const input = '0x6353586b000000000000000000000000bc5951f055a85f41a3b62fd6f68ab7de76d299b2'

before(() => {
    caver = new Caver(testRPCURL)

    sender = caver.wallet.add(caver.wallet.keyring.generate())
    roleBasedKeyring = generateRoleBasedKeyring([3, 3, 3])

    txWithExpectedValues.tx = {
        from: '0xa94f5374Fce5edBC8E2a8697C15331677e6EbF0B',
        to: '0x7b65B75d204aBed71587c9E519a89277766EE1d0',
        value: '0xa',
        input,
        gas: '0xf4240',
        gasPrice: '0x19',
        chainId: '0x1',
        nonce: 1234,
        signatures: [
            [
                '0x25',
                '0x253aea7d2c37160da45e84afbb45f6b3341cf1e8fc2df4ecc78f14adb512dc4f',
                '0x22465b74015c2a8f8501186bb5e200e6ce44be52e9374615a7e7e21c41bc27b5',
            ],
        ],
        feePayer: '0x5A0043070275d9f6054307Ee7348bD660849D90f',
        feePayerSignatures: [
            [
                '0x26',
                '0xe7c51db7b922c6fa2a941c9687884c593b1b13076bdf0c473538d826bf7b9d1a',
                '0x5b0de2aabb84b66db8bf52d62f3d3b71b592e3748455630f1504c20073624d80',
            ],
        ],
    }
    txWithExpectedValues.rlpEncodingForSigning =
        '0xf860b85bf859318204d219830f4240947b65b75d204abed71587c9e519a89277766ee1d00a94a94f5374fce5edbc8e2a8697c15331677e6ebf0ba46353586b000000000000000000000000bc5951f055a85f41a3b62fd6f68ab7de76d299b2018080'
    txWithExpectedValues.rlpEncodingForFeePayerSigning =
        '0xf875b85bf859318204d219830f4240947b65b75d204abed71587c9e519a89277766ee1d00a94a94f5374fce5edbc8e2a8697c15331677e6ebf0ba46353586b000000000000000000000000bc5951f055a85f41a3b62fd6f68ab7de76d299b2945a0043070275d9f6054307ee7348bd660849d90f018080'
    txWithExpectedValues.senderTxHash = '0x3cd3380f4206943422d5d5b218dd66d03d60d19a109f9929ea12b52a230257cb'
    txWithExpectedValues.transactionHash = '0xef46f28c54b3d90a183e26f406ca1d5cc2b6e9fbb6cfa7c85a10330ffadf54b0'
    txWithExpectedValues.rlpEncoding =
        '0x31f8fb8204d219830f4240947b65b75d204abed71587c9e519a89277766ee1d00a94a94f5374fce5edbc8e2a8697c15331677e6ebf0ba46353586b000000000000000000000000bc5951f055a85f41a3b62fd6f68ab7de76d299b2f845f84325a0253aea7d2c37160da45e84afbb45f6b3341cf1e8fc2df4ecc78f14adb512dc4fa022465b74015c2a8f8501186bb5e200e6ce44be52e9374615a7e7e21c41bc27b5945a0043070275d9f6054307ee7348bd660849d90ff845f84326a0e7c51db7b922c6fa2a941c9687884c593b1b13076bdf0c473538d826bf7b9d1aa05b0de2aabb84b66db8bf52d62f3d3b71b592e3748455630f1504c20073624d80'
})

describe('TxTypeFeeDelegatedSmartContractExecution', () => {
    let transactionObj
    let getGasPriceSpy
    let getNonceSpy
    let getChainIdSpy
    beforeEach(() => {
        transactionObj = {
            from: sender.address,
            to: '0x7b65B75d204aBed71587c9E519a89277766EE1d0',
            input,
            gas: '0x15f90',
        }

        getGasPriceSpy = sandbox.stub(caver.transaction.klaytnCall, 'getGasPrice')
        getGasPriceSpy.returns('0x5d21dba00')
        getNonceSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionCount')
        getNonceSpy.returns('0x3a')
        getChainIdSpy = sandbox.stub(caver.transaction.klaytnCall, 'getChainId')
        getChainIdSpy.returns('0x7e3')
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('create feeDelegatedSmartContractExecution instance', () => {
        it('CAVERJS-UNIT-TRANSACTIONFD-297: If feeDelegatedSmartContractExecution not define from, return error', () => {
            delete transactionObj.from

            const expectedError = '"from" is missing'
            expect(() => caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-298: If feeDelegatedSmartContractExecution not define to, return error', () => {
            delete transactionObj.to

            const expectedError = '"to" is missing'
            expect(() => caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-299: If feeDelegatedSmartContractExecution not define gas, return error', () => {
            delete transactionObj.gas

            const expectedError = '"gas" is missing'
            expect(() => caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-300: If feeDelegatedSmartContractExecution not define input, return error', () => {
            delete transactionObj.input

            const expectedError = '"input" is missing'
            expect(() => caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-301: If feeDelegatedSmartContractExecution define from property with invalid address, return error', () => {
            transactionObj.from = 'invalid'

            const expectedError = `Invalid address of from: ${transactionObj.from}`
            expect(() => caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-302: If feeDelegatedSmartContractExecution define to property with invalid address, return error', () => {
            transactionObj.to = 'invalid'

            const expectedError = `Invalid address of to: ${transactionObj.to}`
            expect(() => caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-303: If feeDelegatedSmartContractExecution define feePayer property with invalid address, return error', () => {
            transactionObj.feePayer = 'invalid'

            const expectedError = `Invalid address of fee payer: ${transactionObj.feePayer}`
            expect(() => caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-304: If feeDelegatedSmartContractExecution define feePayerSignatures property without feePayer, return error', () => {
            transactionObj.feePayerSignatures = [
                [
                    '0x26',
                    '0xf45cf8d7f88c08e6b6ec0b3b562f34ca94283e4689021987abb6b0772ddfd80a',
                    '0x298fe2c5aeabb6a518f4cbb5ff39631a5d88be505d3923374f65fdcf63c2955b',
                ],
            ]

            const expectedError = '"feePayer" is missing: feePayer must be defined with feePayerSignatures.'
            expect(() => caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-305: If feeDelegatedSmartContractExecution define unnecessary property, return error', () => {
            const unnecessaries = [
                propertiesForUnnecessary.codeFormat,
                propertiesForUnnecessary.humanReadable,
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
                propertiesForUnnecessary.accessList,
                propertiesForUnnecessary.maxPriorityFeePerGas,
                propertiesForUnnecessary.maxFeePerGas,
            ]

            for (let i = 0; i < unnecessaries.length; i++) {
                if (i > 0) delete transactionObj[unnecessaries[i - 1].name]
                transactionObj[unnecessaries[i].name] = unnecessaries[i].value

                const expectedError = `"${unnecessaries[i].name}" cannot be used with ${caver.transaction.type.TxTypeFeeDelegatedSmartContractExecution} transaction`
                expect(() => caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)).to.throw(expectedError)
            }
        })
    })

    context('feeDelegatedSmartContractExecution.getRLPEncoding', () => {
        it('CAVERJS-UNIT-TRANSACTIONFD-306: Returns RLP-encoded string', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(txWithExpectedValues.tx)

            expect(tx.getRLPEncoding()).to.equal(txWithExpectedValues.rlpEncoding)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-307: getRLPEncoding should throw error when nonce is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.gasPrice = '0x5d21dba00'
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-308: getRLPEncoding should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })
    })

    context('feeDelegatedSmartContractExecution.sign', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            createFromPrivateKeySpy = sandbox.spy(Keyring, 'createFromPrivateKey')
            senderSignSpy = sandbox.spy(sender, 'sign')
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

        it('CAVERJS-UNIT-TRANSACTIONFD-310: input: keyring. should sign transaction.', async () => {
            await tx.sign(sender)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-311: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.key.privateKey)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-312: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-313: input: keyring, index. should sign transaction with specific index.', async () => {
            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.from = roleBasedKeyring.address

            await tx.sign(roleBasedKeyring, 1)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignSpy).to.have.been.calledWith(txHash, '0x7e3', 0, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-314: input: keyring, custom hasher. should use custom hasher.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-315: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.from = roleBasedKeyring.address

            await tx.sign(roleBasedKeyring, 1, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-316: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-317: input: rolebased keyring, index out of range. should throw error.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
            await expect(tx.sign(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('feeDelegatedSmartContractExecution.signAsFeePayer', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)
            tx.feePayer = sender.address

            fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            createFromPrivateKeySpy = sandbox.spy(Keyring, 'createFromPrivateKey')
            senderSignSpy = sandbox.spy(sender, 'sign')
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

        it('CAVERJS-UNIT-TRANSACTIONFD-318: input: keyring. If feePayer is not defined, should be set with keyring address.', async () => {
            tx.feePayer = '0x'
            await tx.signAsFeePayer(sender)

            expect(tx.feePayer.toLowerCase()).to.equal(sender.address.toLowerCase())
            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-319: input: keyring. should sign transaction.', async () => {
            await tx.signAsFeePayer(sender)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-320: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.signAsFeePayer(sender.key.privateKey)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-321: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.signAsFeePayer(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-322: input: keyring, index. should sign transaction with specific index.', async () => {
            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.feePayer = roleBasedKeyring.address

            await tx.signAsFeePayer(roleBasedKeyring, 1)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignSpy).to.have.been.calledWith(txHash, '0x7e3', 2, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-323: input: keyring, custom hasher. should use custom hasher.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.feePayer = roleBasedKeyring.address
            await tx.signAsFeePayer(roleBasedKeyring, customHasher)

            checkFunctionCall(true)
            checkFeePayerSignature(tx, { expectedLength: roleBasedKeyring.keys[2].length })
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 2, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-324: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.feePayer = roleBasedKeyring.address

            await tx.signAsFeePayer(roleBasedKeyring, 1, customHasher)

            checkFunctionCall(true)
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 2, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-325: input: keyring. should throw error when feePayer is different.', async () => {
            tx.feePayer = roleBasedKeyring.address

            const expectedError = `The feePayer address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signAsFeePayer(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-326: input: rolebased keyring, index out of range. should throw error.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
            await expect(tx.signAsFeePayer(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('feeDelegatedSmartContractExecution.sign with multiple keys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeysSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            createFromPrivateKeySpy = sandbox.spy(Keyring, 'createFromPrivateKey')
            senderSignWithKeysSpy = sandbox.spy(sender, 'sign')
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

        it('CAVERJS-UNIT-TRANSACTIONFD-327: input: keyring. should sign transaction.', async () => {
            await tx.sign(sender)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-328: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.key.privateKey)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-329: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-330: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-331: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-332: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.from = roleBasedKeyring.address

            await tx.sign(roleBasedKeyring)

            checkFunctionCall(true)
            checkSignature(tx, { expectedLength: roleBasedKeyring.keys[0].length })
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)
    })

    context('feeDelegatedSmartContractExecution.signAsFeePayer with multiple keys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeysSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            createFromPrivateKeySpy = sandbox.spy(Keyring, 'createFromPrivateKey')
            senderSignWithKeysSpy = sandbox.spy(sender, 'sign')
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

        it('CAVERJS-UNIT-TRANSACTIONFD-333: input: keyring. If feePayer is not defined, should be set with keyring address.', async () => {
            tx.feePayer = '0x'
            await tx.signAsFeePayer(sender)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-334: input: keyring. should sign transaction.', async () => {
            await tx.signAsFeePayer(sender)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-335: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.signAsFeePayer(sender.key.privateKey)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-336: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.signAsFeePayer(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-337: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.signAsFeePayer(sender, customHasher)

            checkFunctionCall(true)
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-338: input: keyring. should throw error when feePayer is different.', async () => {
            tx.feePayer = roleBasedKeyring.address

            const expectedError = `The feePayer address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signAsFeePayer(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-339: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.feePayer = roleBasedKeyring.address

            await tx.signAsFeePayer(roleBasedKeyring)

            checkFunctionCall(true)
            checkFeePayerSignature(tx, { expectedLength: roleBasedKeyring.keys[2].length })
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)
    })

    context('feeDelegatedSmartContractExecution.appendSignatures', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-340: If signatures is empty, appendSignatures append signatures in transaction', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            tx.appendSignatures(sig)
            checkSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-341: If signatures is empty, appendSignatures append signatures with two-dimensional signature array', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTIONFD-342: If signatures is not empty, appendSignatures should append signatures', () => {
            transactionObj.signatures = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const sig = [
                '0x0fea',
                '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
            ]

            tx.appendSignatures(sig)
            checkSignature(tx, { expectedLength: 2 })
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-343: appendSignatures should append multiple signatures', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

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

    context('feeDelegatedSmartContractExecution.appendFeePayerSignatures', () => {
        beforeEach(() => {
            transactionObj.feePayer = '0x90b3e9a3770481345a7f17f22f16d020bccfd33e'
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-344: If feePayerSignatures is empty, appendFeePayerSignatures append feePayerSignatures in transaction', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            tx.appendFeePayerSignatures(sig)
            checkFeePayerSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-345: If feePayerSignatures is empty, appendFeePayerSignatures append feePayerSignatures with two-dimensional signature array', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTIONFD-346: If feePayerSignatures is not empty, appendFeePayerSignatures should append feePayerSignatures', () => {
            transactionObj.feePayerSignatures = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const sig = [
                '0x0fea',
                '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
            ]

            tx.appendFeePayerSignatures(sig)
            checkFeePayerSignature(tx, { expectedLength: 2 })
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-347: appendFeePayerSignatures should append multiple feePayerSignatures', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

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

    context('feeDelegatedSmartContractExecution.combineSignedRawTransactions', () => {
        beforeEach(() => {
            transactionObj = {
                from: '0x553b11f36cd1ebcbf74c920dc51cd8a1648cb98a',
                to: '0xd3e7cbbba40c98e05d972438b11ff9374d71654a',
                value: '0x0',
                input:
                    '0xa9059cbb000000000000000000000000fc9fb77a8407e4ac10e6d5f96574debc844d0d5b00000000000000000000000000000000000000000000000000000002540be400',
                gas: '0xdbba0',
                nonce: '0x3',
                gasPrice: '0x5d21dba00',
                chainId: '0x7e3',
            }
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-348: combineSignedRawTransactions combines single signature and sets signatures in transaction', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x31f8df038505d21dba00830dbba094d3e7cbbba40c98e05d972438b11ff9374d71654a8094553b11f36cd1ebcbf74c920dc51cd8a1648cb98ab844a9059cbb000000000000000000000000fc9fb77a8407e4ac10e6d5f96574debc844d0d5b00000000000000000000000000000000000000000000000000000002540be400f847f845820fe9a07531ee2314700f1d4f45983cfd9f865cd7c7d90341c745f7371073f407d48acfa03ea07fc14ccd89da897dbfbe10ad04fe8c74ee3a3f3cadf1c5697a8f669bbd71940000000000000000000000000000000000000000c4c3018080'
            const combined = tx.combineSignedRawTransactions([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0x7531ee2314700f1d4f45983cfd9f865cd7c7d90341c745f7371073f407d48acf',
                    '0x3ea07fc14ccd89da897dbfbe10ad04fe8c74ee3a3f3cadf1c5697a8f669bbd71',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-349: combineSignedRawTransactions combines multiple signatures and sets signatures in transaction', () => {
            transactionObj.signatures = [
                [
                    '0x0fe9',
                    '0x7531ee2314700f1d4f45983cfd9f865cd7c7d90341c745f7371073f407d48acf',
                    '0x3ea07fc14ccd89da897dbfbe10ad04fe8c74ee3a3f3cadf1c5697a8f669bbd71',
                ],
            ]
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const rlpEncodedStrings = [
                '0x31f8cb038505d21dba00830dbba094d3e7cbbba40c98e05d972438b11ff9374d71654a8094553b11f36cd1ebcbf74c920dc51cd8a1648cb98ab844a9059cbb000000000000000000000000fc9fb77a8407e4ac10e6d5f96574debc844d0d5b00000000000000000000000000000000000000000000000000000002540be400f847f845820feaa0390e818cdd138b4c698082c52c330589489af0ba169f5c8685247c53abd08831a0784755dd4bc6c0a4b8e7f32f84c9d22e4b5ed04ddb43e9dfc35ee9083db474a380c4c3018080',
                '0x31f8cb038505d21dba00830dbba094d3e7cbbba40c98e05d972438b11ff9374d71654a8094553b11f36cd1ebcbf74c920dc51cd8a1648cb98ab844a9059cbb000000000000000000000000fc9fb77a8407e4ac10e6d5f96574debc844d0d5b00000000000000000000000000000000000000000000000000000002540be400f847f845820feaa0a94395fb25f06759e101fb159f7a2989b08c8912564b74d0c64078d964747f18a003c4574aa95af372c69accb57faa8e713ca180d3af85fa690201d33bf204639080c4c3018080',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignedRawTransactions(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x31f9016d038505d21dba00830dbba094d3e7cbbba40c98e05d972438b11ff9374d71654a8094553b11f36cd1ebcbf74c920dc51cd8a1648cb98ab844a9059cbb000000000000000000000000fc9fb77a8407e4ac10e6d5f96574debc844d0d5b00000000000000000000000000000000000000000000000000000002540be400f8d5f845820fe9a07531ee2314700f1d4f45983cfd9f865cd7c7d90341c745f7371073f407d48acfa03ea07fc14ccd89da897dbfbe10ad04fe8c74ee3a3f3cadf1c5697a8f669bbd71f845820feaa0390e818cdd138b4c698082c52c330589489af0ba169f5c8685247c53abd08831a0784755dd4bc6c0a4b8e7f32f84c9d22e4b5ed04ddb43e9dfc35ee9083db474a3f845820feaa0a94395fb25f06759e101fb159f7a2989b08c8912564b74d0c64078d964747f18a003c4574aa95af372c69accb57faa8e713ca180d3af85fa690201d33bf2046390940000000000000000000000000000000000000000c4c3018080'

            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0x7531ee2314700f1d4f45983cfd9f865cd7c7d90341c745f7371073f407d48acf',
                    '0x3ea07fc14ccd89da897dbfbe10ad04fe8c74ee3a3f3cadf1c5697a8f669bbd71',
                ],
                [
                    '0x0fea',
                    '0x390e818cdd138b4c698082c52c330589489af0ba169f5c8685247c53abd08831',
                    '0x784755dd4bc6c0a4b8e7f32f84c9d22e4b5ed04ddb43e9dfc35ee9083db474a3',
                ],
                [
                    '0x0fea',
                    '0xa94395fb25f06759e101fb159f7a2989b08c8912564b74d0c64078d964747f18',
                    '0x03c4574aa95af372c69accb57faa8e713ca180d3af85fa690201d33bf2046390',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-350: combineSignedRawTransactions combines single feePayerSignature and sets feePayerSignatures in transaction', () => {
            transactionObj.feePayer = '0xfc9fb77a8407e4ac10e6d5f96574debc844d0d5b'
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x31f8df038505d21dba00830dbba094d3e7cbbba40c98e05d972438b11ff9374d71654a8094553b11f36cd1ebcbf74c920dc51cd8a1648cb98ab844a9059cbb000000000000000000000000fc9fb77a8407e4ac10e6d5f96574debc844d0d5b00000000000000000000000000000000000000000000000000000002540be400c4c301808094fc9fb77a8407e4ac10e6d5f96574debc844d0d5bf847f845820feaa08d9d977567a1903deb82d67525beaa23842ebfe8ae7dad04c0d161a9a2451573a07e280f122aaf89e6379e95d1499c2d536d7ac37b77fa8980b5f083d153f2fb5b'
            const combined = tx.combineSignedRawTransactions([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fea',
                    '0x8d9d977567a1903deb82d67525beaa23842ebfe8ae7dad04c0d161a9a2451573',
                    '0x7e280f122aaf89e6379e95d1499c2d536d7ac37b77fa8980b5f083d153f2fb5b',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkFeePayerSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-351: combineSignedRawTransactions combines multiple feePayerSignatures and sets feePayerSignatures in transaction', () => {
            transactionObj.feePayer = '0xfc9fb77a8407e4ac10e6d5f96574debc844d0d5b'
            transactionObj.feePayerSignatures = [
                [
                    '0x0fea',
                    '0x8d9d977567a1903deb82d67525beaa23842ebfe8ae7dad04c0d161a9a2451573',
                    '0x7e280f122aaf89e6379e95d1499c2d536d7ac37b77fa8980b5f083d153f2fb5b',
                ],
            ]
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const rlpEncodedStrings = [
                '0x31f8df038505d21dba00830dbba094d3e7cbbba40c98e05d972438b11ff9374d71654a8094553b11f36cd1ebcbf74c920dc51cd8a1648cb98ab844a9059cbb000000000000000000000000fc9fb77a8407e4ac10e6d5f96574debc844d0d5b00000000000000000000000000000000000000000000000000000002540be400c4c301808094fc9fb77a8407e4ac10e6d5f96574debc844d0d5bf847f845820fe9a08ffc31dc605d1d93b62e5dc5d72d62efe6994235e370feffc2f4366cf5f68a69a03910e05d112c137482ddb5740062dfcc6ce1556f081f22efb9b5f343adf45638',
                '0x31f8df038505d21dba00830dbba094d3e7cbbba40c98e05d972438b11ff9374d71654a8094553b11f36cd1ebcbf74c920dc51cd8a1648cb98ab844a9059cbb000000000000000000000000fc9fb77a8407e4ac10e6d5f96574debc844d0d5b00000000000000000000000000000000000000000000000000000002540be400c4c301808094fc9fb77a8407e4ac10e6d5f96574debc844d0d5bf847f845820feaa025f9886ca65ae770ac69e155978600c6dfe9f2f3f06c692bbae5175f5eb4d7e1a020d0b91badffe5074dd66bdd558ddd2be0ec629e83e6616cf381bb692d41bbe5',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignedRawTransactions(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x31f9016d038505d21dba00830dbba094d3e7cbbba40c98e05d972438b11ff9374d71654a8094553b11f36cd1ebcbf74c920dc51cd8a1648cb98ab844a9059cbb000000000000000000000000fc9fb77a8407e4ac10e6d5f96574debc844d0d5b00000000000000000000000000000000000000000000000000000002540be400c4c301808094fc9fb77a8407e4ac10e6d5f96574debc844d0d5bf8d5f845820feaa08d9d977567a1903deb82d67525beaa23842ebfe8ae7dad04c0d161a9a2451573a07e280f122aaf89e6379e95d1499c2d536d7ac37b77fa8980b5f083d153f2fb5bf845820fe9a08ffc31dc605d1d93b62e5dc5d72d62efe6994235e370feffc2f4366cf5f68a69a03910e05d112c137482ddb5740062dfcc6ce1556f081f22efb9b5f343adf45638f845820feaa025f9886ca65ae770ac69e155978600c6dfe9f2f3f06c692bbae5175f5eb4d7e1a020d0b91badffe5074dd66bdd558ddd2be0ec629e83e6616cf381bb692d41bbe5'

            const expectedFeePayerSignatures = [
                [
                    '0x0fea',
                    '0x8d9d977567a1903deb82d67525beaa23842ebfe8ae7dad04c0d161a9a2451573',
                    '0x7e280f122aaf89e6379e95d1499c2d536d7ac37b77fa8980b5f083d153f2fb5b',
                ],
                [
                    '0x0fe9',
                    '0x8ffc31dc605d1d93b62e5dc5d72d62efe6994235e370feffc2f4366cf5f68a69',
                    '0x3910e05d112c137482ddb5740062dfcc6ce1556f081f22efb9b5f343adf45638',
                ],
                [
                    '0x0fea',
                    '0x25f9886ca65ae770ac69e155978600c6dfe9f2f3f06c692bbae5175f5eb4d7e1',
                    '0x20d0b91badffe5074dd66bdd558ddd2be0ec629e83e6616cf381bb692d41bbe5',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkFeePayerSignature(tx, { expectedFeePayerSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-352: combineSignedRawTransactions combines multiple signatures and feePayerSignatures', () => {
            let tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            // RLP encoding with only signatures
            const rlpEncodedStrings = [
                '0x31f90159038505d21dba00830dbba094d3e7cbbba40c98e05d972438b11ff9374d71654a8094553b11f36cd1ebcbf74c920dc51cd8a1648cb98ab844a9059cbb000000000000000000000000fc9fb77a8407e4ac10e6d5f96574debc844d0d5b00000000000000000000000000000000000000000000000000000002540be400f8d5f845820fe9a07531ee2314700f1d4f45983cfd9f865cd7c7d90341c745f7371073f407d48acfa03ea07fc14ccd89da897dbfbe10ad04fe8c74ee3a3f3cadf1c5697a8f669bbd71f845820feaa0390e818cdd138b4c698082c52c330589489af0ba169f5c8685247c53abd08831a0784755dd4bc6c0a4b8e7f32f84c9d22e4b5ed04ddb43e9dfc35ee9083db474a3f845820feaa0a94395fb25f06759e101fb159f7a2989b08c8912564b74d0c64078d964747f18a003c4574aa95af372c69accb57faa8e713ca180d3af85fa690201d33bf204639080c4c3018080',
            ]
            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0x7531ee2314700f1d4f45983cfd9f865cd7c7d90341c745f7371073f407d48acf',
                    '0x3ea07fc14ccd89da897dbfbe10ad04fe8c74ee3a3f3cadf1c5697a8f669bbd71',
                ],
                [
                    '0x0fea',
                    '0x390e818cdd138b4c698082c52c330589489af0ba169f5c8685247c53abd08831',
                    '0x784755dd4bc6c0a4b8e7f32f84c9d22e4b5ed04ddb43e9dfc35ee9083db474a3',
                ],
                [
                    '0x0fea',
                    '0xa94395fb25f06759e101fb159f7a2989b08c8912564b74d0c64078d964747f18',
                    '0x03c4574aa95af372c69accb57faa8e713ca180d3af85fa690201d33bf2046390',
                ],
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            let combined = tx.combineSignedRawTransactions(rlpEncodedStrings)
            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)

            const rlpEncodedStringsWithFeePayerSignatures = [
                '0x31f9016d038505d21dba00830dbba094d3e7cbbba40c98e05d972438b11ff9374d71654a8094553b11f36cd1ebcbf74c920dc51cd8a1648cb98ab844a9059cbb000000000000000000000000fc9fb77a8407e4ac10e6d5f96574debc844d0d5b00000000000000000000000000000000000000000000000000000002540be400c4c301808094fc9fb77a8407e4ac10e6d5f96574debc844d0d5bf8d5f845820feaa08d9d977567a1903deb82d67525beaa23842ebfe8ae7dad04c0d161a9a2451573a07e280f122aaf89e6379e95d1499c2d536d7ac37b77fa8980b5f083d153f2fb5bf845820fe9a08ffc31dc605d1d93b62e5dc5d72d62efe6994235e370feffc2f4366cf5f68a69a03910e05d112c137482ddb5740062dfcc6ce1556f081f22efb9b5f343adf45638f845820feaa025f9886ca65ae770ac69e155978600c6dfe9f2f3f06c692bbae5175f5eb4d7e1a020d0b91badffe5074dd66bdd558ddd2be0ec629e83e6616cf381bb692d41bbe5',
            ]
            const expectedFeePayerSignatures = [
                [
                    '0x0fea',
                    '0x8d9d977567a1903deb82d67525beaa23842ebfe8ae7dad04c0d161a9a2451573',
                    '0x7e280f122aaf89e6379e95d1499c2d536d7ac37b77fa8980b5f083d153f2fb5b',
                ],
                [
                    '0x0fe9',
                    '0x8ffc31dc605d1d93b62e5dc5d72d62efe6994235e370feffc2f4366cf5f68a69',
                    '0x3910e05d112c137482ddb5740062dfcc6ce1556f081f22efb9b5f343adf45638',
                ],
                [
                    '0x0fea',
                    '0x25f9886ca65ae770ac69e155978600c6dfe9f2f3f06c692bbae5175f5eb4d7e1',
                    '0x20d0b91badffe5074dd66bdd558ddd2be0ec629e83e6616cf381bb692d41bbe5',
                ],
            ]

            const appendFeePayerSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            combined = tx.combineSignedRawTransactions(rlpEncodedStringsWithFeePayerSignatures)
            expect(appendFeePayerSignaturesSpy).to.have.been.callCount(rlpEncodedStringsWithFeePayerSignatures.length)

            // combine multiple signatures and feePayerSignatures
            tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)
            const combinedWithMultiple = tx.combineSignedRawTransactions([combined])

            expect(combined).to.equal(combinedWithMultiple)
            checkSignature(tx, { expectedSignatures })
            checkFeePayerSignature(tx, { expectedFeePayerSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-353: If decode transaction has different values, combineSignedRawTransactions should throw error', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)
            tx.value = 10000

            const rlpEncoded =
                '0x31f90159038505d21dba00830dbba094d3e7cbbba40c98e05d972438b11ff9374d71654a8094553b11f36cd1ebcbf74c920dc51cd8a1648cb98ab844a9059cbb000000000000000000000000fc9fb77a8407e4ac10e6d5f96574debc844d0d5b00000000000000000000000000000000000000000000000000000002540be400f8d5f845820fe9a07531ee2314700f1d4f45983cfd9f865cd7c7d90341c745f7371073f407d48acfa03ea07fc14ccd89da897dbfbe10ad04fe8c74ee3a3f3cadf1c5697a8f669bbd71f845820feaa0390e818cdd138b4c698082c52c330589489af0ba169f5c8685247c53abd08831a0784755dd4bc6c0a4b8e7f32f84c9d22e4b5ed04ddb43e9dfc35ee9083db474a3f845820feaa0a94395fb25f06759e101fb159f7a2989b08c8912564b74d0c64078d964747f18a003c4574aa95af372c69accb57faa8e713ca180d3af85fa690201d33bf204639080c4c3018080'
            const expectedError = `Transactions containing different information cannot be combined.`

            expect(() => tx.combineSignedRawTransactions([rlpEncoded])).to.throw(expectedError)
        })
    })

    context('feeDelegatedSmartContractExecution.getRawTransaction', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-354: getRawTransaction should call getRLPEncoding function', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rawTransaction = tx.getRawTransaction()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(rawTransaction).to.equal(txWithExpectedValues.rlpEncoding)
        })
    })

    context('feeDelegatedSmartContractExecution.getTransactionHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-355: getTransactionHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const txHash = tx.getTransactionHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(txHash).to.equal(txWithExpectedValues.transactionHash)
            expect(caver.utils.isValidHashStrict(txHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-356: getTransactionHash should throw error when nonce is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.gasPrice = '0x5d21dba00'
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-357: getTransactionHash should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })
    })

    context('feeDelegatedSmartContractExecution.getSenderTxHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-359: getSenderTxHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const senderTxHash = tx.getSenderTxHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(senderTxHash).to.equal(txWithExpectedValues.senderTxHash)
            expect(caver.utils.isValidHashStrict(senderTxHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-360: getSenderTxHash should throw error when nonce is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.gasPrice = '0x5d21dba00'
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-361: getSenderTxHash should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })
    })

    context('feeDelegatedSmartContractExecution.getRLPEncodingForSignature', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-363: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(txWithExpectedValues.tx)

            const commonRLPForSigningSpy = sandbox.spy(tx, 'getCommonRLPEncodingForSignature')

            const rlpEncodingForSign = tx.getRLPEncodingForSignature()

            expect(rlpEncodingForSign).to.equal(txWithExpectedValues.rlpEncodingForSigning)
            expect(commonRLPForSigningSpy).to.have.been.calledOnce
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-364: getRLPEncodingForSignature should throw error when nonce is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-365: getRLPEncodingForSignature should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-366: getRLPEncodingForSignature should throw error when chainId is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })
    })

    context('feeDelegatedSmartContractExecution.getCommonRLPEncodingForSignature', () => {
        it('CAVERJS-UNIT-TRANSACTIONFD-367: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(txWithExpectedValues.tx)

            const commonRLPForSign = tx.getCommonRLPEncodingForSignature()
            const decoded = RLP.decode(txWithExpectedValues.rlpEncodingForSigning)

            expect(commonRLPForSign).to.equal(decoded[0])
        })
    })

    context('feeDelegatedSmartContractExecution.fillTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTIONFD-368: fillTransaction should call klay_getGasPrice to fill gasPrice when gasPrice is undefined', async () => {
            transactionObj.nonce = '0x3a'
            transactionObj.chainId = 2019
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-369: fillTransaction should call klay_getTransactionCount to fill nonce when nonce is undefined', async () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-370: fillTransaction should call klay_getChainid to fill chainId when chainId is undefined', async () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).to.have.been.calledOnce
        }).timeout(200000)
    })

    context('feeDelegatedSmartContractExecution.recoverPublicKeys feeDelegatedSmartContractExecution.recoverFeePayerPublicKeys', () => {
        // const privateKeys = [
        //     '0x6a1e0b0094e4d168aade69f1305e4d4c26c3c68fdbea4e2ebbcb3afc6d4cecba',
        //     '0xbb5be45662e3b95f468b5248ec18dfb5eae2c1b401277399e943614480cd35f3',
        //     '0xffd56f5237722773702cd559fadf46a7a994e5896ef76ec7282cf55ba6017181',
        // ]
        // const feePayerKeys = [
        //     '0x2ee1467444e4dca5b279014e898ab56da4c2b1ad012fa0d0856f3e3e115fedd2',
        //     '0x73d3d825a24624656f790a2c5ac1e29e227c19208fa0c89a2828f011db078d73',
        //     '0xa83a3afc73d18055a909973f6a126fe1506ba8a1c8bf7aad65d69ee3a6163a3f',
        // ]
        const expectedPublicKeyArray = [
            '0xfbda4ac2c04336609f7e5a363c71c1565b442d552b82cbd0e75bbabaf215fd28b69ce88a6b9f2a463f1420bd9a0992413254748a7ab46d5ba78d09b35cf0e912',
            '0xa234bd09ea829cb39dd2f5aced2318039f30ce5fe28f5eb28a256bac8617eb5db57ac7683fa21a01c8cbd2ca31c2cf93c97871c73896bf051f9bc0885c87ebe2',
            '0x6ed39def6b25fc001790d267922281483c372b5d2486ae955ece1f1b64b19aea85392c8555947a1c63577439afdb74c77ef07d50520435d31cf4afb3dfe0074f',
        ]
        const expectedFeePayerPublicKeyArray = [
            '0x2b557d80ddac3a0bbcc8a7861773ca7434c969e2721a574bb94a1e3aa5ceed3819f08a82b31682c038f9f691fb38ee4aaf7e016e2c973a1bd1e48a51f60a54ea',
            '0x1a1cfe1e2ec4b15520c57c20c2460981a2f16003c8db11a0afc282abf929fa1c1868f60f91b330c423aa660913d86acc2a0b1b15e7ba1fe571e5928a19825a7e',
            '0xdea23a89dbbde1a0c26466c49c1edd32785432389641797038c2b53815cb5c73d6cf5355986fd9a22a68bb57b831857fd1636362b383bd632966392714b60d72',
        ]

        const txObj = {
            from: '0xf21460730845e3652aa3cc9bc13b345e4f53984a',
            feePayer: '0xb5db72925b1b6b79299a1a49ae226cd7861083ac',
            to: '0x59177716c34ac6e49e295a0e78e33522f14d61ee',
            value: '0x1',
            chainId: '0x7e3',
            gasPrice: '0x5d21dba00',
            nonce: '0x0',
            gas: '0x2faf080',
            input:
                '0xd95aced7000000000000000000000000640a4c021cb5889fa1d37378f04a36ad452862240000000000000000000000000000000000000000000000000000000000000001',
            signatures: [
                [
                    '0x0fe9',
                    '0x42f52da40e7648cec0eb5d7f84bc5b3c4218bfc5d8056476af620e1e42cb63a5',
                    '0x478057f9e32cdc46b57be7c5022a6d81f61e07b515481332df3479662084afff',
                ],
                [
                    '0x0fea',
                    '0x6e2d666a01df1804531c0da5cc25a3ddfcb99d506110a2c1fe2a21b09e94c562',
                    '0x19c980243caec5d9f008be963d600d904ea3aa9ac8c453acc0d137f05b171607',
                ],
                [
                    '0x0fe9',
                    '0xcefeda599c36faffa7241e217230c6af1c87f69dd1360673c382f2529a8ab044',
                    '0x6c3da66cd9bcd4cdf3a854da2b30ce36449554cac771aaaf4c70047906b0cd89',
                ],
            ],
            feePayerSignatures: [
                [
                    '0x0fe9',
                    '0x27cb27294a4a7f7fb9c1aa30348ee6b591412cfcefe4f0c28dbebdd290970703',
                    '0x750c5466ec44e07ac67c8950b4150a654503ca13e451508595711c1b83b44d8a',
                ],
                [
                    '0x0fea',
                    '0x2b672a1f4ddac03256bcecb96b834ecc0e74430b787f722ba610f3f270d9e8a1',
                    '0x0e10fa45ae7f06989ef1facd543458c24f37cd8d38d9a937d18a6d39dbcf82ad',
                ],
                [
                    '0x0fea',
                    '0xef6acf5c104eaf67dbd9b8de636362c0fb9445f979d948f50a95fab7a16f3d62',
                    '0x2bfb69ad74351e9a17d529cb186df78a1e7431d3575384986aa130b233aa24d8',
                ],
            ],
        }

        it('CAVERJS-UNIT-TRANSACTIONFD-529: should return public key string recovered from signatures in FeeDelegatedSmartContractExecution', async () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(txObj)
            const publicKeys = tx.recoverPublicKeys()

            expect(publicKeys.length).to.equal(expectedPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedPublicKeyArray[i].toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-530: should return fee payer public key string recovered from feePayerSignatures in FeeDelegatedSmartContractExecution', async () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecution.create(txObj)
            const publicKeys = tx.recoverFeePayerPublicKeys()

            expect(publicKeys.length).to.equal(expectedFeePayerPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedFeePayerPublicKeyArray[i].toLowerCase())
            }
        }).timeout(200000)
    })
})
