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
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')
const testRPCURL = require('../testrpc')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect
const sandbox = sinon.createSandbox()

const Caver = require('../../index')

let caver
let testKeyring
let sender

beforeEach(() => {
    caver = new Caver(testRPCURL)
    testKeyring = caver.wallet.keyring.generate()

    const senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey

    sender = caver.wallet.add(caver.wallet.keyring.createFromPrivateKey(senderPrvKey))
})

afterEach(() => {
    sandbox.restore()
})

describe('caver.rpc.klay', () => {
    context('CAVERJS-UNIT-RPC-001: caver.rpc.klay.encodeAccountKey', () => {
        it('should encode an account key using the Recursive Length Prefix (RLP) encoding scheme.', async () => {
            // AccountKeyNil
            let result = await caver.rpc.klay.encodeAccountKey({ keyType: 0, key: {} })
            expect(_.isString(result)).to.be.true
            expect(result).to.be.equal('0x80')

            // AccountKeyLegacy
            result = await caver.rpc.klay.encodeAccountKey({ keyType: 1, key: {} })
            expect(_.isString(result)).to.be.true
            expect(result).to.be.equal('0x01c0')

            let account = caver.account.createWithAccountKeyLegacy(testKeyring.address)
            let encoded = await caver.rpc.klay.encodeAccountKey(account.accountKey)
            expect(result).to.be.equal(encoded)

            // AccountKeyPublic
            let keyObject = {
                keyType: 2,
                key: {
                    x: '0xdbac81e8486d68eac4e6ef9db617f7fbd79a04a3b323c982a09cdfc61f0ae0e8',
                    y: '0x906d7170ba349c86879fb8006134cbf57bda9db9214a90b607b6b4ab57fc026e',
                },
            }
            result = await caver.rpc.klay.encodeAccountKey(keyObject)
            expect(_.isString(result)).to.be.true
            expect(result).to.be.equal('0x02a102dbac81e8486d68eac4e6ef9db617f7fbd79a04a3b323c982a09cdfc61f0ae0e8')
            account = caver.account.create(
                testKeyring.address,
                '0xdbac81e8486d68eac4e6ef9db617f7fbd79a04a3b323c982a09cdfc61f0ae0e8906d7170ba349c86879fb8006134cbf57bda9db9214a90b607b6b4ab57fc026e'
            )
            encoded = await caver.rpc.klay.encodeAccountKey(account.accountKey)
            expect(result).to.be.equal(encoded)

            // AccountKeyFail
            result = await caver.rpc.klay.encodeAccountKey({ keyType: 3, key: {} })
            expect(_.isString(result)).to.be.true
            expect(result).to.be.equal('0x03c0')

            account = caver.account.createWithAccountKeyFail(testKeyring.address)
            encoded = await caver.rpc.klay.encodeAccountKey(account.accountKey)
            expect(result).to.be.equal(encoded)

            // AccountKeyWeightedMultiSig
            keyObject = {
                keyType: 4,
                key: {
                    threshold: 3,
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
                        {
                            weight: 1,
                            key: {
                                x: '0xea9a9f85065a00d7b9ffd3a8532a574035984587fd08107d8f4cbad6b786b0cd',
                                y: '0xb95ebb02d9397b4a8faceb58d485d612f0379a923ec0ddcf083378460a56acca',
                            },
                        },
                        {
                            weight: 1,
                            key: {
                                x: '0x8551bc489d62fa2e6f767ba87fe93a62b679fca8ff3114eb5805e6487b51e8f6',
                                y: '0x4206aa84bc8955fcbfcc396854228aa63ebacd81b7311a31ab9d71d90b7ec3d7',
                            },
                        },
                    ],
                },
            }
            result = await caver.rpc.klay.encodeAccountKey(keyObject)
            expect(_.isString(result)).to.be.true
            expect(result).to.be.equal(
                '0x04f89303f890e301a102c734b50ddb229be5e929fc4aa8080ae8240a802d23d3290e5e6156ce029b110ee301a10212d45f1cc56fbd6cd8fc877ab63b5092ac77db907a8a42c41dad3e98d7c64dfbe301a102ea9a9f85065a00d7b9ffd3a8532a574035984587fd08107d8f4cbad6b786b0cde301a1038551bc489d62fa2e6f767ba87fe93a62b679fca8ff3114eb5805e6487b51e8f6'
            )
            let options = new caver.account.weightedMultiSigOptions(3, [1, 1, 1, 1])
            account = caver.account.create(
                testKeyring.address,
                [
                    '0xc734b50ddb229be5e929fc4aa8080ae8240a802d23d3290e5e6156ce029b110e61a443ac3ffff164d1fb3617875f07641014cf17af6b7dc38e429fe838763712',
                    '0x12d45f1cc56fbd6cd8fc877ab63b5092ac77db907a8a42c41dad3e98d7c64dfb8ef355a8d524eb444eba507f236309ce08370debaa136cb91b2f445774bff842',
                    '0xea9a9f85065a00d7b9ffd3a8532a574035984587fd08107d8f4cbad6b786b0cdb95ebb02d9397b4a8faceb58d485d612f0379a923ec0ddcf083378460a56acca',
                    '0x8551bc489d62fa2e6f767ba87fe93a62b679fca8ff3114eb5805e6487b51e8f64206aa84bc8955fcbfcc396854228aa63ebacd81b7311a31ab9d71d90b7ec3d7',
                ],
                options
            )
            encoded = await caver.rpc.klay.encodeAccountKey(account.accountKey)
            expect(result).to.be.equal(encoded)

            // AccountKeyRoleBased
            keyObject = {
                keyType: 5,
                key: [
                    {
                        keyType: 2,
                        key: {
                            x: '0xe4a01407460c1c03ac0c82fd84f303a699b210c0b054f4aff72ff7dcdf01512d',
                            y: '0xa5735a23ce1654b14680054a993441eae7c261983a56f8e0da61280758b5919',
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
                                        x: '0xe4a01407460c1c03ac0c82fd84f303a699b210c0b054f4aff72ff7dcdf01512d',
                                        y: '0xa5735a23ce1654b14680054a993441eae7c261983a56f8e0da61280758b5919',
                                    },
                                },
                                {
                                    weight: 1,
                                    key: {
                                        x: '0x36f6355f5b532c3c1606f18fa2be7a16ae200c5159c8031dd25bfa389a4c9c06',
                                        y: '0x6fdf9fc87a16ac359e66d9761445d5ccbb417fb7757a3f5209d713824596a50d',
                                    },
                                },
                            ],
                        },
                    },
                    {
                        keyType: 2,
                        key: {
                            x: '0xc8785266510368d9372badd4c7f4a94b692e82ba74e0b5e26b34558b0f081447',
                            y: '0x94c27901465af0a703859ab47f8ae17e54aaba453b7cde5a6a9e4a32d45d72b2',
                        },
                    },
                ],
            }
            result = await caver.rpc.klay.encodeAccountKey(keyObject)
            expect(_.isString(result)).to.be.true
            expect(result).to.be.equal(
                '0x05f898a302a103e4a01407460c1c03ac0c82fd84f303a699b210c0b054f4aff72ff7dcdf01512db84e04f84b02f848e301a103e4a01407460c1c03ac0c82fd84f303a699b210c0b054f4aff72ff7dcdf01512de301a10336f6355f5b532c3c1606f18fa2be7a16ae200c5159c8031dd25bfa389a4c9c06a302a102c8785266510368d9372badd4c7f4a94b692e82ba74e0b5e26b34558b0f081447'
            )
            options = [
                new caver.account.weightedMultiSigOptions(),
                new caver.account.weightedMultiSigOptions(2, [1, 1]),
                new caver.account.weightedMultiSigOptions(),
            ]
            account = caver.account.create(
                testKeyring.address,
                [
                    [
                        '0xe4a01407460c1c03ac0c82fd84f303a699b210c0b054f4aff72ff7dcdf01512d0a5735a23ce1654b14680054a993441eae7c261983a56f8e0da61280758b5919',
                    ],
                    [
                        '0xe4a01407460c1c03ac0c82fd84f303a699b210c0b054f4aff72ff7dcdf01512d0a5735a23ce1654b14680054a993441eae7c261983a56f8e0da61280758b5919',
                        '0x36f6355f5b532c3c1606f18fa2be7a16ae200c5159c8031dd25bfa389a4c9c066fdf9fc87a16ac359e66d9761445d5ccbb417fb7757a3f5209d713824596a50d',
                    ],
                    [
                        '0xc8785266510368d9372badd4c7f4a94b692e82ba74e0b5e26b34558b0f08144794c27901465af0a703859ab47f8ae17e54aaba453b7cde5a6a9e4a32d45d72b2',
                    ],
                ],
                options
            )
            encoded = await caver.rpc.klay.encodeAccountKey(account.accountKey)
            expect(result).to.be.equal(encoded)
        }).timeout(100000)
    })

    context('CAVERJS-UNIT-RPC-002: caver.rpc.klay.decodeAccountKey', () => {
        it('should encode an account key using the Recursive Length Prefix (RLP) encoding scheme.', async () => {
            // AccountKeyNil
            let decoded = await caver.rpc.klay.decodeAccountKey('0x80')
            expect(decoded.keyType).to.equal(0)

            // AccountKeyLegacy
            decoded = await caver.rpc.klay.decodeAccountKey('0x01c0')
            expect(decoded.keyType).to.equal(1)

            // AccountKeyPublic
            let keyObject = {
                keyType: 2,
                key: {
                    x: '0xdbac81e8486d68eac4e6ef9db617f7fbd79a04a3b323c982a09cdfc61f0ae0e8',
                    y: '0x906d7170ba349c86879fb8006134cbf57bda9db9214a90b607b6b4ab57fc026e',
                },
            }
            decoded = await caver.rpc.klay.decodeAccountKey('0x02a102dbac81e8486d68eac4e6ef9db617f7fbd79a04a3b323c982a09cdfc61f0ae0e8')
            expect(decoded.keyType).to.equal(keyObject.keyType)
            expect(decoded.key.x).to.equal(keyObject.key.x)
            expect(decoded.key.y).to.equal(keyObject.key.y)

            // AccountKeyFail
            decoded = await caver.rpc.klay.decodeAccountKey('0x03c0')
            expect(decoded.keyType).to.equal(3)

            // AccountKeyWeightedMultiSig
            keyObject = {
                keyType: 4,
                key: {
                    threshold: 3,
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
                        {
                            weight: 1,
                            key: {
                                x: '0xea9a9f85065a00d7b9ffd3a8532a574035984587fd08107d8f4cbad6b786b0cd',
                                y: '0xb95ebb02d9397b4a8faceb58d485d612f0379a923ec0ddcf083378460a56acca',
                            },
                        },
                        {
                            weight: 1,
                            key: {
                                x: '0x8551bc489d62fa2e6f767ba87fe93a62b679fca8ff3114eb5805e6487b51e8f6',
                                y: '0x4206aa84bc8955fcbfcc396854228aa63ebacd81b7311a31ab9d71d90b7ec3d7',
                            },
                        },
                    ],
                },
            }
            decoded = await caver.rpc.klay.decodeAccountKey(
                '0x04f89303f890e301a102c734b50ddb229be5e929fc4aa8080ae8240a802d23d3290e5e6156ce029b110ee301a10212d45f1cc56fbd6cd8fc877ab63b5092ac77db907a8a42c41dad3e98d7c64dfbe301a102ea9a9f85065a00d7b9ffd3a8532a574035984587fd08107d8f4cbad6b786b0cde301a1038551bc489d62fa2e6f767ba87fe93a62b679fca8ff3114eb5805e6487b51e8f6'
            )
            expect(decoded.keyType).to.equal(keyObject.keyType)
            expect(decoded.key.threshold).to.equal(keyObject.key.threshold)
            for (let i = 0; i < decoded.key.keys.length; i++) {
                expect(decoded.key.keys[i].weight).to.equal(keyObject.key.keys[i].weight)
                expect(decoded.key.keys[i].key.x).to.equal(keyObject.key.keys[i].key.x)
                expect(decoded.key.keys[i].key.y).to.equal(keyObject.key.keys[i].key.y)
            }

            // AccountKeyRoleBased
            keyObject = {
                keyType: 5,
                key: [
                    {
                        keyType: 2,
                        key: {
                            x: '0xe4a01407460c1c03ac0c82fd84f303a699b210c0b054f4aff72ff7dcdf01512d',
                            y: '0xa5735a23ce1654b14680054a993441eae7c261983a56f8e0da61280758b5919',
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
                                        x: '0xe4a01407460c1c03ac0c82fd84f303a699b210c0b054f4aff72ff7dcdf01512d',
                                        y: '0xa5735a23ce1654b14680054a993441eae7c261983a56f8e0da61280758b5919',
                                    },
                                },
                                {
                                    weight: 1,
                                    key: {
                                        x: '0x36f6355f5b532c3c1606f18fa2be7a16ae200c5159c8031dd25bfa389a4c9c06',
                                        y: '0x6fdf9fc87a16ac359e66d9761445d5ccbb417fb7757a3f5209d713824596a50d',
                                    },
                                },
                            ],
                        },
                    },
                    {
                        keyType: 2,
                        key: {
                            x: '0xc8785266510368d9372badd4c7f4a94b692e82ba74e0b5e26b34558b0f081447',
                            y: '0x94c27901465af0a703859ab47f8ae17e54aaba453b7cde5a6a9e4a32d45d72b2',
                        },
                    },
                ],
            }
            decoded = await caver.rpc.klay.decodeAccountKey(
                '0x05f898a302a103e4a01407460c1c03ac0c82fd84f303a699b210c0b054f4aff72ff7dcdf01512db84e04f84b02f848e301a103e4a01407460c1c03ac0c82fd84f303a699b210c0b054f4aff72ff7dcdf01512de301a10336f6355f5b532c3c1606f18fa2be7a16ae200c5159c8031dd25bfa389a4c9c06a302a102c8785266510368d9372badd4c7f4a94b692e82ba74e0b5e26b34558b0f081447'
            )
            expect(decoded.keyType).to.equal(keyObject.keyType)
            for (let i = 0; i < decoded.key.length; i++) {
                expect(decoded.key[i].keyType).to.equal(keyObject.key[i].keyType)
                if (decoded.key[i].keyType === 2) {
                    expect(decoded.key[i].key.x).to.equal(keyObject.key[i].key.x)
                    expect(decoded.key[i].key.y).to.equal(keyObject.key[i].key.y)
                } else {
                    expect(decoded.key[i].key.threshold).to.equal(keyObject.key[i].key.threshold)
                    for (let j = 0; j < decoded.key[i].key.keys.length; j++) {
                        expect(decoded.key[i].key.keys[j].weight).to.equal(keyObject.key[i].key.keys[j].weight)
                        expect(decoded.key[i].key.keys[j].key.x).to.equal(keyObject.key[i].key.keys[j].key.x)
                        expect(decoded.key[i].key.keys[j].key.y).to.equal(keyObject.key[i].key.keys[j].key.y)
                    }
                }
            }
        }).timeout(100000)
    })

    context('CAVERJS-UNIT-RPC-003: caver.rpc.klay.signTransaction', () => {
        it('should return result of signing as a sender', async () => {
            const passphrase = 'passphrase'
            let keyringToImport = caver.wallet.keyring.generate()
            keyringToImport = caver.wallet.add(keyringToImport)
            const address = await caver.klay.personal.importRawKey(keyringToImport.key.privateKey, passphrase)
            expect(address.toLowerCase()).to.equals(keyringToImport.address.toLowerCase())

            const isUnlock = await caver.klay.personal.unlockAccount(keyringToImport.address, passphrase, 100)
            expect(typeof isUnlock).to.equals('boolean')
            expect(isUnlock).to.be.true

            const feeDelegated = caver.transaction.feeDelegatedValueTransfer.create({
                from: keyringToImport.address,
                to: sender.address,
                value: 1,
                gas: 50000,
                feePayer: sender.address,
                nonce: await caver.rpc.klay.getTransactionCount(keyringToImport.address),
            })

            const result = await caver.rpc.klay.signTransaction(feeDelegated)
            const signed = await feeDelegated.sign(keyringToImport)
            expect(caver.utils.makeEven(result.tx.signatures[0].V)).to.equal(signed.signatures[0].v)
            expect(caver.utils.makeEven(result.tx.signatures[0].R)).to.equal(signed.signatures[0].r)
            expect(caver.utils.makeEven(result.tx.signatures[0].S)).to.equal(signed.signatures[0].s)
        }).timeout(100000)
    })

    context('CAVERJS-UNIT-RPC-004: caver.rpc.klay.signTransactionAsFeePayer', () => {
        it('should return result of signing as a fee payer', async () => {
            const passphrase = 'passphrase'
            let keyringToImport = caver.wallet.keyring.generate()
            keyringToImport = caver.wallet.add(keyringToImport)
            const address = await caver.klay.personal.importRawKey(keyringToImport.key.privateKey, passphrase)
            expect(address.toLowerCase()).to.equals(keyringToImport.address.toLowerCase())

            const isUnlock = await caver.klay.personal.unlockAccount(keyringToImport.address, passphrase, 100)
            expect(typeof isUnlock).to.equals('boolean')
            expect(isUnlock).to.be.true

            const feeDelegated = caver.transaction.feeDelegatedValueTransfer.create({
                from: sender.address,
                to: keyringToImport.address,
                value: 1,
                gas: 50000,
                feePayer: keyringToImport.address,
                nonce: await caver.rpc.klay.getTransactionCount(sender.address),
            })

            await feeDelegated.sign(sender)

            const result = await caver.rpc.klay.signTransactionAsFeePayer(feeDelegated)
            const signed = await feeDelegated.signAsFeePayer(keyringToImport)
            expect(result.tx.feePayerSignatures[0].toString()).to.equal(
                caver.utils.transformSignaturesToObject(signed.feePayerSignatures).toString()
            )
        }).timeout(100000)
    })

    context('CAVERJS-UNIT-RPC-005: caver.rpc.klay.sendTransactionAsFeePayer', () => {
        it('should send transaction to Klaytn node as a fee payer', async () => {
            const passphrase = 'passphrase'
            let keyringToImport = caver.wallet.keyring.generate()
            keyringToImport = caver.wallet.add(keyringToImport)

            // Send KLAY to test keyring
            const valueTransfer = caver.transaction.valueTransfer.create({
                from: sender.address,
                to: keyringToImport.address,
                value: caver.utils.toPeb(1, 'KLAY'),
                gas: 30000,
            })
            await valueTransfer.sign(sender)
            await caver.rpc.klay.sendRawTransaction(valueTransfer)

            // Import key in Klaytn node
            const address = await caver.klay.personal.importRawKey(keyringToImport.key.privateKey, passphrase)
            expect(address.toLowerCase()).to.equals(keyringToImport.address.toLowerCase())

            const isUnlock = await caver.klay.personal.unlockAccount(keyringToImport.address, passphrase, 100)
            expect(typeof isUnlock).to.equals('boolean')
            expect(isUnlock).to.be.true

            const feeDelegated = caver.transaction.feeDelegatedValueTransfer.create({
                from: sender.address,
                to: keyringToImport.address,
                value: 1,
                gas: 50000,
                feePayer: keyringToImport.address,
                nonce: await caver.rpc.klay.getTransactionCount(sender.address),
            })

            await feeDelegated.sign(sender)

            const result = await caver.rpc.klay.signTransactionAsFeePayer(feeDelegated)
            const signed = await feeDelegated.signAsFeePayer(keyringToImport)
            expect(result.tx.feePayerSignatures[0].toString()).to.equal(
                caver.utils.transformSignaturesToObject(signed.feePayerSignatures).toString()
            )
        }).timeout(100000)
    })

    context('caver.rpc.klay.getFeeHistory', () => {
        function checkFeeHistoryResult(blockCount, blockNumberOrTag, rewardPercentiles, ret) {
            const bc = caver.utils.hexToNumber(blockCount)
            let bn = blockNumberOrTag
            try {
                bn = caver.utils.hexToNumber(bn)
                expect(ret.oldestBlock).to.equal(caver.utils.toHex(bn - bc + 1))
            } catch (e) {
                // blockNumberOrTag is tag
            }

            expect(ret.oldestBlock).not.to.be.undefined
            expect(ret.reward.length).to.equal(bc)
            expect(ret.reward[0].length).to.equal(rewardPercentiles.length)
            expect(ret.baseFeePerGas.length).to.equal(bc + 1) // include next base fee
            expect(ret.baseFeePerGas.every(bf => caver.utils.isHexStrict(bf))).to.be.true
            expect(ret.gasUsedRatio.length).to.equal(bc)
            expect(ret.gasUsedRatio.every(gur => _.isNumber(gur))).to.be.true
        }

        it('CAVERJS-UNIT-RPC-023: should call klay_feeHistory', async () => {
            const blockCount = 5
            const blockNumber = 'latest'
            const rewardPercentiles = [0.1, 0.3, 0.8]

            sandbox.stub(caver.rpc.klay._requestManager, 'send').callsFake((data, callback) => {
                expect(data.method).to.equal('klay_feeHistory')
                callback(undefined, {})
            })

            await caver.rpc.klay.getFeeHistory(blockCount, blockNumber, rewardPercentiles)
        }).timeout(100000)

        it('CAVERJS-UNIT-RPC-024: should return fee history with various parameter types', async () => {
            let nonce = caver.utils.hexToNumber(await caver.rpc.klay.getTransactionCount(sender.address))
            const txsCount = 30
            let receipt
            for (let i = 0; i < txsCount; i++) {
                const tx = caver.transaction.valueTransfer.create({
                    from: sender.address,
                    to: caver.wallet.keyring.generate().address,
                    value: 1,
                    gas: 50000,
                    nonce,
                })
                await caver.wallet.sign(sender.address, tx)
                nonce++

                // To track last transaction's receipt
                if (i !== txsCount - 1) {
                    caver.rpc.klay.sendRawTransaction(tx)
                    continue
                }
                receipt = await caver.rpc.klay.sendRawTransaction(tx)
            }

            // Test with hex string
            let blockCount = caver.utils.numberToHex(5)
            let blockNumber = receipt.blockNumber
            let rewardPercentiles = [0.1, 0.3, 0.8]
            let ret = await caver.rpc.klay.getFeeHistory(blockCount, blockNumber, rewardPercentiles)
            checkFeeHistoryResult(blockCount, blockNumber, rewardPercentiles, ret)

            // Test with hex string
            blockCount = 5
            blockNumber = caver.utils.hexToNumber(receipt.blockNumber)
            rewardPercentiles = [0.1, 0.3, 0.8]
            ret = await caver.rpc.klay.getFeeHistory(blockCount, blockNumber, rewardPercentiles)
            checkFeeHistoryResult(blockCount, blockNumber, rewardPercentiles, ret)

            // Test with BN
            blockCount = caver.utils.toBN(5)
            blockNumber = caver.utils.toBN(receipt.blockNumber)
            rewardPercentiles = [0.1, 0.3, 0.8]
            ret = await caver.rpc.klay.getFeeHistory(blockCount, blockNumber, rewardPercentiles)
            checkFeeHistoryResult(blockCount, blockNumber, rewardPercentiles, ret)

            // Test with BigNumber
            blockCount = new caver.utils.BigNumber(5)
            blockNumber = new caver.utils.BigNumber(receipt.blockNumber)
            rewardPercentiles = [0.1, 0.3, 0.8]
            ret = await caver.rpc.klay.getFeeHistory(blockCount, blockNumber, rewardPercentiles)
            checkFeeHistoryResult(blockCount, blockNumber, rewardPercentiles, ret)

            // Test with block tag string
            blockCount = 5
            blockNumber = 'latest'
            rewardPercentiles = [0.1, 0.3, 0.8]
            ret = await caver.rpc.klay.getFeeHistory(blockCount, blockNumber, rewardPercentiles)
            checkFeeHistoryResult(blockCount, blockNumber, rewardPercentiles, ret)
        }).timeout(100000)
    })

    context('caver.rpc.klay.getMaxPriorityFeePerGas', () => {
        it('CAVERJS-UNIT-RPC-025: should call klay_maxPriorityFeePerGas', async () => {
            sandbox.stub(caver.rpc.klay._requestManager, 'send').callsFake((data, callback) => {
                expect(data.method).to.equal('klay_maxPriorityFeePerGas')
                callback(undefined, {})
            })

            await caver.rpc.klay.getMaxPriorityFeePerGas()
        }).timeout(100000)

        it('CAVERJS-UNIT-RPC-026: should return suggested max priority fee per gas', async () => {
            const ret = await caver.rpc.klay.getMaxPriorityFeePerGas()
            const gasPrice = await caver.rpc.klay.getGasPrice()
            expect(_.isString(ret)).to.be.true
            expect(ret).to.equal(gasPrice)
        }).timeout(100000)
    })

    context('caver.rpc.klay.createAccessList', () => {
        const txArgs = {
            from: '0x3bc5885c2941c5cda454bdb4a8c88aa7f248e312',
            data: '0x20965255',
            gasPrice: '0x3b9aca00',
            gas: '0x3d0900',
            to: '0x00f5f5f3a25f142fafd0af24a754fafa340f32c7',
        }
        function checkAccessListResult(blockNumberOrTag, ret) {
            expect(_.isArray(ret.accessList)).to.be.true
            expect(ret.accessList.length).to.equal(0) // For now Klaytn will return empty access list
            expect(ret.gasUsed).to.equal('0x0') // For now Klaytn will return zero gasUsed
        }

        it('CAVERJS-UNIT-RPC-027: should call klay_createAccessList', async () => {
            sandbox.stub(caver.rpc.klay._requestManager, 'send').callsFake((data, callback) => {
                expect(data.method).to.equal('klay_createAccessList')
                callback(undefined, {})
            })
            await caver.rpc.klay.createAccessList(txArgs, 'latest')
        }).timeout(100000)

        it('CAVERJS-UNIT-RPC-028: should return access list used by transaction', async () => {
            const blocTag = 'latest'
            let ret = await caver.rpc.klay.createAccessList(txArgs, blocTag)
            checkAccessListResult(blocTag, ret)

            const hexBlockNumber = await caver.rpc.klay.getBlockNumber()
            ret = await caver.rpc.klay.createAccessList(txArgs, hexBlockNumber)
            checkAccessListResult(hexBlockNumber, ret)

            const blockNumber = caver.utils.hexToNumber(hexBlockNumber)
            ret = await caver.rpc.klay.createAccessList(txArgs, blockNumber)
            checkAccessListResult(blockNumber, ret)

            const blockBN = caver.utils.toBN(blockNumber)
            ret = await caver.rpc.klay.createAccessList(txArgs, blockBN)
            checkAccessListResult(blockBN, ret)

            const blockBigNumber = new caver.utils.BigNumber(blockNumber)
            ret = await caver.rpc.klay.createAccessList(txArgs, blockBigNumber)
            checkAccessListResult(blockBigNumber, ret)
        }).timeout(100000)
    })

    context('caver.rpc.klay.getHeader', () => {
        it('CAVERJS-UNIT-RPC-029: caver.rpc.klay.getHeader should call correct RPC call depends on param type', async () => {
            // Have to call klay_getHeaderByHash with hex string param
            sandbox.stub(caver.rpc.klay._requestManager, 'send').callsFake((data, callback) => {
                expect(data.params.length).to.equal(1)
                if (caver.utils.isValidHash(data.params[0])) {
                    expect(data.method).to.equal('klay_getHeaderByHash')
                } else {
                    expect(data.method).to.equal('klay_getHeaderByNumber')
                }
                callback(undefined, {})
            })
            await caver.rpc.klay.getHeader('latest')
            await caver.rpc.klay.getHeader(0)
            await caver.rpc.klay.getHeader('0x489ef4696baa7f5c9548cb4affa1b969a5b18de221b0cc0ed2483a1b2f84ac69')
        }).timeout(100000)
    })
})

