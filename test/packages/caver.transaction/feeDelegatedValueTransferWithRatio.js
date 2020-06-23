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
const Keyring = require('../../../packages/caver-wallet/src/keyring/keyringFactory')
const SingleKeyring = require('../../../packages/caver-wallet/src/keyring/singleKeyring')
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
        feeRatio: 30,
        chainId: '0x1',
        nonce: 1234,
        signatures: [
            [
                '0x25',
                '0xdde32b8241f039a82b124fe94d3e556eb08f0d6f26d07dcc0f3fca621f1090ca',
                '0x1c8c336b358ab6d3a2bbf25de2adab4d01b754e2fb3b9b710069177d54c1e956',
            ],
        ],
        feePayer: '0x5A0043070275d9f6054307Ee7348bD660849D90f',
        feePayerSignatures: [
            [
                '0x26',
                '0x91ecf53f91bb97bb694f2f2443f3563ac2b646d651497774524394aae396360',
                '0x44228b88f275aa1ec1bab43681d21dc7e3a676786ed1906f6841d0a1a188f88a',
            ],
        ],
    }
    txWithExpectedValues.rlpEncodingForSigning =
        '0xf83ab6f50a8204d219830f4240947b65b75d204abed71587c9e519a89277766ee1d00a94a94f5374fce5edbc8e2a8697c15331677e6ebf0b1e018080'
    txWithExpectedValues.rlpEncodingForFeePayerSigning =
        '0xf84fb6f50a8204d219830f4240947b65b75d204abed71587c9e519a89277766ee1d00a94a94f5374fce5edbc8e2a8697c15331677e6ebf0b1e945a0043070275d9f6054307ee7348bd660849d90f018080'
    txWithExpectedValues.senderTxHash = '0x4711ed4023e821425968342c1d50063b6bc3176b1792b7075cfeee3656d450f6'
    txWithExpectedValues.transactionHash = '0x83a89f4debd8e9d6374b987e25132b3a4030c9cf9ace2fc6e7d1086fcea2ce40'
    txWithExpectedValues.rlpEncoding =
        '0x0af8d78204d219830f4240947b65b75d204abed71587c9e519a89277766ee1d00a94a94f5374fce5edbc8e2a8697c15331677e6ebf0b1ef845f84325a0dde32b8241f039a82b124fe94d3e556eb08f0d6f26d07dcc0f3fca621f1090caa01c8c336b358ab6d3a2bbf25de2adab4d01b754e2fb3b9b710069177d54c1e956945a0043070275d9f6054307ee7348bd660849d90ff845f84326a0091ecf53f91bb97bb694f2f2443f3563ac2b646d651497774524394aae396360a044228b88f275aa1ec1bab43681d21dc7e3a676786ed1906f6841d0a1a188f88a'
})

