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
        feeRatio: 30,
        chainId: '0x1',
        nonce: 1234,
        signatures: [
            [
                '0x26',
                '0x74ccfee18dc28932396b85617c53784ee366303bce39a2401d8eb602cf73766f',
                '0x4c937a5ab9401d2cacb3f39ba8c29dbcd44588cc5c7d0b6b4113cfa7b7d9427b',
            ],
        ],
        feePayer: '0x5A0043070275d9f6054307Ee7348bD660849D90f',
        feePayerSignatures: [
            [
                '0x25',
                '0x4a4997524694d535976d7343c1e3a260f99ba53fcb5477e2b96216ec96ebb565',
                '0xf8cb31a35399d2b0fbbfa39f259c819a15370706c0449952c7cfc682d200d7c',
            ],
        ],
    }
    txWithExpectedValues.rlpEncodingForSigning =
        '0xf861b85cf85a328204d219830f4240947b65b75d204abed71587c9e519a89277766ee1d00a94a94f5374fce5edbc8e2a8697c15331677e6ebf0ba46353586b000000000000000000000000bc5951f055a85f41a3b62fd6f68ab7de76d299b21e018080'
    txWithExpectedValues.rlpEncodingForFeePayerSigning =
        '0xf876b85cf85a328204d219830f4240947b65b75d204abed71587c9e519a89277766ee1d00a94a94f5374fce5edbc8e2a8697c15331677e6ebf0ba46353586b000000000000000000000000bc5951f055a85f41a3b62fd6f68ab7de76d299b21e945a0043070275d9f6054307ee7348bd660849d90f018080'
    txWithExpectedValues.senderTxHash = '0xd5e22319cbf020d422d8ba3a07da9d99b9300826637af85b4e061805dcb2c1b0'
    txWithExpectedValues.transactionHash = '0xb204e530f2a7f010d65b6f0f7639d1e9fc8add73e3a0ff1551b11585c36d3bdb'
    txWithExpectedValues.rlpEncoding =
        '0x32f8fc8204d219830f4240947b65b75d204abed71587c9e519a89277766ee1d00a94a94f5374fce5edbc8e2a8697c15331677e6ebf0ba46353586b000000000000000000000000bc5951f055a85f41a3b62fd6f68ab7de76d299b21ef845f84326a074ccfee18dc28932396b85617c53784ee366303bce39a2401d8eb602cf73766fa04c937a5ab9401d2cacb3f39ba8c29dbcd44588cc5c7d0b6b4113cfa7b7d9427b945a0043070275d9f6054307ee7348bd660849d90ff845f84325a04a4997524694d535976d7343c1e3a260f99ba53fcb5477e2b96216ec96ebb565a00f8cb31a35399d2b0fbbfa39f259c819a15370706c0449952c7cfc682d200d7c'
})

