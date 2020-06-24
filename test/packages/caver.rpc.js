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
const testRPCURL = require('../testrpc')
const { expect } = require('../extendedChai')

const Caver = require('../../index.js')

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

            const feeDelegated = new caver.transaction.feeDelegatedValueTransfer({
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

            const feeDelegated = new caver.transaction.feeDelegatedValueTransfer({
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
            const valueTransfer = new caver.transaction.valueTransfer({
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

            const feeDelegated = new caver.transaction.feeDelegatedValueTransfer({
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
})