describe('TxTypeFeeDelegatedValueTransferWithRatio', () => {
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
            feeRatio: 30,
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

    context('create feeDelegatedValueTransferWithRatio instance', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-001: If feeDelegatedValueTransferWithRatio not define from, return error', () => {
            delete transactionObj.from

            const expectedError = '"from" is missing'
            expect(() => new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-002: If feeDelegatedValueTransferWithRatio not define to, return error', () => {
            delete transactionObj.to

            const expectedError = '"to" is missing'
            expect(() => new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-003: If feeDelegatedValueTransferWithRatio not define value, return error', () => {
            delete transactionObj.value

            const expectedError = '"value" is missing'
            expect(() => new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-004: If feeDelegatedValueTransferWithRatio not define gas, return error', () => {
            delete transactionObj.gas

            const expectedError = '"gas" is missing'
            expect(() => new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-005: If feeDelegatedValueTransferWithRatio not define feeRatio, return error', () => {
            delete transactionObj.feeRatio

            const expectedError = '"feeRatio" is missing'
            expect(() => new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-006: If feeDelegatedValueTransferWithRatio define from property with invalid address, return error', () => {
            transactionObj.from = 'invalid'

            const expectedError = `Invalid address of from: ${transactionObj.from}`
            expect(() => new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-007: If feeDelegatedValueTransferWithRatio define feePayer property with invalid address, return error', () => {
            transactionObj.feePayer = 'invalid'

            const expectedError = `Invalid address of fee payer: ${transactionObj.feePayer}`
            expect(() => new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-008: If feeDelegatedValueTransferWithRatio define to property with invalid address, return error', () => {
            transactionObj.to = 'invalid address'

            const expectedError = `Invalid address of to: ${transactionObj.to}`
            expect(() => new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-527: If feeDelegatedValueTransferWithRatio define feeRatio property with invalid value, return error', () => {
            transactionObj.feeRatio = 'nonHexString'
            let expectedError = `Invalid type fo feeRatio: feeRatio should be number type or hex number string.`
            expect(() => new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = {}
            expect(() => new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = []
            expect(() => new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = 0
            expectedError = `Invalid feeRatio: feeRatio is out of range. [1, 99]`
            expect(() => new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = 100
            expect(() => new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = -1
            expect(() => new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = 101
            expect(() => new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-009: If feeDelegatedValueTransferWithRatio define feePayerSignatures property without feePayer, return error', () => {
            transactionObj.feePayerSignatures = [
                [
                    '0x26',
                    '0xf45cf8d7f88c08e6b6ec0b3b562f34ca94283e4689021987abb6b0772ddfd80a',
                    '0x298fe2c5aeabb6a518f4cbb5ff39631a5d88be505d3923374f65fdcf63c2955b',
                ],
            ]

            const expectedError = '"feePayer" is missing: feePayer must be defined with feePayerSignatures.'
            expect(() => new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-010: If feeDelegatedValueTransferWithRatio define unnecessary property, return error', () => {
            const unnecessaries = [
                propertiesForUnnecessary.data,
                propertiesForUnnecessary.input,
                propertiesForUnnecessary.codeFormat,
                propertiesForUnnecessary.failKey,
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

                const expectedError = `"${unnecessaries[i].name}" cannot be used with ${caver.transaction.type.TxTypeFeeDelegatedValueTransferWithRatio} transaction`
                // eslint-disable-next-line no-loop-func
                expect(() => new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)).to.throw(expectedError)
            }
        })
    })

    context('feeDelegatedValueTransferWithRatio.getRLPEncoding', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-011: Returns RLP-encoded string', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(txWithExpectedValues.tx)

            expect(tx.getRLPEncoding()).to.equal(txWithExpectedValues.rlpEncoding)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-012: getRLPEncoding should throw error when nonce is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.gasPrice = '0x5d21dba00'
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-013: getRLPEncoding should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })
    })

    context('feeDelegatedValueTransferWithRatio.sign', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTIONFDR-015: input: keyring. should sign transaction.', async () => {
            await tx.sign(sender)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-016: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.key.privateKey)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-017: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-018: input: keyring, index. should sign transaction with specific index.', async () => {
            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.from = roleBasedKeyring.address

            await tx.sign(roleBasedKeyring, 1)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignSpy).to.have.been.calledWith(txHash, '0x7e3', 0, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-019: input: keyring, custom hasher. should use custom hasher.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-020: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFDR-021: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-022: input: rolebased keyring, index out of range. should throw error.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
            await expect(tx.sign(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('feeDelegatedValueTransferWithRatio.signAsFeePayer', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)
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

        it('CAVERJS-UNIT-TRANSACTIONFDR-023: input: keyring. If feePayer is not defined, should be set with keyring address.', async () => {
            tx.feePayer = '0x'
            await tx.signAsFeePayer(sender)

            expect(tx.feePayer.toLowerCase()).to.equal(sender.address.toLowerCase())
            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-024: input: keyring. should sign transaction.', async () => {
            await tx.signAsFeePayer(sender)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-025: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.signAsFeePayer(sender.key.privateKey)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-026: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.signAsFeePayer(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-027: input: keyring, index. should sign transaction with specific index.', async () => {
            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.feePayer = roleBasedKeyring.address

            await tx.signAsFeePayer(roleBasedKeyring, 1)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignSpy).to.have.been.calledWith(txHash, '0x7e3', 2, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-028: input: keyring, custom hasher. should use custom hasher.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFDR-029: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFDR-030: input: keyring. should throw error when feePayer is different.', async () => {
            tx.feePayer = roleBasedKeyring.address

            const expectedError = `The feePayer address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signAsFeePayer(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-031: input: rolebased keyring, index out of range. should throw error.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
            await expect(tx.signAsFeePayer(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('feeDelegatedValueTransferWithRatio.sign with multiple keys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeysSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTIONFDR-032: input: keyring. should sign transaction.', async () => {
            await tx.sign(sender)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-033: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.key.privateKey)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-034: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-035: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-036: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-037: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.from = roleBasedKeyring.address

            await tx.sign(roleBasedKeyring)

            checkFunctionCall(true)
            checkSignature(tx, { expectedLength: roleBasedKeyring.keys[0].length })
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)
    })

    context('feeDelegatedValueTransferWithRatio.signAsFeePayer with multiple keys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeysSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTIONFDR-038: input: keyring. If feePayer is not defined, should be set with keyring address.', async () => {
            tx.feePayer = '0x'
            await tx.signAsFeePayer(sender)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-039: input: keyring. should sign transaction.', async () => {
            await tx.signAsFeePayer(sender)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-040: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.signAsFeePayer(sender.key.privateKey)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-041: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.signAsFeePayer(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-042: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.signAsFeePayer(sender, customHasher)

            checkFunctionCall(true)
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-043: input: keyring. should throw error when feePayer is different.', async () => {
            tx.feePayer = roleBasedKeyring.address

            const expectedError = `The feePayer address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signAsFeePayer(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-044: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.feePayer = roleBasedKeyring.address

            await tx.signAsFeePayer(roleBasedKeyring)

            checkFunctionCall(true)
            checkFeePayerSignature(tx, { expectedLength: roleBasedKeyring.keys[2].length })
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)
    })

    context('feeDelegatedValueTransferWithRatio.appendSignatures', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-045: If signatures is empty, appendSignatures append signatures in transaction', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            tx.appendSignatures(sig)
            checkSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-046: If signatures is empty, appendSignatures append signatures with two-dimensional signature array', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTIONFDR-047: If signatures is not empty, appendSignatures should append signatures', () => {
            transactionObj.signatures = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const sig = [
                '0x0fea',
                '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
            ]

            tx.appendSignatures(sig)
            checkSignature(tx, { expectedLength: 2 })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-048: appendSignatures should append multiple signatures', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

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

    context('feeDelegatedValueTransferWithRatio.appendFeePayerSignatures', () => {
        beforeEach(() => {
            transactionObj.feePayer = '0x90b3e9a3770481345a7f17f22f16d020bccfd33e'
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-049: If feePayerSignatures is empty, appendFeePayerSignatures append feePayerSignatures in transaction', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            tx.appendFeePayerSignatures(sig)
            checkFeePayerSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-050: If feePayerSignatures is empty, appendFeePayerSignatures append feePayerSignatures with two-dimensional signature array', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTIONFDR-051: If feePayerSignatures is not empty, appendFeePayerSignatures should append feePayerSignatures', () => {
            transactionObj.feePayerSignatures = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const sig = [
                '0x0fea',
                '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
            ]

            tx.appendFeePayerSignatures(sig)
            checkFeePayerSignature(tx, { expectedLength: 2 })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-052: appendFeePayerSignatures should append multiple feePayerSignatures', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

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

    context('feeDelegatedValueTransferWithRatio.combineSignedRawTransactions', () => {
        beforeEach(() => {
            transactionObj = {
                from: '0x31e7c5218f810af8ad1e50bf207de0cfb5bd4526',
                to: '0x7b65b75d204abed71587c9e519a89277766ee1d0',
                value: '0xa',
                gas: '0xf4240',
                nonce: '0x1',
                gasPrice: '0x5d21dba00',
                chainId: '0x7e3',
                feeRatio: '0x1e',
            }
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-053: combineSignedRawTransactions combines single signature and sets signatures in transaction', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x0af886018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9431e7c5218f810af8ad1e50bf207de0cfb5bd45261ef847f845820feaa0a832e241979ee7a3e08b49d7a7e8f8029982ee5502c7f970a8fe2676fe1b1084a044ded5739de93803b37790bb323f5020de50850b7b7cdc9a6a2e23a29a8cc14580c4c3018080'
            const combined = tx.combineSignedRawTransactions([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fea',
                    '0xa832e241979ee7a3e08b49d7a7e8f8029982ee5502c7f970a8fe2676fe1b1084',
                    '0x44ded5739de93803b37790bb323f5020de50850b7b7cdc9a6a2e23a29a8cc145',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-054: combineSignedRawTransactions combines multiple signatures and sets signatures in transaction', () => {
            transactionObj.signatures = [
                [
                    '0x0fea',
                    '0xa832e241979ee7a3e08b49d7a7e8f8029982ee5502c7f970a8fe2676fe1b1084',
                    '0x44ded5739de93803b37790bb323f5020de50850b7b7cdc9a6a2e23a29a8cc145',
                ],
            ]
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const rlpEncodedStrings = [
                '0x0af886018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9431e7c5218f810af8ad1e50bf207de0cfb5bd45261ef847f845820feaa0df06077618ef021174af72c807ac968ab6b8549ca997432df73a1fe3612ed226a052684b175ec8fb45506e6f809ec0c879afa62e5cc1e64bd91e16a58a6aa0966780c4c3018080',
                '0x0af886018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9431e7c5218f810af8ad1e50bf207de0cfb5bd45261ef847f845820feaa02944c25a5dc2fe12d365743413ee4f4c133c3f0c142629cadff486679408b86ea05d633f11b2dde9cf51bc596565ca18a7f0f92b9d3447ce4f622188563299217e80c4c3018080',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignedRawTransactions(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x0af90114018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9431e7c5218f810af8ad1e50bf207de0cfb5bd45261ef8d5f845820feaa0a832e241979ee7a3e08b49d7a7e8f8029982ee5502c7f970a8fe2676fe1b1084a044ded5739de93803b37790bb323f5020de50850b7b7cdc9a6a2e23a29a8cc145f845820feaa0df06077618ef021174af72c807ac968ab6b8549ca997432df73a1fe3612ed226a052684b175ec8fb45506e6f809ec0c879afa62e5cc1e64bd91e16a58a6aa09667f845820feaa02944c25a5dc2fe12d365743413ee4f4c133c3f0c142629cadff486679408b86ea05d633f11b2dde9cf51bc596565ca18a7f0f92b9d3447ce4f622188563299217e80c4c3018080'

            const expectedSignatures = [
                [
                    '0x0fea',
                    '0xa832e241979ee7a3e08b49d7a7e8f8029982ee5502c7f970a8fe2676fe1b1084',
                    '0x44ded5739de93803b37790bb323f5020de50850b7b7cdc9a6a2e23a29a8cc145',
                ],
                [
                    '0x0fea',
                    '0xdf06077618ef021174af72c807ac968ab6b8549ca997432df73a1fe3612ed226',
                    '0x52684b175ec8fb45506e6f809ec0c879afa62e5cc1e64bd91e16a58a6aa09667',
                ],
                [
                    '0x0fea',
                    '0x2944c25a5dc2fe12d365743413ee4f4c133c3f0c142629cadff486679408b86e',
                    '0x5d633f11b2dde9cf51bc596565ca18a7f0f92b9d3447ce4f622188563299217e',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-055: combineSignedRawTransactions combines single feePayerSignature and sets feePayerSignatures in transaction', () => {
            transactionObj.feePayer = '0x12dbe69692cb021bc1f161dd5abc0507bd1493ce'
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x0af89a018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9431e7c5218f810af8ad1e50bf207de0cfb5bd45261ec4c30180809412dbe69692cb021bc1f161dd5abc0507bd1493cef847f845820fe9a00c438aba938ee678761ccde71696518d40ed0669c420aaedf66952af0f4eafaaa029354a82fe53b4971b745acd837e0182b7df7e03c6e77821e508669b6a0a6390'
            const combined = tx.combineSignedRawTransactions([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0x0c438aba938ee678761ccde71696518d40ed0669c420aaedf66952af0f4eafaa',
                    '0x29354a82fe53b4971b745acd837e0182b7df7e03c6e77821e508669b6a0a6390',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkFeePayerSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-056: combineSignedRawTransactions combines multiple feePayerSignatures and sets feePayerSignatures in transaction', () => {
            transactionObj.feePayer = '0x12dbe69692cb021bc1f161dd5abc0507bd1493ce'
            transactionObj.feePayerSignatures = [
                [
                    '0x0fe9',
                    '0x0c438aba938ee678761ccde71696518d40ed0669c420aaedf66952af0f4eafaa',
                    '0x29354a82fe53b4971b745acd837e0182b7df7e03c6e77821e508669b6a0a6390',
                ],
            ]
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const rlpEncodedStrings = [
                '0x0af89a018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9431e7c5218f810af8ad1e50bf207de0cfb5bd45261ec4c30180809412dbe69692cb021bc1f161dd5abc0507bd1493cef847f845820feaa015a95b922f43aad929329b13a42c3b00760eb0cabebd19cc0c7935db7d46da9ca02e4d9aa62bc12e40405d8209abbd40b65ba90eb6ff63b4e9260180c3a17525e0',
                '0x0af89a018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9431e7c5218f810af8ad1e50bf207de0cfb5bd45261ec4c30180809412dbe69692cb021bc1f161dd5abc0507bd1493cef847f845820fe9a0b6a124f371122cb3ac5c98c1d0a94ce41d87387b05fce8cfc244c152ab580ffda0121e3c11516f67cda27ade771a7166b93cdbd2beeba39302bd240ee1d9432060',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignedRawTransactions(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x0af90128018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9431e7c5218f810af8ad1e50bf207de0cfb5bd45261ec4c30180809412dbe69692cb021bc1f161dd5abc0507bd1493cef8d5f845820fe9a00c438aba938ee678761ccde71696518d40ed0669c420aaedf66952af0f4eafaaa029354a82fe53b4971b745acd837e0182b7df7e03c6e77821e508669b6a0a6390f845820feaa015a95b922f43aad929329b13a42c3b00760eb0cabebd19cc0c7935db7d46da9ca02e4d9aa62bc12e40405d8209abbd40b65ba90eb6ff63b4e9260180c3a17525e0f845820fe9a0b6a124f371122cb3ac5c98c1d0a94ce41d87387b05fce8cfc244c152ab580ffda0121e3c11516f67cda27ade771a7166b93cdbd2beeba39302bd240ee1d9432060'

            const expectedFeePayerSignatures = [
                [
                    '0x0fe9',
                    '0x0c438aba938ee678761ccde71696518d40ed0669c420aaedf66952af0f4eafaa',
                    '0x29354a82fe53b4971b745acd837e0182b7df7e03c6e77821e508669b6a0a6390',
                ],
                [
                    '0x0fea',
                    '0x15a95b922f43aad929329b13a42c3b00760eb0cabebd19cc0c7935db7d46da9c',
                    '0x2e4d9aa62bc12e40405d8209abbd40b65ba90eb6ff63b4e9260180c3a17525e0',
                ],
                [
                    '0x0fe9',
                    '0xb6a124f371122cb3ac5c98c1d0a94ce41d87387b05fce8cfc244c152ab580ffd',
                    '0x121e3c11516f67cda27ade771a7166b93cdbd2beeba39302bd240ee1d9432060',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkFeePayerSignature(tx, { expectedFeePayerSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-057: combineSignedRawTransactions combines multiple signatures and feePayerSignatures', () => {
            let tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            // RLP encoding with only signatures
            const rlpEncodedStrings = [
                '0x0af90114018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9431e7c5218f810af8ad1e50bf207de0cfb5bd45261ef8d5f845820feaa0a832e241979ee7a3e08b49d7a7e8f8029982ee5502c7f970a8fe2676fe1b1084a044ded5739de93803b37790bb323f5020de50850b7b7cdc9a6a2e23a29a8cc145f845820feaa0df06077618ef021174af72c807ac968ab6b8549ca997432df73a1fe3612ed226a052684b175ec8fb45506e6f809ec0c879afa62e5cc1e64bd91e16a58a6aa09667f845820feaa02944c25a5dc2fe12d365743413ee4f4c133c3f0c142629cadff486679408b86ea05d633f11b2dde9cf51bc596565ca18a7f0f92b9d3447ce4f622188563299217e80c4c3018080',
            ]
            const expectedSignatures = [
                [
                    '0x0fea',
                    '0xa832e241979ee7a3e08b49d7a7e8f8029982ee5502c7f970a8fe2676fe1b1084',
                    '0x44ded5739de93803b37790bb323f5020de50850b7b7cdc9a6a2e23a29a8cc145',
                ],
                [
                    '0x0fea',
                    '0xdf06077618ef021174af72c807ac968ab6b8549ca997432df73a1fe3612ed226',
                    '0x52684b175ec8fb45506e6f809ec0c879afa62e5cc1e64bd91e16a58a6aa09667',
                ],
                [
                    '0x0fea',
                    '0x2944c25a5dc2fe12d365743413ee4f4c133c3f0c142629cadff486679408b86e',
                    '0x5d633f11b2dde9cf51bc596565ca18a7f0f92b9d3447ce4f622188563299217e',
                ],
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            let combined = tx.combineSignedRawTransactions(rlpEncodedStrings)
            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)

            const rlpEncodedStringsWithFeePayerSignatures = [
                '0x0af90128018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9431e7c5218f810af8ad1e50bf207de0cfb5bd45261ec4c30180809412dbe69692cb021bc1f161dd5abc0507bd1493cef8d5f845820fe9a00c438aba938ee678761ccde71696518d40ed0669c420aaedf66952af0f4eafaaa029354a82fe53b4971b745acd837e0182b7df7e03c6e77821e508669b6a0a6390f845820feaa015a95b922f43aad929329b13a42c3b00760eb0cabebd19cc0c7935db7d46da9ca02e4d9aa62bc12e40405d8209abbd40b65ba90eb6ff63b4e9260180c3a17525e0f845820fe9a0b6a124f371122cb3ac5c98c1d0a94ce41d87387b05fce8cfc244c152ab580ffda0121e3c11516f67cda27ade771a7166b93cdbd2beeba39302bd240ee1d9432060',
            ]
            const expectedFeePayerSignatures = [
                [
                    '0x0fe9',
                    '0x0c438aba938ee678761ccde71696518d40ed0669c420aaedf66952af0f4eafaa',
                    '0x29354a82fe53b4971b745acd837e0182b7df7e03c6e77821e508669b6a0a6390',
                ],
                [
                    '0x0fea',
                    '0x15a95b922f43aad929329b13a42c3b00760eb0cabebd19cc0c7935db7d46da9c',
                    '0x2e4d9aa62bc12e40405d8209abbd40b65ba90eb6ff63b4e9260180c3a17525e0',
                ],
                [
                    '0x0fe9',
                    '0xb6a124f371122cb3ac5c98c1d0a94ce41d87387b05fce8cfc244c152ab580ffd',
                    '0x121e3c11516f67cda27ade771a7166b93cdbd2beeba39302bd240ee1d9432060',
                ],
            ]

            const appendFeePayerSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            combined = tx.combineSignedRawTransactions(rlpEncodedStringsWithFeePayerSignatures)
            expect(appendFeePayerSignaturesSpy).to.have.been.callCount(rlpEncodedStringsWithFeePayerSignatures.length)

            // combine multiple signatures and feePayerSignatures
            tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)
            const combinedWithMultiple = tx.combineSignedRawTransactions([combined])

            expect(combined).to.equal(combinedWithMultiple)
            checkSignature(tx, { expectedSignatures })
            checkFeePayerSignature(tx, { expectedFeePayerSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-058: If decode transaction has different values, combineSignedRawTransactions should throw error', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)
            tx.value = 10000

            const rlpEncoded =
                '0x0af886018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a9431e7c5218f810af8ad1e50bf207de0cfb5bd45261ef847f845820feaa0a832e241979ee7a3e08b49d7a7e8f8029982ee5502c7f970a8fe2676fe1b1084a044ded5739de93803b37790bb323f5020de50850b7b7cdc9a6a2e23a29a8cc14580c4c3018080'
            const expectedError = `Transactions containing different information cannot be combined.`

            expect(() => tx.combineSignedRawTransactions([rlpEncoded])).to.throw(expectedError)
        })
    })

    context('feeDelegatedValueTransferWithRatio.getRawTransaction', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-059: getRawTransaction should call getRLPEncoding function', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rawTransaction = tx.getRawTransaction()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(rawTransaction).to.equal(txWithExpectedValues.rlpEncoding)
        })
    })

    context('feeDelegatedValueTransferWithRatio.getTransactionHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-060: getTransactionHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const txHash = tx.getTransactionHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(txHash).to.equal(txWithExpectedValues.transactionHash)
            expect(caver.utils.isValidHashStrict(txHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-061: getTransactionHash should throw error when nonce is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.gasPrice = '0x5d21dba00'
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-062: getTransactionHash should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })
    })

    context('feeDelegatedValueTransferWithRatio.getSenderTxHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-064: getSenderTxHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const senderTxHash = tx.getSenderTxHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(senderTxHash).to.equal(txWithExpectedValues.senderTxHash)
            expect(caver.utils.isValidHashStrict(senderTxHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-065: getSenderTxHash should throw error when nonce is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.gasPrice = '0x5d21dba00'
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-066: getSenderTxHash should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })
    })

    context('feeDelegatedValueTransferWithRatio.getRLPEncodingForSignature', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-068: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(txWithExpectedValues.tx)

            const commonRLPForSigningSpy = sandbox.spy(tx, 'getCommonRLPEncodingForSignature')

            const rlpEncodingForSign = tx.getRLPEncodingForSignature()

            expect(rlpEncodingForSign).to.equal(txWithExpectedValues.rlpEncodingForSigning)
            expect(commonRLPForSigningSpy).to.have.been.calledOnce
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-069: getRLPEncodingForSignature should throw error when nonce is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-070: getRLPEncodingForSignature should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-071: getRLPEncodingForSignature should throw error when chainId is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })
    })

    context('feeDelegatedValueTransferWithRatio.getCommonRLPEncodingForSignature', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-072: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(txWithExpectedValues.tx)

            const commonRLPForSign = tx.getCommonRLPEncodingForSignature()
            const decoded = RLP.decode(txWithExpectedValues.rlpEncodingForSigning)

            expect(commonRLPForSign).to.equal(decoded[0])
        })
    })

    context('feeDelegatedValueTransferWithRatio.fillTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-073: fillTransaction should call klay_getGasPrice to fill gasPrice when gasPrice is undefined', async () => {
            transactionObj.nonce = '0x3a'
            transactionObj.chainId = 2019
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-074: fillTransaction should call klay_getTransactionCount to fill nonce when nonce is undefined', async () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-075: fillTransaction should call klay_getChainid to fill chainId when chainId is undefined', async () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransferWithRatio(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).to.have.been.calledOnce
        }).timeout(200000)
    })
})
