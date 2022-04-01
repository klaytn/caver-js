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

const { generateRoleBasedKeyring, makeAccount, accountKeyTestCases, checkSignature } = require('../utils')

let caver
let sender
let roleBasedKeyring

let txObjWithLegacy
let txObjWithPublic
let txObjWithFail
let txObjWithMultiSig
let txObjWithRoleBased

const expectedValues = []
let txsByAccountKeys = []

const sandbox = sinon.createSandbox()

function makeAccountUpdateObjectWithExpectedValues() {
    {
        const testAddress = '0xdca786ce39b074966e8a9eae16eac90783974d80'
        const account = caver.account.createWithAccountKeyLegacy(testAddress)

        const tx = {
            from: testAddress,
            gas: '0x30d40',
            nonce: '0x0',
            gasPrice: '0x5d21dba00',
            signatures: [
                [
                    '0x0fea',
                    '0x866f7cf552d4062a3c1a6055cabbe358a21ce779cfe2b81cee87b66024b993af',
                    '0x2990dc2d9d36cc4de4b9a79c30aeab8d59e2d60631e0d90c8ac3c096b7a38852',
                ],
            ],
            chainId: '0x7e3',
            account,
        }

        expectedValues.push({})
        expectedValues[accountKeyTestCases.LEGACY].tx = tx
        expectedValues[accountKeyTestCases.LEGACY].rlpEncodingForSigning =
            '0xeba5e420808505d21dba0083030d4094dca786ce39b074966e8a9eae16eac90783974d808201c08207e38080'
        expectedValues[accountKeyTestCases.LEGACY].rlpEncodingCommon =
            '0xe420808505d21dba0083030d4094dca786ce39b074966e8a9eae16eac90783974d808201c0'
        expectedValues[accountKeyTestCases.LEGACY].senderTxHash = '0xeea281154fc4000f01b47a5a6f0c2caa1481cbc9ef935cc8c35a5f006f8d97a6'
        expectedValues[accountKeyTestCases.LEGACY].transactionHash = '0xeea281154fc4000f01b47a5a6f0c2caa1481cbc9ef935cc8c35a5f006f8d97a6'
        expectedValues[accountKeyTestCases.LEGACY].rlpEncoding =
            '0x20f86c808505d21dba0083030d4094dca786ce39b074966e8a9eae16eac90783974d808201c0f847f845820feaa0866f7cf552d4062a3c1a6055cabbe358a21ce779cfe2b81cee87b66024b993afa02990dc2d9d36cc4de4b9a79c30aeab8d59e2d60631e0d90c8ac3c096b7a38852'
    }
    {
        const testAddress = '0xffb52bc54635f840013e142ebe7c06c9c91c1625'
        const pubKey =
            '0xc93fcbdb2b9dbef8ee5c4748ffdce11f1f5b06d7ba71cc2b7699e38be7698d1edfa5c0486858a516e8a46c4834ac0ad10ed7dc7ec818a88a9f75fe5fabd20e90'
        const account = caver.account.createWithAccountKeyPublic(testAddress, pubKey)

        const tx = {
            from: testAddress,
            gas: '0x30d40',
            nonce: '0x0',
            gasPrice: '0x5d21dba00',
            signatures: [
                [
                    '0x0fe9',
                    '0x9c2ca281e94567846acbeef724b1a7a5f882d581aff9984755abd92272592b8e',
                    '0x344fd23d7774ae9c227809bb579387dfcd69e74ae2fe3a788617f54a4001e5ab',
                ],
            ],
            chainId: '0x7e3',
            account,
        }

        expectedValues.push({})
        expectedValues[accountKeyTestCases.PUBLIC].tx = tx
        expectedValues[accountKeyTestCases.PUBLIC].rlpEncodingForSigning =
            '0xf84eb847f84520808505d21dba0083030d4094ffb52bc54635f840013e142ebe7c06c9c91c1625a302a102c93fcbdb2b9dbef8ee5c4748ffdce11f1f5b06d7ba71cc2b7699e38be7698d1e8207e38080'

        expectedValues[accountKeyTestCases.PUBLIC].rlpEncodingCommon =
            '0xf84520808505d21dba0083030d4094ffb52bc54635f840013e142ebe7c06c9c91c1625a302a102c93fcbdb2b9dbef8ee5c4748ffdce11f1f5b06d7ba71cc2b7699e38be7698d1e'
        expectedValues[accountKeyTestCases.PUBLIC].senderTxHash = '0x0c52c7e1d67da8221df26fa7ac01f33d87f46dc706844804f378cebe2e66c432'
        expectedValues[accountKeyTestCases.PUBLIC].transactionHash = '0x0c52c7e1d67da8221df26fa7ac01f33d87f46dc706844804f378cebe2e66c432'
        expectedValues[accountKeyTestCases.PUBLIC].rlpEncoding =
            '0x20f88d808505d21dba0083030d4094ffb52bc54635f840013e142ebe7c06c9c91c1625a302a102c93fcbdb2b9dbef8ee5c4748ffdce11f1f5b06d7ba71cc2b7699e38be7698d1ef847f845820fe9a09c2ca281e94567846acbeef724b1a7a5f882d581aff9984755abd92272592b8ea0344fd23d7774ae9c227809bb579387dfcd69e74ae2fe3a788617f54a4001e5ab'
    }
    {
        const testAddress = '0x26b05cce63f78ddf6a769fb2db39e54b9f2db620'
        const account = caver.account.createWithAccountKeyFail(testAddress)

        const tx = {
            from: testAddress,
            gas: '0x30d40',
            nonce: '0x0',
            gasPrice: '0x5d21dba00',
            signatures: [
                [
                    '0x0fe9',
                    '0x86361c43593859b6989794a6848c5ba1e5d8bd860522347cd167042acd6a7816',
                    '0x773f5cc10f734b3b4486b9c5b7e5def156e06d9d9f4a3aaae6662f9a2126094c',
                ],
            ],
            chainId: '0x7e3',
            account,
        }

        expectedValues.push({})
        expectedValues[accountKeyTestCases.FAIL].tx = tx
        expectedValues[accountKeyTestCases.FAIL].rlpEncodingForSigning =
            '0xeba5e420808505d21dba0083030d409426b05cce63f78ddf6a769fb2db39e54b9f2db6208203c08207e38080'
        expectedValues[accountKeyTestCases.FAIL].rlpEncodingCommon =
            '0xe420808505d21dba0083030d409426b05cce63f78ddf6a769fb2db39e54b9f2db6208203c0'
        expectedValues[accountKeyTestCases.FAIL].senderTxHash = '0xfb6053ce6d0321eebcdbce2c123fd501bc38ab6bcf74a34001663a56d227cd92'
        expectedValues[accountKeyTestCases.FAIL].transactionHash = '0xfb6053ce6d0321eebcdbce2c123fd501bc38ab6bcf74a34001663a56d227cd92'
        expectedValues[accountKeyTestCases.FAIL].rlpEncoding =
            '0x20f86c808505d21dba0083030d409426b05cce63f78ddf6a769fb2db39e54b9f2db6208203c0f847f845820fe9a086361c43593859b6989794a6848c5ba1e5d8bd860522347cd167042acd6a7816a0773f5cc10f734b3b4486b9c5b7e5def156e06d9d9f4a3aaae6662f9a2126094c'
    }
    {
        const testAddress = '0x2dcd60f120bd64e35093a2945ce61c0bcb71dc93'
        const pubArray = [
            '0xe1c4bb4d01245ebdc62a88092f6c79b59d56e319ae694050e7a0c1cff93a0d9240bf159aa0ee59bacb41df2185cf0be1ca316c349d839e4edc04e1af77ec8c4e',
            '0x13853532348457b4fb18526c6447a6cdff38a791dc2e778f19a843fc6b3a3e8d4cb21a4c331ccc967aa9127fb7e49ce52eaf69c967521d4066745371868b297b',
            '0xe0f3c6f28dc933ac3cf7fc3143f0d38bc83aa9541ce7bb67c356cad5c9b020a3a0b24f48b17b1f7880ba027ad39095ae53888d788816658e47a58193c1b81720',
        ]
        const options = new caver.account.weightedMultiSigOptions(2, [1, 1, 1])
        const account = caver.account.createWithAccountKeyWeightedMultiSig(testAddress, pubArray, options)

        const tx = {
            from: testAddress,
            gas: '0x30d40',
            nonce: '0x0',
            gasPrice: '0x5d21dba00',
            signatures: [
                [
                    '0x0fe9',
                    '0x02aca4ec6773a26c71340c2500cb45886a61797bcd82790f7f01150ced48b0ac',
                    '0x20502f22a1b3c95a5f260a03dc3de0eaa1f4a618b1d2a7d4da643507302e523c',
                ],
            ],
            chainId: '0x7e3',
            account,
        }

        expectedValues.push({})
        expectedValues[accountKeyTestCases.MULTISIG].tx = tx
        expectedValues[accountKeyTestCases.MULTISIG].rlpEncodingForSigning =
            '0xf89eb897f89520808505d21dba0083030d40942dcd60f120bd64e35093a2945ce61c0bcb71dc93b87204f86f02f86ce301a102e1c4bb4d01245ebdc62a88092f6c79b59d56e319ae694050e7a0c1cff93a0d92e301a10313853532348457b4fb18526c6447a6cdff38a791dc2e778f19a843fc6b3a3e8de301a102e0f3c6f28dc933ac3cf7fc3143f0d38bc83aa9541ce7bb67c356cad5c9b020a38207e38080'
        expectedValues[accountKeyTestCases.MULTISIG].rlpEncodingCommon =
            '0xf89520808505d21dba0083030d40942dcd60f120bd64e35093a2945ce61c0bcb71dc93b87204f86f02f86ce301a102e1c4bb4d01245ebdc62a88092f6c79b59d56e319ae694050e7a0c1cff93a0d92e301a10313853532348457b4fb18526c6447a6cdff38a791dc2e778f19a843fc6b3a3e8de301a102e0f3c6f28dc933ac3cf7fc3143f0d38bc83aa9541ce7bb67c356cad5c9b020a3'
        expectedValues[accountKeyTestCases.MULTISIG].senderTxHash = '0x6b67ca5e8f1ef46e009348541d0866dbb2902b75a4dccb3b7286d6987f556b44'
        expectedValues[accountKeyTestCases.MULTISIG].transactionHash = '0x6b67ca5e8f1ef46e009348541d0866dbb2902b75a4dccb3b7286d6987f556b44'
        expectedValues[accountKeyTestCases.MULTISIG].rlpEncoding =
            '0x20f8dd808505d21dba0083030d40942dcd60f120bd64e35093a2945ce61c0bcb71dc93b87204f86f02f86ce301a102e1c4bb4d01245ebdc62a88092f6c79b59d56e319ae694050e7a0c1cff93a0d92e301a10313853532348457b4fb18526c6447a6cdff38a791dc2e778f19a843fc6b3a3e8de301a102e0f3c6f28dc933ac3cf7fc3143f0d38bc83aa9541ce7bb67c356cad5c9b020a3f847f845820fe9a002aca4ec6773a26c71340c2500cb45886a61797bcd82790f7f01150ced48b0aca020502f22a1b3c95a5f260a03dc3de0eaa1f4a618b1d2a7d4da643507302e523c'
    }
    {
        const testAddress = '0xfb675bea5c3fa279fd21572161b6b6b2dbd84233'
        const pubArray = [
            [
                '0xf7e7e03c328d39cee6201080ac2576919f904f0b8e47fcb7ea8869e7db0baf4470a0b29a1f6dd007e19a53da122d18bf6273cdddb2903ef0ad2b350b207ad67c',
                '0xedacd9095274f292c702514f6443f58337e7d7c8311694f31c73e86f150ecf45820929c143da861f6009784e36a6ebd99f83b1baf93fd72e820b5df3cd00883b',
                '0xb74fd682a6a805415e7711890bc91a283c268c78947ebf25a02a2e02625a68aa825b5213f3e9f03c34650da902a2a70915dcc1c7fe86333a7e40e638361335a4',
            ],
            [
                '0xd0ae803893f344ee664378bbc9ebb35ca2d94f7d7ecea4e3e2f9f33817cdb04bb54cf4211eef21e9627a7d0ca6960e8f1135a35c751f526ce203c6e36b3f2230',
            ],
            [
                '0x4b4cd35195aa4324184a64821e514a991b513cc354f5fa6d78fb99e23949bc59613d8be87ad3e1418ad11e1d5537233b697bc0c8c5d7335a6decf687cce700ba',
                '0x3e65f4a76bca1488a1a046d6976778852aa41f07156d2c42e81c3da6621435d2350f8419fe8255dc87158c8ae30378b19b0d3d224eb410ca2de847a41caeb617',
            ],
        ]
        const options = [
            new caver.account.weightedMultiSigOptions(2, [1, 1, 1]),
            new caver.account.weightedMultiSigOptions(),
            new caver.account.weightedMultiSigOptions(1, [1, 1]),
        ]
        const account = caver.account.createWithAccountKeyRoleBased(testAddress, pubArray, options)

        const transactionWithRolebased = {
            from: testAddress,
            gas: '0x30d40',
            nonce: '0x0',
            gasPrice: '0x5d21dba00',
            signatures: [
                [
                    '0x0fe9',
                    '0x66e28c27f16ba34325770e842874d07473180bcec22e86851a6882acbaeb56c3',
                    '0x761e12fe11003aa4cb8fd9b44a41e5edebeb943cc366264b345d0f7e63853724',
                ],
            ],
            chainId: '0x7e3',
            account,
        }

        expectedValues.push({})
        expectedValues[accountKeyTestCases.ROLEBAED].tx = transactionWithRolebased
        expectedValues[accountKeyTestCases.ROLEBAED].rlpEncodingForSigning =
            '0xf90119b90111f9010e20808505d21dba0083030d4094fb675bea5c3fa279fd21572161b6b6b2dbd84233b8eb05f8e8b87204f86f02f86ce301a102f7e7e03c328d39cee6201080ac2576919f904f0b8e47fcb7ea8869e7db0baf44e301a103edacd9095274f292c702514f6443f58337e7d7c8311694f31c73e86f150ecf45e301a102b74fd682a6a805415e7711890bc91a283c268c78947ebf25a02a2e02625a68aaa302a102d0ae803893f344ee664378bbc9ebb35ca2d94f7d7ecea4e3e2f9f33817cdb04bb84e04f84b01f848e301a1024b4cd35195aa4324184a64821e514a991b513cc354f5fa6d78fb99e23949bc59e301a1033e65f4a76bca1488a1a046d6976778852aa41f07156d2c42e81c3da6621435d28207e38080'
        expectedValues[accountKeyTestCases.ROLEBAED].rlpEncodingCommon =
            '0xf9010e20808505d21dba0083030d4094fb675bea5c3fa279fd21572161b6b6b2dbd84233b8eb05f8e8b87204f86f02f86ce301a102f7e7e03c328d39cee6201080ac2576919f904f0b8e47fcb7ea8869e7db0baf44e301a103edacd9095274f292c702514f6443f58337e7d7c8311694f31c73e86f150ecf45e301a102b74fd682a6a805415e7711890bc91a283c268c78947ebf25a02a2e02625a68aaa302a102d0ae803893f344ee664378bbc9ebb35ca2d94f7d7ecea4e3e2f9f33817cdb04bb84e04f84b01f848e301a1024b4cd35195aa4324184a64821e514a991b513cc354f5fa6d78fb99e23949bc59e301a1033e65f4a76bca1488a1a046d6976778852aa41f07156d2c42e81c3da6621435d2'
        expectedValues[accountKeyTestCases.ROLEBAED].senderTxHash = '0x57cdfb7b92c16608b467c28e6519f66ef89923046fce37e086baa1f5775ef312'
        expectedValues[accountKeyTestCases.ROLEBAED].transactionHash = '0x57cdfb7b92c16608b467c28e6519f66ef89923046fce37e086baa1f5775ef312'
        expectedValues[accountKeyTestCases.ROLEBAED].rlpEncoding =
            '0x20f90156808505d21dba0083030d4094fb675bea5c3fa279fd21572161b6b6b2dbd84233b8eb05f8e8b87204f86f02f86ce301a102f7e7e03c328d39cee6201080ac2576919f904f0b8e47fcb7ea8869e7db0baf44e301a103edacd9095274f292c702514f6443f58337e7d7c8311694f31c73e86f150ecf45e301a102b74fd682a6a805415e7711890bc91a283c268c78947ebf25a02a2e02625a68aaa302a102d0ae803893f344ee664378bbc9ebb35ca2d94f7d7ecea4e3e2f9f33817cdb04bb84e04f84b01f848e301a1024b4cd35195aa4324184a64821e514a991b513cc354f5fa6d78fb99e23949bc59e301a1033e65f4a76bca1488a1a046d6976778852aa41f07156d2c42e81c3da6621435d2f847f845820fe9a066e28c27f16ba34325770e842874d07473180bcec22e86851a6882acbaeb56c3a0761e12fe11003aa4cb8fd9b44a41e5edebeb943cc366264b345d0f7e63853724'
    }
}

