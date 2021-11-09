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

const testRPCURL = require('../testrpc')

const Caver = require('../../index')
const utils = require('../../packages/caver-utils')
const Account = require('../../packages/caver-account')

const AccountKeyLegacy = require('../../packages/caver-account/src/accountKey/accountKeyLegacy')
const AccountKeyPublic = require('../../packages/caver-account/src/accountKey/accountKeyPublic')
const AccountKeyFail = require('../../packages/caver-account/src/accountKey/accountKeyFail')
const AccountKeyWeightedMultiSig = require('../../packages/caver-account/src/accountKey/accountKeyWeightedMultiSig')
const AccountKeyRoleBased = require('../../packages/caver-account/src/accountKey/accountKeyRoleBased')

let caver

beforeEach(() => {
    caver = new Caver(testRPCURL)
})

function testAccount(data, { expectedAddress, expectedAccountKeyType, expectedAccountKey, exepectedOptions }) {
    expect(data instanceof Account).to.be.true
    const objectKeys = ['_address', '_accountKey']

    expect(Object.getOwnPropertyNames(data)).to.deep.equal(objectKeys)

    expect(caver.utils.isAddress(data.address)).to.equal(true)

    if (expectedAddress !== undefined) {
        expect(data.address.toLowerCase()).to.equal(expectedAddress.toLowerCase())
    }

    if (expectedAccountKeyType !== undefined) {
        switch (expectedAccountKeyType) {
            case 'AccountKeyPublic':
                testAccountKeyPublic(data.accountKey, expectedAccountKey)
                break
            case 'AccountKeyWeightedMultiSig':
                testAccountKeyWeightedMultiSig(data.accountKey, expectedAccountKey, exepectedOptions)
                break
            case 'AccountKeyRoleBased':
                expect(data.accountKey instanceof AccountKeyRoleBased).to.be.true
                for (let i = 0; i < data.accountKey.accountKeys.length; i++) {
                    const acctKey = data.accountKey.accountKeys[i]
                    if (acctKey instanceof AccountKeyPublic) {
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

describe('caver.account.create', () => {
    context('CAVERJS-UNIT-ACCOUNT-001: address: valid address / accountKey: uncompressed public key string', () => {
        it('should generate account instances with AccountKeyPublic', () => {
            const createWithAccoutnKeyPublicSpy = sinon.spy(caver.account, 'createWithAccountKeyPublic')
            const address = '0xf43dcbb903a0b4b48a7dfa8a370a63f0a731708d'
            const pub =
                '0x1e3aec6e8bd8247aea112c3d1094566272974e56bb0151c58745847e2998ad0e5e8360b120dceea794c6cb1e4215208a78c82e8df5dcf1ac9aa73f1568ee5f2e'

            const account = caver.account.create(address, pub)

            testAccount(account, { expectedAddress: address, expectedAccountKeyType: 'AccountKeyPublic', expectedAccountKey: pub })
            expect(createWithAccoutnKeyPublicSpy).to.have.been.calledOnce
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-025: address: valid address / accountKey: compressed public key string', () => {
        it('should generate account instances with AccountKeyPublic', () => {
            const address = '0xf43dcbb903a0b4b48a7dfa8a370a63f0a731708d'
            const pub = '0x021e3aec6e8bd8247aea112c3d1094566272974e56bb0151c58745847e2998ad0e'

            const account = caver.account.create(address, pub)

            testAccount(account, { expectedAddress: address, expectedAccountKeyType: 'AccountKeyPublic', expectedAccountKey: pub })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-002: address: valid address / accountKey: RLP-encoded account key string', () => {
        it('should generate account instances with AccountKeyLegacy', () => {
            const createFromRLPEncodingSpy = sinon.spy(caver.account, 'createFromRLPEncoding')
            const address = '0xab9825316619a0720ad891135e92adb84fd74fc1'

            const rlpEncodedAccountKey = '0x01c0'
            const account = caver.account.create(address, rlpEncodedAccountKey)

            expect(account.accountKey instanceof AccountKeyLegacy).to.be.true
            expect(account.address.toLowerCase()).to.equal('0xab9825316619a0720ad891135e92adb84fd74fc1')
            expect(createFromRLPEncodingSpy).to.have.been.calledOnce
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-003: address: valid address / accountKey: uncompressed public key strings', () => {
        it('should generate account instances with AccountKeyWeightedMultiSig', () => {
            const createWithAccountKeyWeightedMultiSigSpy = sinon.spy(caver.account, 'createWithAccountKeyWeightedMultiSig')
            const address = '0xab9825316619a0720ad891135e92adb84fd74fc1'
            const pubs = [
                '0x91245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02f2b0870653417943e795e7c8694c4f8be8af865b7a0224d1dec0bf8a1bf1b5a6',
                '0x77e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f3570b1a104b67d1cd169bbf61dd557f15ab5ee8b661326096954caddadf34ae6ac8',
                '0xd3bb14320d87eed081ae44740b5abbc52bac2c7ccf85b6281a0fc69f3ba4c171cc4bd2ba7f0c969cd72bfa49c854d8ac2cf3d0edea7f0ce0fd31cf080374935d',
                '0xcfa4d1bee51e59e6842b136ff95b9d01385f94bed13c4be8996c6d20cb732c3ee47cd2b6bbb917658c5fd3d02b0ddf1242b1603d1acbde7812a7d9d684ed37a9',
            ]
            const options = new caver.account.weightedMultiSigOptions(2, [1, 1, 2, 2])

            const account = caver.account.create(address, pubs, options)

            testAccount(account, {
                expectedAddress: address,
                expectedAccountKeyType: 'AccountKeyWeightedMultiSig',
                expectedAccountKey: pubs,
                exepectedOptions: options,
            })
            expect(createWithAccountKeyWeightedMultiSigSpy).to.have.been.calledOnce
            createWithAccountKeyWeightedMultiSigSpy.restore()
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-064: address: valid address / accountKey: uncompressed public key strings', () => {
        it('should generate account instances with AccountKeyWeightedMultiSig with default options', () => {
            const createWithAccountKeyWeightedMultiSigSpy = sinon.spy(caver.account, 'createWithAccountKeyWeightedMultiSig')
            const address = '0xab9825316619a0720ad891135e92adb84fd74fc1'
            const pubs = [
                '0x91245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02f2b0870653417943e795e7c8694c4f8be8af865b7a0224d1dec0bf8a1bf1b5a6',
                '0x77e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f3570b1a104b67d1cd169bbf61dd557f15ab5ee8b661326096954caddadf34ae6ac8',
                '0xd3bb14320d87eed081ae44740b5abbc52bac2c7ccf85b6281a0fc69f3ba4c171cc4bd2ba7f0c969cd72bfa49c854d8ac2cf3d0edea7f0ce0fd31cf080374935d',
                '0xcfa4d1bee51e59e6842b136ff95b9d01385f94bed13c4be8996c6d20cb732c3ee47cd2b6bbb917658c5fd3d02b0ddf1242b1603d1acbde7812a7d9d684ed37a9',
            ]
            const options = new caver.account.weightedMultiSigOptions(1, [1, 1, 1, 1])

            const account = caver.account.create(address, pubs)

            testAccount(account, {
                expectedAddress: address,
                expectedAccountKeyType: 'AccountKeyWeightedMultiSig',
                expectedAccountKey: pubs,
                exepectedOptions: options,
            })
            expect(createWithAccountKeyWeightedMultiSigSpy).to.have.been.calledOnce
            createWithAccountKeyWeightedMultiSigSpy.restore()
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-026: address: valid address / accountKey: compressed public key strings', () => {
        it('should generate account instances with AccountKeyWeightedMultiSig', () => {
            const address = '0xab9825316619a0720ad891135e92adb84fd74fc1'
            const pubs = [
                '0x0291245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02',
                '0x0277e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f357',
                '0x03d3bb14320d87eed081ae44740b5abbc52bac2c7ccf85b6281a0fc69f3ba4c171',
                '0x03cfa4d1bee51e59e6842b136ff95b9d01385f94bed13c4be8996c6d20cb732c3e',
            ]
            const options = new caver.account.weightedMultiSigOptions(2, [1, 1, 2, 2])

            const account = caver.account.create(address, pubs, options)

            testAccount(account, {
                expectedAddress: address,
                expectedAccountKeyType: 'AccountKeyWeightedMultiSig',
                expectedAccountKey: pubs,
                exepectedOptions: options,
            })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-004: address: valid address / accountKey: role based uncompressed public key strings', () => {
        it('should generate account instances with AccountKeyRoleBased', () => {
            const createWithAccountKeyRoleBasedSpy = sinon.spy(caver.account, 'createWithAccountKeyRoleBased')
            const address = '0xab9825316619a0720ad891135e92adb84fd74fc1'
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

            const account = caver.account.create(address, pubs, options)

            testAccount(account, {
                expectedAddress: address,
                expectedAccountKeyType: 'AccountKeyRoleBased',
                expectedAccountKey: pubs,
                exepectedOptions: options,
            })
            expect(createWithAccountKeyRoleBasedSpy).to.have.been.calledOnce
            createWithAccountKeyRoleBasedSpy.restore()
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-065: address: valid address / accountKey: role based uncompressed public key strings', () => {
        it('should generate account instances with AccountKeyRoleBased with default options', () => {
            const createWithAccountKeyRoleBasedSpy = sinon.spy(caver.account, 'createWithAccountKeyRoleBased')
            const address = '0xab9825316619a0720ad891135e92adb84fd74fc1'
            const pubs = [
                [
                    '0xb86b2787e8c7accd7d2d82678c9bef047a0aafd72a6e690817506684e8513c9af36becba90c8de06fd06da16492263267a63720985f94fc5a027d0a26d25e6ae',
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
                new caver.account.weightedMultiSigOptions(),
                new caver.account.weightedMultiSigOptions(1, [1, 1, 1]),
                new caver.account.weightedMultiSigOptions(1, [1, 1, 1, 1]),
            ]

            const account = caver.account.create(address, pubs)

            testAccount(account, {
                expectedAddress: address,
                expectedAccountKeyType: 'AccountKeyRoleBased',
                expectedAccountKey: pubs,
                exepectedOptions: options,
            })
            expect(createWithAccountKeyRoleBasedSpy).to.have.been.calledOnce
            createWithAccountKeyRoleBasedSpy.restore()
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-027: address: valid address / accountKey: role based compressed public key strings', () => {
        it('should generate account instances with AccountKeyRoleBased', () => {
            const address = '0xab9825316619a0720ad891135e92adb84fd74fc1'
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

            const account = caver.account.create(address, pubs, options)

            testAccount(account, {
                expectedAddress: address,
                expectedAccountKeyType: 'AccountKeyRoleBased',
                expectedAccountKey: pubs,
                exepectedOptions: options,
            })
        })
    })
})

describe('caver.account.createFromRLPEncoding', () => {
    context('CAVERJS-UNIT-ACCOUNT-005: address: valid address / accountKey: RLP-encoded account key string(legacy)', () => {
        it('should generate account instances with AccountKeyLegacy', () => {
            const address = '0xab9825316619a0720ad891135e92adb84fd74fc1'

            const rlpEncodedAccountKey = '0x01c0'
            const account = caver.account.createFromRLPEncoding(address, rlpEncodedAccountKey)

            expect(account.accountKey instanceof AccountKeyLegacy).to.be.true
            expect(account.address.toLowerCase()).to.equal('0xab9825316619a0720ad891135e92adb84fd74fc1')
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-006: address: valid address / accountKey: RLP-encoded account key string(public)', () => {
        it('should generate account instances with AccountKeyPublic', () => {
            const address = '0xab9825316619a0720ad891135e92adb84fd74fc1'
            const expectedAccountKey =
                '0xc10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9803a1898f45b2770eda7abce70e8503b5e82b748ec0ce557ac9f4f4796965e4e'

            const rlpEncodedAccountKey = '0x02a102c10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9'
            const account = caver.account.createFromRLPEncoding(address, rlpEncodedAccountKey)
            testAccount(account, {
                expectedAddress: address,
                expectedAccountKeyType: 'AccountKeyPublic',
                expectedAccountKey,
            })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-007: address: valid address / accountKey: RLP-encoded account key string(fail)', () => {
        it('should generate account instances with accountKeyFail', () => {
            const address = '0xab9825316619a0720ad891135e92adb84fd74fc1'

            const rlpEncodedAccountKey = '0x03c0'
            const account = caver.account.createFromRLPEncoding(address, rlpEncodedAccountKey)

            expect(account.accountKey instanceof AccountKeyFail).to.be.true
            expect(account.address.toLowerCase()).to.equal('0xab9825316619a0720ad891135e92adb84fd74fc1')
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-008: address: valid address / accountKey: RLP-encoded account key string(multisig)', () => {
        it('should generate account instances with AccountKeyWeightedMultiSig', () => {
            const address = '0xab9825316619a0720ad891135e92adb84fd74fc1'
            const expectedAccountKey = [
                '0xc10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9803a1898f45b2770eda7abce70e8503b5e82b748ec0ce557ac9f4f4796965e4e',
                '0x1769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c12a4d0eeb91d7bd5d592653d43dd0593cfe24cb20a5dbef05832932e7c7191bf6',
            ]

            const rlpEncodedAccountKey =
                '0x04f84b02f848e301a102c10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9e301a1021769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c1'
            const account = caver.account.createFromRLPEncoding(address, rlpEncodedAccountKey)
            const exepectedOptions = new caver.account.weightedMultiSigOptions(2, [1, 1])

            testAccount(account, {
                expectedAddress: address,
                expectedAccountKeyType: 'AccountKeyWeightedMultiSig',
                expectedAccountKey,
                exepectedOptions,
            })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-009: address: valid address / accountKey: RLP-encoded account key string(role based)', () => {
        it('should generate account instances with AccountKeyRoleBased', () => {
            const address = '0xab9825316619a0720ad891135e92adb84fd74fc1'
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

            const rlpEncodedAccountKey =
                '0x05f8c4a302a1036250dad4985bc22c8b9b84d1a05624c4daa0e83c8ae8fb35702d9024a8c14a71b84e04f84b02f848e301a102c10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9e301a1021769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c1b84e04f84b01f848e301a103e7615d056e770b3262e5b39a4823c3124989924ed4dcfab13f10b252701540d4e301a1036f21d60c16200d99e6777422470b3122b65850d5135a5a4b41344a5607a1446d'
            const account = caver.account.createFromRLPEncoding(address, rlpEncodedAccountKey)
            const exepectedOptions = [
                new caver.account.weightedMultiSigOptions(),
                new caver.account.weightedMultiSigOptions(2, [1, 1]),
                new caver.account.weightedMultiSigOptions(1, [1, 1]),
            ]

            testAccount(account, {
                expectedAddress: address,
                expectedAccountKeyType: 'AccountKeyRoleBased',
                expectedAccountKey,
                exepectedOptions,
            })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-010: address: valid address / accountKey: RLP-encoded account key string(role based with nil)', () => {
        it('should generate account instances with AccountKeyRoleBased with AccountKeyNil', () => {
            const address = '0xab9825316619a0720ad891135e92adb84fd74fc1'
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

            const rlpEncodedAccountKey =
                '0x05f876a302a1036250dad4985bc22c8b9b84d1a05624c4daa0e83c8ae8fb35702d9024a8c14a718180b84e04f84b01f848e301a103e7615d056e770b3262e5b39a4823c3124989924ed4dcfab13f10b252701540d4e301a1036f21d60c16200d99e6777422470b3122b65850d5135a5a4b41344a5607a1446d'
            const account = caver.account.createFromRLPEncoding(address, rlpEncodedAccountKey)
            const exepectedOptions = [
                new caver.account.weightedMultiSigOptions(),
                new caver.account.weightedMultiSigOptions(),
                new caver.account.weightedMultiSigOptions(1, [1, 1]),
            ]

            testAccount(account, {
                expectedAddress: address,
                expectedAccountKeyType: 'AccountKeyRoleBased',
                expectedAccountKey,
                exepectedOptions,
            })
        })
    })
})

describe('caver.account.createWithAccountKeyLegacy', () => {
    context('CAVERJS-UNIT-ACCOUNT-011: address: valid address', () => {
        it('should generate account instances with AccountKeyLegacy', () => {
            const account = caver.account.createWithAccountKeyLegacy('0xab9825316619a0720ad891135e92adb84fd74fc1')

            expect(account.accountKey instanceof AccountKeyLegacy).to.be.true
            expect(account.address.toLowerCase()).to.equal('0xab9825316619a0720ad891135e92adb84fd74fc1')
        })
    })
})

describe('caver.account.createWithAccountKeyPublic', () => {
    context('CAVERJS-UNIT-ACCOUNT-012: address: valid address / accountKey: single uncompressed public key string', () => {
        it('should generate account instances with AccountKeyPublic', () => {
            const address = '0xf43dcbb903a0b4b48a7dfa8a370a63f0a731708d'
            const pub =
                '0x1e3aec6e8bd8247aea112c3d1094566272974e56bb0151c58745847e2998ad0e5e8360b120dceea794c6cb1e4215208a78c82e8df5dcf1ac9aa73f1568ee5f2e'

            const account = caver.account.createWithAccountKeyPublic(address, pub)

            testAccount(account, { expectedAddress: address, expectedAccountKeyType: 'AccountKeyPublic', expectedAccountKey: pub })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-024: address: valid address / accountKey: single compressed public key string', () => {
        it('should generate account instances with AccountKeyPublic', () => {
            const address = '0xf43dcbb903a0b4b48a7dfa8a370a63f0a731708d'
            const pub = '0x021e3aec6e8bd8247aea112c3d1094566272974e56bb0151c58745847e2998ad0e'

            const account = caver.account.createWithAccountKeyPublic(address, pub)

            testAccount(account, { expectedAddress: address, expectedAccountKeyType: 'AccountKeyPublic', expectedAccountKey: pub })
        })
    })
})

describe('caver.account.createWithAccountKeyFail', () => {
    context('CAVERJS-UNIT-ACCOUNT-013: address: valid address', () => {
        it('should generate account instances with AccountKeyFail', () => {
            const account = caver.account.createWithAccountKeyFail('0xab9825316619a0720ad891135e92adb84fd74fc1')

            expect(account.accountKey instanceof AccountKeyFail).to.be.true
            expect(account.address.toLowerCase()).to.equal('0xab9825316619a0720ad891135e92adb84fd74fc1')
        })
    })
})

describe('caver.account.createWithAccountKeyWeightedMultiSig', () => {
    context('CAVERJS-UNIT-ACCOUNT-014: address: valid address / accountKey: multiple public key strings', () => {
        it('should generate account instances with AccountKeyWeightedMultiSig', () => {
            const address = '0xab9825316619a0720ad891135e92adb84fd74fc1'
            const pubs = [
                '0x91245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02f2b0870653417943e795e7c8694c4f8be8af865b7a0224d1dec0bf8a1bf1b5a6',
                '0x77e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f3570b1a104b67d1cd169bbf61dd557f15ab5ee8b661326096954caddadf34ae6ac8',
                '0xd3bb14320d87eed081ae44740b5abbc52bac2c7ccf85b6281a0fc69f3ba4c171cc4bd2ba7f0c969cd72bfa49c854d8ac2cf3d0edea7f0ce0fd31cf080374935d',
                '0xcfa4d1bee51e59e6842b136ff95b9d01385f94bed13c4be8996c6d20cb732c3ee47cd2b6bbb917658c5fd3d02b0ddf1242b1603d1acbde7812a7d9d684ed37a9',
            ]
            const options = new caver.account.weightedMultiSigOptions(2, [1, 1, 2, 2])

            const account = caver.account.createWithAccountKeyWeightedMultiSig(address, pubs, options)

            testAccount(account, {
                expectedAddress: address,
                expectedAccountKeyType: 'AccountKeyWeightedMultiSig',
                expectedAccountKey: pubs,
                exepectedOptions: options,
            })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-015: address: valid address / accountKey: multiple public key strings', () => {
        it('should generate account instances with AccountKeyWeightedMultiSig', () => {
            const address = '0xab9825316619a0720ad891135e92adb84fd74fc1'
            const pubs = [
                '0x91245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02f2b0870653417943e795e7c8694c4f8be8af865b7a0224d1dec0bf8a1bf1b5a6',
                '0x77e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f3570b1a104b67d1cd169bbf61dd557f15ab5ee8b661326096954caddadf34ae6ac8',
            ]

            const options = new caver.account.weightedMultiSigOptions(1, [1, 1])

            const account = caver.account.createWithAccountKeyWeightedMultiSig(address, pubs)

            testAccount(account, {
                expectedAddress: address,
                expectedAccountKeyType: 'AccountKeyWeightedMultiSig',
                expectedAccountKey: pubs,
                exepectedOptions: options,
            })
        })
    })
})

describe('caver.account.createWithAccountKeyRoleBased', () => {
    context('CAVERJS-UNIT-ACCOUNT-016: address: valid address / accountKey: role based public key strings', () => {
        it('should generate account instances with AccountKeyRoleBased', () => {
            const address = '0xab9825316619a0720ad891135e92adb84fd74fc1'
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

            const account = caver.account.createWithAccountKeyRoleBased(address, pubs, options)

            testAccount(account, {
                expectedAddress: address,
                expectedAccountKeyType: 'AccountKeyRoleBased',
                expectedAccountKey: pubs,
                exepectedOptions: options,
            })
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-017: address: valid address / accountKey: role based public key strings', () => {
        it('should generate account instances with AccountKeyRoleBased', () => {
            const address = '0xab9825316619a0720ad891135e92adb84fd74fc1'
            const pubs = [
                [
                    '0xb86b2787e8c7accd7d2d82678c9bef047a0aafd72a6e690817506684e8513c9af36becba90c8de06fd06da16492263267a63720985f94fc5a027d0a26d25e6ae',
                ],
                [
                    '0x1a909c4d7dbb5281b1d1b55e79a1b2568111bd2830246c3173ce824000eb8716afe39b6106fb9db360fb5779e2d346c8328698174831941586b11bdc3e755905',
                    '0x1a909c4d7dbb5281b1d1b55e79a1b2568111bd2830246c3173ce824000eb8716afe39b6106fb9db360fb5779e2d346c8328698174831941586b11bdc3e755905',
                ],
                [
                    '0x91245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02f2b0870653417943e795e7c8694c4f8be8af865b7a0224d1dec0bf8a1bf1b5a6',
                ],
            ]

            const options = [
                new caver.account.weightedMultiSigOptions(),
                new caver.account.weightedMultiSigOptions(1, [1, 1]),
                new caver.account.weightedMultiSigOptions(),
            ]

            const account = caver.account.createWithAccountKeyRoleBased(address, pubs)

            testAccount(account, {
                expectedAddress: address,
                expectedAccountKeyType: 'AccountKeyRoleBased',
                expectedAccountKey: pubs,
                exepectedOptions: options,
            })
        })
    })
})

describe('account.getRLPEncodingAccountKey', () => {
    context('CAVERJS-UNIT-ACCOUNT-018: account type: account with AccountKeyLegacy', () => {
        it('return RLP-encoded AccountKeyLegacy', () => {
            const rlpEncodedAccountKey = '0x01c0'
            const account = caver.account.createFromRLPEncoding('0xab9825316619a0720ad891135e92adb84fd74fc1', rlpEncodedAccountKey)

            expect(account.getRLPEncodingAccountKey()).to.equal(rlpEncodedAccountKey)
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-019: account type: account with AccountKeyPublic', () => {
        it('return RLP-encoded AccountKeyLegacy', () => {
            const rlpEncodedAccountKey = '0x02a102c10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9'
            const account = caver.account.createFromRLPEncoding('0xab9825316619a0720ad891135e92adb84fd74fc1', rlpEncodedAccountKey)

            expect(account.getRLPEncodingAccountKey()).to.equal(rlpEncodedAccountKey)
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-020: address: valid address / accountKey: RLP-encoded account key string(fail)', () => {
        it('should generate account instances with accountKeyFail', () => {
            const rlpEncodedAccountKey = '0x03c0'
            const account = caver.account.create('0xab9825316619a0720ad891135e92adb84fd74fc1', rlpEncodedAccountKey)

            expect(account.getRLPEncodingAccountKey()).to.equal(rlpEncodedAccountKey)
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-021: address: valid address / accountKey: RLP-encoded account key string(multisig)', () => {
        it('should generate account instances with AccountKeyWeightedMultiSig', () => {
            const rlpEncodedAccountKey =
                '0x04f84b02f848e301a102c10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9e301a1021769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c1'
            const account = caver.account.createFromRLPEncoding('0xab9825316619a0720ad891135e92adb84fd74fc1', rlpEncodedAccountKey)

            expect(account.getRLPEncodingAccountKey()).to.equal(rlpEncodedAccountKey)
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-022: address: valid address / accountKey: RLP-encoded account key string(role based)', () => {
        it('should generate account instances with AccountKeyRoleBased', () => {
            const rlpEncodedAccountKey =
                '0x05f8c4a302a1036250dad4985bc22c8b9b84d1a05624c4daa0e83c8ae8fb35702d9024a8c14a71b84e04f84b02f848e301a102c10b598a1a3ba252acc21349d61c2fbd9bc8c15c50a5599f420cccc3291f9bf9e301a1021769a9196f523c419be50c26419ebbec34d3d6aa8b59da834212f13dbec9a9c1b84e04f84b01f848e301a103e7615d056e770b3262e5b39a4823c3124989924ed4dcfab13f10b252701540d4e301a1036f21d60c16200d99e6777422470b3122b65850d5135a5a4b41344a5607a1446d'
            const account = caver.account.createFromRLPEncoding('0xab9825316619a0720ad891135e92adb84fd74fc1', rlpEncodedAccountKey)

            expect(account.getRLPEncodingAccountKey()).to.equal(rlpEncodedAccountKey)
        })
    })

    context('CAVERJS-UNIT-ACCOUNT-023: address: valid address / accountKey: RLP-encoded account key string(role based with nil)', () => {
        it('should generate account instances with AccountKeyRoleBased with AccountKeyNil', () => {
            const rlpEncodedAccountKey =
                '0x05f876a302a1036250dad4985bc22c8b9b84d1a05624c4daa0e83c8ae8fb35702d9024a8c14a718180b84e04f84b01f848e301a103e7615d056e770b3262e5b39a4823c3124989924ed4dcfab13f10b252701540d4e301a1036f21d60c16200d99e6777422470b3122b65850d5135a5a4b41344a5607a1446d'
            const account = caver.account.createFromRLPEncoding('0xab9825316619a0720ad891135e92adb84fd74fc1', rlpEncodedAccountKey)

            expect(account.getRLPEncodingAccountKey()).to.equal(rlpEncodedAccountKey)
        })
    })
})
