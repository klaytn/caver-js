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

const utils = require('../../../packages/caver-utils/src')

let caver
let sender
let roleBasedKeyring
let maxPriorityFeePerGas
let baseFee

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

describe('TxTypeEthereumDynamicFee', () => {
    let transactionObj
    let transactionObjWithSignature
    const expectedTxWithSigRLPEncodingForSignature =
        '0x02f8cc822710258505d21dba008505d21dba00829c40941fc92c23f71a7de4cdb4394a37fc636986a0f48401b844a9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039f85bf8599467116062f1626f7b3019631f03d301b8f701f709f842a00000000000000000000000000000000000000000000000000000000000000003a00000000000000000000000000000000000000000000000000000000000000007'
    const expectedTxWithSigRLPEncoding =
        '0x7802f9010f822710258505d21dba008505d21dba00829c40941fc92c23f71a7de4cdb4394a37fc636986a0f48401b844a9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039f85bf8599467116062f1626f7b3019631f03d301b8f701f709f842a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000780a04fc52da183020a27dc4b684a45404445630e946b0c1a37edeb538d4bdae63040a07d56dbcc61f42ffcbced105f838d20b8fe71e85a4d0344c7f60815fddfeae4cc'

    let getNonceSpy
    let getChainIdSpy
    let getHeaderByNumberSpy
    let getMaxPriorityFeePerGasSpy

    beforeEach(() => {
        const accessList = [
            {
                address: '0x67116062f1626f7b3019631f03d301b8f701f709',
                storageKeys: [
                    '0x0000000000000000000000000000000000000000000000000000000000000003',
                    '0x0000000000000000000000000000000000000000000000000000000000000007',
                ],
            },
        ]

        transactionObj = {
            chainId: '0x2710',
            to: '0x1fc92c23f71a7de4cdb4394a37fc636986a0f484',
            value: '0x1',
            input:
                '0xa9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039',

            gas: '0x9c40',
            maxPriorityFeePerGas: '0x5d21dba00',
            maxFeePerGas: '0x5d21dba00',
            accessList,
        }

        transactionObjWithSignature = {
            accessList,
            to: '0x1fc92c23f71a7de4cdb4394a37fc636986a0f484',
            value: '0x1',
            gas: '0x9c40',
            nonce: '0x25',
            maxPriorityFeePerGas: '0x5d21dba00',
            maxFeePerGas: '0x5d21dba00',
            signatures: [
                '0x0',
                '0x4fc52da183020a27dc4b684a45404445630e946b0c1a37edeb538d4bdae63040',
                '0x7d56dbcc61f42ffcbced105f838d20b8fe71e85a4d0344c7f60815fddfeae4cc',
            ],
            chainId: '0x2710',
            input:
                '0xa9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039',
        }

        getNonceSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionCount')
        getNonceSpy.returns('0x3a')
        getChainIdSpy = sandbox.stub(caver.transaction.klaytnCall, 'getChainId')
        getChainIdSpy.returns('0x7e3')
        baseFee = '0x0'
        getHeaderByNumberSpy = sandbox.stub(caver.transaction.klaytnCall, 'getHeaderByNumber')
        getHeaderByNumberSpy.returns({ baseFeePerGas: baseFee })
        maxPriorityFeePerGas = '0x5d21dba00'
        getMaxPriorityFeePerGasSpy = sandbox.stub(caver.transaction.klaytnCall, 'getMaxPriorityFeePerGas')
        getMaxPriorityFeePerGasSpy.returns(maxPriorityFeePerGas)
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('create ethereumDynamicFee instance', () => {
        it('CAVERJS-UNIT-TRANSACTION-492: If ethereumDynamicFee not define input and to, return error', () => {
            delete transactionObj.input
            delete transactionObj.to

            const expectedError = 'contract creation without any data provided'
            expect(() => caver.transaction.ethereumDynamicFee.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-493: If ethereumDynamicFee not define gas, return error', () => {
            delete transactionObj.gas

            const expectedError = '"gas" is missing'
            expect(() => caver.transaction.ethereumDynamicFee.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-494: If ethereumDynamicFee define from property with invalid address, return error', () => {
            transactionObj.from = 'invalid'

            const expectedError = `Invalid address of from: ${transactionObj.from}`
            expect(() => caver.transaction.ethereumDynamicFee.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-495: If ethereumDynamicFee define to property with invalid address, return error', () => {
            transactionObj.to = 'invalid address'

            const expectedError = `Invalid address of to: ${transactionObj.to}`
            expect(() => caver.transaction.ethereumDynamicFee.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-496: If ethereumDynamicFee define accessList property with invalid value, return error', () => {
            transactionObj.accessList = [
                {
                    address: 'invalid address',
                },
            ]

            let expectedError = `Invalid address: ${transactionObj.accessList[0].address}`
            expect(() => caver.transaction.ethereumDynamicFee.create(transactionObj)).to.throw(expectedError)

            transactionObj.accessList = [
                {
                    address: caver.wallet.keyring.generate().address,
                    storageKeys: ['invalid storageKey'],
                },
            ]
            expectedError = `Invalid storageKey: The storage key must be a hexadecimal string ${
                transactionObj.accessList[0].storageKeys[0]
            }`
            expect(() => caver.transaction.ethereumDynamicFee.create(transactionObj)).to.throw(expectedError)

            transactionObj.accessList = [
                {
                    address: caver.wallet.keyring.generate().address,
                    storageKeys: ['0x00000000000000000000000000000000000000000000000000000000000003'],
                },
            ]
            expectedError = `Invalid storageKey length: The storage key must be a 32-byte`
            expect(() => caver.transaction.ethereumDynamicFee.create(transactionObj)).to.throw(expectedError)

            transactionObj.accessList = [
                {
                    address: caver.wallet.keyring.generate().address,
                    storageKeys: ['00000000000000000000000000000000000000000000000000000000000003'],
                },
            ]
            expectedError = `Invalid storageKey length: The storage key must be a 32-byte`
            expect(() => caver.transaction.ethereumDynamicFee.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-497: If ethereumDynamicFee define unnecessary property, return error', () => {
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
                propertiesForUnnecessary.gasPrice,
            ]

            for (let i = 0; i < unnecessaries.length; i++) {
                if (i > 0) delete transactionObj[unnecessaries[i - 1].name]
                transactionObj[unnecessaries[i].name] = unnecessaries[i].value

                const expectedError = `"${unnecessaries[i].name}" cannot be used with ${caver.transaction.type.TxTypeEthereumDynamicFee} transaction`
                expect(() => caver.transaction.ethereumDynamicFee.create(transactionObj)).to.throw(expectedError)
            }
        })
    })

    context('ethereumDynamicFee.getRLPEncoding', () => {
        it('CAVERJS-UNIT-TRANSACTION-498: returns RLP-encoded transaction string', () => {
            // 0 y-parity
            const tx1 = caver.transaction.ethereumDynamicFee.create(transactionObjWithSignature)
            expect(tx1.getRLPEncoding()).to.equal(expectedTxWithSigRLPEncoding)

            // 1 y-parity
            transactionObj = {
                accessList: [
                    {
                        address: '0xd9d6bd9e2186233d9441bde052504b926f2e0bb2',
                        storageKeys: [
                            '0x0000000000000000000000000000000000000000000000000000000000000003',
                            '0x0000000000000000000000000000000000000000000000000000000000000007',
                        ],
                    },
                ],
                to: '0x7988508e9236a5b796ddbb6ac40864777a414f5f',
                value: '0x1',
                gas: '0x9c40',
                nonce: '0x28',
                maxFeePerGas: '0x5d21dba00',
                maxPriorityFeePerGas: '0x5d21dba00',
                signatures: [
                    '0x1',
                    '0x54d6ea6f359a7d3546199ac93dca216918b45647a45b6f32be58f33735a696b7',
                    '0x7179ffc15f5c6b4b08efc4f7306548c435529edc2e5b8243d1193f52085dbc65',
                ],
                chainId: '0x2710',
                input:
                    '0xa9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039',
            }
            const tx2 = caver.transaction.ethereumDynamicFee.create(transactionObj)

            expect(tx2.getRLPEncoding()).to.equal(
                '0x7802f9010f822710288505d21dba008505d21dba00829c40947988508e9236a5b796ddbb6ac40864777a414f5f01b844a9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039f85bf85994d9d6bd9e2186233d9441bde052504b926f2e0bb2f842a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000701a054d6ea6f359a7d3546199ac93dca216918b45647a45b6f32be58f33735a696b7a07179ffc15f5c6b4b08efc4f7306548c435529edc2e5b8243d1193f52085dbc65'
            )
        })

        it('CAVERJS-UNIT-TRANSACTION-499: getRLPEncoding should throw error when chainId is undefined', () => {
            transactionObj.nonce = '0x3a'
            delete transactionObj.chainId
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-500: getRLPEncoding should throw error when nonce is undefined', () => {
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-501: getRLPEncoding should throw error when maxPriorityFeePerGas is undefined', () => {
            transactionObj.nonce = '0x3a'
            delete transactionObj.maxPriorityFeePerGas
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `maxPriorityFeePerGas is undefined. Define maxPriorityFeePerGas in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-502: getRLPEncoding should throw error when maxFeePerGas is undefined', () => {
            transactionObj.nonce = '0x3a'
            delete transactionObj.maxFeePerGas
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `maxFeePerGas is undefined. Define maxFeePerGas in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })
    })

    context('ethereumDynamicFee.sign', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let ecsignSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTION-503: input: keyring. should sign transaction.', async () => {
            await tx.sign(sender)

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(ecsignSpy).to.have.been.calledWith(txHash, 0, undefined)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-504: input: private key string. should sign the transaction with ecsign function.', async () => {
            const ecsignProtoSpy = sandbox.spy(SingleKeyring.prototype, 'ecsign')
            await tx.sign(sender.key.privateKey)

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(ecsignProtoSpy).to.have.been.calledWith(txHash, 0, undefined)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-505: 449: KlaytnWalletKey. should sign the transaction with ecsign function.', async () => {
            const ecsignProtoSpy = sandbox.spy(SingleKeyring.prototype, 'ecsign')
            await tx.sign(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(ecsignProtoSpy).to.have.been.calledWith(txHash, 0, undefined)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-506: input: decoupled KlaytnWalletKey. should throw error.', async () => {
            tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `TxTypeEthereumDynamicFee cannot be signed with a decoupled keyring.`
            await expect(tx.sign(generateDecoupledKeyring().getKlaytnWalletKey())).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-507: input: keyring, index. should sign transaction with specific index.', async () => {
            await tx.sign(sender, 0)

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(ecsignSpy).to.have.been.calledWith(txHash, 0, 0)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-508: input: keyring, custom hasher. should use custom hasher.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(ecsignSpy).to.have.been.calledWith(hashForCustomHasher, 0, undefined)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-509: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, 0, customHasher)

            checkFunctionCall(true)
            checkSignature()
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(ecsignSpy).to.have.been.calledWith(hashForCustomHasher, 0, 0)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-510: input: decoupled keyring. should throw error.', async () => {
            tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `TxTypeEthereumDynamicFee cannot be signed with a decoupled keyring.`
            await expect(tx.sign(generateDecoupledKeyring())).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-511: input: multisig keyring. should throw error.', async () => {
            tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `TxTypeEthereumDynamicFee cannot be signed with a decoupled keyring.`
            await expect(tx.sign(generateMultiSigKeyring())).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-512: input: roleBased keyring. should throw error.', async () => {
            tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `TxTypeEthereumDynamicFee cannot be signed with a decoupled keyring.`
            await expect(tx.sign(roleBasedKeyring)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-513: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('ethereumDynamicFee.sign with multiple keys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let ecsignSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTION-514: input: keyring. should sign transaction.', async () => {
            await tx.sign(sender)

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(ecsignSpy).to.have.been.calledWith(txHash, 0)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-515: input: private key string. should sign the transaction with ecsign function.', async () => {
            const ecsignProtoSpy = sandbox.spy(SingleKeyring.prototype, 'ecsign')
            await tx.sign(sender.key.privateKey)

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(ecsignProtoSpy).to.have.been.calledWith(txHash, 0)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-516: input: KlaytnWalletKey. should sign the transaction with ecsign function.', async () => {
            const ecsignProtoSpy = sandbox.spy(SingleKeyring.prototype, 'ecsign')
            await tx.sign(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(ecsignProtoSpy).to.have.been.calledWith(txHash, 0)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-517: input: decoupled KlaytnWalletKey. should throw error.', async () => {
            tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `TxTypeEthereumDynamicFee cannot be signed with a decoupled keyring.`
            await expect(tx.sign(generateDecoupledKeyring().getKlaytnWalletKey())).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-518: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, customHasher)

            checkFunctionCall(true)
            checkSignature()
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(ecsignSpy).to.have.been.calledWith(hashForCustomHasher, 0)
            expect(isValidV(tx.signatures)).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-519: input: keyring. should throw error when address is not equal.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-520: input: decoupled keyring. should throw error.', async () => {
            tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `TxTypeEthereumDynamicFee cannot be signed with a decoupled keyring.`
            await expect(tx.sign(generateDecoupledKeyring())).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-521: input: multisig keyring. should throw error.', async () => {
            tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `TxTypeEthereumDynamicFee cannot be signed with a decoupled keyring.`
            await expect(tx.sign(generateMultiSigKeyring())).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-522: input: roleBased keyring. should throw error.', async () => {
            tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `TxTypeEthereumDynamicFee cannot be signed with a decoupled keyring.`
            await expect(tx.sign(roleBasedKeyring)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('ethereumDynamicFee.appendSignatures', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-523: If signatures is empty, appendSignatures append signatures in transaction', () => {
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTION-524: If signatures is empty, appendSignatures append signatures with two-dimensional signature array', () => {
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTION-525: If signatures is not empty, appendSignatures should throw error', () => {
            transactionObj.signatures = [
                '0x0',
                '0xd2502e40a01b7836e1f389ff71b8c64108a879d6316d4ff5367bc1b42910c928',
                '0x32a19c030f1c95378f8d9c265f6911a022e2e78ddd28795d33d9697c7732fb9c',
            ]
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const sig = [
                '0x1',
                '0xa65d60319310ce2eda59f2c75073d6214afc01d161fec24766d397ed66e22df6',
                '0x72d8385554a637b847ce64d295f30267eff083fc6042cc06ea5e76791c40382e',
            ]

            const expectedError = `signatures already defined. ${tx.type} cannot include more than one signature. Please use tx.signatures = sigArr to replace.`

            expect(() => tx.appendSignatures(sig)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-526: appendSignatures should throw error when sig array has more than one signatures', () => {
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTION-527: appendSignatures should throw error when sig recovery id is neither 0 nor 1', () => {
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]

            const expectedError = `Invalid signature: The y-parity of the transaction should either be 0 or 1.`

            expect(() => tx.appendSignatures(sig)).to.throw(expectedError)
        })
    })

    context('ethereumDynamicFee.combineSignedRawTransactions', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-528: If signatures is empty, combineSignedRawTransactions set signatures in transaction', () => {
            const expectedSignatures = transactionObjWithSignature.signatures
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)
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

        it('CAVERJS-UNIT-TRANSACTION-529: If signatures is not empty, combineSignedRawTransactions should throw error', () => {
            transactionObjWithSignature.signatures = [
                '0x1',
                '0xa65d60319310ce2eda59f2c75073d6214afc01d161fec24766d397ed66e22df6',
                '0x72d8385554a637b847ce64d295f30267eff083fc6042cc06ea5e76791c40382e',
            ]
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObjWithSignature)

            const rlpEncoded = expectedTxWithSigRLPEncoding
            const expectedError = `signatures already defined. ${tx.type} cannot include more than one signature. Please use tx.signatures = sigArr to replace.`

            expect(() => tx.combineSignedRawTransactions([rlpEncoded])).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-530: If decode transaction has different values, combineSignedRawTransactions should throw error', () => {
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            // Something different RLP-encoding string
            const rlpEncoded =
                '0x7802f9010f822710298505d21dba008505d21dba00829c4094ac5318f959569d2da0fad8660b6d9253d35fd90f01b844a9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039f85bf85994cdf91790c1227a4970d7d61b1e5c2d820fb1389cf842a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000701a07103b928ce08afac0c56a14e0dc785c4ba2d154141828813839fc3f431bd3de7a0668b3da42dde439d4a950cb33fe27d007818b48ef314a94771ef52832a2e5e34'
            const expectedError = `Transactions containing different information cannot be combined.`

            expect(() => tx.combineSignedRawTransactions([rlpEncoded])).to.throw(expectedError)
        })
    })

    context('ethereumDynamicFee.getRawTransaction', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-531: getRawTransaction should call getRLPEncoding function', () => {
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObjWithSignature)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rawTransaction = tx.getRawTransaction()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(rawTransaction).to.equal(expectedTxWithSigRLPEncoding)
        })
    })

    context('ethereumDynamicFee.getTransactionHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-532: getTransactionHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObjWithSignature)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const hashRLP = expectedTxWithSigRLPEncoding.replace('0x78', '0x')
            const expected = Hash.keccak256(hashRLP)
            const txHash = tx.getTransactionHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(txHash).to.equal(expected)
            expect(caver.utils.isValidHashStrict(txHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTION-533: getTransactionHash should throw error when chainId is undefined', () => {
            transactionObj.nonce = '0x3a'
            delete transactionObj.chainId
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-534: getTransactionHash should throw error when nonce is undefined', () => {
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-535: getTransactionHash should throw error when maxPriorityFeePerGas is undefined', () => {
            transactionObj.nonce = '0x3a'
            delete transactionObj.maxPriorityFeePerGas
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `maxPriorityFeePerGas is undefined. Define maxPriorityFeePerGas in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-536: getTransactionHash should throw error when maxFeePerGas is undefined', () => {
            transactionObj.nonce = '0x3a'
            delete transactionObj.maxFeePerGas
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `maxFeePerGas is undefined. Define maxFeePerGas in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })
    })

    context('ethereumDynamicFee.getSenderTxHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-537: getSenderTxHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObjWithSignature)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const hashRLP = expectedTxWithSigRLPEncoding.replace('0x78', '0x')
            const expected = Hash.keccak256(hashRLP)
            const senderTxHash = tx.getSenderTxHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(senderTxHash).to.equal(expected)
            expect(caver.utils.isValidHashStrict(senderTxHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTION-538: getSenderTxHash should throw error when chainId is undefined', () => {
            transactionObj.nonce = '0x3a'
            delete transactionObj.chainId
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-539: getSenderTxHash should throw error when nonce is undefined', () => {
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-540: getSenderTxHash should throw error when maxPriorityFeePerGas is undefined', () => {
            transactionObj.nonce = '0x3a'
            delete transactionObj.maxPriorityFeePerGas
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `maxPriorityFeePerGas is undefined. Define maxPriorityFeePerGas in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-541: getSenderTxHash should throw error when maxFeePerGas is undefined', () => {
            transactionObj.nonce = '0x3a'
            delete transactionObj.maxFeePerGas
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `maxFeePerGas is undefined. Define maxFeePerGas in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })
    })

    context('ethereumDynamicFee.getRLPEncodingForSignature', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-542: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObjWithSignature)

            const rlpEncodingForSign = tx.getRLPEncodingForSignature()

            expect(rlpEncodingForSign).to.equal(expectedTxWithSigRLPEncodingForSignature)
        })

        it('CAVERJS-UNIT-TRANSACTION-543: getRLPEncodingForSignature should throw error when nonce is undefined', () => {
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-544: getRLPEncodingForSignature should throw error when chainId is undefined', () => {
            transactionObj.nonce = '0x3a'
            delete transactionObj.chainId
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-545: getRLPEncodingForSignature should throw error when maxPriorityFeePerGas is undefined', () => {
            transactionObj.nonce = '0x3a'
            delete transactionObj.maxPriorityFeePerGas
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `maxPriorityFeePerGas is undefined. Define maxPriorityFeePerGas in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-546: getRLPEncodingForSignature should throw error when maxFeePerGas is undefined', () => {
            transactionObj.nonce = '0x3a'
            delete transactionObj.maxFeePerGas
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            const expectedError = `maxFeePerGas is undefined. Define maxFeePerGas in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })
    })

    context('ethereumDynamicFee.fillTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTION-547: fillTransaction should call klay_getMaxPriorityFeePerGas to fill maxPriorityFeePerGas when maxPriorityFeePerGas is undefined', async () => {
            transactionObj.nonce = '0x3a'
            delete transactionObj.maxPriorityFeePerGas
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            await tx.fillTransaction()
            expect(getMaxPriorityFeePerGasSpy).to.have.been.calledOnce
            expect(getHeaderByNumberSpy).to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-548: fillTransaction should call klay_getHeaderByNumber to fill maxFeePerGas when maxFeePerGas is undefined', async () => {
            transactionObj.nonce = '0x3a'
            delete transactionObj.maxFeePerGas
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)
            const expectedMaxFeePerGas = utils.toHex(
                utils.hexToNumber(baseFee) * 2 + utils.hexToNumber(transactionObj.maxPriorityFeePerGas)
            )

            await tx.fillTransaction()

            expect(getMaxPriorityFeePerGasSpy).not.to.have.been.called
            expect(getHeaderByNumberSpy).to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
            expect(tx.maxFeePerGas).to.equal(expectedMaxFeePerGas)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-549: fillTransaction should call klay_getTransactionCount to fill nonce when nonce is undefined', async () => {
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            await tx.fillTransaction()
            expect(getMaxPriorityFeePerGasSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-550: fillTransaction should call klay_getChainid to fill chainId when chainId is undefined', async () => {
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObj)

            await tx.fillTransaction()
            expect(getMaxPriorityFeePerGasSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
        }).timeout(200000)
    })

    context('ethereumDynamicFee.recoverPublicKeys', () => {
        it('CAVERJS-UNIT-TRANSACTION-551: should return public key string recovered from signatures in EthereumDynamicFee', async () => {
            const tx = caver.transaction.ethereumDynamicFee.create(transactionObjWithSignature)
            const publicKeys = tx.recoverPublicKeys()

            expect(publicKeys[0].toLowerCase()).to.equal(
                '0xde8009313a986ec6d21dca780bd0bd12f0f8b177a29f50e833e5b3187391319cae9a5c8d179601417aeba6330b69b436f01f55d1c89ebb705adafd55d9636573'
            )
        }).timeout(200000)
    })
})
