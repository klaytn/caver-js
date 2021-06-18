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

const Caver = require('../../index.js')

const Validator = require('../../packages/caver-validator')
const SignatureData = require('../../packages/caver-wallet/src/keyring/signatureData')

let caver

const sandbox = sinon.createSandbox()

describe('caver.validator.validteSignedMessage', () => {
    beforeEach(() => {
        caver = new Caver(testRPCURL)
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.validator.validteSignedMessage with AccountKeyLegacy', () => {
        const address = '0xa84a1ce657e9d5b383cece6f4ba365e23fa234dd'
        const privateKey = '0x7db91b4606aa4421eeb85d03601562f966693e38957d5e79a29edda0e85b2225'

        const getAccountKeyResult = { keyType: 1, key: {} }

        const message = 'Some Message'
        const hasedMessage = '0xa4b1069c1000981f4fdca0d62302dfff77c2d0bc17f283d961e2dc5961105b18'

        const signature = [
            '0x1b',
            '0x8213e560e7bbe1f2e28fd69cbbb41c9108b84c98cd7c2c88d3c8e3549fd6ab10',
            '0x3ca40c9e20c1525348d734a6724db152b9244bff6e0ff0c2b811d61d8f874f00',
        ]

        it('CAVERJS-UNIT-VALIDATOR-001: should return true when valid signatures with array format', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)
            const ret = await caver.validator.validteSignedMessage(message, signature, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-002: should return true when valid signatures with array format when message is hashed', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)

            const ret = await caver.validator.validteSignedMessage(hasedMessage, signature, keyring.address, true)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-003: should return true when valid signatures with SignatureData format', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)
            const ret = await caver.validator.validteSignedMessage(message, new SignatureData(signature), keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-004: should return true when valid signatures with SignatureData array format', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)

            const ret = await caver.validator.validteSignedMessage(message, [new SignatureData(signature)], keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-005: should return false when invalid signatures is passed as a parameter', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)

            const invalid = [
                '0x1c',
                '0xa5c9ff1df09258a6f9262f1fae43a306ec77592287787cbd3ee0419dd8d2bfeb',
                '0x4c903d3dda703554cf7b65aa2c0dc819c86d36cf2dbf0ff5071667fb5551a706',
            ]

            const ret = await caver.validator.validteSignedMessage(message, invalid, keyring.address)
            expect(ret).to.be.false
        }).timeout(100000)
    })

    context('caver.validator.validteSignedMessage with AccountKeyPublic', () => {
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
        const hasedMessage = '0xa4b1069c1000981f4fdca0d62302dfff77c2d0bc17f283d961e2dc5961105b18'

        const signature = [
            '0x1c',
            '0xa5c9ff1df09258a6f9262f1fae43a306ec77592287787cbd3ee0419dd8d2bfeb',
            '0x4c903d3dda703554cf7b65aa2c0dc819c86d36cf2dbf0ff5071667fb5551a706',
        ]

        it('CAVERJS-UNIT-VALIDATOR-006: should return true when valid signatures with array format', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)
            const ret = await caver.validator.validteSignedMessage(message, signature, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-007: should return true when valid signatures with array format when message is hashed', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)

            const ret = await caver.validator.validteSignedMessage(hasedMessage, signature, keyring.address, true)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-008: should return true when valid signatures with SignatureData format', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)
            const ret = await caver.validator.validteSignedMessage(message, new SignatureData(signature), keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-009: should return true when valid signatures with SignatureData array format', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)

            const ret = await caver.validator.validteSignedMessage(message, [new SignatureData(signature)], keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-010: should return false when invalid signatures are passed as a parameter', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKey)

            const invalidSig = [
                '0x1b',
                '0x883c4174fada447e95b09e3f27b2e27f419179366230bbcd5046ff946d1e4a90',
                '0x052f9e19394e593547370ec5216703c6b698377d4f5fa422bf0e1cb26698dad2',
            ]

            const ret = await caver.validator.validteSignedMessage(message, [new SignatureData(invalidSig)], keyring.address)
            expect(ret).to.be.false
        }).timeout(100000)
    })

    context('caver.validator.validteSignedMessage with AccountKeyFail', () => {
        const address = '0xa84a1ce657e9d5b383cece6f4ba365e23fa234dd'

        const getAccountKeyResult = { keyType: 3, key: {} }

        const message = 'Some Message'

        const signature = [
            '0x1c',
            '0xa5c9ff1df09258a6f9262f1fae43a306ec77592287787cbd3ee0419dd8d2bfeb',
            '0x4c903d3dda703554cf7b65aa2c0dc819c86d36cf2dbf0ff5071667fb5551a706',
        ]

        it('CAVERJS-UNIT-VALIDATOR-011: should return false when accountKey is AccountKeyFail', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const ret = await caver.validator.validteSignedMessage(message, signature, address)
            expect(ret).to.be.false
        }).timeout(100000)
    })

    context('caver.validator.validteSignedMessage with AccountKeyWeightedMultiSig', () => {
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
        const hasedMessage = '0xa4b1069c1000981f4fdca0d62302dfff77c2d0bc17f283d961e2dc5961105b18'

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
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const ret = await caver.validator.validteSignedMessage(message, signatures, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-013: should return true when valid signatures with array format when message is hashed', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const ret = await caver.validator.validteSignedMessage(hasedMessage, signatures, keyring.address, true)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-014: should return true when valid signatures with SignatureData array format', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const formattedSignatures = []
            for (const sig of signatures) formattedSignatures.push(new SignatureData(sig))

            const ret = await caver.validator.validteSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-015: should return true if threshold is satisfied', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const formattedSignatures = []
            formattedSignatures.push(new SignatureData(signatures[0])) // weight 2
            formattedSignatures.push(new SignatureData(signatures[1])) // wieght 1

            const ret = await caver.validator.validteSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-016: should return false if threshold is not satisfied', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const formattedSignatures = []
            formattedSignatures.push(new SignatureData(signatures[1])) // wieght 1
            formattedSignatures.push(new SignatureData(signatures[2])) // wieght 1

            const ret = await caver.validator.validteSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.false
        }).timeout(100000)

        // This test case should be chagned to expect false after fork.
        it('CAVERJS-UNIT-VALIDATOR-017: should return true when threshold is satisfied but includes invalid siganture though', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
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

            const ret = await caver.validator.validteSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        // This test case should be chagned to expect false after fork.
        it('CAVERJS-UNIT-VALIDATOR-018: should return false when invalid signatures are passed as a parameter', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
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

            const ret = await caver.validator.validteSignedMessage(message, invalidSig, keyring.address)
            expect(ret).to.be.false
        }).timeout(100000)
    })

    context('caver.validator.validteSignedMessage with AccountKeyRoleBased', () => {
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
        const hasedMessage = '0xa4b1069c1000981f4fdca0d62302dfff77c2d0bc17f283d961e2dc5961105b18'

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
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const ret = await caver.validator.validteSignedMessage(message, signatures, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-020: should return true when valid signatures with array format when message is hashed', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const ret = await caver.validator.validteSignedMessage(hasedMessage, signatures, keyring.address, true)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-021: should return true when valid signatures with SignatureData array format', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const formattedSignatures = []
            for (const sig of signatures) formattedSignatures.push(new SignatureData(sig))

            const ret = await caver.validator.validteSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-022: should return true if threshold is satisfied', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const formattedSignatures = []
            formattedSignatures.push(new SignatureData(signatures[0])) // weight 2
            formattedSignatures.push(new SignatureData(signatures[1])) // wieght 1

            const ret = await caver.validator.validteSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-023: should return false if threshold is not satisfied', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const formattedSignatures = []
            formattedSignatures.push(new SignatureData(signatures[1])) // wieght 1
            formattedSignatures.push(new SignatureData(signatures[2])) // wieght 1

            const ret = await caver.validator.validteSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.false
        }).timeout(100000)

        // This test case should be chagned to expect false after fork.
        it('CAVERJS-UNIT-VALIDATOR-024: should return true when threshold is satisfied but includes invalid siganture though', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
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

            const ret = await caver.validator.validteSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-025: should return false if signature is signed by roleAccountUpateKey', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const formattedSignatures = []
            for (const sig of roleAccountUpdateKeySignatures) formattedSignatures.push(new SignatureData(sig))

            const ret = await caver.validator.validteSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.false
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-026: should return false if signature is signed by roleFeePayerKey', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves(getAccountKeyResult)

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const formattedSignatures = []
            for (const sig of roleFeePayerKeySignatures) formattedSignatures.push(new SignatureData(sig))

            const ret = await caver.validator.validteSignedMessage(message, formattedSignatures, keyring.address)
            expect(ret).to.be.false
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-027: should return true with AccountKeyLegacy in roleTransactionKey', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
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

            const ret = await caver.validator.validteSignedMessage(message, signatureWithAccountKeyLegacy, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-028: should return true with AccountKeyPublic in roleTransactionKey', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
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

            const ret = await caver.validator.validteSignedMessage(message, signatureWithAccountKeyPublic, keyring.address)
            expect(ret).to.be.true
        }).timeout(100000)

        it('CAVERJS-UNIT-VALIDATOR-029: should return false with AccountKeyFail in roleTransactionKey', async () => {
            const getAccoutKeyStub = sandbox.stub(Validator._klaytnCall, 'getAccountKey')
            getAccoutKeyStub.resolves({
                keyType: 5,
                key: [{ keyType: 3, key: {} }, getAccountKeyResult.key[1], getAccountKeyResult.key[2]],
            })

            const keyring = caver.wallet.keyring.create(address, privateKeys)

            const ret = await caver.validator.validteSignedMessage(message, signatures, keyring.address)
            expect(ret).to.be.false
        }).timeout(100000)
    })
})
