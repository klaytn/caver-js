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

const { generateRoleBasedKeyring, checkSignature } = require('../utils')

const AbstractTransaction = require('../../../packages/caver-transaction/src/transactionTypes/abstractTransaction')

let caver
let sender
let roleBasedKeyring

const txWithExpectedValues = {}
const input =
    '0xf8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405'

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
        nonce: 1234,
        gasPrice: '0x19',
        signatures: [
            [
                '0x25',
                '0xe58b9abf9f33a066b998fccaca711553fb4df425c9234bbb3577f9d9775bb124',
                '0x2c409a6c5d92277c0a812dd0cc553d7fe1d652a807274c3786df3292cd473e09',
            ],
        ],
        input,
        chainId: 0x1,
    }

    txWithExpectedValues.rlpEncodingForSigning =
        '0xf8cfb8caf8c8488204d219830f424094a94f5374fce5edbc8e2a8697c15331677e6ebf0bb8a8f8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405018080'
    txWithExpectedValues.senderTxHash = '0x4aad85735e777795d24aa3eab51be959d8ebdf9683083d85b66f70b7170f2ea3'
    txWithExpectedValues.transactionHash = '0x4aad85735e777795d24aa3eab51be959d8ebdf9683083d85b66f70b7170f2ea3'
    txWithExpectedValues.rlpEncoding =
        '0x48f9010e8204d219830f424094a94f5374fce5edbc8e2a8697c15331677e6ebf0bb8a8f8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405f845f84325a0e58b9abf9f33a066b998fccaca711553fb4df425c9234bbb3577f9d9775bb124a02c409a6c5d92277c0a812dd0cc553d7fe1d652a807274c3786df3292cd473e09'
})

