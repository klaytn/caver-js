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

const _ = require('lodash')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

const testRPCURL = require('../testrpc')

const Caver = require('../../index')
const utils = require('../../packages/caver-utils')

const AccountKeyLegacy = require('../../packages/caver-account/src/accountKey/accountKeyLegacy')
const AccountKeyPublic = require('../../packages/caver-account/src/accountKey/accountKeyPublic')
const AccountKeyFail = require('../../packages/caver-account/src/accountKey/accountKeyFail')
const AccountKeyWeightedMultiSig = require('../../packages/caver-account/src/accountKey/accountKeyWeightedMultiSig')
const AccountKeyRoleBased = require('../../packages/caver-account/src/accountKey/accountKeyRoleBased')

const { ACCOUNT_KEY_TAG } = require('../../packages/caver-account/src/accountKey/accountKeyHelper')

let caver

beforeEach(() => {
    caver = new Caver(testRPCURL)
})

function testAccountKey(accountKey, expectedAccountKeyType, options = {}) {
    const { expectedAccountKey, exepectedOptions } = options
    switch (expectedAccountKeyType) {
        case 'AccountKeyLegacy':
            expect(accountKey instanceof AccountKeyLegacy).to.be.true
            break
        case 'AccountKeyPublic':
            testAccountKeyPublic(accountKey, expectedAccountKey)
            break
        case 'AccountKeyFail':
            expect(accountKey instanceof AccountKeyFail).to.be.true
            break
        case 'AccountKeyWeightedMultiSig':
            testAccountKeyWeightedMultiSig(accountKey, expectedAccountKey, exepectedOptions)
            break
        case 'AccountKeyRoleBased':
            expect(accountKey instanceof AccountKeyRoleBased).to.be.true
            for (let i = 0; i < accountKey.accountKeys.length; i++) {
                const acctKey = accountKey.accountKeys[i]
                if (acctKey instanceof AccountKeyLegacy) {
                    expectedAccountKey[i] = _.isArray(expectedAccountKey[i]) ? expectedAccountKey[i][0] : expectedAccountKey[i]
                    expect(expectedAccountKey[i] instanceof AccountKeyLegacy)
                } else if (acctKey instanceof AccountKeyFail) {
                    expectedAccountKey[i] = _.isArray(expectedAccountKey[i]) ? expectedAccountKey[i][0] : expectedAccountKey[i]
                    expect(expectedAccountKey[i] instanceof AccountKeyFail)
                } else if (acctKey instanceof AccountKeyPublic) {
                    testAccountKeyPublic(acctKey, expectedAccountKey[i][0])
                } else if (acctKey instanceof AccountKeyWeightedMultiSig) {
                    testAccountKeyWeightedMultiSig(acctKey, expectedAccountKey[i], exepectedOptions[i])
                } else if (acctKey === undefined) {
                    // AccountKeyNil case in AccountKeyRoleBased
                    expect(expectedAccountKey[i].length).to.equal(0)
                    if (exepectedOptions) {
                        expect(Object.keys(exepectedOptions[i]).length).to.equal(0)
                    }
                } else {
                    throw new Error(`Something wrong`)
                }
            }
            break
    }
}

function testAccountKeyPublic(key, singlePubKey) {
    expect(key instanceof AccountKeyPublic).to.be.true
    checkEqualWithPublicKey(key.publicKey, singlePubKey)
}

function testAccountKeyWeightedMultiSig(key, multiplePubKeys, options) {
    expect(key instanceof AccountKeyWeightedMultiSig).to.be.true
    if (options) {
        expect(key.threshold).to.equal(options.threshold)
    }
    for (let i = 0; i < key.weightedPublicKeys.length; i++) {
        checkEqualWithPublicKey(key.weightedPublicKeys[i].publicKey, multiplePubKeys[i])
        if (options) {
            expect(key.weightedPublicKeys[i].weight).to.equal(options.weights[i])
        }
    }
}

function checkEqualWithPublicKey(pub1, pub2) {
    const publicKey = [pub1, pub2]
    if (!caver.utils.isCompressedPublicKey(publicKey[0])) publicKey[0] = utils.compressPublicKey(publicKey[0])
    if (!caver.utils.isCompressedPublicKey(publicKey[1])) publicKey[1] = utils.compressPublicKey(publicKey[1])
    expect(publicKey[0]).to.equal(publicKey[1])
}

