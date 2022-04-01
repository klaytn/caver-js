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

const { generateRoleBasedKeyring, checkSignature } = require('../utils')

let caver
let sender
let roleBasedKeyring

const sandbox = sinon.createSandbox()

const txWithExpectedValues = {}

before(() => {
    caver = new Caver(testRPCURL)

    sender = caver.wallet.add(caver.wallet.keyring.generate())
    roleBasedKeyring = generateRoleBasedKeyring([3, 3, 3])

    txWithExpectedValues.tx = {
        from: '0x6b604e77c0fbebb5b2941bcde3ab5eb09d99ad24',
        gas: '0xdbba0',
        gasPrice: '0x5d21dba00',
        chainId: '0x7e3',
        signatures: [
            [
                '0x0fea',
                '0xd9994ef507951a59380309f656ee8ed685becdc89b1d1a0eb1d2f72683ae14d3',
                '0x7ad5d37a89781f294fab72b254ea9266e4d039ae163db4a4c4752f1fabff023b',
            ],
        ],
        nonce: '0x6',
    }

    txWithExpectedValues.rlpEncodingForSigning = '0xe8a2e138068505d21dba00830dbba0946b604e77c0fbebb5b2941bcde3ab5eb09d99ad248207e38080'
    txWithExpectedValues.rlpEncodingCommon = '0xe138068505d21dba00830dbba0946b604e77c0fbebb5b2941bcde3ab5eb09d99ad24'
    txWithExpectedValues.senderTxHash = '0x65a45683117b76640328ad54ada9ac801fa7b0c4605cbac271f9ab543deeab1e'
    txWithExpectedValues.transactionHash = '0x65a45683117b76640328ad54ada9ac801fa7b0c4605cbac271f9ab543deeab1e'
    txWithExpectedValues.rlpEncoding =
        '0x38f869068505d21dba00830dbba0946b604e77c0fbebb5b2941bcde3ab5eb09d99ad24f847f845820feaa0d9994ef507951a59380309f656ee8ed685becdc89b1d1a0eb1d2f72683ae14d3a07ad5d37a89781f294fab72b254ea9266e4d039ae163db4a4c4752f1fabff023b'
})

