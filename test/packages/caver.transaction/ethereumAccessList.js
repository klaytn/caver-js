/*
    Copyright 2022 The caver-js Authors
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

const _ = require('lodash')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')
const Hash = require('eth-lib/lib/hash')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

const { propertiesForUnnecessary } = require('../utils')

const testRPCURL = require('../../testrpc')
const Caver = require('../../../index')
const Keyring = require('../../../packages/caver-wallet/src/keyring/keyringFactory')
const SingleKeyring = require('../../../packages/caver-wallet/src/keyring/singleKeyring')
const TransactionHasher = require('../../../packages/caver-transaction/src/transactionHasher/transactionHasher')

const SignatureData = require('../../../packages/caver-wallet/src/keyring/signatureData')

const { generateDecoupledKeyring, generateMultiSigKeyring, generateRoleBasedKeyring } = require('../utils')

const utils = require('../../../packages/caver-utils')

let caver
let sender
let roleBasedKeyring

const sandbox = sinon.createSandbox()

function isValidV(sigs) {
    if (!_.isArray(sigs)) sigs = [sigs]
    for (const s of sigs) {
        const vNumber = utils.hexToNumber(s.v)
        if (vNumber !== 0 && vNumber !== 1) {
            return false
        }
    }
    return true
}

before(() => {
    caver = new Caver(testRPCURL)

    sender = caver.wallet.add(caver.wallet.keyring.generate())
    roleBasedKeyring = generateRoleBasedKeyring([3, 3, 3])
})

describe('TxTypeEthereumAccessList', () => {
    let transactionObj
    let transactionObjWithSignature
    const expectedTxWithSigRLPEncodingForSignature =
        '0x01f8c6822710238505d21dba00829c4094c5fb1386b60160614a8151dcd4b0ae41325d1cb801b844a9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039f85bf859945430192ae264b3feff967fc08982b9c6f5694023f842a00000000000000000000000000000000000000000000000000000000000000003a00000000000000000000000000000000000000000000000000000000000000007'
    const expectedTxWithSigRLPEncoding =
        '0x7801f90109822710238505d21dba00829c4094c5fb1386b60160614a8151dcd4b0ae41325d1cb801b844a9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039f85bf859945430192ae264b3feff967fc08982b9c6f5694023f842a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000701a05ac25e47591243af2d6b8e7f54d608e9e0e0aeb5194d34c17852bd7e376f4857a0095a40394f33e95cce9695d5badf4270f4cc8aff0b5395cefc3a0fe213be1f30'

    let getGasPriceSpy
    let getNonceSpy
    let getChainIdSpy

    beforeEach(() => {
        const accessList = [
            {
                address: '0x5430192ae264b3feff967fc08982b9c6f5694023',
                storageKeys: [
                    '0x0000000000000000000000000000000000000000000000000000000000000003',
                    '0x0000000000000000000000000000000000000000000000000000000000000007',
                ],
            },
        ]

        transactionObj = {
            chainId: '0x2710',
            to: '0xc5fb1386b60160614a8151dcd4b0ae41325d1cb8',
            value: '0x1',
            input:
                '0xa9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039',

            gas: '0x9c40',
            accessList,
        }

        transactionObjWithSignature = {
            accessList,
            to: '0xc5fb1386b60160614a8151dcd4b0ae41325d1cb8',
            value: '0x1',
            gas: '0x9c40',
            nonce: '0x23',
            gasPrice: '0x5d21dba00',
            signatures: [
                '0x1',
                '0x5ac25e47591243af2d6b8e7f54d608e9e0e0aeb5194d34c17852bd7e376f4857',
                '0x095a40394f33e95cce9695d5badf4270f4cc8aff0b5395cefc3a0fe213be1f30',
            ],
            chainId: '0x2710',
            input:
                '0xa9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039',
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

    context('create ethereumAccessList instance', () => {
        it('CAVERJS-UNIT-TRANSACTION-437: If ethereumAccessList not define input and to, return error', () => {
            delete transactionObj.input
            delete transactionObj.to

            const expectedError = 'contract creation without any data provided'
            expect(() => caver.transaction.ethereumAccessList.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-438: If ethereumAccessList not define gas, return error', () => {
            delete transactionObj.gas

            const expectedError = '"gas" is missing'
            expect(() => caver.transaction.ethereumAccessList.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-439: If ethereumAccessList define from property with invalid address, return error', () => {
            transactionObj.from = 'invalid'

            const expectedError = `Invalid address of from: ${transactionObj.from}`
            expect(() => caver.transaction.ethereumAccessList.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-440: If ethereumAccessList define to property with invalid address, return error', () => {
            transactionObj.to = 'invalid address'

            const expectedError = `Invalid address of to: ${transactionObj.to}`
            expect(() => caver.transaction.ethereumAccessList.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-441: If ethereumAccessList define accessList property with invalid value, return error', () => {
            transactionObj.accessList = [
                {
                    address: 'invalid address',
                },
            ]

            let expectedError = `Invalid address: ${transactionObj.accessList[0].address}`
            expect(() => caver.transaction.ethereumAccessList.create(transactionObj)).to.throw(expectedError)

            transactionObj.accessList = [
                {
                    address: caver.wallet.keyring.generate().address,
                    storageKeys: ['invalid storageKey'],
                },
            ]
            expectedError = `Invalid storageKey: The storage key must be a hexadecimal string ${
                transactionObj.accessList[0].storageKeys[0]
            }`
            expect(() => caver.transaction.ethereumAccessList.create(transactionObj)).to.throw(expectedError)

            transactionObj.accessList = [
                {
                    address: caver.wallet.keyring.generate().address,
                    storageKeys: ['0x00000000000000000000000000000000000000000000000000000000000003'],
                },
            ]
            expectedError = `Invalid storageKey length: The storage key must be a 32-byte`
            expect(() => caver.transaction.ethereumAccessList.create(transactionObj)).to.throw(expectedError)

            transactionObj.accessList = [
                {
                    address: caver.wallet.keyring.generate().address,
                    storageKeys: ['00000000000000000000000000000000000000000000000000000000000003'],
                },
            ]
            expectedError = `Invalid storageKey length: The storage key must be a 32-byte`
            expect(() => caver.transaction.ethereumAccessList.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-442: If ethereumAccessList define unnecessary property, return error', () => {
            const unnecessaries = [
                propertiesForUnnecessary.codeFormat,
                propertiesForUnnecessary.failKey,
                propertiesForUnnecessary.feePayer,
                propertiesForUnnecessary.feePayerSignatures,
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
                propertiesForUnnecessary.maxPriorityFeePerGas,
                propertiesForUnnecessary.maxFeePerGas,
            ]

            for (let i = 0; i < unnecessaries.length; i++) {
                if (i > 0) delete transactionObj[unnecessaries[i - 1].name]
                transactionObj[unnecessaries[i].name] = unnecessaries[i].value

                const expectedError = `"${unnecessaries[i].name}" cannot be used with ${caver.transaction.type.TxTypeEthereumAccessList} transaction`
                expect(() => caver.transaction.ethereumAccessList.create(transactionObj)).to.throw(expectedError)
            }
        })
    })

    context('ethereumAccessList.getRLPEncoding', () => {
        it('CAVERJS-UNIT-TRANSACTION-443: returns RLP-encoded transaction string', () => {
            // 0 y-parity
            transactionObj = {
                accessList: [
                    {
                        address: '0xac9ba2a7fb8572e971bcac01a5b58934b385a172',
                        storageKeys: [
                            '0x0000000000000000000000000000000000000000000000000000000000000003',
                            '0x0000000000000000000000000000000000000000000000000000000000000007',
                        ],
                    },
                ],
                to: '0xc6779d72a88bec1a03bbb83cf028d95ff5f32f5b',
                value: '0x1',
                gas: '0x9c40',
                nonce: '0x1a',
                gasPrice: '0x5d21dba00',
                signatures: [
                    '0x0',
                    '0x43ff73938e019e13dcc48c9ff1a46d9f1f081512351cf7b0eca49dbf74047848',
                    '0x17a9816ca1446f51e0d6eb8c406a52758feb83b234128e4cfcaeaa8419f706af',
                ],
                chainId: '0x2710',
                input:
                    '0xa9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039',
            }
            const tx1 = caver.transaction.ethereumAccessList.create(transactionObj)

            expect(tx1.getRLPEncoding()).to.equal(
                '0x7801f901098227101a8505d21dba00829c4094c6779d72a88bec1a03bbb83cf028d95ff5f32f5b01b844a9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039f85bf85994ac9ba2a7fb8572e971bcac01a5b58934b385a172f842a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000780a043ff73938e019e13dcc48c9ff1a46d9f1f081512351cf7b0eca49dbf74047848a017a9816ca1446f51e0d6eb8c406a52758feb83b234128e4cfcaeaa8419f706af'
            )

            // 1 y-parity
            const tx2 = caver.transaction.ethereumAccessList.create(transactionObjWithSignature)
            expect(tx2.getRLPEncoding()).to.equal(expectedTxWithSigRLPEncoding)
        })

        it('CAVERJS-UNIT-TRANSACTION-444: getRLPEncoding should throw error when chainId is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            delete transactionObj.chainId
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-445: getRLPEncoding should throw error when nonce is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-446: getRLPEncoding should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })
    })

    context('ethereumAccessList.sign', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let ecsignSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = caver.transaction.ethereumAccessList.create(transactionObj)

            fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            createFromPrivateKeySpy = sandbox.spy(Keyring, 'createFromPrivateKey')
            ecsignSpy = sandbox.spy(sender, 'ecsign')
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
        function checkSignature() {
            expect(tx.signatures instanceof SignatureData).to.be.true
        }

        it('CAVERJS-UNIT-TRANSACTION-447: input: keyring. should sign transaction.', async () => {
            await tx.sign(sender)

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(ecsignSpy).to.have.been.calledWith(txHash, 0, undefined)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-448: input: private key string. should sign the transaction with ecsign function.', async () => {
            const ecsignProtoSpy = sandbox.spy(SingleKeyring.prototype, 'ecsign')
            await tx.sign(sender.key.privateKey)

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(ecsignProtoSpy).to.have.been.calledWith(txHash, 0, undefined)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-009: 449: KlaytnWalletKey. should sign the transaction with ecsign function.', async () => {
            const ecsignProtoSpy = sandbox.spy(SingleKeyring.prototype, 'ecsign')
            await tx.sign(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(ecsignProtoSpy).to.have.been.calledWith(txHash, 0, undefined)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-450: input: decoupled KlaytnWalletKey. should throw error.', async () => {
            tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `TxTypeEthereumAccessList cannot be signed with a decoupled keyring.`
            await expect(tx.sign(generateDecoupledKeyring().getKlaytnWalletKey())).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-451: input: keyring, index. should sign transaction with specific index.', async () => {
            await tx.sign(sender, 0)

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(ecsignSpy).to.have.been.calledWith(txHash, 0, 0)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-452: input: keyring, custom hasher. should use custom hasher.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(ecsignSpy).to.have.been.calledWith(hashForCustomHasher, 0, undefined)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-453: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, 0, customHasher)

            checkFunctionCall(true)
            checkSignature()
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(ecsignSpy).to.have.been.calledWith(hashForCustomHasher, 0, 0)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-454: input: decoupled keyring. should throw error.', async () => {
            tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `TxTypeEthereumAccessList cannot be signed with a decoupled keyring.`
            await expect(tx.sign(generateDecoupledKeyring())).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-455: input: multisig keyring. should throw error.', async () => {
            tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `TxTypeEthereumAccessList cannot be signed with a decoupled keyring.`
            await expect(tx.sign(generateMultiSigKeyring())).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-456: input: roleBased keyring. should throw error.', async () => {
            tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `TxTypeEthereumAccessList cannot be signed with a decoupled keyring.`
            await expect(tx.sign(roleBasedKeyring)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-457: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('ethereumAccessList.sign with multiple keys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let ecsignSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = caver.transaction.ethereumAccessList.create(transactionObj)

            fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            createFromPrivateKeySpy = sandbox.spy(Keyring, 'createFromPrivateKey')
            ecsignSpy = sandbox.spy(sender, 'ecsign')
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

        function checkSignature() {
            expect(tx.signatures instanceof SignatureData).to.be.true
        }

        it('CAVERJS-UNIT-TRANSACTION-458: input: keyring. should sign transaction.', async () => {
            await tx.sign(sender)

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(ecsignSpy).to.have.been.calledWith(txHash, 0)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-459: input: private key string. should sign the transaction with ecsign function.', async () => {
            const ecsignProtoSpy = sandbox.spy(SingleKeyring.prototype, 'ecsign')
            await tx.sign(sender.key.privateKey)

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(ecsignProtoSpy).to.have.been.calledWith(txHash, 0)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-460: input: KlaytnWalletKey. should sign the transaction with ecsign function.', async () => {
            const ecsignProtoSpy = sandbox.spy(SingleKeyring.prototype, 'ecsign')
            await tx.sign(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(ecsignProtoSpy).to.have.been.calledWith(txHash, 0)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-461: input: decoupled KlaytnWalletKey. should throw error.', async () => {
            tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `TxTypeEthereumAccessList cannot be signed with a decoupled keyring.`
            await expect(tx.sign(generateDecoupledKeyring().getKlaytnWalletKey())).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-462: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, customHasher)

            checkFunctionCall(true)
            checkSignature()
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(ecsignSpy).to.have.been.calledWith(hashForCustomHasher, 0)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-463: input: keyring. should throw error when address is not equal.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-464: input: decoupled keyring. should throw error.', async () => {
            tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `TxTypeEthereumAccessList cannot be signed with a decoupled keyring.`
            await expect(tx.sign(generateDecoupledKeyring())).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-465: input: multisig keyring. should throw error.', async () => {
            tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `TxTypeEthereumAccessList cannot be signed with a decoupled keyring.`
            await expect(tx.sign(generateMultiSigKeyring())).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-466: input: roleBased keyring. should throw error.', async () => {
            tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `TxTypeEthereumAccessList cannot be signed with a decoupled keyring.`
            await expect(tx.sign(roleBasedKeyring)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('ethereumAccessList.appendSignatures', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-467: If signatures is empty, appendSignatures append signatures in transaction', () => {
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const sig = [
                '0x0',
                '0xd2502e40a01b7836e1f389ff71b8c64108a879d6316d4ff5367bc1b42910c928',
                '0x32a19c030f1c95378f8d9c265f6911a022e2e78ddd28795d33d9697c7732fb9c',
            ]
            tx.appendSignatures(sig)

            expect(tx.signatures instanceof SignatureData).to.be.true
            expect(caver.utils.hexToNumber(tx.signatures.v)).to.equal(caver.utils.hexToNumber(sig[0]))
            expect(tx.signatures.r).to.equal(sig[1])
            expect(tx.signatures.s).to.equal(sig[2])
        })

        it('CAVERJS-UNIT-TRANSACTION-468: If signatures is empty, appendSignatures append signatures with two-dimensional signature array', () => {
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const sig = [
                [
                    '0x0',
                    '0xd2502e40a01b7836e1f389ff71b8c64108a879d6316d4ff5367bc1b42910c928',
                    '0x32a19c030f1c95378f8d9c265f6911a022e2e78ddd28795d33d9697c7732fb9c',
                ],
            ]
            tx.appendSignatures(sig)

            expect(tx.signatures instanceof SignatureData).to.be.true
            expect(caver.utils.hexToNumber(tx.signatures.v)).to.equal(caver.utils.hexToNumber(sig[0][0]))
            expect(tx.signatures.r).to.equal(sig[0][1])
            expect(tx.signatures.s).to.equal(sig[0][2])
        })

        it('CAVERJS-UNIT-TRANSACTION-469: If signatures is not empty, appendSignatures should throw error', () => {
            transactionObj.signatures = [
                '0x0',
                '0xd2502e40a01b7836e1f389ff71b8c64108a879d6316d4ff5367bc1b42910c928',
                '0x32a19c030f1c95378f8d9c265f6911a022e2e78ddd28795d33d9697c7732fb9c',
            ]
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const sig = [
                '0x1',
                '0xa65d60319310ce2eda59f2c75073d6214afc01d161fec24766d397ed66e22df6',
                '0x72d8385554a637b847ce64d295f30267eff083fc6042cc06ea5e76791c40382e',
            ]

            const expectedError = `signatures already defined. ${tx.type} cannot include more than one signature. Please use tx.signatures = sigArr to replace.`

            expect(() => tx.appendSignatures(sig)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-470: appendSignatures should throw error when sig array has more than one signatures', () => {
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const sig = [
                [
                    '0x0',
                    '0xd2502e40a01b7836e1f389ff71b8c64108a879d6316d4ff5367bc1b42910c928',
                    '0x32a19c030f1c95378f8d9c265f6911a022e2e78ddd28795d33d9697c7732fb9c',
                ],
                [
                    '0x1',
                    '0xa65d60319310ce2eda59f2c75073d6214afc01d161fec24766d397ed66e22df6',
                    '0x72d8385554a637b847ce64d295f30267eff083fc6042cc06ea5e76791c40382e',
                ],
            ]

            const expectedError = `signatures are too long. ${tx.type} cannot include more than one signature.`

            expect(() => tx.appendSignatures(sig)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-471: appendSignatures should throw error when sig recovery id is neither 0 nor 1', () => {
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]

            const expectedError = `Invalid signature: The y-parity of the transaction should either be 0 or 1.`

            expect(() => tx.appendSignatures(sig)).to.throw(expectedError)
        })
    })

    context('ethereumAccessList.combineSignedRawTransactions', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-472: If signatures is empty, combineSignedRawTransactions set signatures in transaction', () => {
            const expectedSignatures = transactionObjWithSignature.signatures
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded = expectedTxWithSigRLPEncoding
            const combined = tx.combineSignedRawTransactions([rlpEncoded])

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            expect(tx.signatures instanceof SignatureData).to.be.true
            expect(caver.utils.hexToNumber(tx.signatures.v)).to.equal(caver.utils.hexToNumber(expectedSignatures[0]))
            expect(tx.signatures.r).to.equal(expectedSignatures[1])
            expect(tx.signatures.s).to.equal(expectedSignatures[2])
        })

        it('CAVERJS-UNIT-TRANSACTION-473: If signatures is not empty, combineSignedRawTransactions should throw error', () => {
            transactionObjWithSignature.signatures = [
                '0x1',
                '0xa65d60319310ce2eda59f2c75073d6214afc01d161fec24766d397ed66e22df6',
                '0x72d8385554a637b847ce64d295f30267eff083fc6042cc06ea5e76791c40382e',
            ]
            const tx = caver.transaction.ethereumAccessList.create(transactionObjWithSignature)

            const rlpEncoded = expectedTxWithSigRLPEncoding
            const expectedError = `signatures already defined. ${tx.type} cannot include more than one signature. Please use tx.signatures = sigArr to replace.`

            expect(() => tx.combineSignedRawTransactions([rlpEncoded])).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-474: If decode transaction has different values, combineSignedRawTransactions should throw error', () => {
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            // Something different RLP-encoding string
            const rlpEncoded =
                '0x7801f901098227101c8505d21dba00829c40947fad871313b22a2059b08aa8c3419a2c563d4f2001b844a9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039f85bf85994c40004d85fa54f22f24c4a1d817b6f65a6e205b7f842a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000701a05f501e8b8ed3d800e684769e4cbb076eb97a64aae1d437f8b21beca6f998292aa00edee82b034c444dcb2a71bf222b1a089fd0a5411e4c396cc1ac44e36ecf4c7f'
            const expectedError = `Transactions containing different information cannot be combined.`

            expect(() => tx.combineSignedRawTransactions([rlpEncoded])).to.throw(expectedError)
        })
    })

    context('ethereumAccessList.getRawTransaction', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-475: getRawTransaction should call getRLPEncoding function', () => {
            const tx = caver.transaction.ethereumAccessList.create(transactionObjWithSignature)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rawTransaction = tx.getRawTransaction()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(rawTransaction).to.equal(expectedTxWithSigRLPEncoding)
        })
    })

    context('ethereumAccessList.getTransactionHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-476: getTransactionHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = caver.transaction.ethereumAccessList.create(transactionObjWithSignature)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const hashRLP = expectedTxWithSigRLPEncoding.replace('0x78', '0x')
            const expected = Hash.keccak256(hashRLP)
            const txHash = tx.getTransactionHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(txHash).to.equal(expected)
            expect(caver.utils.isValidHashStrict(txHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTION-477: getTransactionHash should throw error when chainId is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            delete transactionObj.chainId
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-478: getTransactionHash should throw error when nonce is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-479: getTransactionHash should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })
    })

    context('ethereumAccessList.getSenderTxHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-480: getSenderTxHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = caver.transaction.ethereumAccessList.create(transactionObjWithSignature)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const hashRLP = expectedTxWithSigRLPEncoding.replace('0x78', '0x')
            const expected = Hash.keccak256(hashRLP)
            const senderTxHash = tx.getSenderTxHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(senderTxHash).to.equal(expected)
            expect(caver.utils.isValidHashStrict(senderTxHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTION-481: getSenderTxHash should throw error when chainId is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            delete transactionObj.chainId
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-482: getSenderTxHash should throw error when nonce is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-483: getSenderTxHash should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })
    })

    context('ethereumAccessList.getRLPEncodingForSignature', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-484: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = caver.transaction.ethereumAccessList.create(transactionObjWithSignature)

            const rlpEncodingForSign = tx.getRLPEncodingForSignature()

            expect(rlpEncodingForSign).to.equal(expectedTxWithSigRLPEncodingForSignature)
        })

        it('CAVERJS-UNIT-TRANSACTION-485: getRLPEncodingForSignature should throw error when nonce is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-486: getRLPEncodingForSignature should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-487: getRLPEncodingForSignature should throw error when chainId is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            delete transactionObj.chainId
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })
    })

    context('ethereumAccessList.fillTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTION-488: fillTransaction should call klay_getGasPrice to fill gasPrice when gasPrice is undefined', async () => {
            transactionObj.nonce = '0x3a'
            transactionObj.chainId = 2019
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-489: fillTransaction should call klay_getTransactionCount to fill nonce when nonce is undefined', async () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-490: fillTransaction should call klay_getChainid to fill chainId when chainId is undefined', async () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.ethereumAccessList.create(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
        }).timeout(200000)
    })

    context('ethereumAccessList.recoverPublicKeys', () => {
        it('CAVERJS-UNIT-TRANSACTION-491: should return public key string recovered from signatures in LegacyTransaction', async () => {
            const tx = caver.transaction.ethereumAccessList.create(transactionObjWithSignature)
            const publicKeys = tx.recoverPublicKeys()

            expect(publicKeys[0].toLowerCase()).to.equal(
                '0xde8009313a986ec6d21dca780bd0bd12f0f8b177a29f50e833e5b3187391319cae9a5c8d179601417aeba6330b69b436f01f55d1c89ebb705adafd55d9636573'
            )
        }).timeout(200000)
    })
})
