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
const Keyring = require('../../../packages/caver-wallet/src/keyring/keyring')
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
        input: '0x68656c6c6f',
        gas: '0xf4240',
        gasPrice: '0x19',
        chainId: '0x1',
        nonce: 1234,
        signatures: [
            [
                '0x26',
                '0x64e213aef0167fbd853f8f9989ef5d8b912a77457395ccf13d7f37009edd5c5b',
                '0x5d0c2e55e4d8734fe2516ed56ac628b74c0eb02aa3b6eda51e1e25a1396093e1',
            ],
        ],
        feePayer: '0x5A0043070275d9f6054307Ee7348bD660849D90f',
        feePayerSignatures: [
            [
                '0x26',
                '0x87390ac14d3c34440b6ddb7b190d3ebde1a07d9a556e5a82ce7e501f24a060f9',
                '0x37badbcb12cda1ed67b12b1831683a08a3adadee2ea760a07a46bdbb856fea44',
            ],
        ],
    }
    txWithExpectedValues.rlpEncodingForSigning =
        '0xf841b83cf83a118204d219830f4240947b65b75d204abed71587c9e519a89277766ee1d00a94a94f5374fce5edbc8e2a8697c15331677e6ebf0b8568656c6c6f018080'
    txWithExpectedValues.rlpEncodingForFeePayerSigning =
        '0xf856b83cf83a118204d219830f4240947b65b75d204abed71587c9e519a89277766ee1d00a94a94f5374fce5edbc8e2a8697c15331677e6ebf0b8568656c6c6f945a0043070275d9f6054307ee7348bd660849d90f018080'
    txWithExpectedValues.senderTxHash = '0xfffaa2b38d4e684ea70a89c78fc7b2659000d130c76ad721d68175cbfc77c550'
    txWithExpectedValues.transactionHash = '0x8f68882f6192a53ba470aeca1e83ed9b9e519906a91256724b284dee778b21c9'
    txWithExpectedValues.rlpEncoding =
        '0x11f8dc8204d219830f4240947b65b75d204abed71587c9e519a89277766ee1d00a94a94f5374fce5edbc8e2a8697c15331677e6ebf0b8568656c6c6ff845f84326a064e213aef0167fbd853f8f9989ef5d8b912a77457395ccf13d7f37009edd5c5ba05d0c2e55e4d8734fe2516ed56ac628b74c0eb02aa3b6eda51e1e25a1396093e1945a0043070275d9f6054307ee7348bd660849d90ff845f84326a087390ac14d3c34440b6ddb7b190d3ebde1a07d9a556e5a82ce7e501f24a060f9a037badbcb12cda1ed67b12b1831683a08a3adadee2ea760a07a46bdbb856fea44'
})