describe('TxTypeChainDataAnchoring', () => {
    let transactionObj
    let getGasPriceSpy
    let getNonceSpy
    let getChainIdSpy
    beforeEach(() => {
        transactionObj = {
            from: sender.address,
            gas: '0x3b9ac9ff',
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

    context('create chainDataAnchoring instance', () => {
        it('CAVERJS-UNIT-TRANSACTION-343: If chainDataAnchoring not define from, return error', () => {
            delete transactionObj.from

            const expectedError = '"from" is missing'
            expect(() => new caver.transaction.chainDataAnchoring(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-344: If chainDataAnchoring not define gas, return error', () => {
            delete transactionObj.gas

            const expectedError = '"gas" is missing'
            expect(() => new caver.transaction.chainDataAnchoring(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-345: If chainDataAnchoring not define input, return error', () => {
            delete transactionObj.input

            const expectedError = '"input" is missing'
            expect(() => new caver.transaction.chainDataAnchoring(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-346: If chainDataAnchoring define from property with invalid address, return error', () => {
            transactionObj.from = 'invalid'

            const expectedError = `Invalid address of from: ${transactionObj.from}`
            expect(() => new caver.transaction.chainDataAnchoring(transactionObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-347: If chainDataAnchoring define unnecessary property, return error', () => {
            const unnecessaries = [
                propertiesForUnnecessary.to,
                propertiesForUnnecessary.value,
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
            ]

            for (let i = 0; i < unnecessaries.length; i++) {
                if (i > 0) delete transactionObj[unnecessaries[i - 1].name]
                transactionObj[unnecessaries[i].name] = unnecessaries[i].value

                const expectedError = `"${unnecessaries[i].name}" cannot be used with ${caver.transaction.type.TxTypeChainDataAnchoring} transaction`
                // eslint-disable-next-line no-loop-func
                expect(() => new caver.transaction.chainDataAnchoring(transactionObj)).to.throw(expectedError)
            }
        })
    })

    context('chainDataAnchoring.getRLPEncoding', () => {
        it('CAVERJS-UNIT-TRANSACTION-348: Returns RLP-encoded string', () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)

            expect(tx.getRLPEncoding()).to.equal(txWithExpectedValues.rlpEncoding)
        })

        it('CAVERJS-UNIT-TRANSACTION-349: getRLPEncoding should throw error when nonce is undefined', () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)
            delete tx._nonce

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-350: getRLPEncoding should throw error when gasPrice is undefined', () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)
            delete tx._gasPrice

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-351: getRLPEncoding should throw error when chainId is undefined', () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)
            delete tx._chainId

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncoding()).to.throw(expectedError)
        })
    })

    context('chainDataAnchoring.signWithKey', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeySpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.chainDataAnchoring(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTION-352: input: keyring. should sign transaction.', async () => {
            await tx.signWithKey(sender)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeySpy).to.have.been.calledWith(txHash, '0x7e3', 0, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-353: input: private key string. should sign transaction.', async () => {
            const signWithKeyProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKey')
            await tx.signWithKey(sender.keys[0][0].privateKey)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeyProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-354: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signWithKeyProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKey')
            await tx.signWithKey(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeyProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0, 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-355: input: keyring, index. should sign transaction with specific index.', async () => {
            const roleBasedSignWithKeySpy = sandbox.spy(roleBasedKeyring, 'signWithKey')

            tx.from = roleBasedKeyring.address

            await tx.signWithKey(roleBasedKeyring, 1)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeySpy).to.have.been.calledWith(txHash, '0x7e3', 0, 1)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-356: input: keyring, custom hasher. c.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            const expectedError = `In order to pass a custom hasher, use the third parameter.`
            await expect(tx.signWithKey(sender, customHasher)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-357: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTION-358: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.chainDataAnchoring(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signWithKey(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-359: input: rolebased keyring, index out of range. should throw error.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.chainDataAnchoring(transactionObj)

            const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
            await expect(tx.signWithKey(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('chainDataAnchoring.signWithKeys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        let fillTransactionSpy
        let createFromPrivateKeySpy
        let senderSignWithKeysSpy
        let appendSignaturesSpy
        let hasherSpy
        let tx

        beforeEach(() => {
            tx = new caver.transaction.chainDataAnchoring(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTION-360: input: keyring. should sign transaction.', async () => {
            await tx.signWithKeys(sender)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-361: input: private key string. should sign transaction.', async () => {
            const signWithKeysProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKeys')
            await tx.signWithKeys(sender.keys[0][0].privateKey)

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeysProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-362: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signWithKeysProtoSpy = sandbox.spy(Keyring.prototype, 'signWithKeys')
            await tx.signWithKeys(sender.getKlaytnWalletKey())

            checkFunctionCall()
            checkSignature(tx)
            expect(createFromPrivateKeySpy).to.have.been.calledOnce
            expect(signWithKeysProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-363: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            await tx.signWithKeys(sender, customHasher)

            checkFunctionCall(true)
            checkSignature(tx)
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(senderSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 0)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-364: input: keyring. should throw error when from is different.', async () => {
            transactionObj.from = roleBasedKeyring.address
            tx = new caver.transaction.chainDataAnchoring(transactionObj)

            const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
            await expect(tx.signWithKeys(sender)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-365: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'signWithKeys')

            tx.from = roleBasedKeyring.address

            await tx.signWithKeys(roleBasedKeyring)

            checkFunctionCall(true)
            checkSignature(tx, { expectedLength: roleBasedKeyring.keys[0].length })
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
            expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 0)
        }).timeout(200000)
    })

    context('chainDataAnchoring.appendSignatures', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-366: If signatures is empty, appendSignatures append signatures in transaction', () => {
            const tx = new caver.transaction.chainDataAnchoring(transactionObj)

            const sig = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            tx.appendSignatures(sig)
            checkSignature(tx)
        })

        it('CAVERJS-UNIT-TRANSACTION-367: If signatures is empty, appendSignatures append signatures with two-dimensional signature array', () => {
            const tx = new caver.transaction.chainDataAnchoring(transactionObj)

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

        it('CAVERJS-UNIT-TRANSACTION-368: If signatures is not empty, appendSignatures should append signatures', () => {
            transactionObj.signatures = [
                '0x0fea',
                '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
            ]
            const tx = new caver.transaction.chainDataAnchoring(transactionObj)

            const sig = [
                '0x0fea',
                '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
            ]

            tx.appendSignatures(sig)
            checkSignature(tx, { expectedLength: 2 })
        })

        it('CAVERJS-UNIT-TRANSACTION-369: appendSignatures should append multiple signatures', () => {
            const tx = new caver.transaction.chainDataAnchoring(transactionObj)

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

    context('chainDataAnchoring.combineSignatures', () => {
        beforeEach(() => {
            transactionObj = {
                from: '0xb605c7550ad5fb15ddd9291a2d31a889db808152',
                gas: '0xf4240',
                gasPrice: '0x5d21dba00',
                input,
                chainId: '0x7e3',
                nonce: '0x1',
            }
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-370: combineSignatures combines single signature and sets signatures in transaction', () => {
            const tx = new caver.transaction.chainDataAnchoring(transactionObj)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x48f90113018505d21dba00830f424094b605c7550ad5fb15ddd9291a2d31a889db808152b8a8f8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405f847f845820feaa091e77e86e76dc7f1edb1ef1c87fd4bcba1fd95cbc659db407e1f358ae0cc00eda008c2fc7ec8ee14e734701435d0ca2e001bc1e0742c0fe0d58bd131a582e4f10c'
            const combined = tx.combineSignatures([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fea',
                    '0x91e77e86e76dc7f1edb1ef1c87fd4bcba1fd95cbc659db407e1f358ae0cc00ed',
                    '0x08c2fc7ec8ee14e734701435d0ca2e001bc1e0742c0fe0d58bd131a582e4f10c',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTION-371: combineSignatures combines multiple signatures and sets signatures in transaction', () => {
            transactionObj.signatures = [
                [
                    '0x0fea',
                    '0x91e77e86e76dc7f1edb1ef1c87fd4bcba1fd95cbc659db407e1f358ae0cc00ed',
                    '0x08c2fc7ec8ee14e734701435d0ca2e001bc1e0742c0fe0d58bd131a582e4f10c',
                ],
            ]
            const tx = new caver.transaction.chainDataAnchoring(transactionObj)

            const rlpEncodedStrings = [
                '0x48f90113018505d21dba00830f424094b605c7550ad5fb15ddd9291a2d31a889db808152b8a8f8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405f847f845820feaa0c17c5ad8820b984da2bc816f881e1e283a9d7806ed5e3c703f58a7ed1f40edf1a049c4aa23508715aba0891ddad59bab4ff6abde777adffc1f39c79e51a78b786a',
                '0x48f90113018505d21dba00830f424094b605c7550ad5fb15ddd9291a2d31a889db808152b8a8f8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405f847f845820fe9a0d2779b46862d5d10cb31d08ad5907eccf6343148e4264c730e048bb859cf1456a052570001d11eee29ee96c9f530be948a5f270167895705454596f6e61680718c',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignatures(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x48f901a1018505d21dba00830f424094b605c7550ad5fb15ddd9291a2d31a889db808152b8a8f8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405f8d5f845820feaa091e77e86e76dc7f1edb1ef1c87fd4bcba1fd95cbc659db407e1f358ae0cc00eda008c2fc7ec8ee14e734701435d0ca2e001bc1e0742c0fe0d58bd131a582e4f10cf845820feaa0c17c5ad8820b984da2bc816f881e1e283a9d7806ed5e3c703f58a7ed1f40edf1a049c4aa23508715aba0891ddad59bab4ff6abde777adffc1f39c79e51a78b786af845820fe9a0d2779b46862d5d10cb31d08ad5907eccf6343148e4264c730e048bb859cf1456a052570001d11eee29ee96c9f530be948a5f270167895705454596f6e61680718c'

            const expectedSignatures = [
                [
                    '0x0fea',
                    '0x91e77e86e76dc7f1edb1ef1c87fd4bcba1fd95cbc659db407e1f358ae0cc00ed',
                    '0x08c2fc7ec8ee14e734701435d0ca2e001bc1e0742c0fe0d58bd131a582e4f10c',
                ],
                [
                    '0x0fea',
                    '0xc17c5ad8820b984da2bc816f881e1e283a9d7806ed5e3c703f58a7ed1f40edf1',
                    '0x49c4aa23508715aba0891ddad59bab4ff6abde777adffc1f39c79e51a78b786a',
                ],
                [
                    '0x0fe9',
                    '0xd2779b46862d5d10cb31d08ad5907eccf6343148e4264c730e048bb859cf1456',
                    '0x52570001d11eee29ee96c9f530be948a5f270167895705454596f6e61680718c',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTION-372: If decode transaction has different values, combineSignatures should throw error', () => {
            const tx = new caver.transaction.chainDataAnchoring(transactionObj)
            tx.input = '0x'

            const rlpEncoded =
                '0x48f901a1018505d21dba00830f424094b605c7550ad5fb15ddd9291a2d31a889db808152b8a8f8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405f8d5f845820feaa091e77e86e76dc7f1edb1ef1c87fd4bcba1fd95cbc659db407e1f358ae0cc00eda008c2fc7ec8ee14e734701435d0ca2e001bc1e0742c0fe0d58bd131a582e4f10cf845820feaa0c17c5ad8820b984da2bc816f881e1e283a9d7806ed5e3c703f58a7ed1f40edf1a049c4aa23508715aba0891ddad59bab4ff6abde777adffc1f39c79e51a78b786af845820fe9a0d2779b46862d5d10cb31d08ad5907eccf6343148e4264c730e048bb859cf1456a052570001d11eee29ee96c9f530be948a5f270167895705454596f6e61680718c'
            const expectedError = `Transactions containing different information cannot be combined.`

            expect(() => tx.combineSignatures([rlpEncoded])).to.throw(expectedError)
        })
    })

    context('chainDataAnchoring.getRawTransaction', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-373: getRawTransaction should call getRLPEncoding function', () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const expected = txWithExpectedValues.rlpEncoding
            const rawTransaction = tx.getRawTransaction()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(rawTransaction).to.equal(expected)
        })
    })

    context('chainDataAnchoring.getTransactionHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-374: getTransactionHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const expected = txWithExpectedValues.transactionHash
            const txHash = tx.getTransactionHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(txHash).to.equal(expected)
            expect(caver.utils.isValidHashStrict(txHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTION-375: getTransactionHash should throw error when nonce is undefined', () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)
            delete tx._nonce

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-376: getTransactionHash should throw error when gasPrice is undefined', () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)
            delete tx._gasPrice

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-377: getTransactionHash should throw error when chainId is undefined', () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)
            delete tx._chainId

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getTransactionHash()).to.throw(expectedError)
        })
    })

    context('chainDataAnchoring.getSenderTxHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-378: getSenderTxHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const expected = txWithExpectedValues.senderTxHash
            const senderTxHash = tx.getSenderTxHash()

            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(senderTxHash).to.equal(expected)
            expect(caver.utils.isValidHashStrict(senderTxHash)).to.be.true
        })

        it('CAVERJS-UNIT-TRANSACTION-379: getSenderTxHash should throw error when nonce is undefined', () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)
            delete tx._nonce

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-380: getSenderTxHash should throw error when gasPrice is undefined', () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)
            delete tx._gasPrice

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-381: getSenderTxHash should throw error when chainId is undefined', () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)
            delete tx._chainId

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getSenderTxHash()).to.throw(expectedError)
        })
    })

    context('chainDataAnchoring.getRLPEncodingForSignature', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-382: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)

            const commonRLPForSigningSpy = sandbox.spy(tx, 'getCommonRLPEncodingForSignature')

            const expected = txWithExpectedValues.rlpEncodingForSigning
            const rlpEncodingForSign = tx.getRLPEncodingForSignature()

            expect(rlpEncodingForSign).to.equal(expected)
            expect(commonRLPForSigningSpy).to.have.been.calledOnce
        })

        it('CAVERJS-UNIT-TRANSACTION-383: getRLPEncodingForSignature should throw error when nonce is undefined', () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)
            delete tx._nonce

            const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-384: getRLPEncodingForSignature should throw error when gasPrice is undefined', () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)
            delete tx._gasPrice

            const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-385: getRLPEncodingForSignature should throw error when chainId is undefined', () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)
            delete tx._chainId

            const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

            expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
        })
    })

    context('chainDataAnchoring.getCommonRLPEncodingForSignature', () => {
        it('CAVERJS-UNIT-TRANSACTION-386: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)

            const commonRLPForSign = tx.getCommonRLPEncodingForSignature()
            const decoded = RLP.decode(txWithExpectedValues.rlpEncodingForSigning)

            expect(commonRLPForSign).to.equal(decoded[0])
        })
    })

    context('chainDataAnchoring.fillTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTION-387: fillTransaction should call klay_getGasPrice to fill gasPrice when gasPrice is undefined', async () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)
            delete tx._gasPrice

            await tx.fillTransaction()
            expect(getGasPriceSpy).to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-388: fillTransaction should call klay_getTransactionCount to fill nonce when nonce is undefined', async () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)
            delete tx._nonce

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).to.have.been.calledOnce
            expect(getChainIdSpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-389: fillTransaction should call klay_getChainid to fill chainId when chainId is undefined', async () => {
            const tx = new caver.transaction.chainDataAnchoring(txWithExpectedValues.tx)
            delete tx._chainId

            await tx.fillTransaction()
            expect(getGasPriceSpy).not.to.have.been.calledOnce
            expect(getNonceSpy).not.to.have.been.calledOnce
            expect(getChainIdSpy).to.have.been.calledOnce
        }).timeout(200000)
    })
})
