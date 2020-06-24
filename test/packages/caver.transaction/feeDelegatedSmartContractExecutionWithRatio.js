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
let roleBasedKeyring

const txWithExpectedValues = {}

const sandbox = sinon.createSandbox()
const input = '0x6353586b000000000000000000000000bc5951f055a85f41a3b62fd6f68ab7de76d299b2'

before(() => {
    caver = new Caver(testRPCURL)
    AbstractTransaction._klaytnCall = {
        getGasPrice: () => {},
        getTransactionCount: () => {},
        getChainId: () => {},
    }

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

    context('create feeDelegatedSmartContractExecutionWithRatio instance', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-301: If feeDelegatedSmartContractExecutionWithRatio not define from, return error', () => {
            delete transactionObj.from

            const expectedError = '"from" is missing'
            expect(() => new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-302: If feeDelegatedSmartContractExecutionWithRatio not define to, return error', () => {
            delete transactionObj.to

            const expectedError = '"to" is missing'
            expect(() => new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-303: If feeDelegatedSmartContractExecutionWithRatio not define gas, return error', () => {
            delete transactionObj.gas

            const expectedError = '"gas" is missing'
            expect(() => new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-304: If feeDelegatedSmartContractExecutionWithRatio not define input, return error', () => {
            delete transactionObj.input

            const expectedError = '"input" is missing'
            expect(() => new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-305: If feeDelegatedSmartContractExecutionWithRatio not define feeRatio, return error', () => {
            delete transactionObj.feeRatio

            const expectedError = '"feeRatio" is missing'
            expect(() => new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-306: If feeDelegatedSmartContractExecutionWithRatio define from property with invalid address, return error', () => {
            transactionObj.from = 'invalid'

            const expectedError = `Invalid address of from: ${transactionObj.from}`
            expect(() => new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-307: If feeDelegatedSmartContractExecutionWithRatio define to property with invalid address, return error', () => {
            transactionObj.to = 'invalid'

            const expectedError = `Invalid address of to: ${transactionObj.to}`
            expect(() => new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-308: If feeDelegatedSmartContractExecutionWithRatio define feePayer property with invalid address, return error', () => {
            transactionObj.feePayer = 'invalid'

            const expectedError = `Invalid address of fee payer: ${transactionObj.feePayer}`
            expect(() => new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-525: If feeDelegatedSmartContractExecutionWithRatio define feeRatio property with invalid value, return error', () => {
            transactionObj.feeRatio = 'nonHexString'
            let expectedError = `Invalid type fo feeRatio: feeRatio should be number type or hex number string.`
            expect(() => new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = {}
            expect(() => new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = []
            expect(() => new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = 0
            expectedError = `Invalid feeRatio: feeRatio is out of range. [1, 99]`
            expect(() => new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = 100
            expect(() => new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = -1
            expect(() => new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = 101
            expect(() => new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)).to.throw(expectedError)
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
            expect(() => new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)).to.throw(expectedError)
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
            ]

            for (let i = 0; i < unnecessaries.length; i++) {
                if (i > 0) delete transactionObj[unnecessaries[i - 1].name]
                transactionObj[unnecessaries[i].name] = unnecessaries[i].value

                const expectedError = `"${unnecessaries[i].name}" cannot be used with ${caver.transaction.type.TxTypeFeeDelegatedSmartContractExecutionWithRatio} transaction`
                // eslint-disable-next-line no-loop-func
                expect(() => new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)).to.throw(expectedError)
            }
        })
    })

    context('feeDelegatedSmartContractExecutionWithRatio.getRLPEncoding', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-311: Returns RLP-encoded string', () => {
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(txWithExpectedValues.tx)

            expect(tx.getRLPEncoding()).to.equal(txWithExpectedValues.rlpEncoding)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-312: getRLPEncoding should throw error when nonce is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.gasPrice = '0x5d21dba00'
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-313: getRLPEncoding should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

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
            tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

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
            tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-322: input: rolebased keyring, index out of range. should throw error.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

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
            tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)
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
            tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

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
            tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

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
            tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

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
            tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

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
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            tx.appendSignatures(sig)
            checkSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-346: If signatures is empty, appendSignatures append signatures with two-dimensional signature array', () => {
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

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
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

            const sig = [
                '0x0fea',
                '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
            ]

            tx.appendSignatures(sig)
            checkSignature(tx, { expectedLength: 2 })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-348: appendSignatures should append multiple signatures', () => {
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

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
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            tx.appendFeePayerSignatures(sig)
            checkFeePayerSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-350: If feePayerSignatures is empty, appendFeePayerSignatures append feePayerSignatures with two-dimensional signature array', () => {
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

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
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

            const sig = [
                '0x0fea',
                '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
            ]

            tx.appendFeePayerSignatures(sig)
            checkFeePayerSignature(tx, { expectedLength: 2 })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-352: appendFeePayerSignatures should append multiple feePayerSignatures', () => {
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

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
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x32f8cc038505d21dba0083030d4094f14274fd5f22f436e3a2d3f3b167f9f241c33db58094e862a5ddac7f82f57eaea34f3f915121a6da1bb2b844a9059cbb000000000000000000000000ad3bd7a7df94367e8b0443dd10e86330750ebf0c00000000000000000000000000000000000000000000000000000002540be4001ef847f845820fe9a0b95ed5ff6d9cd8d02e3031ea4ddf38d42803817b5ecc086828f497787699bf5ba0105105455d4af28cc943e43e375316b57205e6eb664407b3bc1a7eca9ecd6c8f80c4c3018080'
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
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

            const rlpEncodedStrings = [
                '0x32f8cc038505d21dba0083030d4094f14274fd5f22f436e3a2d3f3b167f9f241c33db58094e862a5ddac7f82f57eaea34f3f915121a6da1bb2b844a9059cbb000000000000000000000000ad3bd7a7df94367e8b0443dd10e86330750ebf0c00000000000000000000000000000000000000000000000000000002540be4001ef847f845820fe9a058cf881d440cd88e2a1d0999b4b0eec72b36f7c13a793fcba7d509c544c06505a025bdcc5b6f7619169397508d38da290faa54b01c83c582d1dfa0ba250b7a187180c4c3018080',
                '0x32f8cc038505d21dba0083030d4094f14274fd5f22f436e3a2d3f3b167f9f241c33db58094e862a5ddac7f82f57eaea34f3f915121a6da1bb2b844a9059cbb000000000000000000000000ad3bd7a7df94367e8b0443dd10e86330750ebf0c00000000000000000000000000000000000000000000000000000002540be4001ef847f845820fe9a0fa309605c494a338e4cd92c7bedeafa25387f57e0b5f6e18f9d8da90edea9e44a055d173d614d096f23eb9a01fd894f961d266985df6503d5176d047eb3b3ef5ed80c4c3018080',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignedRawTransactions(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x32f9015a038505d21dba0083030d4094f14274fd5f22f436e3a2d3f3b167f9f241c33db58094e862a5ddac7f82f57eaea34f3f915121a6da1bb2b844a9059cbb000000000000000000000000ad3bd7a7df94367e8b0443dd10e86330750ebf0c00000000000000000000000000000000000000000000000000000002540be4001ef8d5f845820fe9a0b95ed5ff6d9cd8d02e3031ea4ddf38d42803817b5ecc086828f497787699bf5ba0105105455d4af28cc943e43e375316b57205e6eb664407b3bc1a7eca9ecd6c8ff845820fe9a058cf881d440cd88e2a1d0999b4b0eec72b36f7c13a793fcba7d509c544c06505a025bdcc5b6f7619169397508d38da290faa54b01c83c582d1dfa0ba250b7a1871f845820fe9a0fa309605c494a338e4cd92c7bedeafa25387f57e0b5f6e18f9d8da90edea9e44a055d173d614d096f23eb9a01fd894f961d266985df6503d5176d047eb3b3ef5ed80c4c3018080'

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
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)
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
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

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
            let tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

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
            tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)
            const combinedWithMultiple = tx.combineSignedRawTransactions([combined])

            expect(combined).to.equal(combinedWithMultiple)
            checkSignature(tx, { expectedSignatures })
            checkFeePayerSignature(tx, { expectedFeePayerSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-358: If decode transaction has different values, combineSignedRawTransactions should throw error', () => {
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)
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
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(txWithExpectedValues.tx)
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
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const txHash = tx.getTransactionHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(txHash).to.equal(txWithExpectedValues.transactionHash)
            expect(caver.utils.isValidHashStrict(txHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-361: getTransactionHash should throw error when nonce is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.gasPrice = '0x5d21dba00'
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-362: getTransactionHash should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })
    })

    context('feeDelegatedSmartContractExecutionWithRatio.getSenderTxHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-364: getSenderTxHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const senderTxHash = tx.getSenderTxHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(senderTxHash).to.equal(txWithExpectedValues.senderTxHash)
            expect(caver.utils.isValidHashStrict(senderTxHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-365: getSenderTxHash should throw error when nonce is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.gasPrice = '0x5d21dba00'
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-366: getSenderTxHash should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })
    })

    context('feeDelegatedSmartContractExecutionWithRatio.getRLPEncodingForSignature', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-368: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(txWithExpectedValues.tx)

            const commonRLPForSigningSpy = sandbox.spy(tx, 'getCommonRLPEncodingForSignature')

            const rlpEncodingForSign = tx.getRLPEncodingForSignature()

            expect(rlpEncodingForSign).to.equal(txWithExpectedValues.rlpEncodingForSigning)
            expect(commonRLPForSigningSpy).to.have.been.calledOnce
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-369: getRLPEncodingForSignature should throw error when nonce is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-370: getRLPEncodingForSignature should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-371: getRLPEncodingForSignature should throw error when chainId is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })
    })

    context('feeDelegatedSmartContractExecutionWithRatio.getCommonRLPEncodingForSignature', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-372: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(txWithExpectedValues.tx)

            const commonRLPForSign = tx.getCommonRLPEncodingForSignature()
            const decoded = RLP.decode(txWithExpectedValues.rlpEncodingForSigning)

            expect(commonRLPForSign).to.equal(decoded[0])
        })
    })

    context('feeDelegatedSmartContractExecutionWithRatio.fillTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-373: fillTransaction should call klay_getGasPrice to fill gasPrice when gasPrice is undefined', async () => {
            transactionObj.nonce = '0x3a'
            transactionObj.chainId = 2019
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-374: fillTransaction should call klay_getTransactionCount to fill nonce when nonce is undefined', async () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-375: fillTransaction should call klay_getChainid to fill chainId when chainId is undefined', async () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).to.have.been.calledOnce
        }).timeout(200000)
    })
})