describe('TxTypeCancel', () => {
    let transactionObj
    let getGasPriceSpy
    let getNonceSpy
    let getChainIdSpy
    beforeEach(() => {
        transactionObj = {
            from: sender.address,
            gas: '0xdbba0',
            nonce: '0x6',
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

    context('create cancel instance', () => {
        it('CAVERJS-UNIT-TRANSACTION-297: If cancel not define from, return error', () => {
            delete transactionObj.from

            const expectedError = '"from" is missing'
            expect(() => caver.transaction.cancel.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-298: If cancel not define gas, return error', () => {
            delete transactionObj.gas

            const expectedError = '"gas" is missing'
            expect(() => caver.transaction.cancel.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-299: If cancel define from property with invalid address, return error', () => {
            transactionObj.from = 'invalid'

            const expectedError = `Invalid address of from: ${transactionObj.from}`
            expect(() => caver.transaction.cancel.create(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-300: If cancel define unnecessary property, return error', () => {
            const unnecessaries = [
                propertiesForUnnecessary.to,
                propertiesForUnnecessary.value,
                propertiesForUnnecessary.input,
                propertiesForUnnecessary.codeFormat,
                propertiesForUnnecessary.humanReadable,
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
                propertiesForUnnecessary.accessList,
                propertiesForUnnecessary.maxPriorityFeePerGas,
                propertiesForUnnecessary.maxFeePerGas,
            ]

            for (let i = 0; i < unnecessaries.length; i++) {
                if (i > 0) delete transactionObj[unnecessaries[i - 1].name]
                transactionObj[unnecessaries[i].name] = unnecessaries[i].value

                const expectedError = `"${unnecessaries[i].name}" cannot be used with ${caver.transaction.type.TxTypeCancel} transaction`
                expect(() => caver.transaction.cancel.create(transactionObj)).to.throw(expectedError)
            }
        })
    })

    context('cancel.getRLPEncoding', () => {
        it('CAVERJS-UNIT-TRANSACTION-301: Returns RLP-encoded string', () => {
            const tx = caver.transaction.cancel.create(txWithExpectedValues.tx)

            expect(tx.getRLPEncoding()).to.equal(txWithExpectedValues.rlpEncoding)
        })

        it('CAVERJS-UNIT-TRANSACTION-302: getRLPEncoding should throw error when nonce is undefined', () => {
            const tx = caver.transaction.cancel.create(txWithExpectedValues.tx)
            delete tx._nonce

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-303: getRLPEncoding should throw error when gasPrice is undefined', () => {
            const tx = caver.transaction.cancel.create(txWithExpectedValues.tx)
            delete tx._gasPrice

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })
    })

    context('cancel.sign', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = caver.transaction.cancel.create(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTION-305: input: keyring. should sign transaction.', async () => {
            await tx.sign(sender)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-306: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.key.privateKey)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-307: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-308: input: keyring, index. should sign transaction with specific index.', async () => {
            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.from = roleBasedKeyring.address

            await tx.sign(roleBasedKeyring, 1)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignSpy).to.have.been.calledWith(txHash, '0x7e3', 0, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-309: input: keyring, custom hasher. should use custom hasher.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-310: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTION-311: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = caver.transaction.cancel.create(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-312: input: rolebased keyring, index out of range. should throw error.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = caver.transaction.cancel.create(transactionObj)

            const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
            await expect(tx.sign(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('cancel.sign with multiple keys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeysSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = caver.transaction.cancel.create(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTION-313: input: keyring. should sign transaction.', async () => {
            await tx.sign(sender)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-314: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.key.privateKey)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-315: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-316: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-317: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = caver.transaction.cancel.create(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-318: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.from = roleBasedKeyring.address

            await tx.sign(roleBasedKeyring)

            checkFunctionCall(true)
            checkSignature(tx, { expectedLength: roleBasedKeyring.keys[0].length })
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)
    })

    context('cancel.appendSignatures', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-319: If signatures is empty, appendSignatures append signatures in transaction', () => {
            const tx = caver.transaction.cancel.create(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            tx.appendSignatures(sig)
            checkSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTION-320: If signatures is empty, appendSignatures append signatures with two-dimensional signature array', () => {
            const tx = caver.transaction.cancel.create(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTION-321: If signatures is not empty, appendSignatures should append signatures', () => {
            transactionObj.signatures = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            const tx = caver.transaction.cancel.create(transactionObj)

            const sig = [
                '0x0fea',
                '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
            ]

            tx.appendSignatures(sig)
            checkSignature(tx, { expectedLength: 2 })
        })

        it('CAVERJS-UNIT-TRANSACTION-322: appendSignatures should append multiple signatures', () => {
            const tx = caver.transaction.cancel.create(transactionObj)

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

    context('cancel.combineSignedRawTransactions', () => {
        beforeEach(() => {
            transactionObj = {
                from: '0x504a835246e030d70ded9027f9f5a0aefcd45143',
                gas: '0xdbba0',
                gasPrice: '0x5d21dba00',
                chainId: '0x7e3',
                nonce: '0x1',
            }
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-323: combineSignedRawTransactions combines single signature and sets signatures in transaction', () => {
            const tx = caver.transaction.cancel.create(transactionObj)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x38f869018505d21dba00830dbba094504a835246e030d70ded9027f9f5a0aefcd45143f847f845820feaa00382dcd275a9657d8fc3c4dc1509ad975f083184e3d34779dc6bef10e0e973c8a059d5deb0f4c06a35a8024506159864ffc46dd08d91d5ac16fa69e92fb2d6b9ae'
            const combined = tx.combineSignedRawTransactions([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fea',
                    '0x0382dcd275a9657d8fc3c4dc1509ad975f083184e3d34779dc6bef10e0e973c8',
                    '0x59d5deb0f4c06a35a8024506159864ffc46dd08d91d5ac16fa69e92fb2d6b9ae',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTION-324: combineSignedRawTransactions combines multiple signatures and sets signatures in transaction', () => {
            transactionObj.signatures = [
                [
                    '0x0fea',
                    '0x0382dcd275a9657d8fc3c4dc1509ad975f083184e3d34779dc6bef10e0e973c8',
                    '0x59d5deb0f4c06a35a8024506159864ffc46dd08d91d5ac16fa69e92fb2d6b9ae',
                ],
            ]
            const tx = caver.transaction.cancel.create(transactionObj)

            const rlpEncodedStrings = [
                '0x38f869018505d21dba00830dbba094504a835246e030d70ded9027f9f5a0aefcd45143f847f845820feaa05a3a7910ce495e316da1394f197cdadd95dbb6954d803052b9f62ce993c0ec3ca00934f8dda9666d759e511a5658de1db36faefb35e76a5e237d87ba8c3b9bb700',
                '0x38f869018505d21dba00830dbba094504a835246e030d70ded9027f9f5a0aefcd45143f847f845820feaa0dccd060bd76582d221f6fe7e02e70877a25b65d80fed13b69b5c79d7c4520912a07572c5c68daf7094a17105eb6e5fed1b102bfe4ca737d62b51f921f7663fb2bd',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignedRawTransactions(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x38f8f7018505d21dba00830dbba094504a835246e030d70ded9027f9f5a0aefcd45143f8d5f845820feaa00382dcd275a9657d8fc3c4dc1509ad975f083184e3d34779dc6bef10e0e973c8a059d5deb0f4c06a35a8024506159864ffc46dd08d91d5ac16fa69e92fb2d6b9aef845820feaa05a3a7910ce495e316da1394f197cdadd95dbb6954d803052b9f62ce993c0ec3ca00934f8dda9666d759e511a5658de1db36faefb35e76a5e237d87ba8c3b9bb700f845820feaa0dccd060bd76582d221f6fe7e02e70877a25b65d80fed13b69b5c79d7c4520912a07572c5c68daf7094a17105eb6e5fed1b102bfe4ca737d62b51f921f7663fb2bd'

            const expectedSignatures = [
                [
                    '0x0fea',
                    '0x0382dcd275a9657d8fc3c4dc1509ad975f083184e3d34779dc6bef10e0e973c8',
                    '0x59d5deb0f4c06a35a8024506159864ffc46dd08d91d5ac16fa69e92fb2d6b9ae',
                ],
                [
                    '0x0fea',
                    '0x5a3a7910ce495e316da1394f197cdadd95dbb6954d803052b9f62ce993c0ec3c',
                    '0x0934f8dda9666d759e511a5658de1db36faefb35e76a5e237d87ba8c3b9bb700',
                ],
                [
                    '0x0fea',
                    '0xdccd060bd76582d221f6fe7e02e70877a25b65d80fed13b69b5c79d7c4520912',
                    '0x7572c5c68daf7094a17105eb6e5fed1b102bfe4ca737d62b51f921f7663fb2bd',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTION-325: If decode transaction has different values, combineSignedRawTransactions should throw error', () => {
            const tx = caver.transaction.cancel.create(transactionObj)
            tx.nonce = 1234

            const rlpEncoded =
                '0x38f869018505d21dba00830dbba094504a835246e030d70ded9027f9f5a0aefcd45143f847f845820feaa05a3a7910ce495e316da1394f197cdadd95dbb6954d803052b9f62ce993c0ec3ca00934f8dda9666d759e511a5658de1db36faefb35e76a5e237d87ba8c3b9bb700'
            const expectedError = `Transactions containing different information cannot be combined.`

            expect(() => tx.combineSignedRawTransactions([rlpEncoded])).to.throw(expectedError)
        })
    })

    context('cancel.getRawTransaction', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-326: getRawTransaction should call getRLPEncoding function', () => {
            const tx = caver.transaction.cancel.create(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const expected = txWithExpectedValues.rlpEncoding
            const rawTransaction = tx.getRawTransaction()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(rawTransaction).to.equal(expected)
        })
    })

    context('cancel.getTransactionHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-327: getTransactionHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = caver.transaction.cancel.create(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const expected = txWithExpectedValues.transactionHash
            const txHash = tx.getTransactionHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(txHash).to.equal(expected)
            expect(caver.utils.isValidHashStrict(txHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTION-328: getTransactionHash should throw error when nonce is undefined', () => {
            const tx = caver.transaction.cancel.create(txWithExpectedValues.tx)
            delete tx._nonce

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-329: getTransactionHash should throw error when gasPrice is undefined', () => {
            const tx = caver.transaction.cancel.create(txWithExpectedValues.tx)
            delete tx._gasPrice

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })
    })

    context('cancel.getSenderTxHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-331: getSenderTxHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = caver.transaction.cancel.create(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const expected = txWithExpectedValues.senderTxHash
            const senderTxHash = tx.getSenderTxHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(senderTxHash).to.equal(expected)
            expect(caver.utils.isValidHashStrict(senderTxHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTION-332: getSenderTxHash should throw error when nonce is undefined', () => {
            const tx = caver.transaction.cancel.create(txWithExpectedValues.tx)
            delete tx._nonce

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })
    })

    context('cancel.getRLPEncodingForSignature', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-335: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = caver.transaction.cancel.create(txWithExpectedValues.tx)

            const commonRLPForSigningSpy = sandbox.spy(tx, 'getCommonRLPEncodingForSignature')

            const expected = txWithExpectedValues.rlpEncodingForSigning
            const rlpEncodingForSign = tx.getRLPEncodingForSignature()

            expect(rlpEncodingForSign).to.equal(expected)
            expect(commonRLPForSigningSpy).to.have.been.calledOnce
        })

        it('CAVERJS-UNIT-TRANSACTION-336: getRLPEncodingForSignature should throw error when nonce is undefined', () => {
            const tx = caver.transaction.cancel.create(txWithExpectedValues.tx)
            delete tx._nonce

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-337: getRLPEncodingForSignature should throw error when gasPrice is undefined', () => {
            const tx = caver.transaction.cancel.create(txWithExpectedValues.tx)
            delete tx._gasPrice

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-338: getRLPEncodingForSignature should throw error when chainId is undefined', () => {
            const tx = caver.transaction.cancel.create(txWithExpectedValues.tx)
            delete tx._chainId

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })
    })

    context('cancel.getCommonRLPEncodingForSignature', () => {
        it('CAVERJS-UNIT-TRANSACTION-339: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = caver.transaction.cancel.create(txWithExpectedValues.tx)

            const commonRLPForSign = tx.getCommonRLPEncodingForSignature()

            expect(commonRLPForSign).to.equal(txWithExpectedValues.rlpEncodingCommon)
        })
    })

    context('cancel.fillTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTION-340: fillTransaction should call klay_getGasPrice to fill gasPrice when gasPrice is undefined', async () => {
            const tx = caver.transaction.cancel.create(txWithExpectedValues.tx)
            delete tx._gasPrice

            await tx.fillTransaction()
            expect(getGasPriceSpy).to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-341: fillTransaction should call klay_getTransactionCount to fill nonce when nonce is undefined', async () => {
            const tx = caver.transaction.cancel.create(txWithExpectedValues.tx)
            delete tx._nonce

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-342: fillTransaction should call klay_getChainid to fill chainId when chainId is undefined', async () => {
            const tx = caver.transaction.cancel.create(txWithExpectedValues.tx)
            delete tx._chainId

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).to.have.been.calledOnce
        }).timeout(200000)
    })

    context('cancel.recoverPublicKeys', () => {
        const expectedPublicKeyArray = [
            '0x8bb6aaeb2d96d024754d3b50babf116cece68977acbe8ba6a66f14d5217c60d96af020a0568661e7c72e753e80efe084a3aed9f9ac87bf44d09ce67aad3d4e01',
            '0xc7751c794337a93e4db041fb5401c2c816cf0a099d8fd4b1f3f555aab5dfead2417521bb0c03d8637f350df15ef6a6cb3cdb806bd9d10bc71982dd03ff5d9ddd',
            '0x3919091ba17c106dd034af508cfe00b963d173dffab2c7702890e25a96d107ca1bb4f148ee1984751e57d2435468558193ce84ab9a7731b842e9672e40dc0f22',
        ]

        it('CAVERJS-UNIT-TRANSACTION-427: should return public key string recovered from signatures in Cancel', async () => {
            const tx = caver.transaction.cancel.create({
                from: '0xf21460730845e3652aa3cc9bc13b345e4f53984a',
                chainId: '0x7e3',
                gasPrice: '0x5d21dba00',
                nonce: '0x0',
                gas: '0x2faf080',
                signatures: [
                    [
                        '0x0fea',
                        '0xac0efc65393b4136e474c8185af7f44491e797d8aa2e07d6853703c4efdbf7dc',
                        '0x3691224986fec26012fe329f6bed56c6964a3d4f3bc8ff704131970735cd0a2f',
                    ],
                    [
                        '0x0fea',
                        '0x04f1bbc8767546157bdae445b7e88722c0f94a29efa47d1a3d2241954c3bc816',
                        '0x5701a35937563b3a7542c5766a6218698424c60c0a63b8e463ba88b21e6dbee3',
                    ],
                    [
                        '0x0fea',
                        '0xb1f2d463eee52f6f03f3a5320eb863f964a89b1fdc466ccc93ae22b96044e6ef',
                        '0x3ea104cc4de8f071d9b5cc3da4197b3299408d7da44e8359bb7b36fde9bf3b30',
                    ],
                ],
            })
            const publicKeys = tx.recoverPublicKeys()

            expect(publicKeys.length).to.equal(expectedPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedPublicKeyArray[i].toLowerCase())
            }
        }).timeout(200000)
    })
})
