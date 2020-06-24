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
        gas: '0xf4240',
        gasPrice: '0x19',
        chainId: '0x1',
        nonce: 1234,
        feeRatio: 30,
        signatures: [
            [
                '0x26',
                '0x72efa47960bef40b536c72d7e03ceaf6ca5f6061eb8a3eda3545b1a78fe52ef5',
                '0x62006ddaf874da205f08b3789e2d014ae37794890fc2e575bf75201563a24ba9',
            ],
        ],
        feePayer: '0x5A0043070275d9f6054307Ee7348bD660849D90f',
        feePayerSignatures: [
            [
                '0x26',
                '0x6ba5ef20c3049323fc94defe14ca162e28b86aa64f7cf497ac8a5520e9615614',
                '0x4a0a0fc61c10b416759af0ce4ce5c09ca1060141d56d958af77050c9564df6bf',
            ],
        ],
    }
    txWithExpectedValues.rlpEncodingForSigning = '0xe4a0df3a8204d219830f424094a94f5374fce5edbc8e2a8697c15331677e6ebf0b1e018080'
    txWithExpectedValues.rlpEncodingForFeePayerSigning =
        '0xf839a0df3a8204d219830f424094a94f5374fce5edbc8e2a8697c15331677e6ebf0b1e945a0043070275d9f6054307ee7348bd660849d90f018080'
    txWithExpectedValues.senderTxHash = '0xc0818be4cffbacfe29be1134e0267e10fd1afb6571f4ccc95dcc67a788bab5e7'
    txWithExpectedValues.transactionHash = '0x63604ebf68bfee51b2e3f54ddb2f19f9ea72d32b3fc70877324531ecda25817a'
    txWithExpectedValues.rlpEncoding =
        '0x3af8c18204d219830f424094a94f5374fce5edbc8e2a8697c15331677e6ebf0b1ef845f84326a072efa47960bef40b536c72d7e03ceaf6ca5f6061eb8a3eda3545b1a78fe52ef5a062006ddaf874da205f08b3789e2d014ae37794890fc2e575bf75201563a24ba9945a0043070275d9f6054307ee7348bd660849d90ff845f84326a06ba5ef20c3049323fc94defe14ca162e28b86aa64f7cf497ac8a5520e9615614a04a0a0fc61c10b416759af0ce4ce5c09ca1060141d56d958af77050c9564df6bf'
})