describe('TxTypeFeeDelegatedValueTransferMemo', () => {
    let transactionObj
    let getGasPriceSpy
    let getNonceSpy
    let getChainIdSpy
    beforeEach(() => {
        transactionObj = {
            from: sender.address,
            to: testKeyring.address,
            value: 1,
            input: '0x68656c6c6f',
            gas: '0x3b9ac9ff',
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

    context('create feeDelegatedValueTransferMemo instance', () => {
        it('CAVERJS-UNIT-TRANSACTION-464: If feeDelegatedValueTransferMemo not define from, return error', () => {
            delete transactionObj.from

            const expectedError = '"from" is missing'
            expect(() => new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-465: If feeDelegatedValueTransferMemo not define to, return error', () => {
            delete transactionObj.to

            const expectedError = '"to" is missing'
            expect(() => new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-466: If feeDelegatedValueTransferMemo not define value, return error', () => {
            delete transactionObj.value

            const expectedError = '"value" is missing'
            expect(() => new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-467: If feeDelegatedValueTransferMemo not define gas, return error', () => {
            delete transactionObj.gas

            const expectedError = '"gas" is missing'
            expect(() => new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-468: If feeDelegatedValueTransferMemo not define input, return error', () => {
            delete transactionObj.input

            const expectedError = '"input" is missing'
            expect(() => new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-469: If feeDelegatedValueTransferMemo define from property with invalid address, return error', () => {
            transactionObj.from = 'invalid'

            const expectedError = `Invalid address of from: ${transactionObj.from}`
            expect(() => new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-470: If feeDelegatedValueTransferMemo define feePayer property with invalid address, return error', () => {
            transactionObj.feePayer = 'invalid'

            const expectedError = `Invalid address of fee payer: ${transactionObj.feePayer}`
            expect(() => new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-471: If feeDelegatedValueTransferMemo define to property with invalid address, return error', () => {
            transactionObj.to = 'invalid address'

            const expectedError = `Invalid address of to: ${transactionObj.to}`
            expect(() => new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-472: If feeDelegatedValueTransferMemo define feePayerSignatures property without feePayer, return error', () => {
            transactionObj.feePayerSignatures = [
                [
                    '0x26',
                    '0xf45cf8d7f88c08e6b6ec0b3b562f34ca94283e4689021987abb6b0772ddfd80a',
                    '0x298fe2c5aeabb6a518f4cbb5ff39631a5d88be505d3923374f65fdcf63c2955b',
                ],
            ]

            const expectedError = '"feePayer" is missing: feePayer must be defined with feePayerSignatures.'
            expect(() => new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-473: If feeDelegatedValueTransferMemo define unnecessary property, return error', () => {
            const unnecessaries = [
                propertiesForUnnecessary.codeFormat,
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
                propertiesForUnnecessary.humanReadable,
            ]

            for (let i = 0; i < unnecessaries.length; i++) {
                if (i > 0) delete transactionObj[unnecessaries[i - 1].name]
                transactionObj[unnecessaries[i].name] = unnecessaries[i].value

                const expectedError = `"${unnecessaries[i].name}" cannot be used with ${caver.transaction.type.TxTypeFeeDelegatedValueTransferMemo} transaction`
                // eslint-disable-next-line no-loop-func
                expect(() => new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)).to.throw(expectedError)
            }
        })
    })

    context('feeDelegatedValueTransferMemo.getRLPEncoding', () => {
        it('CAVERJS-UNIT-TRANSACTION-474: Returns RLP-encoded string', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(txWithExpectedValues.tx)

            expect(tx.getRLPEncoding()).to.equal(txWithExpectedValues.rlpEncoding)
        })

        it('CAVERJS-UNIT-TRANSACTION-475: getRLPEncoding should throw error when nonce is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.gasPrice = '0x5d21dba00'
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-476: getRLPEncoding should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-477: getRLPEncoding should throw error when chainId is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })
    })

    context('feeDelegatedValueTransferMemo.signWithKey', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeySpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTION-478: input: keyring. should sign transaction.', async () => {
            await tx.signWithKey(sender)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeySpy).to.have.been.calledWith(txHash, '0x7e3', 0, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-479: input: private key string. should sign transaction.', async () => {
            const signWithKeyProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKey')
            await tx.signWithKey(sender.keys[0][0].privateKey)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeyProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-480: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signWithKeyProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKey')
            await tx.signWithKey(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeyProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-481: input: keyring, index. should sign transaction with specific index.', async () => {
            const roleBasedSignWithKeySpy = sandbox.spy(roleBasedKeyring, 'signWithKey')

            tx.from = roleBasedKeyring.address

            await tx.signWithKey(roleBasedKeyring, 1)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeySpy).to.have.been.calledWith(txHash, '0x7e3', 0, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-482: input: keyring, custom hasher. should throw error.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            const expectedError = `In order to pass a custom hasher, use the third parameter.`
            await expect(tx.signWithKey(sender, customHasher)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-483: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTION-484: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signWithKey(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-485: input: rolebased keyring, index out of range. should throw error.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
            await expect(tx.signWithKey(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('feeDelegatedValueTransferMemo.signFeePayerWithKey', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeySpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)
            tx.feePayer = sender.address

            fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            createFromPrivateKeySpy = sandbox.spy(Keyring, 'createFromPrivateKey')
            senderSignWithKeySpy = sandbox.spy(sender, 'signWithKey')
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

        it('CAVERJS-UNIT-TRANSACTION-486: input: keyring. If feePayer is not defined, should be set with keyring address.', async () => {
            tx.feePayer = '0x'
            await tx.signFeePayerWithKey(sender)

            expect(tx.feePayer.toLowerCase()).to.equal(sender.address.toLowerCase())
            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeySpy).to.have.been.calledWith(txHash, '0x7e3', 2, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-487: input: keyring. should sign transaction.', async () => {
            await tx.signFeePayerWithKey(sender)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeySpy).to.have.been.calledWith(txHash, '0x7e3', 2, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-488: input: private key string. should sign transaction.', async () => {
            const signWithKeyProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKey')
            await tx.signFeePayerWithKey(sender.keys[0][0].privateKey)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeyProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-489: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signWithKeyProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKey')
            await tx.signFeePayerWithKey(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeyProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-490: input: keyring, index. should sign transaction with specific index.', async () => {
            const roleBasedSignWithKeySpy = sandbox.spy(roleBasedKeyring, 'signWithKey')

            tx.feePayer = roleBasedKeyring.address

            await tx.signFeePayerWithKey(roleBasedKeyring, 1)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeySpy).to.have.been.calledWith(txHash, '0x7e3', 2, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-491: input: keyring, custom hasher. should throw error.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            const expectedError = `In order to pass a custom hasher, use the third parameter.`
            await expect(tx.signFeePayerWithKey(sender, customHasher)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-492: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            const roleBasedSignWithKeySpy = sandbox.spy(roleBasedKeyring, 'signWithKey')

            tx.feePayer = roleBasedKeyring.address

            await tx.signFeePayerWithKey(roleBasedKeyring, 1, customHasher)

            checkFunctionCall(true)
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeySpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 2, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-493: input: keyring. should throw error when feePayer is different.', async () => {
            tx.feePayer = roleBasedKeyring.address

            const expectedError = `The feePayer address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signFeePayerWithKey(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-494: input: rolebased keyring, index out of range. should throw error.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
            await expect(tx.signFeePayerWithKey(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('feeDelegatedValueTransferMemo.signWithKeys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeysSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTION-495: input: keyring. should sign transaction.', async () => {
            await tx.signWithKeys(sender)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-496: input: private key string. should sign transaction.', async () => {
            const signWithKeysProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKeys')
            await tx.signWithKeys(sender.keys[0][0].privateKey)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeysProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-497: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signWithKeysProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKeys')
            await tx.signWithKeys(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeysProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-498: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.signWithKeys(sender, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-499: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signWithKeys(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-500: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'signWithKeys')

            tx.from = roleBasedKeyring.address

            await tx.signWithKeys(roleBasedKeyring)

            checkFunctionCall(true)
            checkSignature(tx, { expectedLength: roleBasedKeyring.keys[0].length })
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)
    })

    context('feeDelegatedValueTransferMemo.signFeePayerWithKeys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeysSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            createFromPrivateKeySpy = sandbox.spy(Keyring, 'createFromPrivateKey')
            senderSignWithKeysSpy = sandbox.spy(sender, 'signWithKeys')
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

        it('CAVERJS-UNIT-TRANSACTION-501: input: keyring. If feePayer is not defined, should be set with keyring address.', async () => {
            tx.feePayer = '0x'
            await tx.signFeePayerWithKeys(sender)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-502: input: keyring. should sign transaction.', async () => {
            await tx.signFeePayerWithKeys(sender)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-503: input: private key string. should sign transaction.', async () => {
            const signWithKeysProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKeys')
            await tx.signFeePayerWithKeys(sender.keys[0][0].privateKey)

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeysProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-504: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signWithKeysProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKeys')
            await tx.signFeePayerWithKeys(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeysProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-505: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.signFeePayerWithKeys(sender, customHasher)

            checkFunctionCall(true)
            checkFeePayerSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 2)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-506: input: keyring. should throw error when feePayer is different.', async () => {
            tx.feePayer = roleBasedKeyring.address

            const expectedError = `The feePayer address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signFeePayerWithKeys(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-507: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'signWithKeys')

            tx.feePayer = roleBasedKeyring.address

            await tx.signFeePayerWithKeys(roleBasedKeyring)

            checkFunctionCall(true)
            checkFeePayerSignature(tx, { expectedLength: roleBasedKeyring.keys[2].length })
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
        }).timeout(200000)
    })

    context('feeDelegatedValueTransferMemo.appendSignatures', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-508: If signatures is empty, appendSignatures append signatures in transaction', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            tx.appendSignatures(sig)
            checkSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTION-509: If signatures is empty, appendSignatures append signatures with two-dimensional signature array', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTION-510: If signatures is not empty, appendSignatures should append signatures', () => {
            transactionObj.signatures = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const sig = [
                '0x0fea',
                '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
            ]

            tx.appendSignatures(sig)
            checkSignature(tx, { expectedLength: 2 })
        })

        it('CAVERJS-UNIT-TRANSACTION-511: appendSignatures should append multiple signatures', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

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

    context('feeDelegatedValueTransferMemo.appendFeePayerSignatures', () => {
        beforeEach(() => {
            transactionObj.feePayer = '0x90b3e9a3770481345a7f17f22f16d020bccfd33e'
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-512: If feePayerSignatures is empty, appendFeePayerSignatures append feePayerSignatures in transaction', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            tx.appendFeePayerSignatures(sig)
            checkFeePayerSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTION-513: If feePayerSignatures is empty, appendFeePayerSignatures append feePayerSignatures with two-dimensional signature array', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTION-514: If feePayerSignatures is not empty, appendFeePayerSignatures should append feePayerSignatures', () => {
            transactionObj.feePayerSignatures = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const sig = [
                '0x0fea',
                '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
            ]

            tx.appendFeePayerSignatures(sig)
            checkFeePayerSignature(tx, { expectedLength: 2 })
        })

        it('CAVERJS-UNIT-TRANSACTION-515: appendFeePayerSignatures should append multiple feePayerSignatures', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

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

    context('feeDelegatedValueTransferMemo.combineSignatures', () => {
        beforeEach(() => {
            transactionObj = {
                from: '0x1bc5339c6c55380d0da8aaa28e135164ecb86262',
                to: '0x7b65b75d204abed71587c9e519a89277766ee1d0',
                value: '0xa',
                input: '0x68656c6c6f',
                gas: '0xf4240',
                nonce: '0x1',
                gasPrice: '0x5d21dba00',
                chainId: '0x7e3',
            }
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-516: combineSignatures combines single signature and sets signatures in transaction', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x11f88b018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a941bc5339c6c55380d0da8aaa28e135164ecb862628568656c6c6ff847f845820feaa060a20eed201a2b28bc452b65c699083a6399aaeff2a7572c5c8cf54056254aeaa001586e5321f51ed56da5241d6cc8365bdcade89c4b08d2615bc21231f5e2c26e80c4c3018080'
            const combined = tx.combineSignatures([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fea',
                    '0x60a20eed201a2b28bc452b65c699083a6399aaeff2a7572c5c8cf54056254aea',
                    '0x01586e5321f51ed56da5241d6cc8365bdcade89c4b08d2615bc21231f5e2c26e',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTION-517: combineSignatures combines multiple signatures and sets signatures in transaction', () => {
            transactionObj.signatures = [
                [
                    '0x0fea',
                    '0x60a20eed201a2b28bc452b65c699083a6399aaeff2a7572c5c8cf54056254aea',
                    '0x01586e5321f51ed56da5241d6cc8365bdcade89c4b08d2615bc21231f5e2c26e',
                ],
            ]
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const rlpEncodedStrings = [
                '0x11f88b018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a941bc5339c6c55380d0da8aaa28e135164ecb862628568656c6c6ff847f845820fe9a0b8f3ba052cd0ef34b683a3e8ad6f68f71a82d9416bf9732def4b66802967a055a07c241fa9b7d32b72fc8310e886c5b70de262457fd07711cbb2e17217d8c39b2680c4c3018080',
                '0x11f88b018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a941bc5339c6c55380d0da8aaa28e135164ecb862628568656c6c6ff847f845820feaa06c301c61b6b8746f63baf57c477bd269ecdeb07d6200a719988bfcd0b7767bc1a016da23b63b4e54ffa16ce8668987e48a76b8e64ba7863359462efd1e8d9838a680c4c3018080',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignatures(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x11f90119018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a941bc5339c6c55380d0da8aaa28e135164ecb862628568656c6c6ff8d5f845820feaa060a20eed201a2b28bc452b65c699083a6399aaeff2a7572c5c8cf54056254aeaa001586e5321f51ed56da5241d6cc8365bdcade89c4b08d2615bc21231f5e2c26ef845820fe9a0b8f3ba052cd0ef34b683a3e8ad6f68f71a82d9416bf9732def4b66802967a055a07c241fa9b7d32b72fc8310e886c5b70de262457fd07711cbb2e17217d8c39b26f845820feaa06c301c61b6b8746f63baf57c477bd269ecdeb07d6200a719988bfcd0b7767bc1a016da23b63b4e54ffa16ce8668987e48a76b8e64ba7863359462efd1e8d9838a680c4c3018080'

            const expectedSignatures = [
                [
                    '0x0fea',
                    '0x60a20eed201a2b28bc452b65c699083a6399aaeff2a7572c5c8cf54056254aea',
                    '0x01586e5321f51ed56da5241d6cc8365bdcade89c4b08d2615bc21231f5e2c26e',
                ],
                [
                    '0x0fe9',
                    '0xb8f3ba052cd0ef34b683a3e8ad6f68f71a82d9416bf9732def4b66802967a055',
                    '0x7c241fa9b7d32b72fc8310e886c5b70de262457fd07711cbb2e17217d8c39b26',
                ],
                [
                    '0x0fea',
                    '0x6c301c61b6b8746f63baf57c477bd269ecdeb07d6200a719988bfcd0b7767bc1',
                    '0x16da23b63b4e54ffa16ce8668987e48a76b8e64ba7863359462efd1e8d9838a6',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTION-518: combineSignatures combines single feePayerSignature and sets feePayerSignatures in transaction', () => {
            transactionObj.feePayer = '0x8d2f6e4986bc55e2d50611149e5725999a763d7c'
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x11f89f018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a941bc5339c6c55380d0da8aaa28e135164ecb862628568656c6c6fc4c3018080948d2f6e4986bc55e2d50611149e5725999a763d7cf847f845820feaa0779d20a7958d3131e5ef6a423abb2337e8f120bd0798c47227aee51c70d23c06a07d3c36d5a33cb18e8fec7d1e1f2cfd9a0ec932adee9ad9a090fcd28fafd44392'
            const combined = tx.combineSignatures([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fea',
                    '0x779d20a7958d3131e5ef6a423abb2337e8f120bd0798c47227aee51c70d23c06',
                    '0x7d3c36d5a33cb18e8fec7d1e1f2cfd9a0ec932adee9ad9a090fcd28fafd44392',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkFeePayerSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTION-519: combineSignatures combines multiple feePayerSignatures and sets feePayerSignatures in transaction', () => {
            transactionObj.feePayer = '0x8d2f6e4986bc55e2d50611149e5725999a763d7c'
            transactionObj.feePayerSignatures = [
                [
                    '0x0fea',
                    '0x779d20a7958d3131e5ef6a423abb2337e8f120bd0798c47227aee51c70d23c06',
                    '0x7d3c36d5a33cb18e8fec7d1e1f2cfd9a0ec932adee9ad9a090fcd28fafd44392',
                ],
            ]
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const rlpEncodedStrings = [
                '0x11f89f018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a941bc5339c6c55380d0da8aaa28e135164ecb862628568656c6c6fc4c3018080948d2f6e4986bc55e2d50611149e5725999a763d7cf847f845820fe9a0de14998f4aba6474b55b84e9a236daf159252b460915cea204a4361cf99c9dc9a0743a40d63646defba13c70581d85000836155dddb30bc8024c62dad76981abec',
                '0x11f89f018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a941bc5339c6c55380d0da8aaa28e135164ecb862628568656c6c6fc4c3018080948d2f6e4986bc55e2d50611149e5725999a763d7cf847f845820fe9a034fa68120ce57d201f0c859308d32d74835e7969555960c4041a466c9e2f8788a05a996a8c67347f0eba83cd6b38fe030aff2e8356e4b5ec2af85549f040014e3d',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignatures(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x11f9012d018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a941bc5339c6c55380d0da8aaa28e135164ecb862628568656c6c6fc4c3018080948d2f6e4986bc55e2d50611149e5725999a763d7cf8d5f845820feaa0779d20a7958d3131e5ef6a423abb2337e8f120bd0798c47227aee51c70d23c06a07d3c36d5a33cb18e8fec7d1e1f2cfd9a0ec932adee9ad9a090fcd28fafd44392f845820fe9a0de14998f4aba6474b55b84e9a236daf159252b460915cea204a4361cf99c9dc9a0743a40d63646defba13c70581d85000836155dddb30bc8024c62dad76981abecf845820fe9a034fa68120ce57d201f0c859308d32d74835e7969555960c4041a466c9e2f8788a05a996a8c67347f0eba83cd6b38fe030aff2e8356e4b5ec2af85549f040014e3d'

            const expectedSignatures = [
                [
                    '0x0fea',
                    '0x779d20a7958d3131e5ef6a423abb2337e8f120bd0798c47227aee51c70d23c06',
                    '0x7d3c36d5a33cb18e8fec7d1e1f2cfd9a0ec932adee9ad9a090fcd28fafd44392',
                ],
                [
                    '0x0fe9',
                    '0xde14998f4aba6474b55b84e9a236daf159252b460915cea204a4361cf99c9dc9',
                    '0x743a40d63646defba13c70581d85000836155dddb30bc8024c62dad76981abec',
                ],
                [
                    '0x0fe9',
                    '0x34fa68120ce57d201f0c859308d32d74835e7969555960c4041a466c9e2f8788',
                    '0x5a996a8c67347f0eba83cd6b38fe030aff2e8356e4b5ec2af85549f040014e3d',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkFeePayerSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTION-520: combineSignatures combines multiple signatures and feePayerSignatures', () => {
            let tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            // RLP encoding with only signatures
            const rlpEncodedStrings = [
                '0x11f90119018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a941bc5339c6c55380d0da8aaa28e135164ecb862628568656c6c6ff8d5f845820feaa060a20eed201a2b28bc452b65c699083a6399aaeff2a7572c5c8cf54056254aeaa001586e5321f51ed56da5241d6cc8365bdcade89c4b08d2615bc21231f5e2c26ef845820fe9a0b8f3ba052cd0ef34b683a3e8ad6f68f71a82d9416bf9732def4b66802967a055a07c241fa9b7d32b72fc8310e886c5b70de262457fd07711cbb2e17217d8c39b26f845820feaa06c301c61b6b8746f63baf57c477bd269ecdeb07d6200a719988bfcd0b7767bc1a016da23b63b4e54ffa16ce8668987e48a76b8e64ba7863359462efd1e8d9838a680c4c3018080',
            ]
            const expectedSignatures = [
                [
                    '0x0fea',
                    '0x60a20eed201a2b28bc452b65c699083a6399aaeff2a7572c5c8cf54056254aea',
                    '0x01586e5321f51ed56da5241d6cc8365bdcade89c4b08d2615bc21231f5e2c26e',
                ],
                [
                    '0x0fe9',
                    '0xb8f3ba052cd0ef34b683a3e8ad6f68f71a82d9416bf9732def4b66802967a055',
                    '0x7c241fa9b7d32b72fc8310e886c5b70de262457fd07711cbb2e17217d8c39b26',
                ],
                [
                    '0x0fea',
                    '0x6c301c61b6b8746f63baf57c477bd269ecdeb07d6200a719988bfcd0b7767bc1',
                    '0x16da23b63b4e54ffa16ce8668987e48a76b8e64ba7863359462efd1e8d9838a6',
                ],
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            let combined = tx.combineSignatures(rlpEncodedStrings)
            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)

            const rlpEncodedStringsWithFeePayerSignatures = [
                '0x11f9012d018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a941bc5339c6c55380d0da8aaa28e135164ecb862628568656c6c6fc4c3018080948d2f6e4986bc55e2d50611149e5725999a763d7cf8d5f845820feaa0779d20a7958d3131e5ef6a423abb2337e8f120bd0798c47227aee51c70d23c06a07d3c36d5a33cb18e8fec7d1e1f2cfd9a0ec932adee9ad9a090fcd28fafd44392f845820fe9a0de14998f4aba6474b55b84e9a236daf159252b460915cea204a4361cf99c9dc9a0743a40d63646defba13c70581d85000836155dddb30bc8024c62dad76981abecf845820fe9a034fa68120ce57d201f0c859308d32d74835e7969555960c4041a466c9e2f8788a05a996a8c67347f0eba83cd6b38fe030aff2e8356e4b5ec2af85549f040014e3d',
            ]
            const expectedFeePayerSignatures = [
                [
                    '0x0fea',
                    '0x779d20a7958d3131e5ef6a423abb2337e8f120bd0798c47227aee51c70d23c06',
                    '0x7d3c36d5a33cb18e8fec7d1e1f2cfd9a0ec932adee9ad9a090fcd28fafd44392',
                ],
                [
                    '0x0fe9',
                    '0xde14998f4aba6474b55b84e9a236daf159252b460915cea204a4361cf99c9dc9',
                    '0x743a40d63646defba13c70581d85000836155dddb30bc8024c62dad76981abec',
                ],
                [
                    '0x0fe9',
                    '0x34fa68120ce57d201f0c859308d32d74835e7969555960c4041a466c9e2f8788',
                    '0x5a996a8c67347f0eba83cd6b38fe030aff2e8356e4b5ec2af85549f040014e3d',
                ],
            ]

            const appendFeePayerSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            combined = tx.combineSignatures(rlpEncodedStrings)
            expect(appendFeePayerSignaturesSpy).to.have.been.callCount(rlpEncodedStringsWithFeePayerSignatures.length)

            // combine multiple signatures and feePayerSignatures
            tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)
            const combinedWithMultiple = tx.combineSignatures([combined])

            expect(combined).to.equal(combinedWithMultiple)
            checkSignature(tx, { expectedSignatures })
            checkFeePayerSignature(tx, { expectedFeePayerSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTION-521: If decode transaction has different values, combineSignatures should throw error', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)
            tx.value = 10000

            const rlpEncoded =
                '0x11f9012d018505d21dba00830f4240947b65b75d204abed71587c9e519a89277766ee1d00a941bc5339c6c55380d0da8aaa28e135164ecb862628568656c6c6fc4c3018080948d2f6e4986bc55e2d50611149e5725999a763d7cf8d5f845820feaa0779d20a7958d3131e5ef6a423abb2337e8f120bd0798c47227aee51c70d23c06a07d3c36d5a33cb18e8fec7d1e1f2cfd9a0ec932adee9ad9a090fcd28fafd44392f845820fe9a0de14998f4aba6474b55b84e9a236daf159252b460915cea204a4361cf99c9dc9a0743a40d63646defba13c70581d85000836155dddb30bc8024c62dad76981abecf845820fe9a034fa68120ce57d201f0c859308d32d74835e7969555960c4041a466c9e2f8788a05a996a8c67347f0eba83cd6b38fe030aff2e8356e4b5ec2af85549f040014e3d'
            const expectedError = `Transactions containing different information cannot be combined.`

            expect(() => tx.combineSignatures([rlpEncoded])).to.throw(expectedError)
        })
    })

    context('feeDelegatedValueTransferMemo.getRawTransaction', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-522: getRawTransaction should call getRLPEncoding function', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rawTransaction = tx.getRawTransaction()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(rawTransaction).to.equal(txWithExpectedValues.rlpEncoding)
        })
    })

    context('feeDelegatedValueTransferMemo.getTransactionHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-523: getTransactionHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const txHash = tx.getTransactionHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(txHash).to.equal(txWithExpectedValues.transactionHash)
            expect(caver.utils.isValidHashStrict(txHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTION-524: getTransactionHash should throw error when nonce is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.gasPrice = '0x5d21dba00'
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-525: getTransactionHash should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-526: getTransactionHash should throw error when chainId is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })
    })

    context('feeDelegatedValueTransferMemo.getSenderTxHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-527: getSenderTxHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const senderTxHash = tx.getSenderTxHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(senderTxHash).to.equal(txWithExpectedValues.senderTxHash)
            expect(caver.utils.isValidHashStrict(senderTxHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTION-528: getSenderTxHash should throw error when nonce is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.gasPrice = '0x5d21dba00'
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-529: getSenderTxHash should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-530: getSenderTxHash should throw error when chainId is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })
    })

    context('feeDelegatedValueTransferMemo.getRLPEncodingForSignature', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-531: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(txWithExpectedValues.tx)

            const commonRLPForSigningSpy = sandbox.spy(tx, 'getCommonRLPEncodingForSignature')

            const rlpEncodingForSign = tx.getRLPEncodingForSignature()

            expect(rlpEncodingForSign).to.equal(txWithExpectedValues.rlpEncodingForSigning)
            expect(commonRLPForSigningSpy).to.have.been.calledOnce
        })

        it('CAVERJS-UNIT-TRANSACTION-532: getRLPEncodingForSignature should throw error when nonce is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-533: getRLPEncodingForSignature should throw error when gasPrice is undefined', () => {
            transactionObj.chainId = 2019
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-534: getRLPEncodingForSignature should throw error when chainId is undefined', () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })
    })

    context('feeDelegatedValueTransferMemo.getCommonRLPEncodingForSignature', () => {
        it('CAVERJS-UNIT-TRANSACTION-535: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(txWithExpectedValues.tx)

            const commonRLPForSign = tx.getCommonRLPEncodingForSignature()
            const decoded = RLP.decode(txWithExpectedValues.rlpEncodingForSigning)

            expect(commonRLPForSign).to.equal(decoded[0])
        })
    })

    context('feeDelegatedValueTransferMemo.fillTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTION-536: fillTransaction should call klay_getGasPrice to fill gasPrice when gasPrice is undefined', async () => {
            transactionObj.nonce = '0x3a'
            transactionObj.chainId = 2019
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-537: fillTransaction should call klay_getTransactionCount to fill nonce when nonce is undefined', async () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.chainId = 2019
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-538: fillTransaction should call klay_getChainid to fill chainId when chainId is undefined', async () => {
            transactionObj.gasPrice = '0x5d21dba00'
            transactionObj.nonce = '0x3a'
            const tx = new caver.transaction.feeDelegatedValueTransferMemo(transactionObj)

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).to.have.been.calledOnce
        }).timeout(200000)
    })
})