before(() => {
    caver = new Caver(testRPCURL)
    sender = caver.wallet.add(caver.wallet.keyring.generate())
    roleBasedKeyring = generateRoleBasedKeyring([3, 3, 3])

    const commonObj = {
        from: sender.address,
        gas: '0x3b9ac9ff',
    }

    txObjWithLegacy = { account: makeAccount(sender.address, accountKeyTestCases.LEGACY), ...commonObj }
    txObjWithPublic = { account: makeAccount(sender.address, accountKeyTestCases.PUBLIC), ...commonObj }
    txObjWithFail = { account: makeAccount(sender.address, accountKeyTestCases.FAIL), ...commonObj }
    txObjWithMultiSig = { account: makeAccount(sender.address, accountKeyTestCases.MULTISIG), ...commonObj }
    txObjWithRoleBased = {
        account: makeAccount(sender.address, accountKeyTestCases.ROLEBAED, [
            { threshold: 2, weights: [1, 1, 1] },
            {},
            { threshold: 1, weights: [1, 1] },
        ]),
        ...commonObj,
    }

    makeAccountUpdateObjectWithExpectedValues()
})

describe('TxTypeAccountUpdate', () => {
    let getGasPriceSpy
    let getNonceSpy
    let getChainIdSpy

    beforeEach(() => {
        txsByAccountKeys = []
        txsByAccountKeys.push(caver.transaction.accountUpdate.create(txObjWithLegacy))
        txsByAccountKeys.push(caver.transaction.accountUpdate.create(txObjWithPublic))
        txsByAccountKeys.push(caver.transaction.accountUpdate.create(txObjWithFail))
        txsByAccountKeys.push(caver.transaction.accountUpdate.create(txObjWithMultiSig))
        txsByAccountKeys.push(caver.transaction.accountUpdate.create(txObjWithRoleBased))

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

    context('create accountUpdate instance', () => {
        it('CAVERJS-UNIT-TRANSACTION-152: If accountUpdate not define from, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }
            delete testUpdateObj.from

            const expectedError = '"from" is missing'
            expect(() => caver.transaction.accountUpdate.create(testUpdateObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-153: If accountUpdate not define gas, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }
            delete testUpdateObj.gas

            const expectedError = '"gas" is missing'
            expect(() => caver.transaction.accountUpdate.create(testUpdateObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-389: If accountUpdate not define gas, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }
            delete testUpdateObj.account

            const expectedError = 'Missing account information with TxTypeAccountUpdate transaction'
            expect(() => caver.transaction.accountUpdate.create(testUpdateObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-154: If accountUpdate define from property with invalid address, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }
            testUpdateObj.from = 'invalid'

            const expectedError = `Invalid address of from: ${testUpdateObj.from}`
            expect(() => caver.transaction.accountUpdate.create(testUpdateObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTION-155: If accountUpdate define unnecessary property, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }

            const unnecessaries = [
                propertiesForUnnecessary.data,
                propertiesForUnnecessary.input,
                propertiesForUnnecessary.to,
                propertiesForUnnecessary.value,
                propertiesForUnnecessary.codeFormat,
                propertiesForUnnecessary.failKey,
                propertiesForUnnecessary.feePayer,
                propertiesForUnnecessary.feePayerSignatures,
                propertiesForUnnecessary.feeRatio,
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
                if (i > 0) delete testUpdateObj[unnecessaries[i - 1].name]
                testUpdateObj[unnecessaries[i].name] = unnecessaries[i].value

                const expectedError = `"${unnecessaries[i].name}" cannot be used with ${caver.transaction.type.TxTypeAccountUpdate} transaction`
                expect(() => caver.transaction.accountUpdate.create(testUpdateObj)).to.throw(expectedError)
            }
        })
    })

    context('accountUpdate.getRLPEncoding', () => {
        it('CAVERJS-UNIT-TRANSACTION-156: returns RLP-encoded string.', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.accountUpdate.create(expectedValues[i].tx)

                expect(tx.getRLPEncoding()).to.equal(expectedValues[i].rlpEncoding)
            }
        })

        it('CAVERJS-UNIT-TRANSACTION-157: getRLPEncoding should throw error when nonce is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.accountUpdate.create(expectedValues[i].tx)
                delete tx._nonce

                const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getRLPEncoding()).to.throw(expectedError)
            }
        })

        it('CAVERJS-UNIT-TRANSACTION-158: getRLPEncoding should throw error when gasPrice is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.accountUpdate.create(expectedValues[i].tx)
                delete tx._gasPrice

                const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getRLPEncoding()).to.throw(expectedError)
            }
        })
    })

    context('accountUpdate.sign', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        const fillTransactionSpys = []
        const appendSignaturesSpys = []

        let createFromPrivateKeySpy
        let senderSignSpy
        let hasherSpy

        beforeEach(() => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                fillTransactionSpys.push(sandbox.spy(txsByAccountKeys[i], 'fillTransaction'))
                appendSignaturesSpys.push(sandbox.spy(txsByAccountKeys[i], 'appendSignatures'))
            }

            createFromPrivateKeySpy = sandbox.spy(Keyring, 'createFromPrivateKey')
            senderSignSpy = sandbox.spy(sender, 'sign')
            hasherSpy = sandbox.stub(TransactionHasher, 'getHashForSignature')
            hasherSpy.returns(txHash)
        })

        afterEach(() => {
            sandbox.restore()
        })

        function checkFunctionCall(idx, customHasher = false) {
            expect(fillTransactionSpys[idx]).to.have.been.calledOnce
            expect(appendSignaturesSpys[idx]).to.have.been.calledOnce
            if (!customHasher) expect(hasherSpy).to.have.been.calledWith(txsByAccountKeys[idx])
        }

        it('CAVERJS-UNIT-TRANSACTION-160: input: keyring. should sign transaction.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.sign(sender)

                checkFunctionCall(i)
                checkSignature(tx)
                expect(senderSignSpy).to.have.been.calledWith(txHash, '0x7e3', 1, undefined)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-161: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')

            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.sign(sender.key.privateKey)

                checkFunctionCall(i)
                checkSignature(tx)
                expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 1, undefined)
            }
            expect(createFromPrivateKeySpy).to.have.been.callCount(Object.keys(txsByAccountKeys).length)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-162: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')

            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.sign(sender.getKlaytnWalletKey())

                checkFunctionCall(i)
                checkSignature(tx)
                expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 1, undefined)
            }
            expect(createFromPrivateKeySpy).to.have.been.callCount(Object.keys(txsByAccountKeys).length)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-163: input: keyring, index. should sign transaction with specific index.', async () => {
            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.from = roleBasedKeyring.address

                await tx.sign(roleBasedKeyring, 1)

                checkFunctionCall(i)
                checkSignature(tx)
                expect(roleBasedSignSpy).to.have.been.calledWith(txHash, '0x7e3', 1, 1)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-164: input: keyring, custom hasher. should use custom hasher.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]

                await tx.sign(sender, customHasher)

                checkFunctionCall(i, true)
                checkSignature(tx)
                expect(senderSignSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 1, undefined)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-165: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.from = roleBasedKeyring.address

                await tx.sign(roleBasedKeyring, 1, customHasher)

                checkFunctionCall(i, true)
                checkSignature(tx)
                expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
                expect(roleBasedSignSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 1, 1)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-166: input: keyring. should throw error when from is different.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.from = roleBasedKeyring.address

                const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
                await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-167: input: rolebased keyring, index out of range. should throw error.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.from = roleBasedKeyring.address

                const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
                await expect(tx.sign(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
            }
        })
    })

    context('accountUpdate.sign with multiple keys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        const fillTransactionSpys = []
        const appendSignaturesSpys = []

        let createFromPrivateKeySpy
        let senderSignWithKeysSpy
        let hasherSpy

        beforeEach(() => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                fillTransactionSpys.push(sandbox.spy(txsByAccountKeys[i], 'fillTransaction'))
                appendSignaturesSpys.push(sandbox.spy(txsByAccountKeys[i], 'appendSignatures'))
            }

            createFromPrivateKeySpy = sandbox.spy(Keyring, 'createFromPrivateKey')
            senderSignWithKeysSpy = sandbox.spy(sender, 'sign')
            hasherSpy = sandbox.stub(TransactionHasher, 'getHashForSignature')
            hasherSpy.returns(txHash)
        })

        afterEach(() => {
            sandbox.restore()
        })

        function checkFunctionCall(idx, customHasher = false) {
            expect(fillTransactionSpys[idx]).to.have.been.calledOnce
            expect(appendSignaturesSpys[idx]).to.have.been.calledOnce
            if (!customHasher) expect(hasherSpy).to.have.been.calledWith(txsByAccountKeys[idx])
        }

        it('CAVERJS-UNIT-TRANSACTION-168: input: keyring. should sign transaction.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.sign(sender)

                checkFunctionCall(i)
                checkSignature(tx)
                expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 1)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-169: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.sign(sender.key.privateKey)

                checkFunctionCall(i)
                checkSignature(tx)
                expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 1)
            }
            expect(createFromPrivateKeySpy).to.have.been.callCount(Object.keys(txsByAccountKeys).length)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-170: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.sign(sender.getKlaytnWalletKey())

                checkFunctionCall(i)
                checkSignature(tx)
                expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 1)
            }
            expect(createFromPrivateKeySpy).to.have.been.callCount(Object.keys(txsByAccountKeys).length)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-171: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.sign(sender, customHasher)

                checkFunctionCall(i, true)
                checkSignature(tx)
                expect(senderSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 1)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-172: input: keyring. should throw error when from is different.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.from = roleBasedKeyring.address
                const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
                await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-173: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'sign')

            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.from = roleBasedKeyring.address

                await tx.sign(roleBasedKeyring)

                checkFunctionCall(i, true)
                checkSignature(tx, { expectedLength: roleBasedKeyring.keys[0].length })
                expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
                expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 1)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)
    })

    context('accountUpdate.appendSignatures', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-174: If signatures is empty, appendSignatures append signatures in transaction', () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]

                const sig = [
                    '0x0fea',
                    '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                    '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                ]
                tx.appendSignatures(sig)
                checkSignature(tx)
            }
        })

        it('CAVERJS-UNIT-TRANSACTION-175: If signatures is empty, appendSignatures append signatures with two-dimensional signature array', () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]

                const sig = [
                    [
                        '0x0fea',
                        '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                        '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                    ],
                ]
                tx.appendSignatures(sig)
                checkSignature(tx)
            }
        })

        it('CAVERJS-UNIT-TRANSACTION-176: If signatures is not empty, appendSignatures should append signatures', () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.signatures = [
                    '0x0fea',
                    '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                    '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                ]

                const sig = [
                    '0x0fea',
                    '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                    '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
                ]

                tx.appendSignatures(sig)
                checkSignature(tx, { expectedLength: 2 })
            }
        })

        it('CAVERJS-UNIT-TRANSACTION-177: appendSignatures should append multiple signatures', () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]

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
            }
        })
    })

    context('accountUpdate.combineSignedRawTransactions', () => {
        let combinedTarget
        beforeEach(() => {
            const testAddress = '0x40efcb7d744fdc881f698a8ec573999fe6383545'
            combinedTarget = {
                from: testAddress,
                gas: '0x15f90',
                nonce: '0x1',
                gasPrice: '0x5d21dba00',
                chainId: 2019,
                account: caver.account.createWithAccountKeyLegacy(testAddress),
            }
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-178: combineSignedRawTransactions combines single signature and sets signatures in transaction', () => {
            const tx = caver.transaction.accountUpdate.create(combinedTarget)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x20f86c018505d21dba0083015f909440efcb7d744fdc881f698a8ec573999fe63835458201c0f847f845820fe9a0f2a83743da6931ce25a29d04f1c51cec8464f0d9d4dabb5acb059aa3fb8c345aa065879e06474669005e02e0b8ca06cba6f8943022305659f8936f1f6109147fdd'
            const combined = tx.combineSignedRawTransactions([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0xf2a83743da6931ce25a29d04f1c51cec8464f0d9d4dabb5acb059aa3fb8c345a',
                    '0x65879e06474669005e02e0b8ca06cba6f8943022305659f8936f1f6109147fdd',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTION-179: combineSignedRawTransactions combines multiple signatures and sets signatures in transaction', () => {
            combinedTarget.signatures = [
                [
                    '0x0fe9',
                    '0xf2a83743da6931ce25a29d04f1c51cec8464f0d9d4dabb5acb059aa3fb8c345a',
                    '0x65879e06474669005e02e0b8ca06cba6f8943022305659f8936f1f6109147fdd',
                ],
            ]
            const tx = caver.transaction.accountUpdate.create(combinedTarget)

            const rlpEncodedStrings = [
                '0x20f86c018505d21dba0083015f909440efcb7d744fdc881f698a8ec573999fe63835458201c0f847f845820feaa0638f0d712b4b709cadab174dea6da50e5429ea59d78446e810af954af8d67981a0129ad4eb9222e161e9e52be9c2384e1b1ff7566c640bc5b30c054efd64b081e7',
                '0x20f86c018505d21dba0083015f909440efcb7d744fdc881f698a8ec573999fe63835458201c0f847f845820fe9a0935584330d98f4a8a1cf83bf81ea7a18e33a962ad17b6a9eb8e04e3f5f95179da026804e07b5c105427497e8336300c1435d30ffa8d379dc27e5c1facd966c58db',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignedRawTransactions(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x20f8fa018505d21dba0083015f909440efcb7d744fdc881f698a8ec573999fe63835458201c0f8d5f845820fe9a0f2a83743da6931ce25a29d04f1c51cec8464f0d9d4dabb5acb059aa3fb8c345aa065879e06474669005e02e0b8ca06cba6f8943022305659f8936f1f6109147fddf845820feaa0638f0d712b4b709cadab174dea6da50e5429ea59d78446e810af954af8d67981a0129ad4eb9222e161e9e52be9c2384e1b1ff7566c640bc5b30c054efd64b081e7f845820fe9a0935584330d98f4a8a1cf83bf81ea7a18e33a962ad17b6a9eb8e04e3f5f95179da026804e07b5c105427497e8336300c1435d30ffa8d379dc27e5c1facd966c58db'

            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0xf2a83743da6931ce25a29d04f1c51cec8464f0d9d4dabb5acb059aa3fb8c345a',
                    '0x65879e06474669005e02e0b8ca06cba6f8943022305659f8936f1f6109147fdd',
                ],
                [
                    '0x0fea',
                    '0x638f0d712b4b709cadab174dea6da50e5429ea59d78446e810af954af8d67981',
                    '0x129ad4eb9222e161e9e52be9c2384e1b1ff7566c640bc5b30c054efd64b081e7',
                ],
                [
                    '0x0fe9',
                    '0x935584330d98f4a8a1cf83bf81ea7a18e33a962ad17b6a9eb8e04e3f5f95179d',
                    '0x26804e07b5c105427497e8336300c1435d30ffa8d379dc27e5c1facd966c58db',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTION-180: If decode transaction has different values, combineSignedRawTransactions should throw error', () => {
            const tx = caver.transaction.accountUpdate.create(combinedTarget)
            tx.nonce = 1234

            const rlpEncoded =
                '0x20f86c018505d21dba0083015f909440efcb7d744fdc881f698a8ec573999fe63835458201c0f847f845820feaa0638f0d712b4b709cadab174dea6da50e5429ea59d78446e810af954af8d67981a0129ad4eb9222e161e9e52be9c2384e1b1ff7566c640bc5b30c054efd64b081e7'
            const expectedError = `Transactions containing different information cannot be combined.`

            expect(() => tx.combineSignedRawTransactions([rlpEncoded])).to.throw(expectedError)
        })
    })

    context('accountUpdate.getRawTransaction', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-181: getRawTransaction should call getRLPEncoding function', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.accountUpdate.create(expectedValues[i].tx)

                const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

                const expected = expectedValues[i].rlpEncoding
                const rawTransaction = tx.getRawTransaction()

                expect(getRLPEncodingSpy).to.have.been.calledOnce
                expect(rawTransaction).to.equal(expected)
            }
        })
    })

    context('accountUpdate.getTransactionHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-182: getTransactionHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.accountUpdate.create(expectedValues[i].tx)

                const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

                const expected = expectedValues[i].transactionHash
                const txHash = tx.getTransactionHash()

                expect(getRLPEncodingSpy).to.have.been.calledOnce
                expect(txHash).to.equal(expected)
                expect(caver.utils.isValidHashStrict(txHash)).to.be.true
            }
        })

        it('CAVERJS-UNIT-TRANSACTION-183: getTransactionHash should throw error when nonce is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.accountUpdate.create(expectedValues[i].tx)
                delete tx._nonce

                const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getTransactionHash()).to.throw(expectedError)
            }
        })

        it('CAVERJS-UNIT-TRANSACTION-184: getTransactionHash should throw error when gasPrice is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.accountUpdate.create(expectedValues[i].tx)
                delete tx._gasPrice

                const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getTransactionHash()).to.throw(expectedError)
            }
        })
    })

    context('accountUpdate.getSenderTxHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-186: getSenderTxHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.accountUpdate.create(expectedValues[i].tx)

                const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

                const expected = expectedValues[i].senderTxHash
                const senderTxHash = tx.getSenderTxHash()

                expect(getRLPEncodingSpy).to.have.been.calledOnce
                expect(senderTxHash).to.equal(expected)
                expect(caver.utils.isValidHashStrict(senderTxHash)).to.be.true
            }
        })

        it('CAVERJS-UNIT-TRANSACTION-187: getSenderTxHash should throw error when nonce is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.accountUpdate.create(expectedValues[i].tx)
                delete tx._nonce

                const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getSenderTxHash()).to.throw(expectedError)
            }
        })

        it('CAVERJS-UNIT-TRANSACTION-188: getSenderTxHash should throw error when gasPrice is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.accountUpdate.create(expectedValues[i].tx)
                delete tx._gasPrice

                const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getSenderTxHash()).to.throw(expectedError)
            }
        })
    })

    context('accountUpdate.getRLPEncodingForSignature', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTION-190: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.accountUpdate.create(expectedValues[i].tx)

                const commonRLPForSigningSpy = sandbox.spy(tx, 'getCommonRLPEncodingForSignature')

                const expected = expectedValues[i].rlpEncodingForSigning
                const rlpEncodingForSign = tx.getRLPEncodingForSignature()

                expect(rlpEncodingForSign).to.equal(expected)
                expect(commonRLPForSigningSpy).to.have.been.calledOnce
            }
        })

        it('CAVERJS-UNIT-TRANSACTION-191: getRLPEncodingForSignature should throw error when nonce is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.accountUpdate.create(expectedValues[i].tx)
                delete tx._nonce

                const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
            }
        })

        it('CAVERJS-UNIT-TRANSACTION-192: getRLPEncodingForSignature should throw error when gasPrice is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.accountUpdate.create(expectedValues[i].tx)
                delete tx._gasPrice

                const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
            }
        })

        it('CAVERJS-UNIT-TRANSACTION-193: getRLPEncodingForSignature should throw error when chainId is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.accountUpdate.create(expectedValues[i].tx)
                delete tx._chainId

                const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
            }
        })
    })

    context('accountUpdate.getCommonRLPEncodingForSignature', () => {
        it('CAVERJS-UNIT-TRANSACTION-194: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.accountUpdate.create(expectedValues[i].tx)

                const expected = expectedValues[i].rlpEncodingCommon
                const commonRLPForSign = tx.getCommonRLPEncodingForSignature()

                expect(commonRLPForSign).to.equal(expected)
            }
        })
    })

    context('accountUpdate.fillTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTION-195: fillTransaction should call klay_getGasPrice to fill gasPrice when gasPrice is undefined', async () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.accountUpdate.create(expectedValues[i].tx)
                delete tx._gasPrice

                await tx.fillTransaction()
                expect(getNonceSpy).not.to.have.been.calledOnce
                expect(getChainIdSpy).not.to.have.been.calledOnce
            }
            expect(getGasPriceSpy).to.have.been.callCount(Object.values(expectedValues).length)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-196: fillTransaction should call klay_getTransactionCount to fill nonce when nonce is undefined', async () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.accountUpdate.create(expectedValues[i].tx)
                delete tx._nonce

                await tx.fillTransaction()
                expect(getGasPriceSpy).not.to.have.been.calledOnce
                expect(getChainIdSpy).not.to.have.been.calledOnce
            }
            expect(getNonceSpy).to.have.been.callCount(Object.values(expectedValues).length)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTION-197: fillTransaction should call klay_getChainid to fill chainId when chainId is undefined', async () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.accountUpdate.create(expectedValues[i].tx)
                delete tx._chainId

                await tx.fillTransaction()
                expect(getGasPriceSpy).not.to.have.been.calledOnce
                expect(getNonceSpy).not.to.have.been.calledOnce
            }
            expect(getChainIdSpy).to.have.been.callCount(Object.values(expectedValues).length)
        }).timeout(200000)
    })

    context('accountUpdate.recoverPublicKeys', () => {
        const expectedPublicKeyArray = [
            '0x8bb6aaeb2d96d024754d3b50babf116cece68977acbe8ba6a66f14d5217c60d96af020a0568661e7c72e753e80efe084a3aed9f9ac87bf44d09ce67aad3d4e01',
            '0xc7751c794337a93e4db041fb5401c2c816cf0a099d8fd4b1f3f555aab5dfead2417521bb0c03d8637f350df15ef6a6cb3cdb806bd9d10bc71982dd03ff5d9ddd',
            '0x3919091ba17c106dd034af508cfe00b963d173dffab2c7702890e25a96d107ca1bb4f148ee1984751e57d2435468558193ce84ab9a7731b842e9672e40dc0f22',
        ]

        it('CAVERJS-UNIT-TRANSACTION-424: should return public key string recovered from signatures in AccountUpdate', async () => {
            const tx = caver.transaction.accountUpdate.create({
                from: '0xf21460730845e3652aa3cc9bc13b345e4f53984a',
                chainId: '0x7e3',
                gasPrice: '0x5d21dba00',
                nonce: '0x0',
                gas: '0x2faf080',
                account: caver.account.createWithAccountKeyLegacy('0xf21460730845e3652aa3cc9bc13b345e4f53984a'),
                signatures: [
                    [
                        '0x0fea',
                        '0x84299d74e8b491d7272d86b5ff4f4f4605830406befd360c90adaae56af99359',
                        '0x196240cda43810ba4c19dd865435b991a9c16a91859357777594fb9e77d02d01',
                    ],
                    [
                        '0x0fea',
                        '0xaf27d2163b85e3de5f8b7fee56df509be231d3935890515bfe783e2f38c1c092',
                        '0x1b5d6ff80bd3964ce311c658cdeac0e43a2171a87bb287695c9be2b3517651e9',
                    ],
                    [
                        '0x0fea',
                        '0xf17ec890c3eeae90702f811b4bb880c6631913bb307207bf0bccbcdc229f571a',
                        '0x6f2f203218cc8ddbab785cd59dec47105c7919ab4192295c8307c9a0701605ed',
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