describe('caver.rpc.governance', () => {
    context('caver.rpc.governance.vote', () => {
        it('CAVERJS-UNIT-RPC-006: should submit voting to the Klaytn', async () => {
            let key = 'governance.governancemode'
            let value = 'ballot'
            const govRPCStub = sandbox
                .stub(caver.rpc.governance.vote.method.requestManager, 'send')
                .callsFake((payload, sendTxCallback) => {
                    expect(payload.method).to.equal('governance_vote')
                    expect(payload.params.length).to.equal(caver.rpc.governance.vote.method.params)
                    expect(payload.params[0]).to.equal(key)
                    expect(payload.params[1]).to.equal(value)
                    sendTxCallback(null, 'Your vote was successfully placed.')
                })

            await caver.rpc.governance.vote(key, value)
            expect(govRPCStub.callCount).to.equal(1)

            key = 'governance.governingnode'
            value = '0x12345678990123456789901234567899012345678990'

            await caver.rpc.governance.vote(key, value)
            expect(govRPCStub.callCount).to.equal(2)

            key = 'istanbul.epoch'
            value = 604800

            await caver.rpc.governance.vote(key, value)
            expect(govRPCStub.callCount).to.equal(3)

            key = 'governance.unitprice'
            value = 25000000000

            await caver.rpc.governance.vote(key, value)
            expect(govRPCStub.callCount).to.equal(4)

            key = 'istanbul.committeesize'
            value = 7

            await caver.rpc.governance.vote(key, value)
            expect(govRPCStub.callCount).to.equal(5)

            key = 'reward.mintingamount'
            value = '9600000000000000000'

            await caver.rpc.governance.vote(key, value)
            expect(govRPCStub.callCount).to.equal(6)

            key = 'reward.ratio'
            value = '40/30/30'

            await caver.rpc.governance.vote(key, value)
            expect(govRPCStub.callCount).to.equal(7)

            key = 'reward.useginicoeff'
            value = false

            await caver.rpc.governance.vote(key, value)
            expect(govRPCStub.callCount).to.equal(8)

            key = 'reward.ratio'
            value = 100

            await caver.rpc.governance.vote(key, value)
            expect(govRPCStub.callCount).to.equal(9)
        }).timeout(100000)
    })

    context('caver.rpc.governance.getMyVotes', () => {
        it('CAVERJS-UNIT-RPC-007: should return my votes', async () => {
            const govRPCStub = sandbox
                .stub(caver.rpc.governance.getMyVotes.method.requestManager, 'send')
                .callsFake((payload, sendTxCallback) => {
                    expect(payload.method).to.equal('governance_myVotes')
                    expect(payload.params.length).to.equal(caver.rpc.governance.getMyVotes.method.params)

                    const ret = [
                        {
                            Key: 'governance.governancemode',
                            Value: 'ballot',
                            Casted: false,
                            BlockNum: 0,
                        },
                    ]
                    sendTxCallback(null, ret)
                })

            await caver.rpc.governance.getMyVotes()
            expect(govRPCStub.callCount).to.equal(1)
        }).timeout(100000)
    })

    context('caver.rpc.governance.getMyVotingPower', () => {
        it('CAVERJS-UNIT-RPC-008: should return my voting power', async () => {
            const govRPCStub = sandbox
                .stub(caver.rpc.governance.getMyVotingPower.method.requestManager, 'send')
                .callsFake((payload, sendTxCallback) => {
                    expect(payload.method).to.equal('governance_myVotingPower')
                    expect(payload.params.length).to.equal(caver.rpc.governance.getMyVotingPower.method.params)
                    sendTxCallback(null, 1.323)
                })

            await caver.rpc.governance.getMyVotingPower()
            expect(govRPCStub.callCount).to.equal(1)
        }).timeout(100000)

        it('CAVERJS-UNIT-RPC-009: should return error when in current governing mode voting power is not supported', async () => {
            const govRPCStub = sandbox
                .stub(caver.rpc.governance.getMyVotingPower.method.requestManager, 'send')
                .callsFake((payload, sendTxCallback) => {
                    expect(payload.method).to.equal('governance_myVotingPower')
                    expect(payload.params.length).to.equal(caver.rpc.governance.getMyVotingPower.method.params)
                    sendTxCallback(null, 'In current governance mode, voting power is not available')
                })

            const expectedError = 'In current governance mode, voting power is not available'
            await expect(caver.rpc.governance.getMyVotingPower()).to.be.rejectedWith(expectedError)
            expect(govRPCStub.callCount).to.equal(1)
        }).timeout(100000)
    })

    context('caver.rpc.governance.getTotalVotingPower', () => {
        it('CAVERJS-UNIT-RPC-010: should return total voting power', async () => {
            const govRPCStub = sandbox
                .stub(caver.rpc.governance.getTotalVotingPower.method.requestManager, 'send')
                .callsFake((payload, sendTxCallback) => {
                    expect(payload.method).to.equal('governance_totalVotingPower')
                    expect(payload.params.length).to.equal(caver.rpc.governance.getTotalVotingPower.method.params)
                    sendTxCallback(null, 32.452)
                })

            await caver.rpc.governance.getTotalVotingPower()
            expect(govRPCStub.callCount).to.equal(1)
        }).timeout(100000)

        it('CAVERJS-UNIT-RPC-011: should return error when in current governing mode voting power is not supported', async () => {
            const govRPCStub = sandbox
                .stub(caver.rpc.governance.getTotalVotingPower.method.requestManager, 'send')
                .callsFake((payload, sendTxCallback) => {
                    expect(payload.method).to.equal('governance_totalVotingPower')
                    expect(payload.params.length).to.equal(caver.rpc.governance.getTotalVotingPower.method.params)
                    sendTxCallback(null, 'In current governance mode, voting power is not available')
                })

            const expectedError = 'In current governance mode, voting power is not available'
            await expect(caver.rpc.governance.getTotalVotingPower()).to.be.rejectedWith(expectedError)
            expect(govRPCStub.callCount).to.equal(1)
        }).timeout(100000)
    })

    context('caver.rpc.governance.showTally', () => {
        it('CAVERJS-UNIT-RPC-012: should return current tally of governance votes', async () => {
            const govRPCStub = sandbox
                .stub(caver.rpc.governance.showTally.method.requestManager, 'send')
                .callsFake((payload, sendTxCallback) => {
                    expect(payload.method).to.equal('governance_showTally')
                    expect(payload.params.length).to.equal(caver.rpc.governance.showTally.method.params)
                    const ret = [
                        {
                            ApprovalPercentage: 36.2,
                            Key: 'unitprice',
                            Value: 25000000000,
                        },
                        {
                            ApprovalPercentage: 72.5,
                            Key: 'mintingamount',
                            Value: '9600000000000000000',
                        },
                    ]
                    sendTxCallback(null, ret)
                })

            await caver.rpc.governance.showTally()
            expect(govRPCStub.callCount).to.equal(1)
        }).timeout(100000)
    })

    context('caver.rpc.governance.getMyVotes', () => {
        it('CAVERJS-UNIT-RPC-013: should return my vote information in the epoch', async () => {
            const govRPCStub = sandbox
                .stub(caver.rpc.governance.getMyVotes.method.requestManager, 'send')
                .callsFake((payload, sendTxCallback) => {
                    expect(payload.method).to.equal('governance_myVotes')
                    expect(payload.params.length).to.equal(caver.rpc.governance.getMyVotes.method.params)
                    const ret = [
                        {
                            BlockNum: 403,
                            Casted: true,
                            Key: 'governance.governancemode',
                            Value: 'ballot',
                        },
                    ]
                    sendTxCallback(null, ret)
                })

            await caver.rpc.governance.getMyVotes()
            expect(govRPCStub.callCount).to.equal(1)
        }).timeout(100000)
    })

    context('caver.rpc.governance.getChainConfig', () => {
        it('CAVERJS-UNIT-RPC-014: should return the initial chain configuration', async () => {
            const govRPCStub = sandbox
                .stub(caver.rpc.governance.getChainConfig.method.requestManager, 'send')
                .callsFake((payload, sendTxCallback) => {
                    expect(payload.method).to.equal('governance_chainConfig')
                    expect(payload.params.length).to.equal(caver.rpc.governance.getChainConfig.method.params)
                    const ret = {
                        chainId: 1001,
                        deriveShaImpl: 2,
                        governance: {
                            governanceMode: 'ballot',
                            governingNode: '0xe733cb4d279da696f30d470f8c04decb54fcb0d2',
                            reward: {
                                deferredTxFee: true,
                                minimumStake: 5000000,
                                mintingAmount: 9600000000000000000,
                                proposerUpdateInterval: 3600,
                                ratio: '34/54/12',
                                stakingUpdateInterval: 20,
                                useGiniCoeff: false,
                            },
                        },
                        istanbul: { epoch: 20, policy: 2, sub: 1 },
                        unitPrice: 25000000000,
                    }
                    sendTxCallback(null, ret)
                })

            await caver.rpc.governance.getChainConfig()
            expect(govRPCStub.callCount).to.equal(1)
        }).timeout(100000)
    })

    context('caver.rpc.governance.getNodeAddress', () => {
        it('CAVERJS-UNIT-RPC-015: should return the address of the node that a user is using', async () => {
            const govRPCStub = sandbox
                .stub(caver.rpc.governance.getNodeAddress.method.requestManager, 'send')
                .callsFake((payload, sendTxCallback) => {
                    expect(payload.method).to.equal('governance_nodeAddress')
                    expect(payload.params.length).to.equal(caver.rpc.governance.getNodeAddress.method.params)
                    sendTxCallback(null, '0xa80de139de3fb29fba7e2d20bda593c5ffe63ce9')
                })

            await caver.rpc.governance.getNodeAddress()
            expect(govRPCStub.callCount).to.equal(1)
        }).timeout(100000)
    })

    context('caver.rpc.governance.getItemsAt', () => {
        it('CAVERJS-UNIT-RPC-016: should return governance items at specific block', async () => {
            const govRPCStub = sandbox
                .stub(caver.rpc.governance.getItemsAt.method.requestManager, 'send')
                .callsFake((payload, sendTxCallback) => {
                    expect(payload.method).to.equal('governance_itemsAt')
                    expect(payload.params.length).to.equal(caver.rpc.governance.getItemsAt.method.params)
                    const ret = {
                        'governance.governancemode': 'single',
                        'governance.governingnode': '0xa80de139de3fb29fba7e2d20bda593c5ffe63ce9',
                        'governance.unitprice': 25000000000,
                        'istanbul.committeesize': 22,
                        'istanbul.epoch': 30,
                        'istanbul.policy': 2,
                        'reward.deferredtxfee': true,
                        'reward.minimumstake': '5000000',
                        'reward.mintingamount': '9600000000000000000',
                        'reward.proposerupdateinterval': 30,
                        'reward.ratio': '34/54/12',
                        'reward.stakingupdateinterval': 60,
                        'reward.useginicoeff': true,
                    }
                    sendTxCallback(null, ret)
                })

            await caver.rpc.governance.getItemsAt(0)
            expect(govRPCStub.callCount).to.equal(1)
        }).timeout(100000)
    })

    context('caver.rpc.governance.getPendingChanges', () => {
        it('CAVERJS-UNIT-RPC-017: should return the list of items that have received enough number of votes but not yet finalized', async () => {
            const govRPCStub = sandbox
                .stub(caver.rpc.governance.getPendingChanges.method.requestManager, 'send')
                .callsFake((payload, sendTxCallback) => {
                    expect(payload.method).to.equal('governance_pendingChanges')
                    expect(payload.params.length).to.equal(caver.rpc.governance.getPendingChanges.method.params)
                    const ret = { 'governance.governancemode': 'ballot' }
                    sendTxCallback(null, ret)
                })

            await caver.rpc.governance.getPendingChanges()
            expect(govRPCStub.callCount).to.equal(1)
        }).timeout(100000)
    })

    context('caver.rpc.governance.getVotes', () => {
        it('CAVERJS-UNIT-RPC-018: should return the votes from all nodes in the epoch', async () => {
            const govRPCStub = sandbox
                .stub(caver.rpc.governance.getVotes.method.requestManager, 'send')
                .callsFake((payload, sendTxCallback) => {
                    expect(payload.method).to.equal('governance_votes')
                    expect(payload.params.length).to.equal(caver.rpc.governance.getVotes.method.params)
                    const ret = [
                        {
                            validator: '0xa80de139de3fb29fba7e2d20bda593c5ffe63ce9',
                            key: 'istanbul.epoch',
                            value: 10,
                        },
                    ]
                    sendTxCallback(null, ret)
                })

            await caver.rpc.governance.getVotes()
            expect(govRPCStub.callCount).to.equal(1)
        }).timeout(100000)
    })

    context('caver.rpc.governance.getIdxCache', () => {
        it('CAVERJS-UNIT-RPC-019: should return an array of current idxCache in the memory cache', async () => {
            const govRPCStub = sandbox
                .stub(caver.rpc.governance.getIdxCache.method.requestManager, 'send')
                .callsFake((payload, sendTxCallback) => {
                    expect(payload.method).to.equal('governance_idxCache')
                    expect(payload.params.length).to.equal(caver.rpc.governance.getIdxCache.method.params)
                    sendTxCallback(null, [0, 2190, 2220])
                })

            await caver.rpc.governance.getIdxCache()
            expect(govRPCStub.callCount).to.equal(1)
        }).timeout(100000)
    })

    context('caver.rpc.governance.getIdxCacheFromDb', () => {
        it('CAVERJS-UNIT-RPC-020: should return an array that contains all block numbers on which a governance change ever happened', async () => {
            const govRPCStub = sandbox
                .stub(caver.rpc.governance.getIdxCacheFromDb.method.requestManager, 'send')
                .callsFake((payload, sendTxCallback) => {
                    expect(payload.method).to.equal('governance_idxCacheFromDb')
                    expect(payload.params.length).to.equal(caver.rpc.governance.getIdxCacheFromDb.method.params)
                    sendTxCallback(null, [0, 2190, 2220])
                })

            await caver.rpc.governance.getIdxCacheFromDb()
            expect(govRPCStub.callCount).to.equal(1)
        }).timeout(100000)
    })

    context('caver.rpc.governance.getItemCacheFromDb', () => {
        it('CAVERJS-UNIT-RPC-021: should return the governance information stored in the given block', async () => {
            const govRPCStub = sandbox
                .stub(caver.rpc.governance.getItemCacheFromDb.method.requestManager, 'send')
                .callsFake((payload, sendTxCallback) => {
                    expect(payload.method).to.equal('governance_itemCacheFromDb')
                    expect(payload.params.length).to.equal(caver.rpc.governance.getItemCacheFromDb.method.params)
                    const ret = {
                        'governance.governancemode': 'single',
                        'governance.governingnode': '0xa80de139de3fb29fba7e2d20bda593c5ffe63ce9',
                        'governance.unitprice': 25000000000,
                        'istanbul.committeesize': 22,
                        'istanbul.epoch': 30,
                        'istanbul.policy': 2,
                        'reward.deferredtxfee': true,
                        'reward.minimumstake': '5000000',
                        'reward.mintingamount': '9600000000000000000',
                        'reward.proposerupdateinterval': 30,
                        'reward.ratio': '34/54/12',
                        'reward.stakingupdateinterval': 60,
                        'reward.useginicoeff': true,
                    }
                    sendTxCallback(null, ret)
                })

            await caver.rpc.governance.getItemCacheFromDb(0)
            expect(govRPCStub.callCount).to.equal(1)
        }).timeout(100000)
    })

    context('caver.rpc.governance.getStakingInfo', () => {
        it('CAVERJS-UNIT-RPC-022: should return returns staking information at a specific block', async () => {
            const govRPCStub = sandbox
                .stub(caver.rpc.governance.getStakingInfo.method.requestManager, 'send')
                .callsFake((payload, sendTxCallback) => {
                    expect(payload.method).to.equal('governance_getStakingInfo')
                    expect(payload.params.length).to.equal(caver.rpc.governance.getStakingInfo.method.params)
                    const ret = {
                        BlockNum: 57801600,
                        CouncilNodeAddrs: [
                            '0x99fb17d324fa0e07f23b49d09028ac0919414db6',
                            '0x571e53df607be97431a5bbefca1dffe5aef56f4d',
                            '0xb74ff9dea397fe9e231df545eb53fe2adf776cb2',
                            '0x5cb1a7dccbd0dc446e3640898ede8820368554c8',
                            '0x776817c0ef3d06d794cf01ae9afa33d7397b9b40',
                            '0xc180ca565b34b5b63877674f5fe647e7da079022',
                            '0x03497f51c31fe8b402df0bde90fd5a85f87aa943',
                        ],
                        CouncilRewardAddrs: [
                            '0xb2bd3178affccd9f9f5189457f1cad7d17a01c9d',
                            '0x6559a7b6248b342bc11fbcdf9343212bbc347edc',
                            '0x82829a60c6eac4e3e9d6ed00891c69e88537fd4d',
                            '0xa86fd667c6a340c53cc5d796ba84dbe1f29cb2f7',
                            '0x6e22cbe2b8bbd1df9f1d3c8ebae6d7ff5414a734',
                            '0x24e593fb29731e54905025c230727dc28d229f77',
                            '0x2b2a7a1d29a203f60e0a964fc64231265a49cd97',
                        ],
                        CouncilStakingAddrs: [
                            '0x12fa1ab4c3e17c1c08c1b5a945c864c8e8bf707e',
                            '0xfd56604f1a20268ff7a0eab2ab48e25ee1e0f653',
                            '0x1e0f6aaa9baa6081dc4910a854eebf8854c262ab',
                            '0x5e6988415ebe0f6b088f5a676003ba60f572875a',
                            '0xbb44998c2af35b8faee694cffe216558056d747e',
                            '0x68cba498b7175cde9de08fc2e85ad3e9c8caefa8',
                            '0x98efb31eeccafe35d53a6926e2a54c0858d9eebc',
                        ],
                        CouncilStakingAmounts: [5000000, 5000000, 5000000, 5000000, 5000000, 5000000, 5000000],
                        Gini: 0,
                        KIRAddr: '0x716f89d9bc333286c79db4ebb05516897c8d208a',
                        PoCAddr: '0x2bcf9d3e4a846015e7e3152a614c684de16f37c6',
                        UseGini: true,
                    }
                    sendTxCallback(null, ret)
                })

            await caver.rpc.governance.getStakingInfo()
            expect(govRPCStub.callCount).to.equal(1)
        }).timeout(100000)
    })
})