describe('TxTypeFeeDelegatedCancelWithRatio', () => {
    let transactionObj
    let getGasPriceSpy
    let getNonceSpy
    let getChainIdSpy
    beforeEach(() => {
        transactionObj = {
            from: sender.address,
            gas: '0x15f90',
            nonce: '0x6',
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

    context('create feeDelegatedCancelWithRatio instance', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-376: If feeDelegatedCancelWithRatio not define from, return error', () => {
            delete transactionObj.from

            const expectedError = '"from" is missing'
            expect(() => new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-377: If feeDelegatedCancelWithRatio not define gas, return error', () => {
            delete transactionObj.gas

            const expectedError = '"gas" is missing'
            expect(() => new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-378: If feeDelegatedCancelWithRatio not define feeRatio, return error', () => {
            delete transactionObj.feeRatio

            const expectedError = '"feeRatio" is missing'
            expect(() => new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-379: If feeDelegatedCancelWithRatio define from property with invalid address, return error', () => {
            transactionObj.from = 'invalid'

            const expectedError = `Invalid address of from: ${transactionObj.from}`
            expect(() => new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-380: If feeDelegatedCancelWithRatio define feePayer property with invalid address, return error', () => {
            transactionObj.feePayer = 'invalid'

            const expectedError = `Invalid address of fee payer: ${transactionObj.feePayer}`
            expect(() => new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-522: If feeDelegatedCancelWithRatio define feeRatio property with invalid value, return error', () => {
            transactionObj.feeRatio = 'nonHexString'
            let expectedError = `Invalid type fo feeRatio: feeRatio should be number type or hex number string.`
            expect(() => new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = {}
            expect(() => new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = []
            expect(() => new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = 0
            expectedError = `Invalid feeRatio: feeRatio is out of range. [1, 99]`
            expect(() => new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = 100
            expect(() => new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = -1
            expect(() => new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)).to.throw(expectedError)

            transactionObj.feeRatio = 101
            expect(() => new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-381: If feeDelegatedCancelWithRatio define feePayerSignatures property without feePayer, return error', () => {
            transactionObj.feePayerSignatures = [
                [
                    '0x26',
                    '0xf45cf8d7f88c08e6b6ec0b3b562f34ca94283e4689021987abb6b0772ddfd80a',
                    '0x298fe2c5aeabb6a518f4cbb5ff39631a5d88be505d3923374f65fdcf63c2955b',
                ],
            ]

            const expectedError = '"feePayer" is missing: feePayer must be defined with feePayerSignatures.'
            expect(() => new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-382: If feeDelegatedCancelWithRatio define unnecessary property, return error', () => {
            const unnecessaries = [
                propertiesForUnnecessary.to,
                propertiesForUnnecessary.value,
                propertiesForUnnecessary.input,
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

                const expectedError = `"${unnecessaries[i].name}" cannot be used with ${caver.transaction.type.TxTypeFeeDelegatedCancelWithRatio} transaction`
                // eslint-disable-next-line no-loop-func
                expect(() => new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)).to.throw(expectedError)
            }
        })
    })

    context('feeDelegatedCancelWithRatio.getRLPEncoding', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-383: Returns RLP-encoded string', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(txWithExpectedValues.tx)

            expect(tx.getRLPEncoding()).to.equal(txWithExpectedValues.rlpEncoding)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-384: getRLPEncoding should throw error when nonce is undefined', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(txWithExpectedValues.tx)
            delete tx._nonce

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-385: getRLPEncoding should throw error when gasPrice is undefined', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(txWithExpectedValues.tx)
            delete tx._gasPrice

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })
    })

    context('feeDelegatedCancelWithRatio.sign', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTIONFDR-387: input: keyring. should sign transaction.', async () => {
            await tx.sign(sender)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-388: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.key.privateKey)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-389: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-390: input: keyring, index. should sign transaction with specific index.', async () => {
            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.from = roleBasedKeyring.address

            await tx.sign(roleBasedKeyring, 1)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignSpy).to.have.been.calledWith(txHash, '0x7e3', 0, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-391: input: keyring, custom hasher. should use custom hasher.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-392: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFDR-393: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-394: input: rolebased keyring, index out of range. should throw error.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)

            const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
            await expect(tx.sign(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('feeDelegatedCancelWithRatio.signAsFeePayer', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)
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

        it('CAVERJS-UNIT-TRANSACTIONFDR-395: input: keyring. If feePayer is not defined, should be set with keyring address.', async () => {
            tx.feePayer = '0x'
            await tx.signAsFeePayer(sender)

            expect(tx.feePayer.toLowerCase()).to.equal(sender.address.toLowerCase())
            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-396: input: keyring. should sign transaction.', async () => {
            await tx.signAsFeePayer(sender)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-397: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.signAsFeePayer(sender.key.privateKey)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-398: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.signAsFeePayer(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-399: input: keyring, index. should sign transaction with specific index.', async () => {
            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.feePayer = roleBasedKeyring.address

            await tx.signAsFeePayer(roleBasedKeyring, 1)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignSpy).to.have.been.calledWith(txHash, '0x7e3', 2, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-400: input: keyring, custom hasher. should use custom hasher.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFDR-401: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFDR-402: input: keyring. should throw error when feePayer is different.', async () => {
            tx.feePayer = roleBasedKeyring.address

            const expectedError = `The feePayer address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signAsFeePayer(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-403: input: rolebased keyring, index out of range. should throw error.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)

            const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
            await expect(tx.signAsFeePayer(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('feeDelegatedCancelWithRatio.sign with multiple keys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeysSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTIONFDR-404: input: keyring. should sign transaction.', async () => {
            await tx.sign(sender)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-405: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.key.privateKey)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-406: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.sign(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-407: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.sign(sender, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-408: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-409: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.from = roleBasedKeyring.address

            await tx.sign(roleBasedKeyring)

            checkFunctionCall(true)
            checkSignature(tx, { expectedLength: roleBasedKeyring.keys[0].length })
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)
    })

    context('feeDelegatedCancelWithRatio.signAsFeePayer with multiple keys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeysSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTIONFDR-410: input: keyring. If feePayer is not defined, should be set with keyring address.', async () => {
            tx.feePayer = '0x'
            await tx.signAsFeePayer(sender)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-411: input: keyring. should sign transaction.', async () => {
            await tx.signAsFeePayer(sender)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-412: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.signAsFeePayer(sender.key.privateKey)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-413: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            await tx.signAsFeePayer(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-414: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.signAsFeePayer(sender, customHasher)

            checkFunctionCall(true)
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-415: input: keyring. should throw error when feePayer is different.', async () => {
            tx.feePayer = roleBasedKeyring.address

            const expectedError = `The feePayer address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signAsFeePayer(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-416: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'sign')

            tx.feePayer = roleBasedKeyring.address

            await tx.signAsFeePayer(roleBasedKeyring)

            checkFunctionCall(true)
            checkFeePayerSignature(tx, { expectedLength: roleBasedKeyring.keys[2].length })
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)
    })

    context('feeDelegatedCancelWithRatio.appendSignatures', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-417: If signatures is empty, appendSignatures append signatures in transaction', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            tx.appendSignatures(sig)
            checkSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-418: If signatures is empty, appendSignatures append signatures with two-dimensional signature array', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTIONFDR-419: If signatures is not empty, appendSignatures should append signatures', () => {
            transactionObj.signatures = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)

            const sig = [
                '0x0fea',
                '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
            ]

            tx.appendSignatures(sig)
            checkSignature(tx, { expectedLength: 2 })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-420: appendSignatures should append multiple signatures', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)

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

    context('feeDelegatedCancelWithRatio.appendFeePayerSignatures', () => {
        beforeEach(() => {
            transactionObj.feePayer = '0x90b3e9a3770481345a7f17f22f16d020bccfd33e'
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-421: If feePayerSignatures is empty, appendFeePayerSignatures append feePayerSignatures in transaction', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            tx.appendFeePayerSignatures(sig)
            checkFeePayerSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-422: If feePayerSignatures is empty, appendFeePayerSignatures append feePayerSignatures with two-dimensional signature array', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTIONFDR-423: If feePayerSignatures is not empty, appendFeePayerSignatures should append feePayerSignatures', () => {
            transactionObj.feePayerSignatures = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)

            const sig = [
                '0x0fea',
                '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
            ]

            tx.appendFeePayerSignatures(sig)
            checkFeePayerSignature(tx, { expectedLength: 2 })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-424: appendFeePayerSignatures should append multiple feePayerSignatures', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)

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

    context('feeDelegatedCancelWithRatio.combineSignedRawTransactions', () => {
        beforeEach(() => {
            transactionObj = {
                from: '0x158a98f884e6f5a2731049569cb895cc1c75b47b',
                gas: '0x249f0',
                nonce: '0x1',
                gasPrice: '0x5d21dba00',
                feeRatio: 30,
                chainId: '0x7e3',
            }
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-425: combineSignedRawTransactions combines single signature and sets signatures in transaction', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x3af870018505d21dba00830249f094158a98f884e6f5a2731049569cb895cc1c75b47b1ef847f845820fe9a0879126759f424c790069e47d443c44674f4c2154d1e6f4f02134dbc56a6629f1a04b714b50c900b0b099b3e3ba15743654e8c576aa4fe504da38015f4c6175759080c4c3018080'
            const combined = tx.combineSignedRawTransactions([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0x879126759f424c790069e47d443c44674f4c2154d1e6f4f02134dbc56a6629f1',
                    '0x4b714b50c900b0b099b3e3ba15743654e8c576aa4fe504da38015f4c61757590',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-426: combineSignedRawTransactions combines multiple signatures and sets signatures in transaction', () => {
            transactionObj.signatures = [
                [
                    '0x0fe9',
                    '0x879126759f424c790069e47d443c44674f4c2154d1e6f4f02134dbc56a6629f1',
                    '0x4b714b50c900b0b099b3e3ba15743654e8c576aa4fe504da38015f4c61757590',
                ],
            ]
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)

            const rlpEncodedStrings = [
                '0x3af870018505d21dba00830249f094158a98f884e6f5a2731049569cb895cc1c75b47b1ef847f845820feaa00a5a7ad842672b62c26be2fae2644e9219bdf4baa2f7ea7745c74bab89fa1ff5a054ea57f591aea4d240da909e338b8df7c13a640d731eaaf785ca647c259066c580c4c3018080',
                '0x3af870018505d21dba00830249f094158a98f884e6f5a2731049569cb895cc1c75b47b1ef847f845820fe9a0b871f4760b53fcba095b10979ae8b950e2692c1a526cd6f13c91401dde45d228a01aad1aa4f8efdfb9ab22cee80e0071ee3c6f5e8ad9b54ea79287b9f5631f30f180c4c3018080',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignedRawTransactions(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x3af8fe018505d21dba00830249f094158a98f884e6f5a2731049569cb895cc1c75b47b1ef8d5f845820fe9a0879126759f424c790069e47d443c44674f4c2154d1e6f4f02134dbc56a6629f1a04b714b50c900b0b099b3e3ba15743654e8c576aa4fe504da38015f4c61757590f845820feaa00a5a7ad842672b62c26be2fae2644e9219bdf4baa2f7ea7745c74bab89fa1ff5a054ea57f591aea4d240da909e338b8df7c13a640d731eaaf785ca647c259066c5f845820fe9a0b871f4760b53fcba095b10979ae8b950e2692c1a526cd6f13c91401dde45d228a01aad1aa4f8efdfb9ab22cee80e0071ee3c6f5e8ad9b54ea79287b9f5631f30f180c4c3018080'

            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0x879126759f424c790069e47d443c44674f4c2154d1e6f4f02134dbc56a6629f1',
                    '0x4b714b50c900b0b099b3e3ba15743654e8c576aa4fe504da38015f4c61757590',
                ],
                [
                    '0x0fea',
                    '0x0a5a7ad842672b62c26be2fae2644e9219bdf4baa2f7ea7745c74bab89fa1ff5',
                    '0x54ea57f591aea4d240da909e338b8df7c13a640d731eaaf785ca647c259066c5',
                ],
                [
                    '0x0fe9',
                    '0xb871f4760b53fcba095b10979ae8b950e2692c1a526cd6f13c91401dde45d228',
                    '0x1aad1aa4f8efdfb9ab22cee80e0071ee3c6f5e8ad9b54ea79287b9f5631f30f1',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-427: combineSignedRawTransactions combines single feePayerSignature and sets feePayerSignatures in transaction', () => {
            transactionObj.feePayer = '0xc01f48a99539a743256dc02dcfa9d0f5f075a5e4'
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x3af884018505d21dba00830249f094158a98f884e6f5a2731049569cb895cc1c75b47b1ec4c301808094c01f48a99539a743256dc02dcfa9d0f5f075a5e4f847f845820feaa061eba44b0175713e33867e2dde40aa8f73c67ecd50cf682dd879653a3e773727a055819bfb65b0a74de90e345fb6a5055872a370bf3cbead2d7bd5e43837bf746d'
            const combined = tx.combineSignedRawTransactions([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fea',
                    '0x61eba44b0175713e33867e2dde40aa8f73c67ecd50cf682dd879653a3e773727',
                    '0x55819bfb65b0a74de90e345fb6a5055872a370bf3cbead2d7bd5e43837bf746d',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkFeePayerSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-428: combineSignedRawTransactions combines multiple feePayerSignatures and sets feePayerSignatures in transaction', () => {
            transactionObj.feePayer = '0xc01f48a99539a743256dc02dcfa9d0f5f075a5e4'
            transactionObj.feePayerSignatures = [
                [
                    '0x0fea',
                    '0x61eba44b0175713e33867e2dde40aa8f73c67ecd50cf682dd879653a3e773727',
                    '0x55819bfb65b0a74de90e345fb6a5055872a370bf3cbead2d7bd5e43837bf746d',
                ],
            ]
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)

            const rlpEncodedStrings = [
                '0x3af884018505d21dba00830249f094158a98f884e6f5a2731049569cb895cc1c75b47b1ec4c301808094c01f48a99539a743256dc02dcfa9d0f5f075a5e4f847f845820fe9a0615be8124c6af821b6aec61b2021ebf7d677a38188c74d6324f21cd8ed3243dea0235142496683c0ff1352fe7f20bc83af7229b30be73ce895f040395ef5dfca66',
                '0x3af884018505d21dba00830249f094158a98f884e6f5a2731049569cb895cc1c75b47b1ec4c301808094c01f48a99539a743256dc02dcfa9d0f5f075a5e4f847f845820feaa0499e8cb92c800fc1437d64697c8c6c96a8455f30c654656a7ebf1b69f7aa8679a07f56c052fd2a8701705846d7313872afe85195087c06da4e3ed6c546eeb30259',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignedRawTransactions(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x3af90112018505d21dba00830249f094158a98f884e6f5a2731049569cb895cc1c75b47b1ec4c301808094c01f48a99539a743256dc02dcfa9d0f5f075a5e4f8d5f845820feaa061eba44b0175713e33867e2dde40aa8f73c67ecd50cf682dd879653a3e773727a055819bfb65b0a74de90e345fb6a5055872a370bf3cbead2d7bd5e43837bf746df845820fe9a0615be8124c6af821b6aec61b2021ebf7d677a38188c74d6324f21cd8ed3243dea0235142496683c0ff1352fe7f20bc83af7229b30be73ce895f040395ef5dfca66f845820feaa0499e8cb92c800fc1437d64697c8c6c96a8455f30c654656a7ebf1b69f7aa8679a07f56c052fd2a8701705846d7313872afe85195087c06da4e3ed6c546eeb30259'

            const expectedFeePayerSignatures = [
                [
                    '0x0fea',
                    '0x61eba44b0175713e33867e2dde40aa8f73c67ecd50cf682dd879653a3e773727',
                    '0x55819bfb65b0a74de90e345fb6a5055872a370bf3cbead2d7bd5e43837bf746d',
                ],
                [
                    '0x0fe9',
                    '0x615be8124c6af821b6aec61b2021ebf7d677a38188c74d6324f21cd8ed3243de',
                    '0x235142496683c0ff1352fe7f20bc83af7229b30be73ce895f040395ef5dfca66',
                ],
                [
                    '0x0fea',
                    '0x499e8cb92c800fc1437d64697c8c6c96a8455f30c654656a7ebf1b69f7aa8679',
                    '0x7f56c052fd2a8701705846d7313872afe85195087c06da4e3ed6c546eeb30259',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkFeePayerSignature(tx, { expectedFeePayerSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-429: combineSignedRawTransactions combines multiple signatures and feePayerSignatures', () => {
            let tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)

            // RLP encoding with only signatures
            const rlpEncodedStrings = [
                '0x3af8fe018505d21dba00830249f094158a98f884e6f5a2731049569cb895cc1c75b47b1ef8d5f845820fe9a0879126759f424c790069e47d443c44674f4c2154d1e6f4f02134dbc56a6629f1a04b714b50c900b0b099b3e3ba15743654e8c576aa4fe504da38015f4c61757590f845820feaa00a5a7ad842672b62c26be2fae2644e9219bdf4baa2f7ea7745c74bab89fa1ff5a054ea57f591aea4d240da909e338b8df7c13a640d731eaaf785ca647c259066c5f845820fe9a0b871f4760b53fcba095b10979ae8b950e2692c1a526cd6f13c91401dde45d228a01aad1aa4f8efdfb9ab22cee80e0071ee3c6f5e8ad9b54ea79287b9f5631f30f180c4c3018080',
            ]
            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0x879126759f424c790069e47d443c44674f4c2154d1e6f4f02134dbc56a6629f1',
                    '0x4b714b50c900b0b099b3e3ba15743654e8c576aa4fe504da38015f4c61757590',
                ],
                [
                    '0x0fea',
                    '0x0a5a7ad842672b62c26be2fae2644e9219bdf4baa2f7ea7745c74bab89fa1ff5',
                    '0x54ea57f591aea4d240da909e338b8df7c13a640d731eaaf785ca647c259066c5',
                ],
                [
                    '0x0fe9',
                    '0xb871f4760b53fcba095b10979ae8b950e2692c1a526cd6f13c91401dde45d228',
                    '0x1aad1aa4f8efdfb9ab22cee80e0071ee3c6f5e8ad9b54ea79287b9f5631f30f1',
                ],
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            let combined = tx.combineSignedRawTransactions(rlpEncodedStrings)
            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)

            const rlpEncodedStringsWithFeePayerSignatures = [
                '0x3af90112018505d21dba00830249f094158a98f884e6f5a2731049569cb895cc1c75b47b1ec4c301808094c01f48a99539a743256dc02dcfa9d0f5f075a5e4f8d5f845820feaa061eba44b0175713e33867e2dde40aa8f73c67ecd50cf682dd879653a3e773727a055819bfb65b0a74de90e345fb6a5055872a370bf3cbead2d7bd5e43837bf746df845820fe9a0615be8124c6af821b6aec61b2021ebf7d677a38188c74d6324f21cd8ed3243dea0235142496683c0ff1352fe7f20bc83af7229b30be73ce895f040395ef5dfca66f845820feaa0499e8cb92c800fc1437d64697c8c6c96a8455f30c654656a7ebf1b69f7aa8679a07f56c052fd2a8701705846d7313872afe85195087c06da4e3ed6c546eeb30259',
            ]
            const expectedFeePayerSignatures = [
                [
                    '0x0fea',
                    '0x61eba44b0175713e33867e2dde40aa8f73c67ecd50cf682dd879653a3e773727',
                    '0x55819bfb65b0a74de90e345fb6a5055872a370bf3cbead2d7bd5e43837bf746d',
                ],
                [
                    '0x0fe9',
                    '0x615be8124c6af821b6aec61b2021ebf7d677a38188c74d6324f21cd8ed3243de',
                    '0x235142496683c0ff1352fe7f20bc83af7229b30be73ce895f040395ef5dfca66',
                ],
                [
                    '0x0fea',
                    '0x499e8cb92c800fc1437d64697c8c6c96a8455f30c654656a7ebf1b69f7aa8679',
                    '0x7f56c052fd2a8701705846d7313872afe85195087c06da4e3ed6c546eeb30259',
                ],
            ]

            const appendFeePayerSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            combined = tx.combineSignedRawTransactions(rlpEncodedStringsWithFeePayerSignatures)
            expect(appendFeePayerSignaturesSpy).to.have.been.callCount(rlpEncodedStringsWithFeePayerSignatures.length)

            // combine multiple signatures and feePayerSignatures
            tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)
            const combinedWithMultiple = tx.combineSignedRawTransactions([combined])

            expect(combined).to.equal(combinedWithMultiple)
            checkSignature(tx, { expectedSignatures })
            checkFeePayerSignature(tx, { expectedFeePayerSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-430: If decode transaction has different values, combineSignedRawTransactions should throw error', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(transactionObj)
            tx.nonce = 1234

            const rlpEncoded =
                '0x3af870018505d21dba00830249f094158a98f884e6f5a2731049569cb895cc1c75b47b1ef847f845820fe9a0879126759f424c790069e47d443c44674f4c2154d1e6f4f02134dbc56a6629f1a04b714b50c900b0b099b3e3ba15743654e8c576aa4fe504da38015f4c6175759080c4c3018080'
            const expectedError = `Transactions containing different information cannot be combined.`

            expect(() => tx.combineSignedRawTransactions([rlpEncoded])).to.throw(expectedError)
        })
    })

    context('feeDelegatedCancelWithRatio.getRawTransaction', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-431: getRawTransaction should call getRLPEncoding function', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rawTransaction = tx.getRawTransaction()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(rawTransaction).to.equal(txWithExpectedValues.rlpEncoding)
        })
    })

    context('feeDelegatedCancelWithRatio.getTransactionHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-432: getTransactionHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const txHash = tx.getTransactionHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(txHash).to.equal(txWithExpectedValues.transactionHash)
            expect(caver.utils.isValidHashStrict(txHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-433: getTransactionHash should throw error when nonce is undefined', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(txWithExpectedValues.tx)
            delete tx._nonce

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-434: getTransactionHash should throw error when gasPrice is undefined', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(txWithExpectedValues.tx)
            delete tx._gasPrice

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })
    })

    context('feeDelegatedCancelWithRatio.getSenderTxHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-436: getSenderTxHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const senderTxHash = tx.getSenderTxHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(senderTxHash).to.equal(txWithExpectedValues.senderTxHash)
            expect(caver.utils.isValidHashStrict(senderTxHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-437: getSenderTxHash should throw error when nonce is undefined', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(txWithExpectedValues.tx)
            delete tx._nonce

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-438: getSenderTxHash should throw error when gasPrice is undefined', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(txWithExpectedValues.tx)
            delete tx._gasPrice

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })
    })

    context('feeDelegatedCancelWithRatio.getRLPEncodingForSignature', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-440: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(txWithExpectedValues.tx)

            const commonRLPForSigningSpy = sandbox.spy(tx, 'getCommonRLPEncodingForSignature')

            const rlpEncodingForSign = tx.getRLPEncodingForSignature()

            expect(rlpEncodingForSign).to.equal(txWithExpectedValues.rlpEncodingForSigning)
            expect(commonRLPForSigningSpy).to.have.been.calledOnce
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-441: getRLPEncodingForSignature should throw error when nonce is undefined', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(txWithExpectedValues.tx)
            delete tx._nonce

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-442: getRLPEncodingForSignature should throw error when gasPrice is undefined', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(txWithExpectedValues.tx)
            delete tx._gasPrice

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-443: getRLPEncodingForSignature should throw error when chainId is undefined', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(txWithExpectedValues.tx)
            delete tx._chainId

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })
    })

    context('feeDelegatedCancelWithRatio.getCommonRLPEncodingForSignature', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-444: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(txWithExpectedValues.tx)

            const commonRLPForSign = tx.getCommonRLPEncodingForSignature()
            const decoded = RLP.decode(txWithExpectedValues.rlpEncodingForSigning)

            expect(commonRLPForSign).to.equal(decoded[0])
        })
    })

    context('feeDelegatedCancelWithRatio.fillTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-445: fillTransaction should call klay_getGasPrice to fill gasPrice when gasPrice is undefined', async () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(txWithExpectedValues.tx)
            delete tx._gasPrice

            await tx.fillTransaction()
            expect(getGasPriceSpy).to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-446: fillTransaction should call klay_getTransactionCount to fill nonce when nonce is undefined', async () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(txWithExpectedValues.tx)
            delete tx._nonce

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-447: fillTransaction should call klay_getChainid to fill chainId when chainId is undefined', async () => {
            const tx = new caver.transaction.feeDelegatedCancelWithRatio(txWithExpectedValues.tx)
            delete tx._chainId

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).to.have.been.calledOnce
        }).timeout(200000)
    })
})