describe('TxTypeFeeDelegatedSmartContractExecutionWithRatio', () => {
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
            feeRatio: 30,
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

    context('create feeDelegatedSmartContractExecutionWithRatio instance', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-301: If feeDelegatedSmartContractExecutionWithRatio not define from, return error', () => {
            delete transactionObj.from

            const expectedError = '"from" is missing'
            expect(() => caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-302: If feeDelegatedSmartContractExecutionWithRatio not define to, return error', () => {
            delete transactionObj.to

            const expectedError = '"to" is missing'
            expect(() => caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-303: If feeDelegatedSmartContractExecutionWithRatio not define gas, return error', () => {
            delete transactionObj.gas

            const expectedError = '"gas" is missing'
            expect(() => caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-304: If feeDelegatedSmartContractExecutionWithRatio not define input, return error', () => {
            delete transactionObj.input

            const expectedError = '"input" is missing'
            expect(() => caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-305: If feeDelegatedSmartContractExecutionWithRatio not define feeRatio, return error', () => {
            delete transactionObj.feeRatio

            const expectedError = '"feeRatio" is missing'
            expect(() => caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-306: If feeDelegatedSmartContractExecutionWithRatio define from property with invalid address, return error', () => {
            transactionObj.from = 'invalid'

            const expectedError = `Invalid address of from: ${transactionObj.from}`
            expect(() => caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-307: If feeDelegatedSmartContractExecutionWithRatio define to property with invalid address, return error', () => {
            transactionObj.to = 'invalid'

            const expectedError = `Invalid address of to: ${transactionObj.to}`
            expect(() => caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-308: If feeDelegatedSmartContractExecutionWithRatio define feePayer property with invalid address, return error', () => {
            transactionObj.feePayer = 'invalid'

            const expectedError = `Invalid address of fee payer: ${transactionObj.feePayer}`
            expect(() => caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-525: If feeDelegatedSmartContractExecutionWithRatio define feeRatio property with invalid value, return error', () => {
            transactionObj.feeRatio = 'nonHexString'
            let expectedError = `Invalid type fo feeRatio: feeRatio should be number type or hex number string.`
            expect(() => caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = {}
            expect(() => caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = []
            expect(() => caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = 0
            expectedError = `Invalid feeRatio: feeRatio is out of range. [1, 99]`
            expect(() => caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = 100
            expect(() => caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = -1
            expect(() => caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = 101
            expect(() => caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-309: If feeDelegatedSmartContractExecutionWithRatio define feePayerSignatures property without feePayer, return error', () => {
            transactionObj.feePayerSignatures = [
                [
                    '0x26',
                    '0xf45cf8d7f88c08e6b6ec0b3b562f34ca94283e4689021987abb6b0772ddfd80a',
                    '0x298fe2c5aeabb6a518f4cbb5ff39631a5d88be505d3923374f65fdcf63c2955b',
                ],
            ]

            const expectedError = '"feePayer" is missing: feePayer must be defined with feePayerSignatures.'
            expect(() => caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-310: If feeDelegatedSmartContractExecutionWithRatio define unnecessary property, return error', () => {
            const unnecessaries = [
                propertiesForUnnecessary.codeFormat,
                propertiesForUnnecessary.humanReadable,
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
                propertiesForUnnecessary.accessList,
                propertiesForUnnecessary.maxPriorityFeePerGas,
                propertiesForUnnecessary.maxFeePerGas,
            ]

            for (let i = 0; i < unnecessaries.length; i++) {
                if (i > 0) delete transactionObj[unnecessaries[i - 1].name]
                transactionObj[unnecessaries[i].name] = unnecessaries[i].value

                const expectedError = `"${unnecessaries[i].name}" cannot be used with ${caver.transaction.type.TxTypeFeeDelegatedSmartContractExecutionWithRatio} transaction`
                expect(() => caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)).to.throw(expectedError)
            }
        })
    })

    context('feeDelegatedSmartContractExecutionWithRatio.getRLPEncoding', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-311: Returns RLP-encoded string', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(txWithExpectedValues.tx)

            expect(tx.getRLPEncoding()).to.equal(txWithExpectedValues.rlpEncoding)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-312: getRLPEncoding should throw error when nonce is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.gasPrice = '0x5d21dba00'
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-313: getRLPEncoding should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })
    })

    context('feeDelegatedSmartContractExecutionWithRatio.sign', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTIONFDR-315: input: keyring. should sign transaction.', async () => {
            await tx.sign(sender)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-316: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.key.privateKey)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-317: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-318: input: keyring, index. should sign transaction with specific index.', async () => {
            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.from = roleBasedKeyring.address

            await tx.sign(roleBasedKeyring, 1)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignSpy).to.have.been.calledWith(txHash, '0x7e3', 0, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-319: input: keyring, custom hasher. should use custom hasher.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-320: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFDR-321: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-322: input: rolebased keyring, index out of range. should throw error.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
            await expect(tx.sign(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('feeDelegatedSmartContractExecutionWithRatio.signAsFeePayer', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)
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

        it('CAVERJS-UNIT-TRANSACTIONFDR-323: input: keyring. If feePayer is not defined, should be set with keyring address.', async () => {
            tx.feePayer = '0x'
            await tx.signAsFeePayer(sender)

            expect(tx.feePayer.toLowerCase()).to.equal(sender.address.toLowerCase())
            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-324: input: keyring. should sign transaction.', async () => {
            await tx.signAsFeePayer(sender)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-235: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.signAsFeePayer(sender.key.privateKey)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-326: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.signAsFeePayer(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-327: input: keyring, index. should sign transaction with specific index.', async () => {
            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.feePayer = roleBasedKeyring.address

            await tx.signAsFeePayer(roleBasedKeyring, 1)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignSpy).to.have.been.calledWith(txHash, '0x7e3', 2, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-328: input: keyring, custom hasher. should use custom hasher.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFDR-329: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFDR-330: input: keyring. should throw error when feePayer is different.', async () => {
            tx.feePayer = roleBasedKeyring.address

            const expectedError = `The feePayer address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signAsFeePayer(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-331: input: rolebased keyring, index out of range. should throw error.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
            await expect(tx.signAsFeePayer(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('feeDelegatedSmartContractExecutionWithRatio.sign with multiple keys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeysSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTIONFDR-332: input: keyring. should sign transaction.', async () => {
            await tx.sign(sender)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-333: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.key.privateKey)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-334: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-335: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-336: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-337: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.from = roleBasedKeyring.address

            await tx.sign(roleBasedKeyring)

            checkFunctionCall(true)
            checkSignature(tx, { expectedLength: roleBasedKeyring.keys[0].length })
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)
    })

    context('feeDelegatedSmartContractExecutionWithRatio.signAsFeePayer with multiple keys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeysSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTIONFDR-338: input: keyring. If feePayer is not defined, should be set with keyring address.', async () => {
            tx.feePayer = '0x'
            await tx.signAsFeePayer(sender)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-339: input: keyring. should sign transaction.', async () => {
            await tx.signAsFeePayer(sender)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-340: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.signAsFeePayer(sender.key.privateKey)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-341: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.signAsFeePayer(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-342: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.signAsFeePayer(sender, customHasher)

            checkFunctionCall(true)
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-343: input: keyring. should throw error when feePayer is different.', async () => {
            tx.feePayer = roleBasedKeyring.address

            const expectedError = `The feePayer address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signAsFeePayer(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-344: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.feePayer = roleBasedKeyring.address

            await tx.signAsFeePayer(roleBasedKeyring)

            checkFunctionCall(true)
            checkFeePayerSignature(tx, { expectedLength: roleBasedKeyring.keys[2].length })
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)
    })

    context('feeDelegatedSmartContractExecutionWithRatio.appendSignatures', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-345: If signatures is empty, appendSignatures append signatures in transaction', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            tx.appendSignatures(sig)
            checkSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-346: If signatures is empty, appendSignatures append signatures with two-dimensional signature array', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTIONFDR-347: If signatures is not empty, appendSignatures should append signatures', () => {
            transactionObj.signatures = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const sig = [
                '0x0fea',
                '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
            ]

            tx.appendSignatures(sig)
            checkSignature(tx, { expectedLength: 2 })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-348: appendSignatures should append multiple signatures', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

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

    context('feeDelegatedSmartContractExecutionWithRatio.appendFeePayerSignatures', () => {
        beforeEach(() => {
            transactionObj.feePayer = '0x90b3e9a3770481345a7f17f22f16d020bccfd33e'
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-349: If feePayerSignatures is empty, appendFeePayerSignatures append feePayerSignatures in transaction', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            tx.appendFeePayerSignatures(sig)
            checkFeePayerSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-350: If feePayerSignatures is empty, appendFeePayerSignatures append feePayerSignatures with two-dimensional signature array', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTIONFDR-351: If feePayerSignatures is not empty, appendFeePayerSignatures should append feePayerSignatures', () => {
            transactionObj.feePayerSignatures = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const sig = [
                '0x0fea',
                '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
            ]

            tx.appendFeePayerSignatures(sig)
            checkFeePayerSignature(tx, { expectedLength: 2 })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-352: appendFeePayerSignatures should append multiple feePayerSignatures', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

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

    context('feeDelegatedSmartContractExecutionWithRatio.combineSignedRawTransactions', () => {
        beforeEach(() => {
            transactionObj = {
                from: '0xe862a5ddac7f82f57eaea34f3f915121a6da1bb2',
                to: '0xf14274fd5f22f436e3a2d3f3b167f9f241c33db5',
                value: '0x0',
                input:
                    '0xa9059cbb000000000000000000000000ad3bd7a7df94367e8b0443dd10e86330750ebf0c00000000000000000000000000000000000000000000000000000002540be400',
                gas: '0x30d40',
                nonce: '0x3',
                gasPrice: '0x5d21dba00',
                feeRatio: 30,
                chainId: '0x7e3',
            }
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-353: combineSignedRawTransactions combines single signature and sets signatures in transaction', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x32f8e0038505d21dba0083030d4094f14274fd5f22f436e3a2d3f3b167f9f241c33db58094e862a5ddac7f82f57eaea34f3f915121a6da1bb2b844a9059cbb000000000000000000000000ad3bd7a7df94367e8b0443dd10e86330750ebf0c00000000000000000000000000000000000000000000000000000002540be4001ef847f845820fe9a0b95ed5ff6d9cd8d02e3031ea4ddf38d42803817b5ecc086828f497787699bf5ba0105105455d4af28cc943e43e375316b57205e6eb664407b3bc1a7eca9ecd6c8f940000000000000000000000000000000000000000c4c3018080'
            const combined = tx.combineSignedRawTransactions([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0xb95ed5ff6d9cd8d02e3031ea4ddf38d42803817b5ecc086828f497787699bf5b',
                    '0x105105455d4af28cc943e43e375316b57205e6eb664407b3bc1a7eca9ecd6c8f',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-354: combineSignedRawTransactions combines multiple signatures and sets signatures in transaction', () => {
            transactionObj.signatures = [
                [
                    '0x0fe9',
                    '0xb95ed5ff6d9cd8d02e3031ea4ddf38d42803817b5ecc086828f497787699bf5b',
                    '0x105105455d4af28cc943e43e375316b57205e6eb664407b3bc1a7eca9ecd6c8f',
                ],
            ]
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const rlpEncodedStrings = [
                '0x32f8cc038505d21dba0083030d4094f14274fd5f22f436e3a2d3f3b167f9f241c33db58094e862a5ddac7f82f57eaea34f3f915121a6da1bb2b844a9059cbb000000000000000000000000ad3bd7a7df94367e8b0443dd10e86330750ebf0c00000000000000000000000000000000000000000000000000000002540be4001ef847f845820fe9a058cf881d440cd88e2a1d0999b4b0eec72b36f7c13a793fcba7d509c544c06505a025bdcc5b6f7619169397508d38da290faa54b01c83c582d1dfa0ba250b7a187180c4c3018080',
                '0x32f8cc038505d21dba0083030d4094f14274fd5f22f436e3a2d3f3b167f9f241c33db58094e862a5ddac7f82f57eaea34f3f915121a6da1bb2b844a9059cbb000000000000000000000000ad3bd7a7df94367e8b0443dd10e86330750ebf0c00000000000000000000000000000000000000000000000000000002540be4001ef847f845820fe9a0fa309605c494a338e4cd92c7bedeafa25387f57e0b5f6e18f9d8da90edea9e44a055d173d614d096f23eb9a01fd894f961d266985df6503d5176d047eb3b3ef5ed80c4c3018080',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignedRawTransactions(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x32f9016e038505d21dba0083030d4094f14274fd5f22f436e3a2d3f3b167f9f241c33db58094e862a5ddac7f82f57eaea34f3f915121a6da1bb2b844a9059cbb000000000000000000000000ad3bd7a7df94367e8b0443dd10e86330750ebf0c00000000000000000000000000000000000000000000000000000002540be4001ef8d5f845820fe9a0b95ed5ff6d9cd8d02e3031ea4ddf38d42803817b5ecc086828f497787699bf5ba0105105455d4af28cc943e43e375316b57205e6eb664407b3bc1a7eca9ecd6c8ff845820fe9a058cf881d440cd88e2a1d0999b4b0eec72b36f7c13a793fcba7d509c544c06505a025bdcc5b6f7619169397508d38da290faa54b01c83c582d1dfa0ba250b7a1871f845820fe9a0fa309605c494a338e4cd92c7bedeafa25387f57e0b5f6e18f9d8da90edea9e44a055d173d614d096f23eb9a01fd894f961d266985df6503d5176d047eb3b3ef5ed940000000000000000000000000000000000000000c4c3018080'

            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0xb95ed5ff6d9cd8d02e3031ea4ddf38d42803817b5ecc086828f497787699bf5b',
                    '0x105105455d4af28cc943e43e375316b57205e6eb664407b3bc1a7eca9ecd6c8f',
                ],
                [
                    '0x0fe9',
                    '0x58cf881d440cd88e2a1d0999b4b0eec72b36f7c13a793fcba7d509c544c06505',
                    '0x25bdcc5b6f7619169397508d38da290faa54b01c83c582d1dfa0ba250b7a1871',
                ],
                [
                    '0x0fe9',
                    '0xfa309605c494a338e4cd92c7bedeafa25387f57e0b5f6e18f9d8da90edea9e44',
                    '0x55d173d614d096f23eb9a01fd894f961d266985df6503d5176d047eb3b3ef5ed',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-355: combineSignedRawTransactions combines single feePayerSignature and sets feePayerSignatures in transaction', () => {
            transactionObj.feePayer = '0xad3bd7a7df94367e8b0443dd10e86330750ebf0c'
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x32f8e0038505d21dba0083030d4094f14274fd5f22f436e3a2d3f3b167f9f241c33db58094e862a5ddac7f82f57eaea34f3f915121a6da1bb2b844a9059cbb000000000000000000000000ad3bd7a7df94367e8b0443dd10e86330750ebf0c00000000000000000000000000000000000000000000000000000002540be4001ec4c301808094ad3bd7a7df94367e8b0443dd10e86330750ebf0cf847f845820fe9a0c7a060a2e28476e4567bc76964f826153149a07c061e389b51f34f3863f65a31a01bfd20aca5b410ca369113150c16af4d9f9c72907aaaf34896427ef1f1a51ebb'
            const combined = tx.combineSignedRawTransactions([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0xc7a060a2e28476e4567bc76964f826153149a07c061e389b51f34f3863f65a31',
                    '0x1bfd20aca5b410ca369113150c16af4d9f9c72907aaaf34896427ef1f1a51ebb',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkFeePayerSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-356: combineSignedRawTransactions combines multiple feePayerSignatures and sets feePayerSignatures in transaction', () => {
            transactionObj.feePayer = '0xad3bd7a7df94367e8b0443dd10e86330750ebf0c'
            transactionObj.feePayerSignatures = [
                [
                    '0x0fe9',
                    '0xc7a060a2e28476e4567bc76964f826153149a07c061e389b51f34f3863f65a31',
                    '0x1bfd20aca5b410ca369113150c16af4d9f9c72907aaaf34896427ef1f1a51ebb',
                ],
            ]
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const rlpEncodedStrings = [
                '0x32f8e0038505d21dba0083030d4094f14274fd5f22f436e3a2d3f3b167f9f241c33db58094e862a5ddac7f82f57eaea34f3f915121a6da1bb2b844a9059cbb000000000000000000000000ad3bd7a7df94367e8b0443dd10e86330750ebf0c00000000000000000000000000000000000000000000000000000002540be4001ec4c301808094ad3bd7a7df94367e8b0443dd10e86330750ebf0cf847f845820feaa09d6fb034ed27fa0baf8ba2650b48e087d261ab7716eae4df9299236ddce7dd08a053b1c7ab56349cbb5515e27737846f97862e3f20409b183c3c6b4a918cd20920',
                '0x32f8e0038505d21dba0083030d4094f14274fd5f22f436e3a2d3f3b167f9f241c33db58094e862a5ddac7f82f57eaea34f3f915121a6da1bb2b844a9059cbb000000000000000000000000ad3bd7a7df94367e8b0443dd10e86330750ebf0c00000000000000000000000000000000000000000000000000000002540be4001ec4c301808094ad3bd7a7df94367e8b0443dd10e86330750ebf0cf847f845820fe9a019315d03a16242c6d754bd006883376e211b6f8af486d1b41a0705878e3bb100a06d463477534b9c5e82196cb8c8982bc0e3c9120b14c2db3df0f4d1c9dc04c657',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignedRawTransactions(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x32f9016e038505d21dba0083030d4094f14274fd5f22f436e3a2d3f3b167f9f241c33db58094e862a5ddac7f82f57eaea34f3f915121a6da1bb2b844a9059cbb000000000000000000000000ad3bd7a7df94367e8b0443dd10e86330750ebf0c00000000000000000000000000000000000000000000000000000002540be4001ec4c301808094ad3bd7a7df94367e8b0443dd10e86330750ebf0cf8d5f845820fe9a0c7a060a2e28476e4567bc76964f826153149a07c061e389b51f34f3863f65a31a01bfd20aca5b410ca369113150c16af4d9f9c72907aaaf34896427ef1f1a51ebbf845820feaa09d6fb034ed27fa0baf8ba2650b48e087d261ab7716eae4df9299236ddce7dd08a053b1c7ab56349cbb5515e27737846f97862e3f20409b183c3c6b4a918cd20920f845820fe9a019315d03a16242c6d754bd006883376e211b6f8af486d1b41a0705878e3bb100a06d463477534b9c5e82196cb8c8982bc0e3c9120b14c2db3df0f4d1c9dc04c657'

            const expectedFeePayerSignatures = [
                [
                    '0x0fe9',
                    '0xc7a060a2e28476e4567bc76964f826153149a07c061e389b51f34f3863f65a31',
                    '0x1bfd20aca5b410ca369113150c16af4d9f9c72907aaaf34896427ef1f1a51ebb',
                ],
                [
                    '0x0fea',
                    '0x9d6fb034ed27fa0baf8ba2650b48e087d261ab7716eae4df9299236ddce7dd08',
                    '0x53b1c7ab56349cbb5515e27737846f97862e3f20409b183c3c6b4a918cd20920',
                ],
                [
                    '0x0fe9',
                    '0x19315d03a16242c6d754bd006883376e211b6f8af486d1b41a0705878e3bb100',
                    '0x6d463477534b9c5e82196cb8c8982bc0e3c9120b14c2db3df0f4d1c9dc04c657',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkFeePayerSignature(tx, { expectedFeePayerSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-357: combineSignedRawTransactions combines multiple signatures and feePayerSignatures', () => {
            let tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            // RLP encoding with only signatures
            const rlpEncodedStrings = [
                '0x32f9015a038505d21dba0083030d4094f14274fd5f22f436e3a2d3f3b167f9f241c33db58094e862a5ddac7f82f57eaea34f3f915121a6da1bb2b844a9059cbb000000000000000000000000ad3bd7a7df94367e8b0443dd10e86330750ebf0c00000000000000000000000000000000000000000000000000000002540be4001ef8d5f845820fe9a0b95ed5ff6d9cd8d02e3031ea4ddf38d42803817b5ecc086828f497787699bf5ba0105105455d4af28cc943e43e375316b57205e6eb664407b3bc1a7eca9ecd6c8ff845820fe9a058cf881d440cd88e2a1d0999b4b0eec72b36f7c13a793fcba7d509c544c06505a025bdcc5b6f7619169397508d38da290faa54b01c83c582d1dfa0ba250b7a1871f845820fe9a0fa309605c494a338e4cd92c7bedeafa25387f57e0b5f6e18f9d8da90edea9e44a055d173d614d096f23eb9a01fd894f961d266985df6503d5176d047eb3b3ef5ed80c4c3018080',
            ]
            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0xb95ed5ff6d9cd8d02e3031ea4ddf38d42803817b5ecc086828f497787699bf5b',
                    '0x105105455d4af28cc943e43e375316b57205e6eb664407b3bc1a7eca9ecd6c8f',
                ],
                [
                    '0x0fe9',
                    '0x58cf881d440cd88e2a1d0999b4b0eec72b36f7c13a793fcba7d509c544c06505',
                    '0x25bdcc5b6f7619169397508d38da290faa54b01c83c582d1dfa0ba250b7a1871',
                ],
                [
                    '0x0fe9',
                    '0xfa309605c494a338e4cd92c7bedeafa25387f57e0b5f6e18f9d8da90edea9e44',
                    '0x55d173d614d096f23eb9a01fd894f961d266985df6503d5176d047eb3b3ef5ed',
                ],
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            let combined = tx.combineSignedRawTransactions(rlpEncodedStrings)
            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)

            const rlpEncodedStringsWithFeePayerSignatures = [
                '0x32f9016e038505d21dba0083030d4094f14274fd5f22f436e3a2d3f3b167f9f241c33db58094e862a5ddac7f82f57eaea34f3f915121a6da1bb2b844a9059cbb000000000000000000000000ad3bd7a7df94367e8b0443dd10e86330750ebf0c00000000000000000000000000000000000000000000000000000002540be4001ec4c301808094ad3bd7a7df94367e8b0443dd10e86330750ebf0cf8d5f845820fe9a0c7a060a2e28476e4567bc76964f826153149a07c061e389b51f34f3863f65a31a01bfd20aca5b410ca369113150c16af4d9f9c72907aaaf34896427ef1f1a51ebbf845820feaa09d6fb034ed27fa0baf8ba2650b48e087d261ab7716eae4df9299236ddce7dd08a053b1c7ab56349cbb5515e27737846f97862e3f20409b183c3c6b4a918cd20920f845820fe9a019315d03a16242c6d754bd006883376e211b6f8af486d1b41a0705878e3bb100a06d463477534b9c5e82196cb8c8982bc0e3c9120b14c2db3df0f4d1c9dc04c657',
            ]
            const expectedFeePayerSignatures = [
                [
                    '0x0fe9',
                    '0xc7a060a2e28476e4567bc76964f826153149a07c061e389b51f34f3863f65a31',
                    '0x1bfd20aca5b410ca369113150c16af4d9f9c72907aaaf34896427ef1f1a51ebb',
                ],
                [
                    '0x0fea',
                    '0x9d6fb034ed27fa0baf8ba2650b48e087d261ab7716eae4df9299236ddce7dd08',
                    '0x53b1c7ab56349cbb5515e27737846f97862e3f20409b183c3c6b4a918cd20920',
                ],
                [
                    '0x0fe9',
                    '0x19315d03a16242c6d754bd006883376e211b6f8af486d1b41a0705878e3bb100',
                    '0x6d463477534b9c5e82196cb8c8982bc0e3c9120b14c2db3df0f4d1c9dc04c657',
                ],
            ]

            const appendFeePayerSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            combined = tx.combineSignedRawTransactions(rlpEncodedStringsWithFeePayerSignatures)
            expect(appendFeePayerSignaturesSpy).to.have.been.callCount(rlpEncodedStringsWithFeePayerSignatures.length)

            // combine multiple signatures and feePayerSignatures
            tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)
            const combinedWithMultiple = tx.combineSignedRawTransactions([combined])

            expect(combined).to.equal(combinedWithMultiple)
            checkSignature(tx, { expectedSignatures })
            checkFeePayerSignature(tx, { expectedFeePayerSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-358: If decode transaction has different values, combineSignedRawTransactions should throw error', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)
            tx.value = 10000

            const rlpEncoded =
                '0x32f8cc038505d21dba0083030d4094f14274fd5f22f436e3a2d3f3b167f9f241c33db58094e862a5ddac7f82f57eaea34f3f915121a6da1bb2b844a9059cbb000000000000000000000000ad3bd7a7df94367e8b0443dd10e86330750ebf0c00000000000000000000000000000000000000000000000000000002540be4001ef847f845820fe9a0b95ed5ff6d9cd8d02e3031ea4ddf38d42803817b5ecc086828f497787699bf5ba0105105455d4af28cc943e43e375316b57205e6eb664407b3bc1a7eca9ecd6c8f80c4c3018080'
            const expectedError = `Transactions containing different information cannot be combined.`

            expect(() => tx.combineSignedRawTransactions([rlpEncoded])).to.throw(expectedError)
        })
    })

    context('feeDelegatedSmartContractExecutionWithRatio.getRawTransaction', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-359: getRawTransaction should call getRLPEncoding function', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rawTransaction = tx.getRawTransaction()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(rawTransaction).to.equal(txWithExpectedValues.rlpEncoding)
        })
    })

    context('feeDelegatedSmartContractExecutionWithRatio.getTransactionHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-360: getTransactionHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const txHash = tx.getTransactionHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(txHash).to.equal(txWithExpectedValues.transactionHash)
            expect(caver.utils.isValidHashStrict(txHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-361: getTransactionHash should throw error when nonce is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.gasPrice = '0x5d21dba00'
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-362: getTransactionHash should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })
    })

    context('feeDelegatedSmartContractExecutionWithRatio.getSenderTxHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-364: getSenderTxHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const senderTxHash = tx.getSenderTxHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(senderTxHash).to.equal(txWithExpectedValues.senderTxHash)
            expect(caver.utils.isValidHashStrict(senderTxHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-365: getSenderTxHash should throw error when nonce is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.gasPrice = '0x5d21dba00'
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-366: getSenderTxHash should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })
    })

    context('feeDelegatedSmartContractExecutionWithRatio.getRLPEncodingForSignature', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-368: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(txWithExpectedValues.tx)

            const commonRLPForSigningSpy = sandbox.spy(tx, 'getCommonRLPEncodingForSignature')

            const rlpEncodingForSign = tx.getRLPEncodingForSignature()

            expect(rlpEncodingForSign).to.equal(txWithExpectedValues.rlpEncodingForSigning)
            expect(commonRLPForSigningSpy).to.have.been.calledOnce
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-369: getRLPEncodingForSignature should throw error when nonce is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-370: getRLPEncodingForSignature should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-371: getRLPEncodingForSignature should throw error when chainId is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })
    })

    context('feeDelegatedSmartContractExecutionWithRatio.getCommonRLPEncodingForSignature', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-372: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(txWithExpectedValues.tx)

            const commonRLPForSign = tx.getCommonRLPEncodingForSignature()
            const decoded = RLP.decode(txWithExpectedValues.rlpEncodingForSigning)

            expect(commonRLPForSign).to.equal(decoded[0])
        })
    })

    context('feeDelegatedSmartContractExecutionWithRatio.fillTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-373: fillTransaction should call klay_getGasPrice to fill gasPrice when gasPrice is undefined', async () => {
            transactionObj.nonce = '0x3a'
            transactionObj.chainId = 2019
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-374: fillTransaction should call klay_getTransactionCount to fill nonce when nonce is undefined', async () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-375: fillTransaction should call klay_getChainid to fill chainId when chainId is undefined', async () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).to.have.been.calledOnce
        }).timeout(200000)
    })

    context(
        'feeDelegatedSmartContractExecutionWithRatio.recoverPublicKeys feeDelegatedSmartContractExecutionWithRatio.recoverFeePayerPublicKeys',
        () => {
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
                feeRatio: '0x63',
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
                        '0x0fea',
                        '0xec91b2f010d2a67c553924a5da051c22b1fde3271ef5ca0caaef88e84a687346',
                        '0x4bdc835e82717a34354b7cb445d679f9fcfa4bfd5cb3e201c74aa1cfa1a0c264',
                    ],
                    [
                        '0x0fea',
                        '0x88bff49b9b12dc37f2a9665dc9bf88bf433e3e66b8772006f0b21a6acb619511',
                        '0x1e56201dc2e43d108e7d568b1596d762f68296a47067d6da59f55b88a4c341d1',
                    ],
                    [
                        '0x0fe9',
                        '0xda52e3241059667a2dcb50a541b88b46cc1a8d7a5c5cc1047453815b03d9d34c',
                        '0x17dc3367702f6e20092e8b1893cf0fdec60e8dde82891e9b278607c97ca25a4a',
                    ],
                ],
                feePayerSignatures: [
                    [
                        '0x0fe9',
                        '0xcb516e7ab54063b6096bc7299f24731f08a3589576efe2a0bb590a0f22439db2',
                        '0x1b930b0ae22db6c66f1584b083707198ab7736edafd59a80064a4e1d2f18823e',
                    ],
                    [
                        '0x0fea',
                        '0x2b345d208f3087287f35204f6fc1a68e6086a3a360f99fc6cc869095ad7770ef',
                        '0x4407f06020e6f26978c0fb57dbf4d45f6535ee7218835fcc8a03003fb4309944',
                    ],
                    [
                        '0x0fea',
                        '0x8baf44a961ca99e953f27cc5c865e492f8db46b0b9a58a0ad1418efeb01bb217',
                        '0x4d3c1f7a43017f33a70541ab4f7d962da1c3246a88280cf53d0cb1c74b3a7100',
                    ],
                ],
            }

            it('CAVERJS-UNIT-TRANSACTIONFDR-543: should return public key string recovered from signatures in FeeDelegatedSmartContractExecutionWithRatio', async () => {
                const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(txObj)
                const publicKeys = tx.recoverPublicKeys()

                expect(publicKeys.length).to.equal(expectedPublicKeyArray.length)
                for (let i = 0; i < publicKeys.length; i++) {
                    expect(publicKeys[i].toLowerCase()).to.equal(expectedPublicKeyArray[i].toLowerCase())
                }
            }).timeout(200000)

            it('CAVERJS-UNIT-TRANSACTIONFDR-544: should return fee payer public key string recovered from feePayerSignatures in FeeDelegatedSmartContractExecutionWithRatio', async () => {
                const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(txObj)
                const publicKeys = tx.recoverFeePayerPublicKeys()

                expect(publicKeys.length).to.equal(expectedFeePayerPublicKeyArray.length)
                for (let i = 0; i < publicKeys.length; i++) {
                    expect(publicKeys[i].toLowerCase()).to.equal(expectedFeePayerPublicKeyArray[i].toLowerCase())
                }
            }).timeout(200000)
        }
    )

    context('feeDelegatedSmartContractExecutionWithRatio should encoding odd feeRatio', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-560: should encode and decode correctly with feeDelegatedSmartContractExecutionWithRatio', async () => {
            const tx = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create({
                from: sender.address,
                feePayer: '0xb5db72925b1b6b79299a1a49ae226cd7861083ac',
                feeRatio: '0xa',
                to: '0x59177716c34ac6e49e295a0e78e33522f14d61ee',
                value: '0x1',
                chainId: '0x7e3',
                gasPrice: '0x5d21dba00',
                nonce: '0x0',
                gas: '0x2faf080',
                input:
                    '0xd95aced7000000000000000000000000640a4c021cb5889fa1d37378f04a36ad452862240000000000000000000000000000000000000000000000000000000000000001',
            })
            await tx.sign(sender)
            const rawTx = tx.getRLPEncoding()
            const decoded = caver.transaction.decode(rawTx)

            expect(tx.feeRatio).to.equal(decoded.feeRatio)
        }).timeout(200000)
    })
})