describe('caver.account.accountKey.accountKeyLegacy', () => {
    context('CAVERJS-UNIT-ACCOUNT-028: caver.account.accountKey.accountKeyLegacy.decode', () => {
        it('should decode RLP-encoded string and return AccountLegacy instances', () => {
            const accountKey = caver.account.accountKey.accountKeyLegacy.decode(ACCOUNT_KEY_TAG.ACCOUNT_KEY_LEGACY_TAG)

            testAccountKey(accountKey, 'AccountKeyLegacy')
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-029: caver.account.accountKey.accountKeyLegacy.decode', () => {
        it('should throw error if RLP-encoded string prefix is not matched with type tag', () => {
            const invalid = '0x02b0'
            const expectedError = `Cannot decode to AccountKeyLegacy. The prefix must be ${ACCOUNT_KEY_TAG.ACCOUNT_KEY_LEGACY_TAG}: ${invalid}`
            expect(() => caver.account.accountKey.accountKeyLegacy.decode(invalid)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-030: accountKeyLegacy.getRLPEncoding', () => {
        it('should return RLP-encoded accountLegacy string', () => {
            const accountKey = new caver.account.accountKey.accountKeyLegacy()

            expect(accountKey.getRLPEncoding()).to.equal(ACCOUNT_KEY_TAG.ACCOUNT_KEY_LEGACY_TAG)
        })
    })
})

describe('caver.account.accountKey.accountKeyPublic', () => {
    context('CAVERJS-UNIT-ACCOUNT-031: caver.account.accountKey.accountKeyPublic.decode', () => {
        it('should decode RLP-encoded string and return AccountKeyPublic instances', () => {
            const expectedAccountKey =
                '0xc10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9803a1898f45b2770eda7abce70e8503b5e82b748ec0ce557ac9f4f4796965e4e'
            const accountKey = caver.account.accountKey.accountKeyPublic.decode(
                '0x02a102c10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9'
            )

            testAccountKey(accountKey, 'AccountKeyPublic', { expectedAccountKey })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-032: caver.account.accountKey.accountKeyPublic.decode', () => {
        it('should throw error if RLP-encoded string prefix is not matched with type tag', () => {
            const invalid = '0x03c002c10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9'
            const expectedError = `Cannot decode to AccountKeyPublic. The prefix must be ${ACCOUNT_KEY_TAG.ACCOUNT_KEY_PUBLIC_TAG}: ${invalid}`
            expect(() => caver.account.accountKey.accountKeyPublic.decode(invalid)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-033: caver.account.accountKey.accountKeyPublic.fromXYPoint', () => {
        it('should create AccountKeyPublic instance and return', () => {
            const pubKey =
                '0x022dfe0d7c496d954037ab15afd3352008f6c5bfe972850b7b321e96721f4bf11f7e6aa508dd50af53e190dcd4a2559aa1c3ef3f78b97b97e2928ac33e038464'
            const [x, y] = caver.utils.xyPointFromPublicKey(pubKey)
            const accountKey = caver.account.accountKey.accountKeyPublic.fromXYPoint(x, y)

            testAccountKey(accountKey, 'AccountKeyPublic', { expectedAccountKey: pubKey })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-034: caver.account.accountKey.accountKeyPublic.fromPublicKey', () => {
        it('should create AccountKeyPublic instance and return with uncompressed public key string', () => {
            const pubKey =
                '0x022dfe0d7c496d954037ab15afd3352008f6c5bfe972850b7b321e96721f4bf11f7e6aa508dd50af53e190dcd4a2559aa1c3ef3f78b97b97e2928ac33e038464'
            const accountKey = caver.account.accountKey.accountKeyPublic.fromPublicKey(pubKey)

            testAccountKey(accountKey, 'AccountKeyPublic', { expectedAccountKey: pubKey })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-035: caver.account.accountKey.accountKeyPublic.fromPublicKey', () => {
        it('should create AccountKeyPublic instance and return with compressed public key string', () => {
            const pubKey = '0x02022dfe0d7c496d954037ab15afd3352008f6c5bfe972850b7b321e96721f4bf1'
            const accountKey = caver.account.accountKey.accountKeyPublic.fromPublicKey(pubKey)

            testAccountKey(accountKey, 'AccountKeyPublic', { expectedAccountKey: pubKey })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-036: accountKeyPublic.getRLPEncoding', () => {
        it('should return RLP-encoded accountLegacy string', () => {
            const pubKey =
                '0xc10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9803a1898f45b2770eda7abce70e8503b5e82b748ec0ce557ac9f4f4796965e4e'
            const expectedString = '0x02a102c10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9'
            const accountKey = new caver.account.accountKey.accountKeyPublic(pubKey)

            expect(accountKey.getRLPEncoding()).to.equal(expectedString)
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-037: accountKeyPublic.getXYPoint', () => {
        it('should return x, y point', () => {
            const pubKey =
                '0x022dfe0d7c496d954037ab15afd3352008f6c5bfe972850b7b321e96721f4bf11f7e6aa508dd50af53e190dcd4a2559aa1c3ef3f78b97b97e2928ac33e038464'
            const [x, y] = caver.utils.xyPointFromPublicKey(pubKey)
            const accountKey = caver.account.accountKey.accountKeyPublic.fromXYPoint(x, y)

            const xyPoints = accountKey.getXYPoint()

            expect(xyPoints[0]).to.equal(x)
            expect(xyPoints[1]).to.equal(y)
        })
    })
})

describe('caver.account.accountKey.accountKeyFail', () => {
    context('CAVERJS-UNIT-ACCOUNT-038: caver.account.accountKey.accountKeyFail.decode', () => {
        it('should decode RLP-encoded string and return AccountKeyFail instances', () => {
            const accountKey = caver.account.accountKey.accountKeyFail.decode(ACCOUNT_KEY_TAG.ACCOUNT_KEY_FAIL_TAG)

            testAccountKey(accountKey, 'AccountKeyFail')
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-039: caver.account.accountKey.accountKeyFail.decode', () => {
        it('should throw error if RLP-encoded string prefix is not matched with type tag', () => {
            const invalid = '0x02b0'
            const expectedError = `Cannot decode to AccountKeyFail. The prefix must be ${ACCOUNT_KEY_TAG.ACCOUNT_KEY_FAIL_TAG}: ${invalid}`
            expect(() => caver.account.accountKey.accountKeyFail.decode(invalid)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-040: accountKeyFail.getRLPEncoding', () => {
        it('should return RLP-encoded accountLegacy string', () => {
            const accountKey = new caver.account.accountKey.accountKeyFail()

            expect(accountKey.getRLPEncoding()).to.equal(ACCOUNT_KEY_TAG.ACCOUNT_KEY_FAIL_TAG)
        })
    })
})

describe('caver.account.accountKey.accountKeyWeightedMultiSig', () => {
    context('CAVERJS-UNIT-ACCOUNT-041: caver.account.accountKey.accountKeyWeightedMultiSig.decode', () => {
        it('should decode RLP-encoded string and return AccountKeyWeightedMultiSig instances', () => {
            const expectedAccountKey = [
                '0xc10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9803a1898f45b2770eda7abce70e8503b5e82b748ec0ce557ac9f4f4796965e4e',
                '0x1769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c12a4d0eeb91d7bd5d592653d43dd0593cfe24cb20a5dbef05832932e7c7191bf6',
            ]
            const exepectedOptions = new caver.account.weightedMultiSigOptions(2, [1, 1])
            const accountKey = caver.account.accountKey.accountKeyWeightedMultiSig.decode(
                '0x04f84b02f848e301a102c10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9e301a1021769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c1'
            )

            testAccountKey(accountKey, 'AccountKeyWeightedMultiSig', { expectedAccountKey, exepectedOptions })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-042: caver.account.accountKey.accountKeyWeightedMultiSig.decode', () => {
        it('should throw error if RLP-encoded string prefix is not matched with type tag', () => {
            const invalid =
                '0x05f84b02f848e301a102c10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9e301a1021769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c1'
            const expectedError = `Cannot decode to AccountKeyWeightedMultiSig. The prefix must be ${ACCOUNT_KEY_TAG.ACCOUNT_KEY_WEIGHTED_MULTISIG_TAG}: ${invalid}`
            expect(() => caver.account.accountKey.accountKeyWeightedMultiSig.decode(invalid)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-043: caver.account.accountKey.accountKeyWeightedMultiSig.fromPublicKeysAndOptions', () => {
        it('should create AccountKeyWeightedMultiSig instances and return', () => {
            const publicArray = [
                '0xc10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9803a1898f45b2770eda7abce70e8503b5e82b748ec0ce557ac9f4f4796965e4e',
                '0x1769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c12a4d0eeb91d7bd5d592653d43dd0593cfe24cb20a5dbef05832932e7c7191bf6',
            ]
            const options = new caver.account.weightedMultiSigOptions(2, [1, 1])
            const accountKey = caver.account.accountKey.accountKeyWeightedMultiSig.fromPublicKeysAndOptions(publicArray, options)

            testAccountKey(accountKey, 'AccountKeyWeightedMultiSig', { expectedAccountKey: publicArray, exepectedOptions: options })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-058: caver.account.accountKey.accountKeyWeightedMultiSig.fromPublicKeysAndOptions', () => {
        it('should create AccountKeyWeightedMultiSig instances and return when options is not weightedMultiSigOptions instance', () => {
            const publicArray = [
                '0xc10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9803a1898f45b2770eda7abce70e8503b5e82b748ec0ce557ac9f4f4796965e4e',
                '0x1769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c12a4d0eeb91d7bd5d592653d43dd0593cfe24cb20a5dbef05832932e7c7191bf6',
            ]
            const options = { threshold: 2, weights: [1, 1] }
            const accountKey = caver.account.accountKey.accountKeyWeightedMultiSig.fromPublicKeysAndOptions(publicArray, options)

            testAccountKey(accountKey, 'AccountKeyWeightedMultiSig', { expectedAccountKey: publicArray, exepectedOptions: options })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-059: caver.account.accountKey.accountKeyWeightedMultiSig.fromPublicKeysAndOptions', () => {
        it('should create AccountKeyWeightedMultiSig instances and return when options is in previous options format', () => {
            const publicArray = [
                '0xc10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9803a1898f45b2770eda7abce70e8503b5e82b748ec0ce557ac9f4f4796965e4e',
                '0x1769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c12a4d0eeb91d7bd5d592653d43dd0593cfe24cb20a5dbef05832932e7c7191bf6',
            ]
            const options = { threshold: 2, weight: [1, 1] }
            const accountKey = caver.account.accountKey.accountKeyWeightedMultiSig.fromPublicKeysAndOptions(publicArray, options)

            testAccountKey(accountKey, 'AccountKeyWeightedMultiSig', { expectedAccountKey: publicArray, exepectedOptions: options })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-044: caver.account.accountKey.accountKeyWeightedMultiSig.fromPublicKeysAndOptions', () => {
        it('should throw error if options is not valid', () => {
            const publicArray = [
                '0xc10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9803a1898f45b2770eda7abce70e8503b5e82b748ec0ce557ac9f4f4796965e4e',
                '0x1769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c12a4d0eeb91d7bd5d592653d43dd0593cfe24cb20a5dbef05832932e7c7191bf6',
            ]

            let options = { weights: [1, 1] }
            let expectedError = `Invalid object for creating WeightedMultiSigOptions. 'threshold' and 'weights' should be defined.`
            expect(() => caver.account.accountKey.accountKeyWeightedMultiSig.fromPublicKeysAndOptions(publicArray, options)).to.throw(
                expectedError
            )

            options = { threshold: 1 }
            expect(() => caver.account.accountKey.accountKeyWeightedMultiSig.fromPublicKeysAndOptions(publicArray, options)).to.throw(
                expectedError
            )

            options = { threshold: 1, weights: 1 }
            expectedError = `weight should be an array that stores the weight of each public key.`
            expect(() => caver.account.accountKey.accountKeyWeightedMultiSig.fromPublicKeysAndOptions(publicArray, options)).to.throw(
                expectedError
            )

            options = { threshold: 1, weights: [1, 1, 1] }
            expectedError = `The length of public keys is not equal to the length of weight array.`
            expect(() => caver.account.accountKey.accountKeyWeightedMultiSig.fromPublicKeysAndOptions(publicArray, options)).to.throw(
                expectedError
            )
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-045: caver.account.accountKey.accountKeyWeightedMultiSig.fromPublicKeysAndOptions', () => {
        it('should throw error if sum of weight is less than threshold', () => {
            const publicArray = [
                '0xc10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9803a1898f45b2770eda7abce70e8503b5e82b748ec0ce557ac9f4f4796965e4e',
                '0x1769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c12a4d0eeb91d7bd5d592653d43dd0593cfe24cb20a5dbef05832932e7c7191bf6',
            ]
            const options = { threshold: 5, weights: [1, 1] }
            const expectedError = `Invalid options for AccountKeyWeightedMultiSig: The sum of weights is less than the threshold.`
            expect(() => caver.account.accountKey.accountKeyWeightedMultiSig.fromPublicKeysAndOptions(publicArray, options)).to.throw(
                expectedError
            )
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-062: caver.account.accountKey.accountKeyWeightedMultiSig.fromPublicKeysAndOptions', () => {
        it('should create an instance with default options', () => {
            const publicArray = [
                '0xc10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9803a1898f45b2770eda7abce70e8503b5e82b748ec0ce557ac9f4f4796965e4e',
                '0x1769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c12a4d0eeb91d7bd5d592653d43dd0593cfe24cb20a5dbef05832932e7c7191bf6',
            ]
            const options = { threshold: 1, weights: [1, 1] }
            const accountKey = caver.account.accountKey.accountKeyWeightedMultiSig.fromPublicKeysAndOptions(publicArray)

            testAccountKey(accountKey, 'AccountKeyWeightedMultiSig', { expectedAccountKey: publicArray, exepectedOptions: options })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-046: accountKeyWeightedMultiSig.getRLPEncoding', () => {
        it('should return RLP-encoded AccountKeyWeightedMultiSig string', () => {
            const publicArray = [
                '0xc10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9803a1898f45b2770eda7abce70e8503b5e82b748ec0ce557ac9f4f4796965e4e',
                '0x1769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c12a4d0eeb91d7bd5d592653d43dd0593cfe24cb20a5dbef05832932e7c7191bf6',
            ]
            const encoded =
                '0x04f84b02f848e301a102c10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9e301a1021769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c1'
            const options = new caver.account.weightedMultiSigOptions(2, [1, 1])
            const accountKey = caver.account.accountKey.accountKeyWeightedMultiSig.fromPublicKeysAndOptions(publicArray, options)

            expect(accountKey.getRLPEncoding()).to.equal(encoded)
        })
    })
})

describe('caver.account.accountKey.accountKeyRoleBased', () => {
    context('CAVERJS-UNIT-ACCOUNT-047: caver.account.accountKey.accountKeyRoleBased.decode', () => {
        it('should decode RLP-encoded string and return AccountKeyRoleBased instances', () => {
            const expectedAccountKey = [
                [
                    '0x6250dad4985bc22c8b9b84d1a05624c4daa0e83c8ae8fb35702d9024a8c14a7117bc107912634970e82bc5450d28d6d1dcfa03f7d759d06b6be5ba96efd9eb95',
                ],
                [
                    '0xc10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9803a1898f45b2770eda7abce70e8503b5e82b748ec0ce557ac9f4f4796965e4e',
                    '0x1769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c12a4d0eeb91d7bd5d592653d43dd0593cfe24cb20a5dbef05832932e7c7191bf6',
                ],
                [
                    '0xe7615d056e770b3262e5b39a4823c3124989924ed4dcfab13f10b252701540d4958423c3e2c2a45a9e0e4671b078c8763c3724416f3c6443279ebb9b967ab055',
                    '0x6f21d60c16200d99e6777422470b3122b65850d5135a5a4b41344a5607a1446d3a16e2e0f06d767ca158a1daf2463d78012287fd6503d1546229fdb1af532083',
                ],
            ]
            const exepectedOptions = [
                new caver.account.weightedMultiSigOptions(),
                new caver.account.weightedMultiSigOptions(2, [1, 1]),
                new caver.account.weightedMultiSigOptions(1, [1, 1]),
            ]
            const accountKey = caver.account.accountKey.accountKeyRoleBased.decode(
                '0x05f8c4a302a1036250dad4985bc22c8b9b84d1a05624c4daa0e83c8ae8fb35702d9024a8c14a71b84e04f84b02f848e301a102c10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9e301a1021769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c1b84e04f84b01f848e301a103e7615d056e770b3262e5b39a4823c3124989924ed4dcfab13f10b252701540d4e301a1036f21d60c16200d99e6777422470b3122b65850d5135a5a4b41344a5607a1446d'
            )

            testAccountKey(accountKey, 'AccountKeyRoleBased', { expectedAccountKey, exepectedOptions })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-048: caver.account.accountKey.accountKeyRoleBased.decode', () => {
        it('should decode RLP-encoded string and return AccountKeyRoleBased instances with AccountKeyNil', () => {
            const expectedAccountKey = [
                [
                    '0x6250dad4985bc22c8b9b84d1a05624c4daa0e83c8ae8fb35702d9024a8c14a7117bc107912634970e82bc5450d28d6d1dcfa03f7d759d06b6be5ba96efd9eb95',
                ],
                [],
                [
                    '0xe7615d056e770b3262e5b39a4823c3124989924ed4dcfab13f10b252701540d4958423c3e2c2a45a9e0e4671b078c8763c3724416f3c6443279ebb9b967ab055',
                    '0x6f21d60c16200d99e6777422470b3122b65850d5135a5a4b41344a5607a1446d3a16e2e0f06d767ca158a1daf2463d78012287fd6503d1546229fdb1af532083',
                ],
            ]
            const exepectedOptions = [
                new caver.account.weightedMultiSigOptions(),
                new caver.account.weightedMultiSigOptions(),
                new caver.account.weightedMultiSigOptions(1, [1, 1]),
            ]
            const accountKey = caver.account.accountKey.accountKeyRoleBased.decode(
                '0x05f876a302a1036250dad4985bc22c8b9b84d1a05624c4daa0e83c8ae8fb35702d9024a8c14a718180b84e04f84b01f848e301a103e7615d056e770b3262e5b39a4823c3124989924ed4dcfab13f10b252701540d4e301a1036f21d60c16200d99e6777422470b3122b65850d5135a5a4b41344a5607a1446d'
            )

            testAccountKey(accountKey, 'AccountKeyRoleBased', { expectedAccountKey, exepectedOptions })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-049: caver.account.accountKey.accountKeyRoleBased.decode', () => {
        it('should throw error if RLP-encoded string prefix is not matched with type tag', () => {
            const invalid =
                '0x04f8c4a302a1036250dad4985bc22c8b9b84d1a05624c4daa0e83c8ae8fb35702d9024a8c14a71b84e04f84b02f848e301a102c10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9e301a1021769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c1b84e04f84b01f848e301a103e7615d056e770b3262e5b39a4823c3124989924ed4dcfab13f10b252701540d4e301a1036f21d60c16200d99e6777422470b3122b65850d5135a5a4b41344a5607a1446d'
            const expectedError = `Cannot decode to AccountKeyRoleBased. The prefix must be ${ACCOUNT_KEY_TAG.ACCOUNT_KEY_ROLE_BASED_TAG}: ${invalid}`
            expect(() => caver.account.accountKey.accountKeyRoleBased.decode(invalid)).to.throw(expectedError)
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-050: caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions', () => {
        it('should create AccountKeyRoleBased instances and return with uncompressed public key strings', () => {
            const pubs = [
                [
                    '0xb86b2787e8c7accd7d2d82678c9bef047a0aafd72a6e690817506684e8513c9af36becba90c8de06fd06da16492263267a63720985f94fc5a027d0a26d25e6ae',
                    '0xe4d4901155edabc2bd5b356c63e58af20fe0a74e5f210de6396b74094f40215d3bc4d619872b96c091c741a15736a7ef12f530b7593038bbbfbf6c35deee8a34',
                ],
                [
                    '0x1a909c4d7dbb5281b1d1b55e79a1b2568111bd2830246c3173ce824000eb8716afe39b6106fb9db360fb5779e2d346c8328698174831941586b11bdc3e755905',
                    '0x1427ac6351bbfc15811e8e5389a674b01d7a2c253e69a6ed30a33583864368f65f63b92fd60be61c5d176ae1771e7738e6a043af814b9af5d81137df29ee95f2',
                    '0x90fe4bb78bc981a40874ebcff2f9de4eba1e59ecd7a271a37814413720a3a5ea5fa9bd7d8bc5c66a9a08d77563458b004bbd1d594a3a12ef108cdc7c04c525a6',
                ],
                [
                    '0x91245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02f2b0870653417943e795e7c8694c4f8be8af865b7a0224d1dec0bf8a1bf1b5a6',
                    '0x77e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f3570b1a104b67d1cd169bbf61dd557f15ab5ee8b661326096954caddadf34ae6ac8',
                    '0xd3bb14320d87eed081ae44740b5abbc52bac2c7ccf85b6281a0fc69f3ba4c171cc4bd2ba7f0c969cd72bfa49c854d8ac2cf3d0edea7f0ce0fd31cf080374935d',
                    '0xcfa4d1bee51e59e6842b136ff95b9d01385f94bed13c4be8996c6d20cb732c3ee47cd2b6bbb917658c5fd3d02b0ddf1242b1603d1acbde7812a7d9d684ed37a9',
                ],
            ]
            const options = [
                new caver.account.weightedMultiSigOptions(2, [1, 1]),
                new caver.account.weightedMultiSigOptions(2, [1, 1, 2]),
                new caver.account.weightedMultiSigOptions(3, [1, 1, 2, 2]),
            ]
            const accountKey = caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions(pubs, options)

            testAccountKey(accountKey, 'AccountKeyRoleBased', { expectedAccountKey: pubs, exepectedOptions: options })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-051: caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions', () => {
        it('should create AccountKeyRoleBased instances and return with compressed public key strings', () => {
            const pubs = [
                [
                    '0x02b86b2787e8c7accd7d2d82678c9bef047a0aafd72a6e690817506684e8513c9a',
                    '0x02e4d4901155edabc2bd5b356c63e58af20fe0a74e5f210de6396b74094f40215d',
                ],
                [
                    '0x031a909c4d7dbb5281b1d1b55e79a1b2568111bd2830246c3173ce824000eb8716',
                    '0x021427ac6351bbfc15811e8e5389a674b01d7a2c253e69a6ed30a33583864368f6',
                    '0x0290fe4bb78bc981a40874ebcff2f9de4eba1e59ecd7a271a37814413720a3a5ea',
                ],
                [
                    '0x0291245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02',
                    '0x0277e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f357',
                    '0x03d3bb14320d87eed081ae44740b5abbc52bac2c7ccf85b6281a0fc69f3ba4c171',
                    '0x03cfa4d1bee51e59e6842b136ff95b9d01385f94bed13c4be8996c6d20cb732c3e',
                ],
            ]
            const options = [
                new caver.account.weightedMultiSigOptions(2, [1, 1]),
                new caver.account.weightedMultiSigOptions(2, [1, 1, 2]),
                new caver.account.weightedMultiSigOptions(3, [1, 1, 2, 2]),
            ]
            const accountKey = caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions(pubs, options)

            testAccountKey(accountKey, 'AccountKeyRoleBased', { expectedAccountKey: pubs, exepectedOptions: options })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-060: caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions', () => {
        it('should create AccountKeyRoleBased instances and return when options is not instance of WeightedMultiSigOptions', () => {
            const pubs = [
                [
                    '0x02b86b2787e8c7accd7d2d82678c9bef047a0aafd72a6e690817506684e8513c9a',
                    '0x02e4d4901155edabc2bd5b356c63e58af20fe0a74e5f210de6396b74094f40215d',
                ],
                [
                    '0x031a909c4d7dbb5281b1d1b55e79a1b2568111bd2830246c3173ce824000eb8716',
                    '0x021427ac6351bbfc15811e8e5389a674b01d7a2c253e69a6ed30a33583864368f6',
                    '0x0290fe4bb78bc981a40874ebcff2f9de4eba1e59ecd7a271a37814413720a3a5ea',
                ],
                [
                    '0x0291245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02',
                    '0x0277e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f357',
                    '0x03d3bb14320d87eed081ae44740b5abbc52bac2c7ccf85b6281a0fc69f3ba4c171',
                    '0x03cfa4d1bee51e59e6842b136ff95b9d01385f94bed13c4be8996c6d20cb732c3e',
                ],
            ]
            const options = [
                { threshold: 2, weights: [1, 1] },
                { threshold: 2, weights: [1, 1, 2] },
                { threshold: 3, weights: [1, 1, 2, 2] },
            ]
            const accountKey = caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions(pubs, options)

            testAccountKey(accountKey, 'AccountKeyRoleBased', { expectedAccountKey: pubs, exepectedOptions: options })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-061 caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions', () => {
        it('should create AccountKeyRoleBased instances and return when options is previous options format', () => {
            const pubs = [
                [
                    '0x02b86b2787e8c7accd7d2d82678c9bef047a0aafd72a6e690817506684e8513c9a',
                    '0x02e4d4901155edabc2bd5b356c63e58af20fe0a74e5f210de6396b74094f40215d',
                ],
                [
                    '0x031a909c4d7dbb5281b1d1b55e79a1b2568111bd2830246c3173ce824000eb8716',
                    '0x021427ac6351bbfc15811e8e5389a674b01d7a2c253e69a6ed30a33583864368f6',
                    '0x0290fe4bb78bc981a40874ebcff2f9de4eba1e59ecd7a271a37814413720a3a5ea',
                ],
                [
                    '0x0291245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02',
                    '0x0277e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f357',
                    '0x03d3bb14320d87eed081ae44740b5abbc52bac2c7ccf85b6281a0fc69f3ba4c171',
                    '0x03cfa4d1bee51e59e6842b136ff95b9d01385f94bed13c4be8996c6d20cb732c3e',
                ],
            ]
            const options = [{ threshold: 2, weight: [1, 1] }, { threshold: 2, weight: [1, 1, 2] }, { threshold: 3, weight: [1, 1, 2, 2] }]
            const accountKey = caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions(pubs, options)

            testAccountKey(accountKey, 'AccountKeyRoleBased', { expectedAccountKey: pubs, exepectedOptions: options })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-052: caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions', () => {
        it('should create AccountKeyRoleBased instances and return with AccountKeyNil', () => {
            const pubs = [
                [
                    '0xb86b2787e8c7accd7d2d82678c9bef047a0aafd72a6e690817506684e8513c9af36becba90c8de06fd06da16492263267a63720985f94fc5a027d0a26d25e6ae',
                ],
                [],
                [
                    '0x91245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02f2b0870653417943e795e7c8694c4f8be8af865b7a0224d1dec0bf8a1bf1b5a6',
                    '0x77e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f3570b1a104b67d1cd169bbf61dd557f15ab5ee8b661326096954caddadf34ae6ac8',
                    '0xd3bb14320d87eed081ae44740b5abbc52bac2c7ccf85b6281a0fc69f3ba4c171cc4bd2ba7f0c969cd72bfa49c854d8ac2cf3d0edea7f0ce0fd31cf080374935d',
                    '0xcfa4d1bee51e59e6842b136ff95b9d01385f94bed13c4be8996c6d20cb732c3ee47cd2b6bbb917658c5fd3d02b0ddf1242b1603d1acbde7812a7d9d684ed37a9',
                ],
            ]
            const options = [{}, new caver.account.weightedMultiSigOptions(), new caver.account.weightedMultiSigOptions(3, [1, 1, 2, 2])]
            const accountKey = caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions(pubs, options)

            testAccountKey(accountKey, 'AccountKeyRoleBased', { expectedAccountKey: pubs, exepectedOptions: options })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-053: caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions', () => {
        it('should throw error when options is defined with AccountKeyNil', () => {
            const pubs = [
                [
                    '0xb86b2787e8c7accd7d2d82678c9bef047a0aafd72a6e690817506684e8513c9af36becba90c8de06fd06da16492263267a63720985f94fc5a027d0a26d25e6ae',
                ],
                [],
                [
                    '0x91245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02f2b0870653417943e795e7c8694c4f8be8af865b7a0224d1dec0bf8a1bf1b5a6',
                    '0x77e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f3570b1a104b67d1cd169bbf61dd557f15ab5ee8b661326096954caddadf34ae6ac8',
                    '0xd3bb14320d87eed081ae44740b5abbc52bac2c7ccf85b6281a0fc69f3ba4c171cc4bd2ba7f0c969cd72bfa49c854d8ac2cf3d0edea7f0ce0fd31cf080374935d',
                    '0xcfa4d1bee51e59e6842b136ff95b9d01385f94bed13c4be8996c6d20cb732c3ee47cd2b6bbb917658c5fd3d02b0ddf1242b1603d1acbde7812a7d9d684ed37a9',
                ],
            ]
            const options = [
                new caver.account.weightedMultiSigOptions(),
                new caver.account.weightedMultiSigOptions(3, [1, 1, 2, 2]),
                new caver.account.weightedMultiSigOptions(3, [1, 1, 2, 2]),
            ]
            const expectedError = `Invalid options: AccountKeyNil cannot have options.`
            expect(() => caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions(pubs, options)).to.throw(
                expectedError
            )
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-054: caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions', () => {
        it('should create AccountKeyRoleBased instances and return with AccountKeyLegacy', () => {
            const pubs = [
                [new caver.account.accountKey.accountKeyLegacy()],
                [],
                [
                    '0x91245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02f2b0870653417943e795e7c8694c4f8be8af865b7a0224d1dec0bf8a1bf1b5a6',
                    '0x77e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f3570b1a104b67d1cd169bbf61dd557f15ab5ee8b661326096954caddadf34ae6ac8',
                    '0xd3bb14320d87eed081ae44740b5abbc52bac2c7ccf85b6281a0fc69f3ba4c171cc4bd2ba7f0c969cd72bfa49c854d8ac2cf3d0edea7f0ce0fd31cf080374935d',
                    '0xcfa4d1bee51e59e6842b136ff95b9d01385f94bed13c4be8996c6d20cb732c3ee47cd2b6bbb917658c5fd3d02b0ddf1242b1603d1acbde7812a7d9d684ed37a9',
                ],
            ]
            const options = [
                new caver.account.weightedMultiSigOptions(),
                new caver.account.weightedMultiSigOptions(),
                new caver.account.weightedMultiSigOptions(3, [1, 1, 2, 2]),
            ]
            const accountKey = caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions(pubs, options)

            testAccountKey(accountKey, 'AccountKeyRoleBased', { expectedAccountKey: pubs, exepectedOptions: options })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-055: caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions', () => {
        it('should create AccountKeyRoleBased instances and return with AccountKeyFail', () => {
            let pubs = [
                [new caver.account.accountKey.accountKeyFail()],
                [],
                [
                    '0x91245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02f2b0870653417943e795e7c8694c4f8be8af865b7a0224d1dec0bf8a1bf1b5a6',
                    '0x77e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f3570b1a104b67d1cd169bbf61dd557f15ab5ee8b661326096954caddadf34ae6ac8',
                    '0xd3bb14320d87eed081ae44740b5abbc52bac2c7ccf85b6281a0fc69f3ba4c171cc4bd2ba7f0c969cd72bfa49c854d8ac2cf3d0edea7f0ce0fd31cf080374935d',
                    '0xcfa4d1bee51e59e6842b136ff95b9d01385f94bed13c4be8996c6d20cb732c3ee47cd2b6bbb917658c5fd3d02b0ddf1242b1603d1acbde7812a7d9d684ed37a9',
                ],
            ]
            const options = [
                new caver.account.weightedMultiSigOptions(),
                new caver.account.weightedMultiSigOptions(),
                new caver.account.weightedMultiSigOptions(3, [1, 1, 2, 2]),
            ]
            let accountKey = caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions(pubs, options)

            testAccountKey(accountKey, 'AccountKeyRoleBased', { expectedAccountKey: pubs, exepectedOptions: options })

            // Test handling string
            pubs = [['fail'], [], ['legacy']]
            const expectedAccountKey = [
                [new caver.account.accountKey.accountKeyFail()],
                [],
                [new caver.account.accountKey.accountKeyLegacy()],
            ]
            accountKey = caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions(pubs)

            testAccountKey(accountKey, 'AccountKeyRoleBased', { expectedAccountKey })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-056: caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions', () => {
        it('should throw error when options is defined with AccountKeyLegacy or AccountKeyFail', () => {
            let pubs = [
                [new caver.account.accountKey.accountKeyLegacy()],
                [],
                [
                    '0x91245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02f2b0870653417943e795e7c8694c4f8be8af865b7a0224d1dec0bf8a1bf1b5a6',
                    '0x77e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f3570b1a104b67d1cd169bbf61dd557f15ab5ee8b661326096954caddadf34ae6ac8',
                    '0xd3bb14320d87eed081ae44740b5abbc52bac2c7ccf85b6281a0fc69f3ba4c171cc4bd2ba7f0c969cd72bfa49c854d8ac2cf3d0edea7f0ce0fd31cf080374935d',
                    '0xcfa4d1bee51e59e6842b136ff95b9d01385f94bed13c4be8996c6d20cb732c3ee47cd2b6bbb917658c5fd3d02b0ddf1242b1603d1acbde7812a7d9d684ed37a9',
                ],
            ]
            const options = [
                new caver.account.weightedMultiSigOptions(3, [1, 1, 2, 2]),
                new caver.account.weightedMultiSigOptions(),
                new caver.account.weightedMultiSigOptions(3, [1, 1, 2, 2]),
            ]
            const expectedError = `Invalid options: AccountKeyLegacy or AccountKeyFail cannot have options.`
            expect(() => caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions(pubs, options)).to.throw(
                expectedError
            )

            pubs = [
                [new caver.account.accountKey.accountKeyFail()],
                [],
                [
                    '0x91245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02f2b0870653417943e795e7c8694c4f8be8af865b7a0224d1dec0bf8a1bf1b5a6',
                    '0x77e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f3570b1a104b67d1cd169bbf61dd557f15ab5ee8b661326096954caddadf34ae6ac8',
                    '0xd3bb14320d87eed081ae44740b5abbc52bac2c7ccf85b6281a0fc69f3ba4c171cc4bd2ba7f0c969cd72bfa49c854d8ac2cf3d0edea7f0ce0fd31cf080374935d',
                    '0xcfa4d1bee51e59e6842b136ff95b9d01385f94bed13c4be8996c6d20cb732c3ee47cd2b6bbb917658c5fd3d02b0ddf1242b1603d1acbde7812a7d9d684ed37a9',
                ],
            ]
            expect(() => caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions(pubs, options)).to.throw(
                expectedError
            )
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-063: caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions', () => {
        it('should create an instance with default options', () => {
            const publicArray = [
                [
                    '0x91245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02f2b0870653417943e795e7c8694c4f8be8af865b7a0224d1dec0bf8a1bf1b5a6',
                ],
                [
                    '0xd3bb14320d87eed081ae44740b5abbc52bac2c7ccf85b6281a0fc69f3ba4c171cc4bd2ba7f0c969cd72bfa49c854d8ac2cf3d0edea7f0ce0fd31cf080374935d',
                    '0xcfa4d1bee51e59e6842b136ff95b9d01385f94bed13c4be8996c6d20cb732c3ee47cd2b6bbb917658c5fd3d02b0ddf1242b1603d1acbde7812a7d9d684ed37a9',
                ],
                [
                    '0x91245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02f2b0870653417943e795e7c8694c4f8be8af865b7a0224d1dec0bf8a1bf1b5a6',
                    '0x77e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f3570b1a104b67d1cd169bbf61dd557f15ab5ee8b661326096954caddadf34ae6ac8',
                    '0xd3bb14320d87eed081ae44740b5abbc52bac2c7ccf85b6281a0fc69f3ba4c171cc4bd2ba7f0c969cd72bfa49c854d8ac2cf3d0edea7f0ce0fd31cf080374935d',
                ],
            ]
            const options = [
                new caver.account.weightedMultiSigOptions(),
                new caver.account.weightedMultiSigOptions(1, [1, 1]),
                new caver.account.weightedMultiSigOptions(1, [1, 1, 1]),
            ]
            const accountKey = caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions(publicArray)

            testAccountKey(accountKey, 'AccountKeyRoleBased', { expectedAccountKey: publicArray, exepectedOptions: options })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-057: accountKeyRoleBased.getRLPEncoding', () => {
        it('should return RLP-encoded AccountKeyRoleBased string', () => {
            const publicArray = [
                [
                    '0x6250dad4985bc22c8b9b84d1a05624c4daa0e83c8ae8fb35702d9024a8c14a7117bc107912634970e82bc5450d28d6d1dcfa03f7d759d06b6be5ba96efd9eb95',
                ],
                [
                    '0xc10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9803a1898f45b2770eda7abce70e8503b5e82b748ec0ce557ac9f4f4796965e4e',
                    '0x1769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c12a4d0eeb91d7bd5d592653d43dd0593cfe24cb20a5dbef05832932e7c7191bf6',
                ],
                [
                    '0xe7615d056e770b3262e5b39a4823c3124989924ed4dcfab13f10b252701540d4958423c3e2c2a45a9e0e4671b078c8763c3724416f3c6443279ebb9b967ab055',
                    '0x6f21d60c16200d99e6777422470b3122b65850d5135a5a4b41344a5607a1446d3a16e2e0f06d767ca158a1daf2463d78012287fd6503d1546229fdb1af532083',
                ],
            ]
            const encoded =
                '0x05f8c4a302a1036250dad4985bc22c8b9b84d1a05624c4daa0e83c8ae8fb35702d9024a8c14a71b84e04f84b02f848e301a102c10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9e301a1021769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c1b84e04f84b01f848e301a103e7615d056e770b3262e5b39a4823c3124989924ed4dcfab13f10b252701540d4e301a1036f21d60c16200d99e6777422470b3122b65850d5135a5a4b41344a5607a1446d'
            const options = [
                new caver.account.weightedMultiSigOptions(),
                new caver.account.weightedMultiSigOptions(2, [1, 1]),
                new caver.account.weightedMultiSigOptions(1, [1, 1]),
            ]
            const accountKey = caver.account.accountKey.accountKeyRoleBased.fromRoleBasedPublicKeysAndOptions(publicArray, options)

            expect(accountKey.getRLPEncoding()).to.equal(encoded)
        })
    })
})
