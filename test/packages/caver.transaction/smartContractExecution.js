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
const Caver = require('../../../index.js')
const Keyring = require('../../../packages/caver-wallet/src/keyring/keyring')
const TransactionHasher = require('../../../packages/caver-transaction/src/transactionHasher/transactionHasher')

const { generateRoleBasedKeyring, checkSignature } = require('../utils')

const AbstractTransaction = require('../../../packages/caver-transaction/src/transactionTypes/abstractTransaction')

let caver
let sender
let roleBasedKeyring

const sandbox = sinon.createSandbox()

const input =
    '0xa9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039'

const txWithExpectedValues = {}

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
        from: '0x6b604e77c0fbebb5b2941bcde3ab5eb09d99ad24',
        to: '0xe3cd4e1cd287235cc0ea48c9fd02978533f5ec2b',
        value: '0x0',
        gas: '0xdbba0',
        gasPrice: '0x5d21dba00',
        input,
        chainId: '0x7e3',
        signatures: [
            [
                '0x0fea',
                '0x66e1650b5779f152489633f343581c07938f8b2fc92c919d4dd7c7295d0beace',
                '0x67b0b79383dbcd42a3aa8ebb1aa4bcb1fc0623ef9e97bc1e9b82d96fe37b5881',
            ],
        ],
        nonce: '0x3',
    }

    txWithExpectedValues.rlpEncodingForSigning =
        '0xf886b87ff87d30038505d21dba00830dbba094e3cd4e1cd287235cc0ea48c9fd02978533f5ec2b80946b604e77c0fbebb5b2941bcde3ab5eb09d99ad24b844a9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a00000000000000000000000000000000000000000000000000000000000030398207e38080'
    txWithExpectedValues.rlpEncodingCommon =
        '0xf87d30038505d21dba00830dbba094e3cd4e1cd287235cc0ea48c9fd02978533f5ec2b80946b604e77c0fbebb5b2941bcde3ab5eb09d99ad24b844a9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039'
    txWithExpectedValues.senderTxHash = '0x75119321f4c5e93e486accb33fedc3d714de2610ffdc9655182ac50e4a5f3298'
    txWithExpectedValues.transactionHash = '0x75119321f4c5e93e486accb33fedc3d714de2610ffdc9655182ac50e4a5f3298'
    txWithExpectedValues.rlpEncoding =
        '0x30f8c5038505d21dba00830dbba094e3cd4e1cd287235cc0ea48c9fd02978533f5ec2b80946b604e77c0fbebb5b2941bcde3ab5eb09d99ad24b844a9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039f847f845820feaa066e1650b5779f152489633f343581c07938f8b2fc92c919d4dd7c7295d0beacea067b0b79383dbcd42a3aa8ebb1aa4bcb1fc0623ef9e97bc1e9b82d96fe37b5881'
})

