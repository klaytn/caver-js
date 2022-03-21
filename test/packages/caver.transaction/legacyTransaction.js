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

let caver
let sender
let testKeyring
let roleBasedKeyring

const sandbox = sinon.createSandbox()

before(() => {
    caver = new Caver(testRPCURL)
    sender = caver.wallet.add(caver.wallet.keyring.generate())
    testKeyring = caver.wallet.add(caver.wallet.keyring.generate())
    roleBasedKeyring = generateRoleBasedKeyring([3, 3, 3])
})

describe('TxTypeLegacyTransaction', () => {
    let transactionObj
    let getGasPriceSpy
    let getNonceSpy
    let getChainIdSpy
    beforeEach(() => {
        transactionObj = {
            to: testKeyring.address,
            value: 1,
            input:
                '0x60806040526000805534801561001457600080fd5b5060405161016f38038061016f8339810180604052810190808051906020019092919080518201929190505050816000819055505050610116806100596000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd14605857806342cbb15c146080578063d14e62b81460a8575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b50609260d8565b6040518082815260200191505060405180910390f35b34801560b357600080fd5b5060d06004803603810190808035906020019092919050505060e0565b005b60005481565b600043905090565b80600081905550505600a165627a7a723058206d2bc553736581b6387f9a0410856ca490fcdc7045a8991ad63a1fd71b651c3a0029000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000037374720000000000000000000000000000000000000000000000000000000000',

            gas: '0x3b9ac9ff',
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

    context('create legacyTransaction instance', () => {
        it('CAVERJS-UNIT-TRANSACTION-001: If legacyTransaction not define input and to, return error', () => {
            delete transactionObj.input
            delete transactionObj.to

            const expectedError = 'contract creation without any data provided'
            expect(() => caver.transaction.legacyTransaction.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-002: If legacyTransaction not define gas, return error', () => {
            delete transactionObj.gas

            const expectedError = '"gas" is missing'
            expect(() => caver.transaction.legacyTransaction.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-003: If legacyTransaction define from property with invalid address, return error', () => {
            transactionObj.from = 'invalid'

            const expectedError = `Invalid address of from: ${transactionObj.from}`
            expect(() => caver.transaction.legacyTransaction.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-004: If legacyTransaction define to property with invalid address, return error', () => {
            transactionObj.to = 'invalid address'

            const expectedError = `Invalid address of to: ${transactionObj.to}`
            expect(() => caver.transaction.legacyTransaction.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-005: If legacyTransaction define unnecessary property, return error', () => {
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
                propertiesForUnnecessary.accessList,
                propertiesForUnnecessary.maxPriorityFeePerGas,
                propertiesForUnnecessary.maxFeePerGas,
            ]

            for (let i = 0; i < unnecessaries.length; i++) {
                if (i > 0) delete transactionObj[unnecessaries[i - 1].name]
                transactionObj[unnecessaries[i].name] = unnecessaries[i].value

                const expectedError = `"${unnecessaries[i].name}" cannot be used with ${caver.transaction.type.TxTypeLegacyTransaction} transaction`
                expect(() => caver.transaction.legacyTransaction.create(transactionObj)).to.throw(expectedError)
            }
        })
    })

    context('legacyTransaction.getRLPEncoding', () => {
        it('CAVERJS-UNIT-TRANSACTION-006: returns RLP-encoded transaction string', () => {
            transactionObj = {
                to: '0x7b65b75d204abed71587c9e519a89277766ee1d0',
                value: '0xa',
                gas: '0xf4240',
                nonce: 1234,
                gasPrice: '0x19',
                signatures: [
                    '0x25',
                    '0xb2a5a15550ec298dc7dddde3774429ed75f864c82caeb5ee24399649ad731be9',
                    '0x29da1014d16f2011b3307f7bbe1035b6e699a4204fc416c763def6cefd976567',
                ],
                chainId: '0x1',
                input: '0x31323334',
            }
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            expect(tx.getRLPEncoding()).to.equal(
                '0xf8668204d219830f4240947b65b75d204abed71587c9e519a89277766ee1d00a843132333425a0b2a5a15550ec298dc7dddde3774429ed75f864c82caeb5ee24399649ad731be9a029da1014d16f2011b3307f7bbe1035b6e699a4204fc416c763def6cefd976567'
            )
        })

        it('CAVERJS-UNIT-TRANSACTION-044: getRLPEncoding should throw error when nonce is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-045: getRLPEncoding should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })
    })

    context('legacyTransaction.sign', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = caver.transaction.legacyTransaction.create(transactionObj)

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
        function checkSignature() {
            expect(tx.signatures instanceof SignatureData).to.be.true
        }

        it('CAVERJS-UNIT-TRANSACTION-007: input: keyring. should sign transaction.', async () => {
            await tx.sign(sender)

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-008: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.key.privateKey)

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-009: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-010: input: decoupled KlaytnWalletKey. should throw error.', async () => {
            tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `TxTypeLegacyTransaction cannot be signed with a decoupled keyring.`
            await expect(tx.sign(generateDecoupledKeyring().getKlaytnWalletKey())).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-011: input: keyring, index. should sign transaction with specific index.', async () => {
            await tx.sign(sender, 0)

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(txHash, '0x7e3', 0, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-012: input: keyring, custom hasher. should use custom hasher.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-013: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, 0, customHasher)

            checkFunctionCall(true)
            checkSignature()
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-014: input: decoupled keyring. should throw error.', async () => {
            tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `TxTypeLegacyTransaction cannot be signed with a decoupled keyring.`
            await expect(tx.sign(generateDecoupledKeyring())).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-015: input: multisig keyring. should throw error.', async () => {
            tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `TxTypeLegacyTransaction cannot be signed with a decoupled keyring.`
            await expect(tx.sign(generateMultiSigKeyring())).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-016: input: roleBased keyring. should throw error.', async () => {
            tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `TxTypeLegacyTransaction cannot be signed with a decoupled keyring.`
            await expect(tx.sign(roleBasedKeyring)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-017: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('legacyTransaction.sign with multiple keys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeysSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = caver.transaction.legacyTransaction.create(transactionObj)

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

        function checkSignature() {
            expect(tx.signatures instanceof SignatureData).to.be.true
        }

        it('CAVERJS-UNIT-TRANSACTION-018: input: keyring. should sign transaction.', async () => {
            await tx.sign(sender)

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-019: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.key.privateKey)

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-020: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature()
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-021: input: decoupled KlaytnWalletKey. should throw error.', async () => {
            tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `TxTypeLegacyTransaction cannot be signed with a decoupled keyring.`
            await expect(tx.sign(generateDecoupledKeyring().getKlaytnWalletKey())).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-022: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, customHasher)

            checkFunctionCall(true)
            checkSignature()
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-023: input: keyring. should throw error when address is not equal.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-024: input: decoupled keyring. should throw error.', async () => {
            tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `TxTypeLegacyTransaction cannot be signed with a decoupled keyring.`
            await expect(tx.sign(generateDecoupledKeyring())).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-025: input: multisig keyring. should throw error.', async () => {
            tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `TxTypeLegacyTransaction cannot be signed with a decoupled keyring.`
            await expect(tx.sign(generateMultiSigKeyring())).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-026: input: roleBased keyring. should throw error.', async () => {
            tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `TxTypeLegacyTransaction cannot be signed with a decoupled keyring.`
            await expect(tx.sign(roleBasedKeyring)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('legacyTransaction.appendSignatures', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-027: If signatures is empty, appendSignatures append signatures in transaction', () => {
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            tx.appendSignatures(sig)

            expect(tx.signatures instanceof SignatureData).to.be.true
            expect(tx.signatures.v).to.equal(sig[0])
            expect(tx.signatures.r).to.equal(sig[1])
            expect(tx.signatures.s).to.equal(sig[2])
        })

        it('CAVERJS-UNIT-TRANSACTION-028: If signatures is empty, appendSignatures append signatures with two-dimensional signature array', () => {
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            const sig = [
                [
                    '0x0fea',
                    '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                    '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                ],
            ]
            tx.appendSignatures(sig)

            expect(tx.signatures instanceof SignatureData).to.be.true
            expect(tx.signatures.v).to.equal(sig[0][0])
            expect(tx.signatures.r).to.equal(sig[0][1])
            expect(tx.signatures.s).to.equal(sig[0][2])
        })

        it('CAVERJS-UNIT-TRANSACTION-029: If signatures is not empty, appendSignatures should throw error', () => {
            transactionObj.signatures = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]

            const expectedError = `signatures already defined. ${tx.type} cannot include more than one signature. Please use tx.signatures = sigArr to replace.`

            expect(() => tx.appendSignatures(sig)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-030: appendSignatures should throw error when sig array has more than one signatures', () => {
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            const sig = [
                [
                    '0x0fea',
                    '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                    '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                ],
                [
                    '0x0fea',
                    '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                    '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                ],
            ]

            const expectedError = `signatures are too long. ${tx.type} cannot include more than one signature.`

            expect(() => tx.appendSignatures(sig)).to.throw(expectedError)
        })
    })

    context('legacyTransaction.combineSignedRawTransactions', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-031: If signatures is empty, combineSignedRawTransactions set signatures in transaction', () => {
            transactionObj = {
                to: '0x8723590d5D60e35f7cE0Db5C09D3938b26fF80Ae',
                value: 1,
                gas: 90000,
                nonce: '0x3a',
                gasPrice: '0x5d21dba00',
                chainId: 2019,
            }
            const tx = caver.transaction.legacyTransaction.create(transactionObj)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0xf8673a8505d21dba0083015f90948723590d5d60e35f7ce0db5c09d3938b26ff80ae0180820feaa0ade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6ea038160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e'
            const combined = tx.combineSignedRawTransactions([rlpEncoded])

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            expect(tx.signatures instanceof SignatureData).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTION-032: If signatures is not empty, combineSignedRawTransactions should throw error', () => {
            transactionObj = {
                to: '0x8723590d5D60e35f7cE0Db5C09D3938b26fF80Ae',
                value: 1,
                gas: 90000,
                nonce: '0x3a',
                gasPrice: '0x5d21dba00',
                chainId: 2019,
                signatures: [
                    '0x0fea',
                    '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                    '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                ],
            }
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            const rlpEncoded =
                '0xf8673a8505d21dba0083015f90948723590d5d60e35f7ce0db5c09d3938b26ff80ae0180820feaa0ade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6ea038160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e'
            const expectedError = `signatures already defined. ${tx.type} cannot include more than one signature. Please use tx.signatures = sigArr to replace.`

            expect(() => tx.combineSignedRawTransactions([rlpEncoded])).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-033: If decode transaction has different values, combineSignedRawTransactions should throw error', () => {
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            const rlpEncoded =
                '0xf8673a8505d21dba0083015f90948723590d5d60e35f7ce0db5c09d3938b26ff80ae0180820feaa0ade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6ea038160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e'
            const expectedError = `Transactions containing different information cannot be combined.`

            expect(() => tx.combineSignedRawTransactions([rlpEncoded])).to.throw(expectedError)
        })
    })

    context('legacyTransaction.getRawTransaction', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-034: getRawTransaction should call getRLPEncoding function', () => {
            transactionObj = {
                to: '0x8723590d5D60e35f7cE0Db5C09D3938b26fF80Ae',
                value: 1,
                gas: 90000,
                nonce: '0x3a',
                gasPrice: '0x5d21dba00',
                chainId: 2019,
                signatures: [
                    '0x0fea',
                    '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                    '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                ],
            }
            const tx = caver.transaction.legacyTransaction.create(transactionObj)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const expected =
                '0xf8673a8505d21dba0083015f90948723590d5d60e35f7ce0db5c09d3938b26ff80ae0180820feaa0ade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6ea038160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e'
            const rawTransaction = tx.getRawTransaction()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(rawTransaction).to.equal(expected)
        })
    })

    context('legacyTransaction.getTransactionHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('getTransactionHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            transactionObj = {
                to: '0x7b65b75d204abed71587c9e519a89277766ee1d0',
                value: '0xa',
                gas: '0xf4240',
                nonce: 1234,
                gasPrice: '0x19',
                signatures: [
                    '0x25',
                    '0xb2a5a15550ec298dc7dddde3774429ed75f864c82caeb5ee24399649ad731be9',
                    '0x29da1014d16f2011b3307f7bbe1035b6e699a4204fc416c763def6cefd976567',
                ],
                chainId: '0x1',
                input: '0x31323334',
            }
            const tx = caver.transaction.legacyTransaction.create(transactionObj)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const expected = '0xe434257753bf31a130c839fec0bd34fc6ea4aa256b825288ee82db31c2ed7524'
            const txHash = tx.getTransactionHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(txHash).to.equal(expected)
            expect(caver.utils.isValidHashStrict(txHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTION-047: getTransactionHash should throw error when nonce is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-048: getTransactionHash should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })
    })

    context('legacyTransaction.getSenderTxHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-036: getSenderTxHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            transactionObj = {
                to: '0x7b65b75d204abed71587c9e519a89277766ee1d0',
                value: '0xa',
                gas: '0xf4240',
                nonce: 1234,
                gasPrice: '0x19',
                signatures: [
                    '0x25',
                    '0xb2a5a15550ec298dc7dddde3774429ed75f864c82caeb5ee24399649ad731be9',
                    '0x29da1014d16f2011b3307f7bbe1035b6e699a4204fc416c763def6cefd976567',
                ],
                chainId: '0x1',
                input: '0x31323334',
            }
            const tx = caver.transaction.legacyTransaction.create(transactionObj)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const expected = '0xe434257753bf31a130c839fec0bd34fc6ea4aa256b825288ee82db31c2ed7524'
            const senderTxHash = tx.getSenderTxHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(senderTxHash).to.equal(expected)
            expect(caver.utils.isValidHashStrict(senderTxHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTION-050: getSenderTxHash should throw error when nonce is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-051: getSenderTxHash should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })
    })

    context('legacyTransaction.getRLPEncodingForSignature', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-037: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            transactionObj = {
                to: '0x7b65b75d204abed71587c9e519a89277766ee1d0',
                value: '0xa',
                gas: '0xf4240',
                nonce: 1234,
                gasPrice: '0x19',
                signatures: [
                    '0x25',
                    '0xb2a5a15550ec298dc7dddde3774429ed75f864c82caeb5ee24399649ad731be9',
                    '0x29da1014d16f2011b3307f7bbe1035b6e699a4204fc416c763def6cefd976567',
                ],
                chainId: '0x1',
                input: '0x31323334',
            }
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expected = '0xe68204d219830f4240947b65b75d204abed71587c9e519a89277766ee1d00a8431323334018080'
            const rlpEncodingForSign = tx.getRLPEncodingForSignature()

            expect(rlpEncodingForSign).to.equal(expected)
        })

        it('CAVERJS-UNIT-TRANSACTION-038: getRLPEncodingForSignature should throw error when nonce is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-039: getRLPEncodingForSignature should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-040: getRLPEncodingForSignature should throw error when chainId is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })
    })

    context('legacyTransaction.fillTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTION-041: fillTransaction should call klay_getGasPrice to fill gasPrice when gasPrice is undefined', async () => {
            transactionObj.nonce = '0x3a'
            transactionObj.chainId = 2019
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-042: fillTransaction should call klay_getTransactionCount to fill nonce when nonce is undefined', async () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-043: fillTransaction should call klay_getChainid to fill chainId when chainId is undefined', async () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = caver.transaction.legacyTransaction.create(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).to.have.been.calledOnce
        }).timeout(200000)
    })

    context('legacyTransaction.recoverPublicKeys', () => {
        it('CAVERJS-UNIT-TRANSACTION-421: should return public key string recovered from signatures in LegacyTransaction', async () => {
            const tx = caver.transaction.legacyTransaction.create({
                from: '0xf21460730845e3652aa3cc9bc13b345e4f53984a',
                to: '0x59177716c34ac6e49e295a0e78e33522f14d61ee',
                value: '0x1',
                chainId: '0x7e3',
                gasPrice: '0x5d21dba00',
                nonce: '0x0',
                gas: '0x2faf080',
                signatures: [
                    '0x0fe9',
                    '0xecdec357060dbbb4bd3790e98b1733ec3a0b02b7e4ec7a5622f93cd9bee229fe',
                    '0x0a4a5e28753e7c1d999b286fb07933c5bf353079b8ed4d1ed509a838b48be02c',
                ],
            })
            const publicKeys = tx.recoverPublicKeys()

            expect(publicKeys[0].toLowerCase()).to.equal(
                '0x8bb6aaeb2d96d024754d3b50babf116cece68977acbe8ba6a66f14d5217c60d96af020a0568661e7c72e753e80efe084a3aed9f9ac87bf44d09ce67aad3d4e01'
            )
        }).timeout(200000)
    })
})
