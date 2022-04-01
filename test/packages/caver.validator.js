/*
    Copyright 2021 The caver-js Authors
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

const SignatureData = require('../../packages/caver-wallet/src/keyring/signatureData')

let caver

const sandbox = sinon.createSandbox()

describe('caver.validator.validateSignedMessage', () => {
    beforeEach(() => {
        caver = new Caver(testRPCURL)
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.validator.validateSignedMessage with AccountKeyLegacy', () => {
        const address = '0xa84a1ce657e9d5b383cece6f4ba365e23fa234dd'
        const privateKey = '0x7db91b4606aa4421eeb85d03601562f966693e38957d5e79a29edda0e85b2225'

        const getAccountKeyResult = { keyType: 1, key: {} }

        const message = 'Some Message'
        const hashedMessage = '0xa4b1069c1000981f4fdca0d62302dfff77c2d0bc17f283d961e2dc5961105b18'

        const signature = [
            '0x1b',
            '0x8213e560e7bbe1f2e28fd69cbbb41c9108b84c98cd7c2c88d3c8e3549fd6ab10',
            '0x3ca40c9e20c1525348d734a6724db152b9244bff6e0ff0c2b811d61d8f874f00',
        ]

        it('CAVERJS-UNIT-VALIDATOR-001: should return true when valid signatures with array format', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)
            const ret = await caver.validator.validateSignedMessage(message, signature, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-002: should return true when valid signatures with array format when message is hashed', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)

            const ret = await caver.validator.validateSignedMessage(hashedMessage, signature, keyring.address, true)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-003: should return true when valid signatures with SignatureData format', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)
            const ret = await caver.validator.validateSignedMessage(message, new SignatureData(signature), keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-004: should return true when valid signatures with SignatureData array format', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)

            const ret = await caver.validator.validateSignedMessage(message, [new SignatureData(signature)], keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-005: should return false when invalid signatures is passed as a parameter', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)

            const invalid = [
                '0x1c',
                '0xa5c9ff1df09258a6f9262f1fae43a306ec77592287787cbd3ee0419dd8d2bfeb',
                '0x4c903d3dda703554cf7b65aa2c0dc819c86d36cf2dbf0ff5071667fb5551a706',
            ]

            const ret = await caver.validator.validateSignedMessage(message, invalid, keyring.address)
            expect(ret).to.be.false
        }).timeout(100000)
    })

    context('caver.validator.validateSignedMessage with AccountKeyPublic', () => {
        // Below private key is decoupled from the address
        const address = '0xa84a1ce657e9d5b383cece6f4ba365e23fa234dd'
        const privateKey = '0xf95c224b63f5658281ad853b3f582051eb9bca9b3e5475a8d3e4315abf42cb02'

        const getAccountKeyResult = {
            keyType: 2,
            key: {
                x: '0x89632f9a5aa49b30ddea62574c4b0e23cf05b934f667dd94eb3a4f394ca0bba3',
                y: '0x6726b313ef93fbfc1295b87f62f1c1c9fdb0dbc6f583eae6db0cbd5c715f19cd',
            },
        }

        const message = 'Some Message'
        const hashedMessage = '0xa4b1069c1000981f4fdca0d62302dfff77c2d0bc17f283d961e2dc5961105b18'

        const signature = [
            '0x1c',
            '0xa5c9ff1df09258a6f9262f1fae43a306ec77592287787cbd3ee0419dd8d2bfeb',
            '0x4c903d3dda703554cf7b65aa2c0dc819c86d36cf2dbf0ff5071667fb5551a706',
        ]

        it('CAVERJS-UNIT-VALIDATOR-006: should return true when valid signatures with array format', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)
            const ret = await caver.validator.validateSignedMessage(message, signature, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-007: should return true when valid signatures with array format when message is hashed', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)

            const ret = await caver.validator.validateSignedMessage(hashedMessage, signature, keyring.address, true)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-008: should return true when valid signatures with SignatureData format', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)
            const ret = await caver.validator.validateSignedMessage(message, new SignatureData(signature), keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-009: should return true when valid signatures with SignatureData array format', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)

            const ret = await caver.validator.validateSignedMessage(message, [new SignatureData(signature)], keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-010: should return false when invalid signatures are passed as a parameter', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)

            const invalidSig = [
                '0x1b',
                '0x883c4174fada447e95b09e3f27b2e27f419179366230bbcd5046ff946d1e4a90',
                '0x052f9e19394e593547370ec5216703c6b698377d4f5fa422bf0e1cb26698dad2',
            ]

            const ret = await caver.validator.validateSignedMessage(message, [new SignatureData(invalidSig)], keyring.address)
            expect(ret).to.be.false
        }).timeout(100000)
    })

    context('caver.validator.validateSignedMessage with AccountKeyFail', () => {
        const address = '0xa84a1ce657e9d5b383cece6f4ba365e23fa234dd'

        const getAccountKeyResult = { keyType: 3, key: {} }

        const message = 'Some Message'

        const signature = [
            '0x1c',
            '0xa5c9ff1df09258a6f9262f1fae43a306ec77592287787cbd3ee0419dd8d2bfeb',
            '0x4c903d3dda703554cf7b65aa2c0dc819c86d36cf2dbf0ff5071667fb5551a706',
        ]

        it('CAVERJS-UNIT-VALIDATOR-011: should return false when accountKey is AccountKeyFail', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const ret = await caver.validator.validateSignedMessage(message, signature, address)
            expect(ret).to.be.false
        }).timeout(100000)
    })

    context('caver.validator.validateSignedMessage with AccountKeyWeightedMultiSig', () => {
        // Below private keys is decoupled from the address
        const address = '0xa84a1ce657e9d5b383cece6f4ba365e23fa234dd'
        const privateKeys = [
            '0xc707902dba449d0ce3b47675db728ad795b63a4ae748dc4f7265e05305ae7424',
            '0x9611e74d616659598c56707b47779f99cae268c70a53163348cea01f8f872447',
            '0x24777022e1b8c993451c855b1f74561dff057caa825a01f4d87ab2f2b46aaaf7',
        ]

        const getAccountKeyResult = {
            keyType: 4,
            key: {
                threshold: 3,
                keys: [
                    {
                        weight: 2,
                        key: {
                            x: '0x2459bce1b37d5c517854842574f7fc78d7e76238c1c8b1619f0189a397fbf9c2',
                            y: '0xeeacaae1117b6994df2b5bc2990157f9c7a74c9ef211d6cb49b1a624911ec87b',
                        },
                    },
                    {
                        weight: 1,
                        key: {
                            x: '0x334aa344adf4e5758d4d75a8cc89495d0cb809433960ea6459e31de4f1ac7ac1',
                            y: '0x10a3971d6c139a38d16d83fe87024127b8326c8d16de7187a5adf0b1f7c28ada',
                        },
                    },
                    {
                        weight: 1,
                        key: {
                            x: '0x0xd9fbf7476758d2f4db78379bf0b9d2207207f638b39c831b8034cc35d0f87ab',
                            y: '0xaa6fcac353e85bde5e7a11173aa8ef1f546df4276816daa7b8b5e4985285f1ab0',
                        },
                    },
                ],
            },
        }

        const message = 'Some Message'
        const hashedMessage = '0xa4b1069c1000981f4fdca0d62302dfff77c2d0bc17f283d961e2dc5961105b18'

        const signatures = [
            [
                '0x1b',
                '0x883c4174fada447e95b09e3f27b2e27f419179366230bbcd5046ff946d1e4a90',
                '0x052f9e19394e593547370ec5216703c6b698377d4f5fa422bf0e1cb26698dad2',
            ],
            [
                '0x1c',
                '0x8119b63a28a9c20ef8266b4d99e1f05c1bfa773e1376f19802f898b117311556',
                '0x23d265b2cb102a2d81bf829aae1e9d579d7bf32110e3e62728070ebae466c131',
            ],
            [
                '0x1c',
                '0xa9770147c523ef699959b804c2dd9ba1b61b3c6bdd8eac57c0a72efd5c5c566c',
                '0x2904d93e0510d76120de0e0cd8eeb4842867edde58c29efe389c8a82705ce00e',
            ],
        ]

        it('CAVERJS-UNIT-VALIDATOR-012: should return true when valid signatures with array format', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const ret = await caver.validator.validateSignedMessage(message, signatures, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-013: should return true when valid signatures with array format when message is hashed', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const ret = await caver.validator.validateSignedMessage(hashedMessage, signatures, keyring.address, true)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-014: should return true when valid signatures with SignatureData array format', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const formattedSignatures = []
            for (const sig of signatures) formattedSignatures.push(new SignatureData(sig))

            const ret = await caver.validator.validateSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-015: should return true if threshold is satisfied', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const formattedSignatures = []
            formattedSignatures.push(new SignatureData(signatures[0])) // weight 2
            formattedSignatures.push(new SignatureData(signatures[1])) // wieght 1

            const ret = await caver.validator.validateSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-016: should return false if threshold is not satisfied', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const formattedSignatures = []
            formattedSignatures.push(new SignatureData(signatures[1])) // wieght 1
            formattedSignatures.push(new SignatureData(signatures[2])) // wieght 1

            const ret = await caver.validator.validateSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.false
        }).timeout(100000)

        // This test case should be chagned to expect false after fork.
        it('CAVERJS-UNIT-VALIDATOR-017: should return true when threshold is satisfied but includes invalid siganture though', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const formattedSignatures = []
            for (const sig of signatures) formattedSignatures.push(new SignatureData(sig))
            formattedSignatures.push(
                new SignatureData([
                    '0x1b',
                    '0x8213e560e7bbe1f2e28fd69cbbb41c9108b84c98cd7c2c88d3c8e3549fd6ab10',
                    '0x3ca40c9e20c1525348d734a6724db152b9244bff6e0ff0c2b811d61d8f874f00',
                ])
            )

            const ret = await caver.validator.validateSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-018: should return false when invalid signatures are passed as a parameter', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const invalidSig = [
                [
                    '0x1b',
                    '0xa7373f18960e9f9085781b35c539aa82fe02f076d36b8f56fe199c1262a26691',
                    '0x0d003bc30f79b510a189f98a776b2419995bc3fc88a2e63094e2fb022323ff3c',
                ],
                [
                    '0x1c',
                    '0xdc92f3a0e46c4522a635ddf07a3f970bae4c6e546b3afc5f2fac8b60054ffcec',
                    '0x02b30df9d85a3a1cf2e03c01f5a32544ef68a65ff48ad25428dabe95405aef25',
                ],
            ]

            const ret = await caver.validator.validateSignedMessage(message, invalidSig, keyring.address)
            expect(ret).to.be.false
        }).timeout(100000)
    })

    context('caver.validator.validateSignedMessage with AccountKeyRoleBased', () => {
        // Below private keys is decoupled from the address
        const address = '0xa84a1ce657e9d5b383cece6f4ba365e23fa234dd'
        const privateKeys = [
            [
                '0x91be7ec09a17222740fe356b5b2721722abc38b7b40334cda94a478993e51668',
                '0x4f4b3517caae10ae4571eb1f30e649f1fa10c6a3c690e555db473623cad8a171',
            ],
            [
                '0xd9d77f73890681e7dfe26fba7bb19479112bc902129be2d19ad514b0d0f4cc54',
                '0xf38971e17d4ee376498adba83ef951e93ee7aedeea350d1820c7b8436a5a6286',
            ],
            [
                '0x609afc089f497c8752664a34e03e305d0c9550f0efaa41c3636bc40e92fa6e83',
                '0xf2263c847c9989660cc7319c16611cf5ddb8d3b7d15a45b2f93ef79cc48c582a',
            ],
        ]

        const getAccountKeyResult = {
            keyType: 5,
            key: [
                {
                    keyType: 4,
                    key: {
                        threshold: 2,
                        keys: [
                            {
                                weight: 1,
                                key: {
                                    x: '0x1bd81d8db362bb71ada110b6ce3c5c2cb83a09408b737514dbdd00aec664cb15',
                                    y: '0xc32180d23b23e0adff616ad7e47c47055c429f49729a564cfdef3a20d30c6484',
                                },
                            },
                            {
                                weight: 1,
                                key: {
                                    x: '0x37f5234c9f99ebf5cf4e54038d1fcd6c18f3dc80217d41581c22190310ab4546',
                                    y: '0x542eaa9a24a5aa5d4a6c5729c24c7b82006747408218dffdc3712635fc04bf2a',
                                },
                            },
                        ],
                    },
                },
                {
                    keyType: 4,
                    key: {
                        threshold: 2,
                        keys: [
                            {
                                weight: 1,
                                key: {
                                    x: '0x2524a74b1cdaca02dcba217dfc4c12e1ed211f0625a5625d3d46eba97e2b6f3e',
                                    y: '0x7dfb71b9444a455a88a2c65d5bcc17a4fbd78be0f0c638570d2e380273210ee0',
                                },
                            },
                            {
                                weight: 1,
                                key: {
                                    x: '0x0784d5e42363fb1828981e83506bcb3d0ee99bf5817513a0e828087b61ecbe78',
                                    y: '0xb9fd0686c949e722a201d568e83029cd5abaf2cd59b140ef7e6790a936576f20',
                                },
                            },
                        ],
                    },
                },
                {
                    keyType: 4,
                    key: {
                        threshold: 2,
                        keys: [
                            {
                                weight: 1,
                                key: {
                                    x: '0x953ba821d928da92be9455db80413b7f777ac1fccd2fc08c975e7d70631278fa',
                                    y: '0x35288de9c9b87588209c7aab345bd13244e68221b9fbeed7f60ba3769ba7efd8',
                                },
                            },
                            {
                                weight: 1,
                                key: {
                                    x: '0x8b3f3ee33166683a0f6084f3d6030c184bb8901cf948447705b51399b752a766',
                                    y: '0x10135ab0b296efbdd68477f56541deaadd63cc253bcea61caac08596c2338fbc',
                                },
                            },
                        ],
                    },
                },
            ],
        }

        const message = 'Some Message'
        const hashedMessage = '0xa4b1069c1000981f4fdca0d62302dfff77c2d0bc17f283d961e2dc5961105b18'

        // signatures with roleTransactionKey
        const signatures = [
            [
                '0x1b',
                '0xa7373f18960e9f9085781b35c539aa82fe02f076d36b8f56fe199c1262a26691',
                '0x0d003bc30f79b510a189f98a776b2419995bc3fc88a2e63094e2fb022323ff3c',
            ],
            [
                '0x1c',
                '0xdc92f3a0e46c4522a635ddf07a3f970bae4c6e546b3afc5f2fac8b60054ffcec',
                '0x02b30df9d85a3a1cf2e03c01f5a32544ef68a65ff48ad25428dabe95405aef25',
            ],
        ]

        // signatures with roleAccountUpdateKey
        const roleAccountUpdateKeySignatures = [
            [
                '0x1b',
                '0x2a163fa0cb6b191c4773b11bf177b1e51175db340b4d6c74046119d5d96b2946',
                '0x1282daa48dd3cc500f5aa145bb87cd1f68bc7b9bf92cdd158c2075041002fc60',
            ],
            [
                '0x1c',
                '0x671fd9e070a42dc5e5ffd97b39fdceba4f670cad06f455513f021436a95f1ea1',
                '0x0d01a612c20481f92c51be655a9603afd93a2a9134e12e2b45bf463cb7c02f26',
            ],
        ]

        // signatures with roleFeePayerKey
        const roleFeePayerKeySignatures = [
            [
                '0x1b',
                '0x4e0fd15eb17809eed3f3b92de7a5d785fa462d4a26c671355c78f2e0ec643cf4',
                '0x520fac71728145f92018466b724da7ab447b4ef07037d48efe3c3db6b6c5680d',
            ],
            [
                '0x1c',
                '0x84bb6abdafa54f456ade2de682a86ca8937f9bb5495966b856e9b6dd5b74c051',
                '0x256e505d8e406b7ea7f37834b46b343fdc0658808762f94884921b8e9f3c5275',
            ],
        ]

        it('CAVERJS-UNIT-VALIDATOR-019: should return true when valid signatures with array format', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const ret = await caver.validator.validateSignedMessage(message, signatures, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-020: should return true when valid signatures with array format when message is hashed', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const ret = await caver.validator.validateSignedMessage(hashedMessage, signatures, keyring.address, true)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-021: should return true when valid signatures with SignatureData array format', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const formattedSignatures = []
            for (const sig of signatures) formattedSignatures.push(new SignatureData(sig))

            const ret = await caver.validator.validateSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-022: should return true if threshold is satisfied', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const formattedSignatures = []
            formattedSignatures.push(new SignatureData(signatures[0])) // weight 2
            formattedSignatures.push(new SignatureData(signatures[1])) // wieght 1

            const ret = await caver.validator.validateSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-023: should return false if threshold is not satisfied', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const formattedSignatures = []
            formattedSignatures.push(new SignatureData(signatures[1])) // wieght 1
            formattedSignatures.push(new SignatureData(signatures[2])) // wieght 1

            const ret = await caver.validator.validateSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.false
        }).timeout(100000)

        // This test case should be chagned to expect false after fork.
        it('CAVERJS-UNIT-VALIDATOR-024: should return true when threshold is satisfied but includes invalid siganture though', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const formattedSignatures = []
            for (const sig of signatures) formattedSignatures.push(new SignatureData(sig))
            formattedSignatures.push(
                new SignatureData([
                    '0x1b',
                    '0x8213e560e7bbe1f2e28fd69cbbb41c9108b84c98cd7c2c88d3c8e3549fd6ab10',
                    '0x3ca40c9e20c1525348d734a6724db152b9244bff6e0ff0c2b811d61d8f874f00',
                ])
            )

            const ret = await caver.validator.validateSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-025: should return false if signature is signed by roleAccountUpateKey', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const formattedSignatures = []
            for (const sig of roleAccountUpdateKeySignatures) formattedSignatures.push(new SignatureData(sig))

            const ret = await caver.validator.validateSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.false
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-026: should return false if signature is signed by roleFeePayerKey', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const formattedSignatures = []
            for (const sig of roleFeePayerKeySignatures) formattedSignatures.push(new SignatureData(sig))

            const ret = await caver.validator.validateSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.false
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-027: should return true with AccountKeyLegacy in roleTransactionKey', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves({
                keyType: 5,
                key: [{ keyType: 1, key: {} }, getAccountKeyResult.key[1], getAccountKeyResult.key[2]],
            })

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const signatureWithAccountKeyLegacy = [
                '0x1b',
                '0x8213e560e7bbe1f2e28fd69cbbb41c9108b84c98cd7c2c88d3c8e3549fd6ab10',
                '0x3ca40c9e20c1525348d734a6724db152b9244bff6e0ff0c2b811d61d8f874f00',
            ]

            const ret = await caver.validator.validateSignedMessage(message, signatureWithAccountKeyLegacy, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-028: should return true with AccountKeyPublic in roleTransactionKey', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves({
                keyType: 5,
                key: [
                    {
                        keyType: 2,
                        key: {
                            x: '0x89632f9a5aa49b30ddea62574c4b0e23cf05b934f667dd94eb3a4f394ca0bba3',
                            y: '0x6726b313ef93fbfc1295b87f62f1c1c9fdb0dbc6f583eae6db0cbd5c715f19cd',
                        },
                    },
                    getAccountKeyResult.key[1],
                    getAccountKeyResult.key[2],
                ],
            })

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const signatureWithAccountKeyPublic = [
                '0x1c',
                '0xa5c9ff1df09258a6f9262f1fae43a306ec77592287787cbd3ee0419dd8d2bfeb',
                '0x4c903d3dda703554cf7b65aa2c0dc819c86d36cf2dbf0ff5071667fb5551a706',
            ]

            const ret = await caver.validator.validateSignedMessage(message, signatureWithAccountKeyPublic, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-029: should return false with AccountKeyFail in roleTransactionKey', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves({
                keyType: 5,
                key: [{ keyType: 3, key: {} }, getAccountKeyResult.key[1], getAccountKeyResult.key[2]],
            })

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const ret = await caver.validator.validateSignedMessage(message, signatures, keyring.address)
            expect(ret).to.be.false
        }).timeout(100000)
    })
})

describe('caver.validator.validateSender', () => {
    beforeEach(() => {
        caver = new Caver(testRPCURL)
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.validator.validateSender with AccountKeyLegacy', () => {
        const txObj = {
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
        }
        function setStubResult() {
            const getAccountKeyResult = { keyType: 1, key: {} }
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)
        }

        it('CAVERJS-UNIT-VALIDATOR-030: should validate signatures in the tx', async () => {
            setStubResult()

            const tx = caver.transaction.legacyTransaction.create(txObj)
            const isValid = await caver.validator.validateSender(tx)
            expect(isValid).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-031: should return false when signatures in the tx are invalid', async () => {
            setStubResult()

            const tx = caver.transaction.legacyTransaction.create(txObj)
            tx.signatures = [
                {
                    V: '0x0fe9',
                    R: '0x86c8ecbfd892be41d48443a2243274beb6daed3f72895045965a3baede4c350e',
                    S: '0x69ea748aff6e4c106d3a8ba597d8f134745b76f12dacb581318f9da07351511a',
                },
            ]
            const isValid = await caver.validator.validateSender(tx)
            expect(isValid).to.be.false
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-058: should validate a signature in the ethereum access list tx', async () => {
            setStubResult()

            let tx = caver.transaction.ethereumAccessList.create({
                from: '0x30be91c80566da777d30e659b6746174ecc61576',
                gas: '0x9c40',
                nonce: '0xe1e',
                gasPrice: '0x5d21dba00',
                chainId: '0x2710',
                signatures: [
                    '0x1',
                    '0x653a6840880708f4fe3f3a542ebf4669c6aec6d4575fa099b7158de61012d46a',
                    '0x37510415d55c633b4c70509cd2ca371ae9d17b26ca6fc5b9d622b94d366845ec',
                ],
                to: '0x79ebe19c4f0987b8531c5d3e728aa29d978be9d6',
                input:
                    '0xa9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039',
                value: '0x1',
                accessList: [
                    {
                        address: '0x4468d2cb2c0beb70ca4ab22a3be9a32ecc75411a',
                        storageKeys: [
                            '0x0000000000000000000000000000000000000000000000000000000000000003',
                            '0x0000000000000000000000000000000000000000000000000000000000000007',
                        ],
                    },
                ],
            })
            let isValid = await caver.validator.validateSender(tx)
            expect(isValid).to.be.true

            tx = caver.transaction.ethereumAccessList.create({
                from: '0x30be91c80566da777d30e659b6746174ecc61576',
                gas: '0x9c40',
                nonce: '0xe25',
                gasPrice: '0x5d21dba00',
                chainId: '0x2710',
                signatures: [
                    '0x0',
                    '0xecccb764fe1af4cf8cd8bb003621beaeb0c62357b77ff9f43dc745fd0fff0245',
                    '0x19c68d66686efce41c63fbb19a2f824b96acc28810ee3cd2254977de0a311c23',
                ],
                to: '0x79ebe19c4f0987b8531c5d3e728aa29d978be9d6',
                input:
                    '0xa9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039',
                value: '0x1',
                accessList: [
                    {
                        address: '0x4468d2cb2c0beb70ca4ab22a3be9a32ecc75411a',
                        storageKeys: [
                            '0x0000000000000000000000000000000000000000000000000000000000000003',
                            '0x0000000000000000000000000000000000000000000000000000000000000007',
                        ],
                    },
                ],
            })
            isValid = await caver.validator.validateSender(tx)
            expect(isValid).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-059: should validate a signature in the ethereum dynamic fee tx', async () => {
            setStubResult()

            let tx = caver.transaction.ethereumDynamicFee.create({
                from: '0x30be91c80566da777d30e659b6746174ecc61576',
                gas: '0x9c40',
                nonce: '0xe20',
                chainId: '0x2710',
                signatures: [
                    '0x1',
                    '0x6eccacfc39fa6b2a3216443d7307c29928323b1afd1c468ce51737ddf3f1c5e9',
                    '0x12f5f4b8af6019281cc77fab330f6d8643aa08b2d1c56bd8158dd0ed0ed1d34a',
                ],
                to: '0x79ebe19c4f0987b8531c5d3e728aa29d978be9d6',
                input:
                    '0xa9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039',
                value: '0x1',
                maxFeePerGas: '0x5d21dba00',
                maxPriorityFeePerGas: '0x5d21dba00',
                accessList: [
                    {
                        address: '0x4468d2cb2c0beb70ca4ab22a3be9a32ecc75411a',
                        storageKeys: [
                            '0x0000000000000000000000000000000000000000000000000000000000000003',
                            '0x0000000000000000000000000000000000000000000000000000000000000007',
                        ],
                    },
                ],
            })
            let isValid = await caver.validator.validateSender(tx)
            expect(isValid).to.be.true

            tx = caver.transaction.ethereumDynamicFee.create({
                from: '0x30be91c80566da777d30e659b6746174ecc61576',
                gas: '0x9c40',
                nonce: '0xe22',
                chainId: '0x2710',
                signatures: [
                    '0x0',
                    '0x5a7fda9e8161b872e901687ecf85e1226866d7c244a54d7e7b39ab4932a22cf',
                    '0x42293506f0cd10e23815a922167e8e89e8b37cff2d302c82a6da8fccd17335d9',
                ],
                to: '0x79ebe19c4f0987b8531c5d3e728aa29d978be9d6',
                input:
                    '0xa9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039',
                value: '0x1',
                maxFeePerGas: '0x5d21dba00',
                maxPriorityFeePerGas: '0x5d21dba00',
                accessList: [
                    {
                        address: '0x4468d2cb2c0beb70ca4ab22a3be9a32ecc75411a',
                        storageKeys: [
                            '0x0000000000000000000000000000000000000000000000000000000000000003',
                            '0x0000000000000000000000000000000000000000000000000000000000000007',
                        ],
                    },
                ],
            })
            isValid = await caver.validator.validateSender(tx)
            expect(isValid).to.be.true
        }).timeout(100000)
    })

    context('caver.validator.validateSender with AccountKeyPublic', () => {
        const txObj = {
            from: '0xf21460730845e3652aa3cc9bc13b345e4f53984a',
            to: '0x59177716c34ac6e49e295a0e78e33522f14d61ee',
            value: '0x1',
            chainId: '0x7e3',
            gasPrice: '0x5d21dba00',
            nonce: '0x0',
            gas: '0x2faf080',
            signatures: [
                [
                    '0x0fea',
                    '0x2b5934c6d26bb3e65edf099d79c57c743d2f70744ca09d3ba9a1099edff9f173',
                    '0x0797886edff4b449c1a599943e3a6003ae9e46b3f3f34862ced327e43fba3a6a',
                ],
            ],
        }
        function setStubResult() {
            const getAccountKeyResult = {
                keyType: 2,
                key: {
                    x: '0x8bb6aaeb2d96d024754d3b50babf116cece68977acbe8ba6a66f14d5217c60d9',
                    y: '0x6af020a0568661e7c72e753e80efe084a3aed9f9ac87bf44d09ce67aad3d4e01',
                },
            }
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)
        }

        it('CAVERJS-UNIT-VALIDATOR-032: should validate signatures in the tx', async () => {
            setStubResult()

            const tx = caver.transaction.valueTransfer.create(txObj)
            const isValid = await caver.validator.validateSender(tx)
            expect(isValid).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-033: should return false when signatures in the tx are invalid', async () => {
            setStubResult()

            const tx = caver.transaction.valueTransfer.create(txObj)
            tx.signatures = [
                {
                    V: '0x0fe9',
                    R: '0x86c8ecbfd892be41d48443a2243274beb6daed3f72895045965a3baede4c350e',
                    S: '0x69ea748aff6e4c106d3a8ba597d8f134745b76f12dacb581318f9da07351511a',
                },
            ]
            const isValid = await caver.validator.validateSender(tx)
            expect(isValid).to.be.false
        }).timeout(100000)
    })

    context('caver.validator.validateSender with AccountKeyFail', () => {
        const txObj = {
            from: '0xf21460730845e3652aa3cc9bc13b345e4f53984a',
            to: '0x59177716c34ac6e49e295a0e78e33522f14d61ee',
            value: '0x1',
            chainId: '0x7e3',
            gasPrice: '0x5d21dba00',
            nonce: '0x0',
            gas: '0x2faf080',
            signatures: [
                [
                    '0x0fea',
                    '0x2b5934c6d26bb3e65edf099d79c57c743d2f70744ca09d3ba9a1099edff9f173',
                    '0x0797886edff4b449c1a599943e3a6003ae9e46b3f3f34862ced327e43fba3a6a',
                ],
            ],
        }
        function setStubResult() {
            const getAccountKeyResult = { keyType: 3, key: {} }
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)
        }

        it('CAVERJS-UNIT-VALIDATOR-034: should validate signatures in the tx', async () => {
            setStubResult()

            const tx = caver.transaction.valueTransfer.create(txObj)
            const isValid = await caver.validator.validateSender(tx)
            expect(isValid).to.be.false
        }).timeout(100000)
    })

    context('caver.validator.validateSender with AccountKeyWeightedMultiSig', () => {
        const txObj = {
            from: '0xf21460730845e3652aa3cc9bc13b345e4f53984a',
            to: '0x59177716c34ac6e49e295a0e78e33522f14d61ee',
            value: '0x1',
            chainId: '0x7e3',
            gasPrice: '0x5d21dba00',
            nonce: '0x0',
            gas: '0x2faf080',
            signatures: [
                [
                    '0x0fea',
                    '0x2b5934c6d26bb3e65edf099d79c57c743d2f70744ca09d3ba9a1099edff9f173',
                    '0x0797886edff4b449c1a599943e3a6003ae9e46b3f3f34862ced327e43fba3a6a',
                ],
                [
                    '0x0fe9',
                    '0x63177648732ef855f800eb9f80f68501abb507f84c0d660286a6e0801334a1d2',
                    '0x620a996623c114f2df35b11ec8ac4f3758d3ad89cf81ba13614e51908cfe9218',
                ],
                [
                    '0x0fe9',
                    '0x86c8ecbfd892be41d48443a2243274beb6daed3f72895045965a3baede4c350e',
                    '0x69ea748aff6e4c106d3a8ba597d8f134745b76f12dacb581318f9da07351511a',
                ],
            ],
        }
        function setStubResult() {
            const getAccountKeyResult = {
                keyType: 4,
                key: {
                    threshold: 3,
                    keys: [
                        {
                            weight: 2,
                            key: {
                                x: '0x8bb6aaeb2d96d024754d3b50babf116cece68977acbe8ba6a66f14d5217c60d9',
                                y: '0x6af020a0568661e7c72e753e80efe084a3aed9f9ac87bf44d09ce67aad3d4e01',
                            },
                        },
                        {
                            weight: 1,
                            key: {
                                x: '0xc7751c794337a93e4db041fb5401c2c816cf0a099d8fd4b1f3f555aab5dfead2',
                                y: '0x417521bb0c03d8637f350df15ef6a6cb3cdb806bd9d10bc71982dd03ff5d9ddd',
                            },
                        },
                        {
                            weight: 1,
                            key: {
                                x: '0x3919091ba17c106dd034af508cfe00b963d173dffab2c7702890e25a96d107ca',
                                y: '0x1bb4f148ee1984751e57d2435468558193ce84ab9a7731b842e9672e40dc0f22',
                            },
                        },
                    ],
                },
            }
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)
        }

        it('CAVERJS-UNIT-VALIDATOR-035: should validate signatures in the tx', async () => {
            setStubResult()

            const tx = caver.transaction.valueTransfer.create(txObj)
            const isValid = await caver.validator.validateSender(tx)
            expect(isValid).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-036: should return false when signatures in the tx are invalid', async () => {
            setStubResult()

            const tx = caver.transaction.valueTransfer.create(txObj)
            tx.signatures = [
                {
                    V: '0x0fe9',
                    R: '0x86c8ecbfd892be41d48443a2243274beb6daed3f72895045965a3baede4c350e',
                    S: '0x69ea748aff6e4c106d3a8ba597d8f134745b76f12dacb581318f9da07351511a',
                },
            ]
            const isValid = await caver.validator.validateSender(tx)
            expect(isValid).to.be.false
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-037: should return false when signatures weight sum is less than threshold', async () => {
            setStubResult()

            const tx = caver.transaction.valueTransfer.create(txObj)
            tx.signatures = txObj.signatures[0]
            const isValid = await caver.validator.validateSender(tx)
            expect(isValid).to.be.false
        }).timeout(100000)
    })

    context('caver.validator.validateSender with AccountKeyRoleBased', () => {
        const txObj = {
            from: '0xf21460730845e3652aa3cc9bc13b345e4f53984a',
            to: '0x59177716c34ac6e49e295a0e78e33522f14d61ee',
            value: '0x1',
            chainId: '0x7e3',
            gasPrice: '0x5d21dba00',
            nonce: '0x0',
            gas: '0x2faf080',
            signatures: [
                [
                    '0x0fea',
                    '0x2b5934c6d26bb3e65edf099d79c57c743d2f70744ca09d3ba9a1099edff9f173',
                    '0x0797886edff4b449c1a599943e3a6003ae9e46b3f3f34862ced327e43fba3a6a',
                ],
                [
                    '0x0fe9',
                    '0x63177648732ef855f800eb9f80f68501abb507f84c0d660286a6e0801334a1d2',
                    '0x620a996623c114f2df35b11ec8ac4f3758d3ad89cf81ba13614e51908cfe9218',
                ],
                [
                    '0x0fe9',
                    '0x86c8ecbfd892be41d48443a2243274beb6daed3f72895045965a3baede4c350e',
                    '0x69ea748aff6e4c106d3a8ba597d8f134745b76f12dacb581318f9da07351511a',
                ],
            ],
        }
        function setStubResult(roleNum, fakeKey) {
            const getAccountKeyResult = {
                keyType: 5,
                key: [
                    {
                        keyType: 4,
                        key: {
                            threshold: 2,
                            keys: [
                                {
                                    weight: 1,
                                    key: {
                                        x: '0x8bb6aaeb2d96d024754d3b50babf116cece68977acbe8ba6a66f14d5217c60d9',
                                        y: '0x6af020a0568661e7c72e753e80efe084a3aed9f9ac87bf44d09ce67aad3d4e01',
                                    },
                                },
                                {
                                    weight: 1,
                                    key: {
                                        x: '0xc7751c794337a93e4db041fb5401c2c816cf0a099d8fd4b1f3f555aab5dfead2',
                                        y: '0x417521bb0c03d8637f350df15ef6a6cb3cdb806bd9d10bc71982dd03ff5d9ddd',
                                    },
                                },
                                {
                                    weight: 1,
                                    key: {
                                        x: '0x3919091ba17c106dd034af508cfe00b963d173dffab2c7702890e25a96d107ca',
                                        y: '0x1bb4f148ee1984751e57d2435468558193ce84ab9a7731b842e9672e40dc0f22',
                                    },
                                },
                            ],
                        },
                    },
                    {
                        keyType: 4,
                        key: {
                            threshold: 2,
                            keys: [
                                {
                                    weight: 1,
                                    key: {
                                        x: '0x8bb6aaeb2d96d024754d3b50babf116cece68977acbe8ba6a66f14d5217c60d9',
                                        y: '0x6af020a0568661e7c72e753e80efe084a3aed9f9ac87bf44d09ce67aad3d4e01',
                                    },
                                },
                                {
                                    weight: 1,
                                    key: {
                                        x: '0xc7751c794337a93e4db041fb5401c2c816cf0a099d8fd4b1f3f555aab5dfead2',
                                        y: '0x417521bb0c03d8637f350df15ef6a6cb3cdb806bd9d10bc71982dd03ff5d9ddd',
                                    },
                                },
                            ],
                        },
                    },
                    {
                        keyType: 4,
                        key: {
                            threshold: 2,
                            keys: [
                                {
                                    weight: 1,
                                    key: {
                                        x: '0x8bb6aaeb2d96d024754d3b50babf116cece68977acbe8ba6a66f14d5217c60d9',
                                        y: '0x6af020a0568661e7c72e753e80efe084a3aed9f9ac87bf44d09ce67aad3d4e01',
                                    },
                                },
                                {
                                    weight: 1,
                                    key: {
                                        x: '0xc7751c794337a93e4db041fb5401c2c816cf0a099d8fd4b1f3f555aab5dfead2',
                                        y: '0x417521bb0c03d8637f350df15ef6a6cb3cdb806bd9d10bc71982dd03ff5d9ddd',
                                    },
                                },
                            ],
                        },
                    },
                ],
            }
            if (roleNum !== undefined) getAccountKeyResult.key[roleNum] = fakeKey
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)
        }

        it('CAVERJS-UNIT-VALIDATOR-038: should validate signatures in the tx', async () => {
            setStubResult()

            const tx = caver.transaction.valueTransfer.create(txObj)
            const isValid = await caver.validator.validateSender(tx)
            expect(isValid).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-039: should return false when signatures in the tx are invalid', async () => {
            setStubResult()

            const tx = caver.transaction.valueTransfer.create(txObj)
            tx.signatures = [
                {
                    V: '0x0fe9',
                    R: '0x86c8ecbfd892be41d48443a2243274beb6daed3f72895045965a3baede4c350e',
                    S: '0x69ea748aff6e4c106d3a8ba597d8f134745b76f12dacb581318f9da07351511a',
                },
            ]
            const isValid = await caver.validator.validateSender(tx)
            expect(isValid).to.be.false
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-040: should return false when signatures is made by invalid role (not roleTransactionKey)', async () => {
            setStubResult(0, {
                keyType: 4,
                key: {
                    threshold: 2,
                    keys: [
                        {
                            weight: 1,
                            key: {
                                x: '0xc734b50ddb229be5e929fc4aa8080ae8240a802d23d3290e5e6156ce029b110e',
                                y: '0x61a443ac3ffff164d1fb3617875f07641014cf17af6b7dc38e429fe838763712',
                            },
                        },
                        {
                            weight: 1,
                            key: {
                                x: '0x12d45f1cc56fbd6cd8fc877ab63b5092ac77db907a8a42c41dad3e98d7c64dfb',
                                y: '0x8ef355a8d524eb444eba507f236309ce08370debaa136cb91b2f445774bff842',
                            },
                        },
                    ],
                },
            })

            const tx = caver.transaction.valueTransfer.create(txObj)
            const isValid = await caver.validator.validateSender(tx)
            expect(isValid).to.be.false
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-041: should return false when signatures weight sum is less than threshold', async () => {
            setStubResult()

            const tx = caver.transaction.valueTransfer.create(txObj)
            tx.signatures = txObj.signatures[0]
            const isValid = await caver.validator.validateSender(tx)
            expect(isValid).to.be.false
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-042: should return true when signatures is made by roleAccountKey', async () => {
            const updateTxObj = {
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
            }

            setStubResult(0, {
                keyType: 4,
                key: {
                    threshold: 2,
                    keys: [
                        {
                            weight: 1,
                            key: {
                                x: '0xc734b50ddb229be5e929fc4aa8080ae8240a802d23d3290e5e6156ce029b110e',
                                y: '0x61a443ac3ffff164d1fb3617875f07641014cf17af6b7dc38e429fe838763712',
                            },
                        },
                        {
                            weight: 1,
                            key: {
                                x: '0x12d45f1cc56fbd6cd8fc877ab63b5092ac77db907a8a42c41dad3e98d7c64dfb',
                                y: '0x8ef355a8d524eb444eba507f236309ce08370debaa136cb91b2f445774bff842',
                            },
                        },
                    ],
                },
            })

            const tx = caver.transaction.accountUpdate.create(updateTxObj)
            const isValid = await caver.validator.validateSender(tx)
            expect(isValid).to.be.true
        }).timeout(100000)
    })
})

describe('caver.validator.validateFeePayer', () => {
    const txObj = {
        from: '0x07a9a76ef778676c3bd2b334edcf581db31a85e5',
        feePayer: '0xb5db72925b1b6b79299a1a49ae226cd7861083ac',
        to: '0x59177716c34ac6e49e295a0e78e33522f14d61ee',
        value: '0x1',
        chainId: '0x7e3',
        gasPrice: '0x5d21dba00',
        nonce: '0x0',
        gas: '0x2faf080',
        signatures: [
            [
                '0x0fea',
                '0xcb2bbf04a12ec3a06163c30ce8782739ec4745a53e265aa9443f1c0d678bb871',
                '0x7dd348c7d8fce6be36b661f116973d1c36cc92a389ad4a1a4053bd486060a083',
            ],
            [
                '0x0fe9',
                '0x6d5dfca992d6833c0da272578bc6ea941be45f44fb2fa114310ebe18d673ed52',
                '0x4dc5cd7985c9ce7d44d46d65e65c995a4a8c97159a1eed8b2efb0510b981ab7c',
            ],
            [
                '0x0fea',
                '0x945151edf556fbcebf832092d4534b9a3b1f3d46f85bce09e7d7211070cb57be',
                '0x1617c8f918f96970baddd12f240a9824eca6b29d91eb7333adacb987f2dcd8dd',
            ],
        ],
        feePayerSignatures: [
            [
                '0x0fea',
                '0x86fd17d788e89a6e0639395b3c0a04f916103debd6cbe639d6f4ff5034dde3e8',
                '0x0795551c551d9096234c290689767f34f2d409c95166ab18d216dbc93845ba16',
            ],
            [
                '0x0fea',
                '0x0653b6d1cdb90462094b089ce8e2fed0e3b8ec2c44125965e1a5af286644c758',
                '0x259b10e3bf594d48535fd0d95e15d095897c8d075c01dd56e7417d5943b0d53a',
            ],
            [
                '0x0fe9',
                '0xce8d051427adab10d1dc93de49123aeab18ba8aadedce0d57ef5b7fa451b1f4f',
                '0x4fe2a845d92ff48abca3e1d59637fab5f4a4e3172d91772d9bfce60760edc506',
            ],
        ],
    }

    beforeEach(() => {
        caver = new Caver(testRPCURL)
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.validator.validateSender with AccountKeyLegacy', () => {
        function setStubResult() {
            const getAccountKeyResult = { keyType: 1, key: {} }
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)
        }

        it('CAVERJS-UNIT-VALIDATOR-043: should validate feePayerSignatures in the tx', async () => {
            setStubResult()

            const tx = caver.transaction.feeDelegatedValueTransfer.create(txObj)
            const isValid = await caver.validator.validateFeePayer(tx)
            expect(isValid).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-044: should return false when signatures in the tx are invalid', async () => {
            setStubResult()

            const tx = caver.transaction.feeDelegatedValueTransfer.create(txObj)
            tx.feePayerSignatures = [
                {
                    V: '0x0fea',
                    R: '0x945151edf556fbcebf832092d4534b9a3b1f3d46f85bce09e7d7211070cb57be',
                    S: '0x1617c8f918f96970baddd12f240a9824eca6b29d91eb7333adacb987f2dcd8dd',
                },
            ]
            const isValid = await caver.validator.validateFeePayer(tx)
            expect(isValid).to.be.false
        }).timeout(100000)
    })

    context('caver.validator.validateSender with AccountKeyPublic', () => {
        function setStubResult() {
            const getAccountKeyResult = {
                keyType: 2,
                key: {
                    x: '0x2b557d80ddac3a0bbcc8a7861773ca7434c969e2721a574bb94a1e3aa5ceed38',
                    y: '0x19f08a82b31682c038f9f691fb38ee4aaf7e016e2c973a1bd1e48a51f60a54ea',
                },
            }
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)
        }

        it('CAVERJS-UNIT-VALIDATOR-045: should validate feePayerSignatures in the tx', async () => {
            setStubResult()

            const tx = caver.transaction.feeDelegatedValueTransfer.create(txObj)
            const isValid = await caver.validator.validateFeePayer(tx)
            expect(isValid).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-046: should return false when signatures in the tx are invalid', async () => {
            setStubResult()

            const tx = caver.transaction.feeDelegatedValueTransfer.create(txObj)
            tx.feePayerSignatures = [
                {
                    V: '0x0fe9',
                    R: '0x86c8ecbfd892be41d48443a2243274beb6daed3f72895045965a3baede4c350e',
                    S: '0x69ea748aff6e4c106d3a8ba597d8f134745b76f12dacb581318f9da07351511a',
                },
            ]
            const isValid = await caver.validator.validateFeePayer(tx)
            expect(isValid).to.be.false
        }).timeout(100000)
    })

    context('caver.validator.validateSender with AccountKeyFail', () => {
        function setStubResult() {
            const getAccountKeyResult = { keyType: 3, key: {} }
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)
        }

        it('CAVERJS-UNIT-VALIDATOR-047: should validate feePayerSignatures in the tx', async () => {
            setStubResult()

            const tx = caver.transaction.feeDelegatedValueTransfer.create(txObj)
            const isValid = await caver.validator.validateFeePayer(tx)
            expect(isValid).to.be.false
        }).timeout(100000)
    })

    context('caver.validator.validateSender with AccountKeyWeightedMultiSig', () => {
        function setStubResult() {
            const getAccountKeyResult = {
                keyType: 4,
                key: {
                    threshold: 3,
                    keys: [
                        {
                            weight: 2,
                            key: {
                                x: '0x2b557d80ddac3a0bbcc8a7861773ca7434c969e2721a574bb94a1e3aa5ceed38',
                                y: '0x19f08a82b31682c038f9f691fb38ee4aaf7e016e2c973a1bd1e48a51f60a54ea',
                            },
                        },
                        {
                            weight: 1,
                            key: {
                                x: '0x1a1cfe1e2ec4b15520c57c20c2460981a2f16003c8db11a0afc282abf929fa1c',
                                y: '0x1868f60f91b330c423aa660913d86acc2a0b1b15e7ba1fe571e5928a19825a7e',
                            },
                        },
                        {
                            weight: 1,
                            key: {
                                x: '0xdea23a89dbbde1a0c26466c49c1edd32785432389641797038c2b53815cb5c73',
                                y: '0xd6cf5355986fd9a22a68bb57b831857fd1636362b383bd632966392714b60d72',
                            },
                        },
                    ],
                },
            }
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)
        }

        it('CAVERJS-UNIT-VALIDATOR-048: should validate feePayerSignatures in the tx', async () => {
            setStubResult()

            const tx = caver.transaction.feeDelegatedValueTransfer.create(txObj)
            const isValid = await caver.validator.validateFeePayer(tx)
            expect(isValid).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-049: should return false when feePayerSignatures in the tx are invalid', async () => {
            setStubResult()

            const tx = caver.transaction.feeDelegatedValueTransfer.create(txObj)
            tx.feePayerSignatures = [
                {
                    V: '0x0fe9',
                    R: '0x86c8ecbfd892be41d48443a2243274beb6daed3f72895045965a3baede4c350e',
                    S: '0x69ea748aff6e4c106d3a8ba597d8f134745b76f12dacb581318f9da07351511a',
                },
            ]
            const isValid = await caver.validator.validateFeePayer(tx)
            expect(isValid).to.be.false
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-050: should return false when feePayerSignatures weight sum is less than threshold', async () => {
            setStubResult()

            const tx = caver.transaction.feeDelegatedValueTransfer.create(txObj)
            tx.feePayerSignatures = txObj.signatures[0]
            const isValid = await caver.validator.validateFeePayer(tx)
            expect(isValid).to.be.false
        }).timeout(100000)
    })

    context('caver.validator.validateSender with AccountKeyRoleBased', () => {
        function setStubResult(roleNum, fakeKey) {
            const getAccountKeyResult = {
                keyType: 5,
                key: [
                    {
                        keyType: 4,
                        key: {
                            threshold: 2,
                            keys: [
                                {
                                    weight: 1,
                                    key: {
                                        x: '0x8bb6aaeb2d96d024754d3b50babf116cece68977acbe8ba6a66f14d5217c60d9',
                                        y: '0x6af020a0568661e7c72e753e80efe084a3aed9f9ac87bf44d09ce67aad3d4e01',
                                    },
                                },
                                {
                                    weight: 1,
                                    key: {
                                        x: '0xc7751c794337a93e4db041fb5401c2c816cf0a099d8fd4b1f3f555aab5dfead2',
                                        y: '0x417521bb0c03d8637f350df15ef6a6cb3cdb806bd9d10bc71982dd03ff5d9ddd',
                                    },
                                },
                                {
                                    weight: 1,
                                    key: {
                                        x: '0x3919091ba17c106dd034af508cfe00b963d173dffab2c7702890e25a96d107ca',
                                        y: '0x1bb4f148ee1984751e57d2435468558193ce84ab9a7731b842e9672e40dc0f22',
                                    },
                                },
                            ],
                        },
                    },
                    {
                        keyType: 4,
                        key: {
                            threshold: 2,
                            keys: [
                                {
                                    weight: 1,
                                    key: {
                                        x: '0x8bb6aaeb2d96d024754d3b50babf116cece68977acbe8ba6a66f14d5217c60d9',
                                        y: '0x6af020a0568661e7c72e753e80efe084a3aed9f9ac87bf44d09ce67aad3d4e01',
                                    },
                                },
                                {
                                    weight: 1,
                                    key: {
                                        x: '0xc7751c794337a93e4db041fb5401c2c816cf0a099d8fd4b1f3f555aab5dfead2',
                                        y: '0x417521bb0c03d8637f350df15ef6a6cb3cdb806bd9d10bc71982dd03ff5d9ddd',
                                    },
                                },
                            ],
                        },
                    },
                    {
                        keyType: 4,
                        key: {
                            threshold: 2,
                            keys: [
                                {
                                    weight: 2,
                                    key: {
                                        x: '0x2b557d80ddac3a0bbcc8a7861773ca7434c969e2721a574bb94a1e3aa5ceed38',
                                        y: '0x19f08a82b31682c038f9f691fb38ee4aaf7e016e2c973a1bd1e48a51f60a54ea',
                                    },
                                },
                                {
                                    weight: 1,
                                    key: {
                                        x: '0x1a1cfe1e2ec4b15520c57c20c2460981a2f16003c8db11a0afc282abf929fa1c',
                                        y: '0x1868f60f91b330c423aa660913d86acc2a0b1b15e7ba1fe571e5928a19825a7e',
                                    },
                                },
                                {
                                    weight: 1,
                                    key: {
                                        x: '0xdea23a89dbbde1a0c26466c49c1edd32785432389641797038c2b53815cb5c73',
                                        y: '0xd6cf5355986fd9a22a68bb57b831857fd1636362b383bd632966392714b60d72',
                                    },
                                },
                            ],
                        },
                    },
                ],
            }
            if (roleNum !== undefined) getAccountKeyResult.key[roleNum] = fakeKey
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)
        }

        it('CAVERJS-UNIT-VALIDATOR-051: should validate feePayerSignatures in the tx', async () => {
            setStubResult()

            const tx = caver.transaction.feeDelegatedValueTransfer.create(txObj)
            const isValid = await caver.validator.validateFeePayer(tx)
            expect(isValid).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-052: should return false when feePayerSignatures in the tx are invalid', async () => {
            setStubResult()

            const tx = caver.transaction.feeDelegatedValueTransfer.create(txObj)
            tx.feePayerSignatures = [
                {
                    V: '0x0fe9',
                    R: '0x86c8ecbfd892be41d48443a2243274beb6daed3f72895045965a3baede4c350e',
                    S: '0x69ea748aff6e4c106d3a8ba597d8f134745b76f12dacb581318f9da07351511a',
                },
            ]
            const isValid = await caver.validator.validateFeePayer(tx)
            expect(isValid).to.be.false
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-053: should return false when feePayerSignatures is made by invalid role (not roleFeePayerKey)', async () => {
            setStubResult(2, {
                keyType: 4,
                key: {
                    threshold: 2,
                    keys: [
                        {
                            weight: 1,
                            key: {
                                x: '0xc734b50ddb229be5e929fc4aa8080ae8240a802d23d3290e5e6156ce029b110e',
                                y: '0x61a443ac3ffff164d1fb3617875f07641014cf17af6b7dc38e429fe838763712',
                            },
                        },
                        {
                            weight: 1,
                            key: {
                                x: '0x12d45f1cc56fbd6cd8fc877ab63b5092ac77db907a8a42c41dad3e98d7c64dfb',
                                y: '0x8ef355a8d524eb444eba507f236309ce08370debaa136cb91b2f445774bff842',
                            },
                        },
                    ],
                },
            })

            const tx = caver.transaction.feeDelegatedValueTransfer.create(txObj)
            const isValid = await caver.validator.validateFeePayer(tx)
            expect(isValid).to.be.false
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-054: should return false when feePayerSignatures weight sum is less than threshold', async () => {
            setStubResult()

            const tx = caver.transaction.feeDelegatedValueTransfer.create(txObj)
            tx.feePayerSignatures = txObj.signatures[0]
            const isValid = await caver.validator.validateFeePayer(tx)
            expect(isValid).to.be.false
        }).timeout(100000)
    })
})

describe('caver.validator.validateTransaction', () => {
    const txObj = {
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
    }
    const fdTxObj = {
        from: '0x07a9a76ef778676c3bd2b334edcf581db31a85e5',
        feePayer: '0xb5db72925b1b6b79299a1a49ae226cd7861083ac',
        to: '0x59177716c34ac6e49e295a0e78e33522f14d61ee',
        value: '0x1',
        chainId: '0x7e3',
        gasPrice: '0x5d21dba00',
        nonce: '0x0',
        gas: '0x2faf080',
        signatures: [
            [
                '0x0fea',
                '0xcb2bbf04a12ec3a06163c30ce8782739ec4745a53e265aa9443f1c0d678bb871',
                '0x7dd348c7d8fce6be36b661f116973d1c36cc92a389ad4a1a4053bd486060a083',
            ],
            [
                '0x0fe9',
                '0x6d5dfca992d6833c0da272578bc6ea941be45f44fb2fa114310ebe18d673ed52',
                '0x4dc5cd7985c9ce7d44d46d65e65c995a4a8c97159a1eed8b2efb0510b981ab7c',
            ],
            [
                '0x0fea',
                '0x945151edf556fbcebf832092d4534b9a3b1f3d46f85bce09e7d7211070cb57be',
                '0x1617c8f918f96970baddd12f240a9824eca6b29d91eb7333adacb987f2dcd8dd',
            ],
        ],
        feePayerSignatures: [
            [
                '0x0fea',
                '0x86fd17d788e89a6e0639395b3c0a04f916103debd6cbe639d6f4ff5034dde3e8',
                '0x0795551c551d9096234c290689767f34f2d409c95166ab18d216dbc93845ba16',
            ],
            [
                '0x0fea',
                '0x0653b6d1cdb90462094b089ce8e2fed0e3b8ec2c44125965e1a5af286644c758',
                '0x259b10e3bf594d48535fd0d95e15d095897c8d075c01dd56e7417d5943b0d53a',
            ],
            [
                '0x0fe9',
                '0xce8d051427adab10d1dc93de49123aeab18ba8aadedce0d57ef5b7fa451b1f4f',
                '0x4fe2a845d92ff48abca3e1d59637fab5f4a4e3172d91772d9bfce60760edc506',
            ],
        ],
    }

    beforeEach(() => {
        caver = new Caver(testRPCURL)
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.validator.validateTransaction', () => {
        it('CAVERJS-UNIT-VALIDATOR-055: should validate sender if basic tx', async () => {
            const tx = caver.transaction.valueTransfer.create(txObj)

            const validateSenderStub = sandbox.stub(caver.validator, 'validateSender')
            validateSenderStub.resolves(true)

            const isValid = await caver.validator.validateTransaction(tx)
            expect(isValid).to.be.true
            expect(validateSenderStub).to.have.been.callCount(1)
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-056: should validate sender and fee payer if fee-delegated tx', async () => {
            const tx = caver.transaction.feeDelegatedValueTransfer.create(fdTxObj)

            const validateSenderStub = sandbox.stub(caver.validator, 'validateSender')
            validateSenderStub.resolves(true)
            const validateFeePayerStub = sandbox.stub(caver.validator, 'validateFeePayer')
            validateFeePayerStub.resolves(true)

            const isValid = await caver.validator.validateTransaction(tx)
            expect(isValid).to.be.true
            expect(validateSenderStub).to.have.been.callCount(1)
            expect(validateFeePayerStub).to.have.been.callCount(1)
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-057: should validate with AccountKeyLegacy when getAccountKey returns null', async () => {
            const getAccoutKeyStub = sandbox.stub(caver.validator.klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(null)

            const tx = caver.transaction.feeDelegatedValueTransfer.create(fdTxObj)
            tx.signatures = tx.signatures[0]
            tx.feePayerSignatures = tx.feePayerSignatures[0]

            const isValid = await caver.validator.validateTransaction(tx)
            expect(isValid).to.be.true
            expect(getAccoutKeyStub).to.have.been.callCount(2)
        }).timeout(100000)
    })
})