describe('TxTypeSmartContractExecution', () => {
    let transactionObj
    let getGasPriceSpy
    let getNonceSpy
    let getChainIdSpy
    beforeEach(() => {
        transactionObj = {
            from: sender.address,
            to: '0xe3cd4e1cd287235cc0ea48c9fd02978533f5ec2b',
            value: 0,
            gas: '0x15f90',
            input,
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

    context('create smartContractExecution instance', () => {
        it('CAVERJS-UNIT-TRANSACTION-248: If smartContractExecution not define from, return error', () => {
            delete transactionObj.from

            const expectedError = '"from" is missing'
            expect(() => new caver.transaction.smartContractExecution(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-249: If smartContractExecution not define to, return error', () => {
            delete transactionObj.to

            const expectedError = '"to" is missing'
            expect(() => new caver.transaction.smartContractExecution(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-250: If smartContractExecution not define gas, return error', () => {
            delete transactionObj.gas

            const expectedError = '"gas" is missing'
            expect(() => new caver.transaction.smartContractExecution(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-251: If smartContractExecution not define input, return error', () => {
            delete transactionObj.input

            const expectedError = '"input" is missing'
            expect(() => new caver.transaction.smartContractExecution(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-252: If smartContractExecution define from property with invalid address, return error', () => {
            transactionObj.from = 'invalid'

            const expectedError = `Invalid address of from: ${transactionObj.from}`
            expect(() => new caver.transaction.smartContractExecution(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-253: If smartContractExecution define to property with invalid address, return error', () => {
            transactionObj.to = 'invalid'

            const expectedError = `Invalid address of to: ${transactionObj.to}`
            expect(() => new caver.transaction.smartContractExecution(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-254: If smartContractExecution define unnecessary property, return error', () => {
            const unnecessaries = [
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
            ]

            for (let i = 0; i < unnecessaries.length; i++) {
                if (i > 0) delete transactionObj[unnecessaries[i - 1].name]
                transactionObj[unnecessaries[i].name] = unnecessaries[i].value

                const expectedError = `"${unnecessaries[i].name}" cannot be used with ${caver.transaction.type.TxTypeSmartContractExecution} transaction`
                // eslint-disable-next-line no-loop-func
                expect(() => new caver.transaction.smartContractExecution(transactionObj)).to.throw(expectedError)
            }
        })
    })

    context('smartContractExecution.getRLPEncoding', () => {
        it('CAVERJS-UNIT-TRANSACTION-255: Returns RLP-encoded string', () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)

            expect(tx.getRLPEncoding()).to.equal(txWithExpectedValues.rlpEncoding)
        })

        it('CAVERJS-UNIT-TRANSACTION-256: getRLPEncoding should throw error when nonce is undefined', () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)
            delete tx._nonce

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-257: getRLPEncoding should throw error when gasPrice is undefined', () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)
            delete tx._gasPrice

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-258: getRLPEncoding should throw error when chainId is undefined', () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)
            delete tx._chainId

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })
    })

    context('smartContractExecution.signWithKey', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeySpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.smartContractExecution(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTION-259: input: keyring. should sign transaction.', async () => {
            await tx.signWithKey(sender)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeySpy).to.have.been.calledWith(txHash, '0x7e3', 0, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-260: input: private key string. should sign transaction.', async () => {
            const signWithKeyProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKey')
            await tx.signWithKey(sender.keys[0][0].privateKey)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeyProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-261: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signWithKeyProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKey')
            await tx.signWithKey(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeyProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-262: input: keyring, index. should sign transaction with specific index.', async () => {
            const roleBasedSignWithKeySpy = sandbox.spy(roleBasedKeyring, 'signWithKey')

            tx.from = roleBasedKeyring.address

            await tx.signWithKey(roleBasedKeyring, 1)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeySpy).to.have.been.calledWith(txHash, '0x7e3', 0, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-263: input: keyring, custom hasher. c.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            const expectedError = `In order to pass a custom hasher, use the third parameter.`
            await expect(tx.signWithKey(sender, customHasher)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-264: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTION-265: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.smartContractExecution(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signWithKey(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-266: input: rolebased keyring, index out of range. should throw error.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.smartContractExecution(transactionObj)

            const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
            await expect(tx.signWithKey(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('smartContractExecution.signWithKeys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeysSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.smartContractExecution(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTION-267: input: keyring. should sign transaction.', async () => {
            await tx.signWithKeys(sender)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-268: input: private key string. should sign transaction.', async () => {
            const signWithKeysProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKeys')
            await tx.signWithKeys(sender.keys[0][0].privateKey)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeysProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-269: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signWithKeysProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKeys')
            await tx.signWithKeys(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeysProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-270: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.signWithKeys(sender, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-271: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.smartContractExecution(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signWithKeys(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-272: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'signWithKeys')

            tx.from = roleBasedKeyring.address

            await tx.signWithKeys(roleBasedKeyring)

            checkFunctionCall(true)
            checkSignature(tx, { expectedLength: roleBasedKeyring.keys[0].length })
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)
    })

    context('smartContractExecution.appendSignatures', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-273: If signatures is empty, appendSignatures append signatures in transaction', () => {
            const tx = new caver.transaction.smartContractExecution(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            tx.appendSignatures(sig)
            checkSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTION-274: If signatures is empty, appendSignatures append signatures with two-dimensional signature array', () => {
            const tx = new caver.transaction.smartContractExecution(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTION-275: If signatures is not empty, appendSignatures should append signatures', () => {
            transactionObj.signatures = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            const tx = new caver.transaction.smartContractExecution(transactionObj)

            const sig = [
                '0x0fea',
                '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
            ]

            tx.appendSignatures(sig)
            checkSignature(tx, { expectedLength: 2 })
        })

        it('CAVERJS-UNIT-TRANSACTION-276: appendSignatures should append multiple signatures', () => {
            const tx = new caver.transaction.smartContractExecution(transactionObj)

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

    context('smartContractExecution.combineSignatures', () => {
        beforeEach(() => {
            transactionObj = {
                from: '0x2de587b91c76fb0b92fd607c4fbd5e9a17da799f',
                to: '0xe3cd4e1cd287235cc0ea48c9fd02978533f5ec2b',
                value: '0x0',
                gas: '0xdbba0',
                gasPrice: '0x5d21dba00',
                input,
                chainId: '0x7e3',
                nonce: '0x1',
            }
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-277: combineSignatures combines single signature and sets signatures in transaction', () => {
            const tx = new caver.transaction.smartContractExecution(transactionObj)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x30f8c5018505d21dba00830dbba094e3cd4e1cd287235cc0ea48c9fd02978533f5ec2b80942de587b91c76fb0b92fd607c4fbd5e9a17da799fb844a9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039f847f845820fe9a04a7d00c2680e5bca49a5880e23c5adb40b069af204a55e888f45746a20978e46a007b57a439201d182f4aec5db28d72192468f58f4fe7a1e717f96dd0d1def2d16'
            const combined = tx.combineSignatures([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0x4a7d00c2680e5bca49a5880e23c5adb40b069af204a55e888f45746a20978e46',
                    '0x07b57a439201d182f4aec5db28d72192468f58f4fe7a1e717f96dd0d1def2d16',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTION-278: combineSignatures combines multiple signatures and sets signatures in transaction', () => {
            transactionObj.signatures = [
                [
                    '0x0fe9',
                    '0x4a7d00c2680e5bca49a5880e23c5adb40b069af204a55e888f45746a20978e46',
                    '0x07b57a439201d182f4aec5db28d72192468f58f4fe7a1e717f96dd0d1def2d16',
                ],
            ]
            const tx = new caver.transaction.smartContractExecution(transactionObj)

            const rlpEncodedStrings = [
                '0x30f8c5018505d21dba00830dbba094e3cd4e1cd287235cc0ea48c9fd02978533f5ec2b80942de587b91c76fb0b92fd607c4fbd5e9a17da799fb844a9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039f847f845820fe9a08494bfd86b0480e33700635d37ab0eb0ce3e6d93b5c51e6eda9fadd179569804a047f601d9fcb8682090165d8d048d6a5e3c5a48377ec9b212be6d7ee72b768bfd',
                '0x30f8c5018505d21dba00830dbba094e3cd4e1cd287235cc0ea48c9fd02978533f5ec2b80942de587b91c76fb0b92fd607c4fbd5e9a17da799fb844a9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039f847f845820fe9a0f642b38cf64cf70c89a0ccd74de13266ea98854078119a4619cad3bb2e6d4530a02307abe779333fe9da8eeebf40fbfeff9f1314ae8467a0119541339dfb65f10a',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignatures(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x30f90153018505d21dba00830dbba094e3cd4e1cd287235cc0ea48c9fd02978533f5ec2b80942de587b91c76fb0b92fd607c4fbd5e9a17da799fb844a9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039f8d5f845820fe9a04a7d00c2680e5bca49a5880e23c5adb40b069af204a55e888f45746a20978e46a007b57a439201d182f4aec5db28d72192468f58f4fe7a1e717f96dd0d1def2d16f845820fe9a08494bfd86b0480e33700635d37ab0eb0ce3e6d93b5c51e6eda9fadd179569804a047f601d9fcb8682090165d8d048d6a5e3c5a48377ec9b212be6d7ee72b768bfdf845820fe9a0f642b38cf64cf70c89a0ccd74de13266ea98854078119a4619cad3bb2e6d4530a02307abe779333fe9da8eeebf40fbfeff9f1314ae8467a0119541339dfb65f10a'

            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0x4a7d00c2680e5bca49a5880e23c5adb40b069af204a55e888f45746a20978e46',
                    '0x07b57a439201d182f4aec5db28d72192468f58f4fe7a1e717f96dd0d1def2d16',
                ],
                [
                    '0x0fe9',
                    '0x8494bfd86b0480e33700635d37ab0eb0ce3e6d93b5c51e6eda9fadd179569804',
                    '0x47f601d9fcb8682090165d8d048d6a5e3c5a48377ec9b212be6d7ee72b768bfd',
                ],
                [
                    '0x0fe9',
                    '0xf642b38cf64cf70c89a0ccd74de13266ea98854078119a4619cad3bb2e6d4530',
                    '0x2307abe779333fe9da8eeebf40fbfeff9f1314ae8467a0119541339dfb65f10a',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTION-279: If decode transaction has different values, combineSignatures should throw error', () => {
            const tx = new caver.transaction.smartContractExecution(transactionObj)
            tx.value = 10000

            const rlpEncoded =
                '0x30f8c5018505d21dba00830dbba094e3cd4e1cd287235cc0ea48c9fd02978533f5ec2b80942de587b91c76fb0b92fd607c4fbd5e9a17da799fb844a9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039f847f845820fe9a08494bfd86b0480e33700635d37ab0eb0ce3e6d93b5c51e6eda9fadd179569804a047f601d9fcb8682090165d8d048d6a5e3c5a48377ec9b212be6d7ee72b768bfd'
            const expectedError = `Transactions containing different information cannot be combined.`

            expect(() => tx.combineSignatures([rlpEncoded])).to.throw(expectedError)
        })
    })

    context('smartContractExecution.getRawTransaction', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-280: getRawTransaction should call getRLPEncoding function', () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const expected = txWithExpectedValues.rlpEncoding
            const rawTransaction = tx.getRawTransaction()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(rawTransaction).to.equal(expected)
        })
    })

    context('smartContractExecution.getTransactionHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-281: getTransactionHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const expected = txWithExpectedValues.transactionHash
            const txHash = tx.getTransactionHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(txHash).to.equal(expected)
            expect(caver.utils.isValidHashStrict(txHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTION-282: getTransactionHash should throw error when nonce is undefined', () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)
            delete tx._nonce

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-283: getTransactionHash should throw error when gasPrice is undefined', () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)
            delete tx._gasPrice

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-284: getTransactionHash should throw error when chainId is undefined', () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)
            delete tx._chainId

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })
    })

    context('smartContractExecution.getSenderTxHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-285: getSenderTxHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const expected = txWithExpectedValues.senderTxHash
            const senderTxHash = tx.getSenderTxHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(senderTxHash).to.equal(expected)
            expect(caver.utils.isValidHashStrict(senderTxHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTION-286: getSenderTxHash should throw error when nonce is undefined', () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)
            delete tx._nonce

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-287: getSenderTxHash should throw error when gasPrice is undefined', () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)
            delete tx._gasPrice

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-288: getSenderTxHash should throw error when chainId is undefined', () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)
            delete tx._chainId

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })
    })

    context('smartContractExecution.getRLPEncodingForSignature', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-289: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)

            const commonRLPForSigningSpy = sandbox.spy(tx, 'getCommonRLPEncodingForSignature')

            const expected = txWithExpectedValues.rlpEncodingForSigning
            const rlpEncodingForSign = tx.getRLPEncodingForSignature()

            expect(rlpEncodingForSign).to.equal(expected)
            expect(commonRLPForSigningSpy).to.have.been.calledOnce
        })

        it('CAVERJS-UNIT-TRANSACTION-290: getRLPEncodingForSignature should throw error when nonce is undefined', () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)
            delete tx._nonce

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-291: getRLPEncodingForSignature should throw error when gasPrice is undefined', () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)
            delete tx._gasPrice

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-292: getRLPEncodingForSignature should throw error when chainId is undefined', () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)
            delete tx._chainId

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })
    })

    context('smartContractExecution.getCommonRLPEncodingForSignature', () => {
        it('CAVERJS-UNIT-TRANSACTION-293: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)

            const commonRLPForSign = tx.getCommonRLPEncodingForSignature()

            expect(commonRLPForSign).to.equal(txWithExpectedValues.rlpEncodingCommon)
        })
    })

    context('smartContractExecution.fillTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTION-294: fillTransaction should call klay_getGasPrice to fill gasPrice when gasPrice is undefined', async () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)
            delete tx._gasPrice

            await tx.fillTransaction()
            expect(getGasPriceSpy).to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-295: fillTransaction should call klay_getTransactionCount to fill nonce when nonce is undefined', async () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)
            delete tx._nonce

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-296: fillTransaction should call klay_getChainid to fill chainId when chainId is undefined', async () => {
            const tx = new caver.transaction.smartContractExecution(txWithExpectedValues.tx)
            delete tx._chainId

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).to.have.been.calledOnce
        }).timeout(200000)
    })
})
