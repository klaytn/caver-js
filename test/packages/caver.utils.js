/*
    Copyright 2018 The caver-js Authors
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

const BN = require('bn.js')
const BigNumber = require('bignumber.js')
const _ = require('lodash')
const testRPCURL = require('../testrpc')
const { expect } = require('../extendedChai')

const utils = require('./utils')
const Caver = require('../../index')
const SignatureData = require('../../packages/caver-wallet/src/keyring/signatureData')

let caver
beforeEach(() => {
    caver = new Caver(testRPCURL)
})

describe('caver.utils.randomHex', () => {
    context('CAVERJS-UNIT-ETC-097: input: valid value', () => {
        const tests = [0, 1, 2, 4, 32, 64]
        it('should match with regex', () => {
            for (const size of tests) {
                const data = caver.utils.randomHex(size)
                const regExp = new RegExp(`^0x[0-9a-f]{${size * 2}}$`)
                expect(data).to.match(regExp)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-098: input: invalid value', () => {
        it('should throw an error: Invalid size: It must be >=0 && <= 65536', () => {
            const expectedErrorMessage = 'Invalid size: It must be >=0 && <= 65536'

            expect(() => caver.utils.randomHex(-1)).to.throw(expectedErrorMessage)
            expect(() => caver.utils.randomHex(65537)).to.throw(expectedErrorMessage)
        })
    })
})

describe('caver.utils.isBN', () => {
    context('CAVERJS-UNIT-ETC-099: input: BN type', () => {
        const tests = [
            { value: new BN(255), expected: true },
            { value: new BN('ff', 16), expected: true },
            { value: new BN('377', 8), expected: true },
            { value: new BN('11111111', 2), expected: true },
            { value: new BN(0), expected: true },
        ]
        it('should return true', () => {
            for (const test of tests) {
                expect(caver.utils.isBN(test.value)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-100: input: not a BN type', () => {
        const tests = [
            { value: 255, expected: false },
            { value: 0xff, expected: false },
            { value: 0o377, expected: false },
            { value: 0b11111111, expected: false },
            { value: function() {}, expected: false },
            { value: 'function', expected: false },
            { value: {}, expected: false },
            { value: 'hello', expected: false },
        ]
        it('should return false', () => {
            for (const test of tests) {
                expect(caver.utils.isBN(test.value)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-192: input: An object whose type is BN but not of type BN', () => {
        it('caver.utils should return false', () => {
            const notBn = {}
            notBn.constructor = {}
            notBn.constructor.name = 'BN'
            expect(caver.utils.isBN(notBn)).to.be.equal(false)
        })
    })
})

describe('caver.utils.isBigNumber', () => {
    context('CAVERJS-UNIT-ETC-101: input: BigNumber type', () => {
        const tests = [
            { value: new BigNumber('1.0000000000000001'), expected: true },
            { value: new BigNumber('88259496234518.57'), expected: true },
            { value: new BigNumber('99999999999999999999'), expected: true },
            { value: new BigNumber('2e308'), expected: true },
        ]
        it('should return true', () => {
            for (const test of tests) {
                expect(caver.utils.isBigNumber(test.value)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-102: input: not a BigNumber type', () => {
        const tests = [
            { value: '1.0000000000000001', expected: false },
            { value: '88259496234518.57', expected: false },
            { value: '99999999999999999999', expected: false },
            { value: '2e308', expected: false },
        ]
        it('should return false', () => {
            for (const test of tests) {
                expect(caver.utils.isBigNumber(test.value)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-202: input: An object whose type is BigNumber but not of type BigNumber', () => {
        it('caver.utils.isBigNumber should return false', () => {
            const notBigNumber = {}
            notBigNumber.constructor = {}
            notBigNumber.constructor.name = 'BigNumber'
            expect(caver.utils.isBigNumber(notBigNumber)).to.be.equal(false)
        })
    })
})

describe('caver.utils.sha3', () => {
    context('CAVERJS-UNIT-ETC-103: input: BN type', () => {
        const tests = [{ value: new BN('234'), expected: '0xc1912fee45d61c87cc5ea59dae311904cd86b84fee17cc96966216f811ce6a79' }]
        it('should return 32 bytes hexstring', () => {
            for (const test of tests) {
                expect(caver.utils.sha3(test.value)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-104: input: number type', () => {
        const tests = [{ value: 234, expected: null }, { value: 0xea, expected: null }]
        it('should return null', () => {
            for (const test of tests) {
                expect(caver.utils.sha3(test.value)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-105: input: String | HexString type', () => {
        const tests = [
            { value: '234', expected: '0xc1912fee45d61c87cc5ea59dae311904cd86b84fee17cc96966216f811ce6a79' },
            { value: '0xea', expected: '0x2f20677459120677484f7104c76deb6846a2c071f9b3152c103bb12cd54d1a4a' },
        ]
        it('should return 32 bytes hexstring', () => {
            for (const test of tests) {
                expect(caver.utils.sha3(test.value)).to.be.equal(test.expected)
            }
        })
    })
})

describe('CAVERJS-UNIT-ETC-106: caver.utils.soliditySha3', () => {
    const tests = [
        { values: ['234564535', '0xfff23243', true, -10], expected: '0x3e27a893dc40ef8a7f0841d96639de2f58a132be5ae466d40087a2cfa83b7179' },
        { values: ['Hello!%'], expected: '0x661136a4267dba9ccdf6bfddb7c00e714de936674c4bdb065a531cf1cb15c7fc' },
        { values: ['234'], expected: '0x61c831beab28d67d1bb40b5ae1a11e2757fa842f031a2d0bc94a7867bc5d26c2' },
        { values: [0xea], expected: '0x61c831beab28d67d1bb40b5ae1a11e2757fa842f031a2d0bc94a7867bc5d26c2' },
        { values: [new BN('234')], expected: '0x61c831beab28d67d1bb40b5ae1a11e2757fa842f031a2d0bc94a7867bc5d26c2' },
        { values: [{ type: 'uint256', value: '234' }], expected: '0x61c831beab28d67d1bb40b5ae1a11e2757fa842f031a2d0bc94a7867bc5d26c2' },
        { values: [{ t: 'uint', v: new BN('234') }], expected: '0x61c831beab28d67d1bb40b5ae1a11e2757fa842f031a2d0bc94a7867bc5d26c2' },
        {
            values: ['0x407D73d8a49eeb85D32Cf465507dd71d507100c1'],
            expected: '0x4e8ebbefa452077428f93c9520d3edd60594ff452a29ac7d2ccc11d47f3ab95b',
        },
        {
            values: [{ t: 'bytes', v: '0x407D73d8a49eeb85D32Cf465507dd71d507100c1' }],
            expected: '0x4e8ebbefa452077428f93c9520d3edd60594ff452a29ac7d2ccc11d47f3ab95b',
        },
        {
            values: [{ t: 'address', v: '0x407D73d8a49eeb85D32Cf465507dd71d507100c1' }],
            expected: '0x4e8ebbefa452077428f93c9520d3edd60594ff452a29ac7d2ccc11d47f3ab95b',
        },
        {
            values: [{ t: 'bytes32', v: '0x407D73d8a49eeb85D32Cf465507dd71d507100c1' }],
            expected: '0x3c69a194aaf415ba5d6afca734660d0a3d45acdc05d54cd1ca89a8988e7625b4',
        },
        {
            values: [
                { t: 'string', v: 'Hello!%' },
                { t: 'int8', v: -23 },
                { t: 'address', v: '0x85F43D8a49eeB85d32Cf465507DD71d507100C1d' },
            ],
            expected: '0xa13b31627c1ed7aaded5aecec71baf02fe123797fffd45e662eac8e06fbe4955',
        },
    ]
    it('should return 32 bytes hexstring', () => {
        for (const test of tests) {
            expect(caver.utils.soliditySha3(...test.values)).to.be.equal(test.expected)
        }
    })
})

describe('caver.utils.isHex', () => {
    context('CAVERJS-UNIT-ETC-107: input: hexString', () => {
        const tests = [
            { value: '0xc1912', expected: true },
            { value: 0xc1912, expected: true },
            { value: 'c1912', expected: true },
            { value: 345, expected: true },
        ]
        it('should return true', () => {
            for (const test of tests) {
                expect(caver.utils.isHex(test.value)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-108: input: invalid hexString', () => {
        const tests = [{ value: '0xZ1912', expected: false }, { value: 'Hello', expected: false }]
        it('should return false', () => {
            for (const test of tests) {
                expect(caver.utils.isHex(test.value)).to.be.equal(test.expected)
            }
        })
    })
})

describe('caver.utils.isHexStrict', () => {
    context('CAVERJS-UNIT-ETC-109: input: strict hexString', () => {
        const tests = [{ value: '0xc1912', expected: true }]
        it('should return true', () => {
            for (const test of tests) {
                expect(caver.utils.isHexStrict(test.value)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-110: input: not strict hexString', () => {
        const tests = [
            { value: 0xc1912, expected: false },
            { value: 'c1912', expected: false },
            { value: 345, expected: false },
            { value: '0xZ1912', expected: false },
            { value: 'Hello', expected: false },
        ]
        it('should return false', () => {
            for (const test of tests) {
                expect(caver.utils.isHexStrict(test.value)).to.be.equal(test.expected)
            }
        })
    })
})

describe('caver.utils.isAddress', () => {
    context('CAVERJS-UNIT-ETC-111: input: valid address', () => {
        const tests = [
            { address: '0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d', expected: true },
            { address: 'c1912fee45d61c87cc5ea59dae31190fffff232d', expected: true },
            { address: '0xc1912fee45d61c87cc5ea59dae31190fffff232d', expected: true },
            { address: '0XC1912FEE45D61C87CC5EA59DAE31190FFFFF232D', expected: true },
        ]
        it('should return true', () => {
            for (const test of tests) {
                expect(caver.utils.isAddress(test.address)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-112: input: invalid address', () => {
        const tests = [{ address: '0xC1912fEE45d61C87Cc5EA59DaE31190FFFFf232d', expected: false }]
        it('should return false', () => {
            for (const test of tests) {
                expect(caver.utils.isAddress(test.address)).to.be.equal(test.expected)
            }
        })
    })
})

describe('caver.utils.toChecksumAddress', () => {
    context('CAVERJS-UNIT-ETC-113: input: valid address', () => {
        const tests = [
            { address: '0xc1912fee45d61c87cc5ea59dae31190fffff232D', expected: '0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d' },
            { address: '0XC1912FEE45D61C87CC5EA59DAE31190FFFFF232D', expected: '0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d' },
            { address: '0xC1912fEE45d61C87Cc5EA59DaE31190FFFFf232d', expected: '0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d' },
        ]
        it('should return checksum address', () => {
            for (const test of tests) {
                expect(caver.utils.toChecksumAddress(test.address)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-114: input: invalid address', () => {
        it('should throw an error', () => {
            const invalidAddress = 'zzzz'
            const errorMessage = `Given address "${invalidAddress}" is not a valid Klaytn address.`
            expect(() => caver.utils.toChecksumAddress(invalidAddress)).to.throw(errorMessage)
        })
    })
})

describe('caver.utils.checkAddressChecksum', () => {
    context('CAVERJS-UNIT-ETC-115: input: valid checksum address', () => {
        const tests = [{ address: '0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d', expected: true }]
        it('should return true', () => {
            for (const test of tests) {
                expect(caver.utils.checkAddressChecksum(test.address)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-116: input: invalid checksum address', () => {
        const tests = [
            { address: '0xc1912fee45d61c87cc5ea59dae31190fffff232d', expected: false },
            { address: 'c1912fee45d61c87cc5ea59dae31190fffff232d', expected: false },
            { address: '0XC1912FEE45D61C87CC5EA59DAE31190FFFFF232D', expected: false },
            { address: '0xC1912fEE45d61C87Cc5EA59DaE31190FFFFf232d', expected: false },
        ]
        it('should return false', () => {
            for (const test of tests) {
                expect(caver.utils.checkAddressChecksum(test.address)).to.be.equal(test.expected)
            }
        })
    })
})

describe('CAVERJS-UNIT-ETC-117: caver.utils.toHex', () => {
    const tests = [
        { value: '234', expected: '0xea' },
        { value: 234, expected: '0xea' },
        { value: new BN('234'), expected: '0xea' },
        { value: 'I have 100€', expected: '0x49206861766520313030e282ac' },
        { value: '234', expected: '0xea' },
        { value: '234', expected: '0xea' },
        { value: 1, expected: '0x1' },
        { value: '1', expected: '0x1' },
        { value: '0x1', expected: '0x1' },
        { value: '15', expected: '0xf' },
        { value: '0xf', expected: '0xf' },
        { value: -1, expected: '-0x1' },
        { value: '-1', expected: '-0x1' },
        { value: '-0x1', expected: '-0x1' },
        { value: '-15', expected: '-0xf' },
        { value: '-0xf', expected: '-0xf' },
        { value: '0x657468657265756d', expected: '0x657468657265756d' },
        {
            value: '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
            expected: '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
        },
        {
            value: '-0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            expected: '-0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        },
        {
            value: '-0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
            expected: '-0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
        },
        { value: 0, expected: '0x0' },
        { value: '0', expected: '0x0' },
        { value: '0x0', expected: '0x0' },
        { value: -0, expected: '0x0' },
        { value: '-0', expected: '0x0' },
        { value: '-0x0', expected: '0x0' },
        { value: [1, 2, 3, { test: 'data' }], expected: '0x5b312c322c332c7b2274657374223a2264617461227d5d' },
        { value: { test: 'test' }, expected: '0x7b2274657374223a2274657374227d' },
        { value: '{"test": "test"}', expected: '0x7b2274657374223a202274657374227d' },
        { value: 'myString', expected: '0x6d79537472696e67' },
        { value: 'myString 34534!', expected: '0x6d79537472696e6720333435333421' },
        { value: new BN(15), expected: '0xf' },
        {
            value: 'Heeäööä👅D34ɝɣ24Єͽ-.,äü+#/',
            expected: '0x486565c3a4c3b6c3b6c3a4f09f9185443334c99dc9a33234d084cdbd2d2e2cc3a4c3bc2b232f',
        },
        { value: true, expected: '0x01' },
        { value: false, expected: '0x00' },
        {
            value:
                'ff\u0003\u0000\u0000\u00005èÆÕL]\u0012|Î¾\u001a7«\u00052\u0011(ÐY\n<\u0010\u0000\u0000\u0000\u0000\u0000\u0000e!ßd/ñõì\f:z¦Î¦±ç·÷Í¢Ëß\u00076*\bñùC1ÉUÀé2\u001aÓB',
            expected:
                '0x66660300000035c3a8c386c3954c5d127cc29dc38ec2bec29e1a37c2abc29b05321128c390c297590a3c100000000000006521c39f642fc3b1c3b5c3ac0c3a7ac2a6c38ec2a6c2b1c3a7c2b7c3b7c38dc2a2c38bc39f07362ac28508c28ec297c3b1c29ec3b94331c38955c380c3a9321ac393c28642c28c',
        },
        {
            value:
                '\u0003\u0000\u0000\u00005èÆÕL]\u0012|Î¾\u001a7«\u00052\u0011(ÐY\n<\u0010\u0000\u0000\u0000\u0000\u0000\u0000e!ßd/ñõì\f:z¦Î¦±ç·÷Í¢Ëß\u00076*\bñùC1ÉUÀé2\u001aÓB',
            expected:
                '0x0300000035c3a8c386c3954c5d127cc29dc38ec2bec29e1a37c2abc29b05321128c390c297590a3c100000000000006521c39f642fc3b1c3b5c3ac0c3a7ac2a6c38ec2a6c2b1c3a7c2b7c3b7c38dc2a2c38bc39f07362ac28508c28ec297c3b1c29ec3b94331c38955c380c3a9321ac393c28642c28c',
        },
        {
            value: Buffer.from('5b9ac8', 'hex'),
            expected: '0x5b9ac8',
        },
        {
            value: Buffer.alloc(0),
            expected: '0x',
        },
    ]

    it('should return hexstring', () => {
        for (const test of tests) {
            expect(caver.utils.toHex(test.value)).to.be.equal(test.expected)
        }
    })
})

describe('caver.utils.isTxHashStrict', () => {
    const transactionHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'
    context('CAVERJS-UNIT-ETC-162: input: valid strict transaction hex', () => {
        const tests = [
            { hash: transactionHash, expected: true }, // all lower
            { hash: transactionHash.toUpperCase(), expected: true }, // all upper
            { hash: transactionHash.slice(0, 10) + transactionHash.slice(10).toUpperCase(), expected: true }, // mixed
        ]
        it('should return true', () => {
            for (const test of tests) {
                expect(caver.utils.isTxHashStrict(test.hash)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-163: input: invalid strict transaction hex', () => {
        const tests = [
            { hash: `00${transactionHash.slice(2)}`, expected: false }, // doesn't start with 0x
            { hash: transactionHash.slice(2), expected: false }, // doesn't start with 0x
            { hash: `${transactionHash.slice(0, 64)}ZZ`, expected: false }, // not hex
            { hash: transactionHash.slice(0, 10), expected: false }, // length is not enough
        ]
        it('should return false', () => {
            for (const test of tests) {
                expect(caver.utils.isTxHashStrict(test.hash)).to.be.equal(test.expected)
            }
        })
    })
})

describe('caver.utils.isValidHashStrict', () => {
    const hash = [
        '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550',
        '0xd09032de89e920fa6e9780fd4f5f29c2985f86f6510c0c3d086adc9e21e00763',
    ]

    context('CAVERJS-UNIT-ETC-205: input: valid strict hex', () => {
        const tests = [
            { hash: hash[0], expected: true }, // all lower
            { hash: hash[0].toUpperCase(), expected: true }, // all upper
            { hash: hash[0].slice(0, 10) + hash[0].slice(10).toUpperCase(), expected: true }, // mixed
            { hash: hash[1], expected: true }, // all lower
            { hash: hash[1].toUpperCase(), expected: true }, // all upper
            { hash: hash[1].slice(0, 10) + hash[1].slice(10).toUpperCase(), expected: true }, // mixed
        ]
        it('should return true', () => {
            for (const test of tests) {
                expect(caver.utils.isValidHashStrict(test.hash)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-206: invalid strict hex', () => {
        const tests = [
            { hash: `00${hash[0].slice(2)}`, expected: false }, // doesn't start with 0x
            { hash: hash[0].slice(2), expected: false }, // doesn't start with 0x
            { hash: `${hash[0].slice(0, 64)}ZZ`, expected: false }, // not hex
            { hash: hash[0].slice(0, 10), expected: false }, // length is not enough
            { hash: `00${hash[1].slice(2)}`, expected: false }, // doesn't start with 0x
            { hash: hash[1].slice(2), expected: false }, // doesn't start with 0x
            { hash: `${hash[1].slice(0, 64)}ZZ`, expected: false }, // not hex
            { hash: hash[1].slice(0, 10), expected: false }, // length is not enough
        ]
        it('should return false', () => {
            for (const test of tests) {
                expect(caver.utils.isValidHashStrict(test.hash)).to.be.equal(test.expected)
            }
        })
    })
})

describe('caver.utils.isTxHash', () => {
    const transactionHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'
    context('CAVERJS-UNIT-ETC-164: input: valid transaction hex', () => {
        const tests = [
            { hash: transactionHash, expected: true }, // all lower long
            { hash: transactionHash.slice(2), expected: true }, // all lower short
            { hash: transactionHash.toUpperCase(), expected: true }, // all upper long
            { hash: transactionHash.slice(2).toUpperCase(), expected: true }, // all upper short
            { hash: transactionHash.slice(0, 10) + transactionHash.slice(10).toUpperCase(), expected: true }, // mixed long
            { hash: transactionHash.slice(2, 10) + transactionHash.slice(10).toUpperCase(), expected: true }, // mixed short
        ]
        it('should return true', () => {
            for (const test of tests) {
                expect(caver.utils.isTxHash(test.hash)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-165: input: invalid transaction hex', () => {
        const tests = [
            { hash: transactionHash.slice(4), expected: false }, // length is not enough (62)
            { hash: `${transactionHash.slice(0, 62)}ZZ`, expected: false }, // not hex
            { hash: `${transactionHash.slice(2)}00`, expected: false }, // length is too long (66 without 0x)
            { hash: `${transactionHash}00`, expected: false }, // length is too long (68)
        ]
        it('should return false', () => {
            for (const test of tests) {
                expect(caver.utils.isTxHash(test.tx)).to.be.equal(test.expected)
            }
        })
    })
})

describe('caver.utils.isValidHash', () => {
    const hash = [
        '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550',
        '0xd09032de89e920fa6e9780fd4f5f29c2985f86f6510c0c3d086adc9e21e00763',
    ]

    context('CAVERJS-UNIT-ETC-207: input: valid strict hex', () => {
        const tests = [
            { hash: hash[0], expected: true }, // all lower long
            { hash: hash[0].slice(2), expected: true }, // all lower short
            { hash: hash[0].toUpperCase(), expected: true }, // all upper long
            { hash: hash[0].slice(2).toUpperCase(), expected: true }, // all upper short
            { hash: hash[0].slice(0, 10) + hash[0].slice(10).toUpperCase(), expected: true }, // mixed long
            { hash: hash[0].slice(2, 10) + hash[0].slice(10).toUpperCase(), expected: true }, // mixed short
            { hash: hash[1], expected: true }, // all lower long
            { hash: hash[1].slice(2), expected: true }, // all lower short
            { hash: hash[1].toUpperCase(), expected: true }, // all upper long
            { hash: hash[1].slice(2).toUpperCase(), expected: true }, // all upper short
            { hash: hash[1].slice(0, 10) + hash[1].slice(10).toUpperCase(), expected: true }, // mixed long
            { hash: hash[1].slice(2, 10) + hash[1].slice(10).toUpperCase(), expected: true }, // mixed short
        ]
        it('should return true', () => {
            for (const test of tests) {
                expect(caver.utils.isValidHash(test.hash)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-208: invalid strict hex', () => {
        const tests = [
            { hash: hash[0].slice(4), expected: false }, // length is not enough (62)
            { hash: `${hash[0].slice(0, 62)}ZZ`, expected: false }, // not hex
            { hash: `${hash[0].slice(2)}00`, expected: false }, // length is too long (66 without 0x)
            { hash: `${hash[0]}00`, expected: false }, // length is too long (68)
            { hash: hash[1].slice(4), expected: false }, // length is not enough (62)
            { hash: `${hash[1].slice(0, 62)}ZZ`, expected: false }, // not hex
            { hash: `${hash[1].slice(2)}00`, expected: false }, // length is too long (66 without 0x)
            { hash: `${hash[1]}00`, expected: false }, // length is too long (68)
        ]

        it('should return false', () => {
            for (const test of tests) {
                expect(caver.utils.isValidHash(test.hash)).to.be.equal(test.expected)
            }
        })
    })
})

describe('caver.utils.toBN', () => {
    context('CAVERJS-UNIT-ETC-118: input: valid value', () => {
        const tests = [
            { value: 1, expected: '1' },
            { value: '1', expected: '1' },
            { value: '0x1', expected: '1' },
            { value: '0x01', expected: '1' },
            { value: 15, expected: '15' },
            { value: '15', expected: '15' },
            { value: '0xf', expected: '15' },
            { value: '0x0f', expected: '15' },
            { value: new BN('f', 16), expected: '15' },
            { value: -1, expected: '-1' },
            { value: '-1', expected: '-1' },
            { value: '-0x1', expected: '-1' },
            { value: '-0x01', expected: '-1' },
            { value: -15, expected: '-15' },
            { value: '-15', expected: '-15' },
            { value: '-0xf', expected: '-15' },
            { value: '-0x0f', expected: '-15' },
            {
                value: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                expected: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
            },
            {
                value: '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
                expected: '115792089237316195423570985008687907853269984665640564039457584007913129639933',
            },
            {
                value: '-0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                expected: '-115792089237316195423570985008687907853269984665640564039457584007913129639935',
            },
            {
                value: '-0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
                expected: '-115792089237316195423570985008687907853269984665640564039457584007913129639933',
            },
            { value: 0, expected: '0' },
            { value: '0', expected: '0' },
            { value: '0x0', expected: '0' },
            { value: -0, expected: '0' },
            { value: '-0', expected: '0' },
            { value: '-0x0', expected: '0' },
            { value: new BN(0), expected: '0' },
        ]
        it('should return BigNumber type', () => {
            for (const test of tests) {
                const bn = caver.utils.toBN(test.value)
                expect(caver.utils.isBN(bn)).to.be.true
                expect(bn.toString()).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-119: input: invalid value', () => {
        it('should throw an error', () => {
            const invalid = 'zzzz'
            const errorMessage = `Error: [number-to-bn] while converting number "${invalid}" to BN.js instance, error: invalid number value. Value must be an integer, hex string, BN or BigNumber instance. Note, decimals are not supported. Given value: "${invalid}"`
            expect(() => caver.utils.toBN(invalid)).to.throw(errorMessage)
        })
    })
})

describe('caver.utils.hexToNumberString', () => {
    context('CAVERJS-UNIT-ETC-120: input: number', () => {
        const tests = [
            { value: 1234, expected: (1234).toString() },
            { value: 0x1234, expected: (0x1234).toString() },
            { value: 0xea, expected: (0xea).toString() },
            { value: 100000, expected: '100000' },
        ]
        it('should return numberString', () => {
            for (const test of tests) {
                expect(caver.utils.hexToNumberString(test.value)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-121: input: numberString', () => {
        it('should throw an error', () => {
            const invalid = '1234'
            const errorMessage = `Given value "${invalid}" is not a valid hex string.`
            expect(() => caver.utils.hexToNumberString(invalid)).to.throw(errorMessage)
        })
    })

    context('CAVERJS-UNIT-ETC-122: input: hexString', () => {
        const tests = [
            { value: '0x1234', expected: (0x1234).toString() },
            { value: '0x3e8', expected: '1000' },
            { value: '0x1f0fe294a36', expected: '2134567897654' },
        ]
        it('should return numberString', () => {
            for (const test of tests) {
                expect(caver.utils.hexToNumberString(test.value)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-123: input: invalid hexString', () => {
        it('should throw an error', () => {
            const invalid = 'zzzz'
            const errorMessage = `Given value "${invalid}" is not a valid hex string.`
            expect(() => caver.utils.hexToNumberString(invalid)).to.throw(errorMessage)
        })
    })
})

// caver.utils.hexToNumber
describe('caver.utils.hexToNumber', () => {
    context('CAVERJS-UNIT-ETC-124: input: valid value', () => {
        const tests = [
            { value: 1234, expected: 1234 },
            { value: 0x1234, expected: 4660 },
            { value: 0xea, expected: 234 },
            { value: '0xea', expected: 234 },
        ]
        it('should return number', () => {
            for (const test of tests) {
                expect(caver.utils.hexToNumber(test.value)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-125: input: invalid value', () => {
        it('should throw an error', () => {
            let invalid = '1234'
            let errorMessage = `Given value "${invalid}" is not a valid hex string.`
            expect(() => caver.utils.hexToBytes(invalid)).to.throw(errorMessage)

            invalid = 'zzzz'
            errorMessage = `Given value "${invalid}" is not a valid hex string.`
            expect(() => caver.utils.hexToBytes(invalid)).to.throw(errorMessage)
        })
    })
})

describe('caver.utils.numberToHex', () => {
    const toHexStr = number => `0x${number.toString(16).toLowerCase()}`

    context('CAVERJS-UNIT-ETC-126: input: valid number', () => {
        const tests = [
            { value: 1234, expected: toHexStr(1234) },
            { value: '1234', expected: toHexStr(1234) },
            { value: 0x1234, expected: toHexStr(4660) },
            { value: '0x1234', expected: toHexStr(4660) },
            { value: new BN(234), expected: toHexStr(234) },
            { value: new BN('234'), expected: toHexStr(234) },
            { value: new BigNumber(234), expected: toHexStr(234) },
            { value: new BigNumber('234'), expected: toHexStr(234) },
            { value: 1, expected: '0x1' },
            { value: '21345678976543214567869765432145647586', expected: '0x100f073a3d694d13d1615dc9bc3097e2' },
            { value: '1', expected: '0x1' },
            { value: '0x1', expected: '0x1' },
            { value: '0x01', expected: '0x1' },
            { value: 15, expected: '0xf' },
            { value: '15', expected: '0xf' },
            { value: '0xf', expected: '0xf' },
            { value: '0x0f', expected: '0xf' },
            { value: -1, expected: '-0x1' },
            { value: '-1', expected: '-0x1' },
            { value: '-0x1', expected: '-0x1' },
            { value: '-0x01', expected: '-0x1' },
            { value: -15, expected: '-0xf' },
            { value: '-15', expected: '-0xf' },
            { value: '-0xf', expected: '-0xf' },
            { value: '-0x0f', expected: '-0xf' },
            {
                value: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                expected: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            },
            {
                value: '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
                expected: '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
            },
            {
                value: '-0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                expected: '-0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            },
            {
                value: '-0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
                expected: '-0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
            },
            { value: 0, expected: '0x0' },
            { value: '0', expected: '0x0' },
            { value: '0x0', expected: '0x0' },
            { value: -0, expected: '0x0' },
            { value: '-0', expected: '0x0' },
            { value: '-0x0', expected: '0x0' },
        ]
        it('should return hexString', () => {
            for (const test of tests) {
                expect(caver.utils.numberToHex(test.value)).to.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-127: input: invalid number', () => {
        it('should throw an error', () => {
            const invalid = 'zzzz'
            const errorMessage = `Given input "${invalid}" is not a number.`

            expect(() => caver.utils.numberToHex(invalid)).to.throw(errorMessage)
        })
    })

    context('CAVERJS-UNIT-ETC-397: input: number that Number type cannot handle', () => {
        it('should throw an error', () => {
            const expectedErrorMsg =
                'Number can only safely store up to 53 bits: Number type cannot handle big number. Please use hex string or BigNumber/BN.'

            // eslint-disable-next-line no-loss-of-precision
            let invalid = 0x303f3b2c93f1a7ffff
            expect(() => caver.utils.numberToHex(invalid)).to.throw(expectedErrorMsg)

            // eslint-disable-next-line no-loss-of-precision
            invalid = 889999999999999999999
            expect(() => caver.utils.numberToHex(invalid)).to.throw(expectedErrorMsg)
        })
    })
})

describe('caver.utils.hexToUtf8', () => {
    context('CAVERJS-UNIT-ETC-128: input: valid hexString', () => {
        const tests = [
            { value: '0x49206861766520313030e282ac', expected: 'I have 100€' },
            { value: '0x48656c6c6f2c204b6c6179746e', expected: 'Hello, Klaytn' },
            {
                value: '0x486565c3a4c3b6c3b6c3a4f09f9185443334c99dc9a33234d084cdbd2d2e2cc3a4c3bc2b232f',
                expected: 'Heeäööä👅D34ɝɣ24Єͽ-.,äü+#/',
            },
            { value: '0x6d79537472696e67', expected: 'myString' },
            { value: '0x6d79537472696e6700', expected: 'myString' },
            { value: '0x65787065637465642076616c7565000000000000000000000000000000000000', expected: 'expected value' },
            { value: '0x000000000000000000000000000000000000657870656374000065642076616c7565', expected: 'expect\u0000\u0000ed value' },
        ]
        it('should return utf8 string', () => {
            for (const test of tests) {
                expect(caver.utils.hexToUtf8(test.value)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-129: input: invalid hexString', () => {
        it('should throw an error', () => {
            const invalid = 'zzzz'
            const errorMessage = `The parameter "${invalid}" must be a valid HEX string.`

            expect(() => caver.utils.hexToUtf8(invalid)).to.throw(errorMessage)
        })
    })
})

describe('caver.utils.hexToAscii', () => {
    context('CAVERJS-UNIT-ETC-130: input: valid hexString', () => {
        const tests = [
            { value: '0x4920686176652031303021', expected: 'I have 100!' },
            { value: '0x48656c6c6f2c204b6c6179746e', expected: 'Hello, Klaytn' },
            { value: '0x6d79537472696e67', expected: 'myString' },
            { value: '0x6d79537472696e6700', expected: 'myString\u0000' },
            {
                value:
                    '0x0300000035e8c6d54c5d127c9dcebe9e1a37ab9b05321128d097590a3c100000000000006521df642ff1f5ec0c3a7aa6cea6b1e7b7f7cda2cbdf07362a85088e97f19ef94331c955c0e9321ad386428c',
                expected:
                    '\u0003\u0000\u0000\u00005èÆÕL]\u0012|Î¾\u001a7«\u00052\u0011(ÐY\n<\u0010\u0000\u0000\u0000\u0000\u0000\u0000e!ßd/ñõì\f:z¦Î¦±ç·÷Í¢Ëß\u00076*\bñùC1ÉUÀé2\u001aÓB',
            },
        ]
        it('should return Ascii string', () => {
            for (const test of tests) {
                expect(caver.utils.hexToAscii(test.value)).to.be.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-131: input: invalid hexString', () => {
        it('should throw an error', () => {
            const invalid = 'zzzz'
            const errorMessage = 'The parameter must be a valid HEX string.'

            expect(() => caver.utils.hexToAscii(invalid)).to.throw(errorMessage)
        })
    })
})

describe('CAVERJS-UNIT-ETC-132: caver.utils.utf8ToHex', () => {
    const tests = [
        { value: 'I have 100€', expected: '0x49206861766520313030e282ac' },
        { value: 'Hello, Klaytn', expected: '0x48656c6c6f2c204b6c6179746e' },
        { value: 'Heeäööä👅D34ɝɣ24Єͽ-.,äü+#/', expected: '0x486565c3a4c3b6c3b6c3a4f09f9185443334c99dc9a33234d084cdbd2d2e2cc3a4c3bc2b232f' },
        { value: 'myString', expected: '0x6d79537472696e67' },
        { value: 'myString\u0000', expected: '0x6d79537472696e67' },
        { value: 'expected value\u0000\u0000\u0000', expected: '0x65787065637465642076616c7565' },
        { value: 'expect\u0000\u0000ed value\u0000\u0000\u0000', expected: '0x657870656374000065642076616c7565' },
    ]
    it('should return hexString', () => {
        for (const test of tests) {
            expect(caver.utils.utf8ToHex(test.value)).to.be.equal(test.expected)
        }
    })
})

describe('CAVERJS-UNIT-ETC-133: caver.utils.asciiToHex', () => {
    const tests = [
        { value: 'I have 100!', expected: '0x4920686176652031303021' },
        { value: 'Hello, Klaytn', expected: '0x48656c6c6f2c204b6c6179746e' },
        { value: 'myString', expected: '0x6d79537472696e67' },
        { value: 'myString\u0000', expected: '0x6d79537472696e6700' },
        {
            value:
                '\u0003\u0000\u0000\u00005èÆÕL]\u0012|Î¾\u001a7«\u00052\u0011(ÐY\n<\u0010\u0000\u0000\u0000\u0000\u0000\u0000e!ßd/ñõì\f:z¦Î¦±ç·÷Í¢Ëß\u00076*\bñùC1ÉUÀé2\u001aÓB',
            expected:
                '0x0300000035e8c6d54c5d127c9dcebe9e1a37ab9b05321128d097590a3c100000000000006521df642ff1f5ec0c3a7aa6cea6b1e7b7f7cda2cbdf07362a85088e97f19ef94331c955c0e9321ad386428c',
        },
    ]
    it('should return hex String', () => {
        for (const test of tests) {
            expect(caver.utils.asciiToHex(test.value)).to.be.equal(test.expected)
        }
    })
})

describe('caver.utils.hexToBytes', () => {
    context("CAVERJS-UNIT-ETC-134: input: hexString '0x000000ea'", () => {
        it('should return bytes', () => {
            const hex = '0x000000ea'

            const expected = [0, 0, 0, 234]
            const result = caver.utils.hexToBytes(hex)
            expect(result).to.deep.equal(expected)
        })
    })

    context('CAVERJS-UNIT-ETC-135: input: invalid hexString', () => {
        it('should throw an error', () => {
            let invalid = 0x000000ea
            let errorMessage = `Given value "${invalid.toString(16)}" is not a valid hex string.`
            expect(() => caver.utils.hexToBytes(invalid)).to.throw(errorMessage)

            invalid = 'zzzz'
            errorMessage = `Given value "${invalid}" is not a valid hex string.`
            expect(() => caver.utils.hexToBytes(invalid)).to.throw(errorMessage)
        })
    })
})

describe('CAVERJS-UNIT-ETC-136: caver.utils.bytesToHex', () => {
    const tests = [{ value: [0, 0, 0, 234], expected: '0x000000ea' }, { value: [234], expected: '0xea' }]
    it('should return byteArray', () => {
        for (const test of tests) {
            expect(caver.utils.bytesToHex(test.value)).deep.equal(test.expected)
        }
    })
})

describe('caver.utils.toPeb', () => {
    const { unitMap } = utils

    context('CAVERJS-UNIT-ETC-137: input: various type', () => {
        const tests = [
            { value: 1, expected: unitMap.KLAY },
            { value: '1', expected: unitMap.KLAY },
            { value: 123456789, expected: new BigNumber(unitMap.KLAY * 123456789).toFixed(0) },
            { value: '123456789', expected: new BigNumber(unitMap.KLAY * 123456789).toFixed(0) },
            { value: new BN(1), expected: unitMap.KLAY },
            { value: new BN('1'), expected: unitMap.KLAY },
            { value: new BN(123456789), expected: new BigNumber(unitMap.KLAY * 123456789).toFixed(0) },
            { value: new BN('123456789'), expected: new BigNumber(unitMap.KLAY * 123456789).toFixed(0) },
        ]
        it('should return string', () => {
            for (const test of tests) {
                expect(caver.utils.toPeb(test.value).toString()).to.be.equal(test.expected.toString())
            }
        })
    })

    context('CAVERJS-UNIT-ETC-138: input: base unitmap', () => {
        const tests = [
            { value: 1, unit: 'peb', expected: unitMap.peb },
            { value: 1, unit: 'kpeb', expected: unitMap.kpeb },
            { value: 1, unit: 'Mpeb', expected: unitMap.Mpeb },
            { value: 1, unit: 'Gpeb', expected: unitMap.Gpeb },
            { value: 1, unit: 'uKLAY', expected: unitMap.uKLAY },
            { value: 1, unit: 'mKLAY', expected: unitMap.mKLAY },
            { value: 1, unit: 'KLAY', expected: unitMap.KLAY },
            { value: 1, unit: 'kKLAY', expected: unitMap.kKLAY },
            { value: 1, unit: 'MKLAY', expected: unitMap.MKLAY },
        ]
        it('should return string', () => {
            for (const test of tests) {
                expect(caver.utils.toPeb(test.value, test.unit)).to.be.equal(test.expected)
            }
        })
    })
})

describe('caver.utils.fromPeb', () => {
    const { unitMap } = utils

    context('CAVERJS-UNIT-ETC-139: fromPeb without unit', () => {
        const tests = [
            { value: 1, peb: unitMap.KLAY },
            { value: '1', peb: unitMap.KLAY },
            { value: 123456789, peb: unitMap.KLAY },
            { value: '123456789', peb: unitMap.KLAY },
            { value: new BN(1), peb: unitMap.KLAY },
            { value: new BN('1'), peb: unitMap.KLAY },
            { value: new BN(123456789), peb: unitMap.KLAY },
            { value: new BN('123456789'), peb: unitMap.KLAY },
        ]
        it('should return string based on unitMap', () => {
            for (const test of tests) {
                const bn = new BigNumber(test.peb)
                const expected = (0.1 ** bn.e * test.value).toFixed(bn.e)

                expect(caver.utils.fromPeb(test.value)).to.be.equal(expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-140: fromPeb with unit', () => {
        const tests = [
            { value: 1, unit: 'peb', peb: unitMap.peb },
            { value: 1, unit: 'kpeb', peb: unitMap.kpeb },
            { value: 1, unit: 'Mpeb', peb: unitMap.Mpeb },
            { value: 1, unit: 'Gpeb', peb: unitMap.Gpeb },
            { value: 1, unit: 'uKLAY', peb: unitMap.uKLAY },
            { value: 1, unit: 'mKLAY', peb: unitMap.mKLAY },
            { value: 1, unit: 'KLAY', peb: unitMap.KLAY },
            { value: 1, unit: 'kKLAY', peb: unitMap.kKLAY },
            { value: 1, unit: 'MKLAY', peb: unitMap.MKLAY },
        ]
        it('should return string based on unitMap', () => {
            for (const test of tests) {
                const bn = new BigNumber(test.peb)
                const expected = (0.1 ** bn.e * test.value).toFixed(bn.e)

                expect(caver.utils.fromPeb(test.value, test.unit)).to.be.equal(expected)
            }
        })
    })
})

describe('caver.utils.unitMap', () => {
    const { unitMap } = utils

    it('CAVERJS-UNIT-ETC-141: should return valid unitMap', () => {
        const result = caver.utils.unitMap
        expect(result).to.deep.equal(unitMap)
        expect(result.peb).to.equals('1')
        expect(result.kpeb).to.equals('1000')
        expect(result.Mpeb).to.equals('1000000')
        expect(result.Gpeb).to.equals('1000000000')
        expect(result.Ston).to.equals('1000000000')
        expect(result.ston).to.equals('1000000000')
        expect(result.uKLAY).to.equals('1000000000000')
        expect(result.mKLAY).to.equals('1000000000000000')
        expect(result.KLAY).to.equals('1000000000000000000')
        expect(result.kKLAY).to.equals('1000000000000000000000')
        expect(result.MKLAY).to.equals('1000000000000000000000000')
        expect(result.GKLAY).to.equals('1000000000000000000000000000')
        expect(result.TKLAY).to.equals('1000000000000000000000000000000')
    })
})

describe('caver.utils.klayUnit', () => {
    it('CAVERJS-UNIT-ETC-250: should return valid klayUnit', () => {
        const klayUnit = caver.utils.klayUnit
        const unitMap = caver.utils.unitMap
        Object.values(klayUnit).map(unitObj => {
            const { unit, pebFactor } = unitObj
            expect(unitMap[unit]).not.to.undefined
            expect(unitMap[unit]).to.equal(
                caver.utils
                    .toBN(10)
                    .pow(caver.utils.toBN(pebFactor))
                    .toString(10)
            )
        })
    })
})

describe('caver.utils.padLeft', () => {
    context('CAVERJS-UNIT-ETC-142: input: hex', () => {
        const tests = [
            { value: '0x3456ff', length: 20, expected: '0x000000000000003456ff' },
            { value: 0x3456ff, length: 20, expected: '0x000000000000003456ff' },
        ]
        it('should be left-padded with 0', () => {
            for (const test of tests) {
                expect(caver.utils.padLeft(test.value, test.length)).to.equal(test.expected)
            }
        })
    })

    context('CAVERJS-UNIT-ETC-143: input: string', () => {
        const tests = [{ value: 'Hello', length: 20, sign: 'x', expected: 'xxxxxxxxxxxxxxxHello' }]
        it('should be left padded with x', () => {
            for (const test of tests) {
                expect(caver.utils.padLeft(test.value, test.length, test.sign)).to.equal(test.expected)
            }
        })
    })
})

describe('caver.utils.padRight', () => {
    context('input: hex', () => {
        const tests = [
            { value: '0x3456ff', length: 20, expected: '0x3456ff00000000000000' },
            { value: 0x3456ff, length: 20, expected: '0x3456ff00000000000000' },
        ]
        it('should be right padded with 0', () => {
            for (const test of tests) {
                expect(caver.utils.padRight(test.value, test.length)).to.equal(test.expected)
            }
        })
    })

    context('input: string', () => {
        const tests = [{ value: 'Hello', length: 20, sign: 'x', expected: 'Helloxxxxxxxxxxxxxxx' }]
        it('should be right padded with x', () => {
            for (const test of tests) {
                expect(caver.utils.padRight(test.value, test.length, test.sign)).to.equal(test.expected)
            }
        })
    })
})

describe('CAVERJS-UNIT-ETC-144: caver.utils.toTwosComplement', () => {
    const tests = [
        { value: '-1', expected: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' },
        { value: -1, expected: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' },
        { value: '0x1', expected: '0x0000000000000000000000000000000000000000000000000000000000000001' },
        { value: -15, expected: '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1' },
        { value: '-0x1', expected: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' },
        { value: 1, expected: '0x0000000000000000000000000000000000000000000000000000000000000001' },
        { value: '1', expected: '0x0000000000000000000000000000000000000000000000000000000000000001' },
        { value: '0x01', expected: '0x0000000000000000000000000000000000000000000000000000000000000001' },
        { value: 15, expected: '0x000000000000000000000000000000000000000000000000000000000000000f' },
        { value: '15', expected: '0x000000000000000000000000000000000000000000000000000000000000000f' },
        { value: '0xf', expected: '0x000000000000000000000000000000000000000000000000000000000000000f' },
        { value: '0x0f', expected: '0x000000000000000000000000000000000000000000000000000000000000000f' },
        { value: new BN(0), expected: '0x0000000000000000000000000000000000000000000000000000000000000000' },
    ]
    it('should return TwosComplement', () => {
        for (const test of tests) {
            expect(caver.utils.toTwosComplement(test.value)).to.equal(test.expected)
        }
    })
})

describe('CAVERJS-UNIT-ETC-145: caver.utils.isHexPrefixed', () => {
    it('caver.utils.isHexPrefixed should return boolean depends on parameter', () => {
        expect(caver.utils.isHexPrefixed('0x')).to.be.true
        expect(caver.utils.isHexPrefixed('0X')).to.be.true
        expect(caver.utils.isHexPrefixed('0x0x')).to.be.true
        expect(caver.utils.isHexPrefixed('0X0x')).to.be.true
        expect(caver.utils.isHexPrefixed('01')).to.be.false
        expect(caver.utils.isHexPrefixed({})).to.be.false
    })
})

describe('CAVERJS-UNIT-ETC-146: caver.utils.addHexPrefix', () => {
    it('caver.utils.addHexPrefix should return 0x hex format string', () => {
        expect(caver.utils.addHexPrefix('0x')).to.equals('0x')
        expect(caver.utils.addHexPrefix('0X')).to.equals('0x')
        expect(caver.utils.addHexPrefix('01')).to.equals('0x01')
        expect(caver.utils.addHexPrefix('x')).to.equals('0xx')
        expect(typeof caver.utils.addHexPrefix({})).to.equals('object')
    })
})

describe('CAVERJS-UNIT-ETC-147: caver.utils.stripHexPrefix', () => {
    it('caver.utils.stripHexPrefix should strip 0x prefix and return string', () => {
        expect(caver.utils.stripHexPrefix('0x')).to.equals('')
        expect(caver.utils.stripHexPrefix('0X')).to.equals('')
        expect(caver.utils.stripHexPrefix('01')).to.equals('01')
        expect(caver.utils.stripHexPrefix('0x01')).to.equals('01')
        expect(caver.utils.stripHexPrefix('0X01')).to.equals('01')
        expect(caver.utils.stripHexPrefix('0xx')).to.equals('x')
        expect(caver.utils.stripHexPrefix('0Xx')).to.equals('x')
        expect(typeof caver.utils.stripHexPrefix({})).to.equals('object')
    })
})

describe('caver.utils.toBuffer', () => {
    it('CAVERJS-UNIT-ETC-148: caver.utils.toBuffer should return input when input is Buffer', () => {
        expect(caver.utils.toBuffer(Buffer.from('test Buffer'))).to.deep.equal(Buffer.from('test Buffer'))
    })
    it('CAVERJS-UNIT-ETC-149: caver.utils.toBuffer should convert null or undefined to buffer', () => {
        expect(caver.utils.toBuffer(null)).to.deep.equal(Buffer.alloc(0))
        expect(caver.utils.toBuffer(undefined)).to.deep.equal(Buffer.alloc(0))
    })
    it('CAVERJS-UNIT-ETC-150: caver.utils.toBuffer should convert Array to buffer', () => {
        expect(caver.utils.toBuffer([1, 2, 3, 4, 5])).to.deep.equal(Buffer.from([1, 2, 3, 4, 5]))
        expect(caver.utils.toBuffer([])).to.deep.equal(Buffer.alloc(0))
    })
    it('CAVERJS-UNIT-ETC-151: caver.utils.toBuffer should convert BN to buffer', () => {
        expect(caver.utils.toBuffer(new BN(1))).to.deep.equal(Buffer.from([1]))
        expect(caver.utils.toBuffer(new BN(255)).toString('hex')).to.deep.equal('ff')
        expect(caver.utils.toBuffer(new BN('ff', 16)).toString('hex')).to.deep.equal('ff')
        expect(caver.utils.toBuffer(new BN('377', 8)).toString('hex')).to.deep.equal('ff')
        expect(caver.utils.toBuffer(new BN('11111111', 2)).toString('hex')).to.deep.equal('ff')
    })
    it('CAVERJS-UNIT-ETC-395: caver.utils.toBuffer should convert BN to buffer', () => {
        expect(caver.utils.toBuffer(new caver.utils.BigNumber(1))).to.deep.equal(Buffer.from([1]))
        expect(caver.utils.toBuffer(new caver.utils.BigNumber(255)).toString('hex')).to.deep.equal('ff')
        expect(caver.utils.toBuffer(new caver.utils.BigNumber('ff', 16)).toString('hex')).to.deep.equal('ff')
        expect(caver.utils.toBuffer(new caver.utils.BigNumber('377', 8)).toString('hex')).to.deep.equal('ff')
        expect(caver.utils.toBuffer(new caver.utils.BigNumber('11111111', 2)).toString('hex')).to.deep.equal('ff')
    })
    it('CAVERJS-UNIT-ETC-152: caver.utils.toBuffer should convert Object has toArray function to buffer', () => {
        expect(
            caver.utils.toBuffer({
                toArray() {
                    return [1, 2, 3, 4, 5]
                },
            })
        ).to.deep.equal(Buffer.from([1, 2, 3, 4, 5]))
    })
    it('CAVERJS-UNIT-ETC-153: caver.utils.toBuffer should convert String to buffer', () => {
        expect(caver.utils.toBuffer('0x01').toString('hex')).to.deep.equal('01')
        expect(caver.utils.toBuffer('0x1').toString('hex')).to.deep.equal('01')
        expect(caver.utils.toBuffer('0x1234').toString('hex')).to.deep.equal('1234')
        expect(caver.utils.toBuffer('0x12345').toString('hex')).to.deep.equal('012345')
        expect(caver.utils.toBuffer('0x11')).to.deep.equal(Buffer.from([17]))
        expect(caver.utils.toBuffer('0x')).to.deep.equal(Buffer.from([]))
    })
    it('CAVERJS-UNIT-ETC-154: caver.utils.toBuffer should convert Number to buffer', () => {
        expect(caver.utils.toBuffer(1)).to.deep.equal(Buffer.from([1]))
        expect(caver.utils.toBuffer(1).toString('hex')).to.deep.equal('01')
        expect(caver.utils.toBuffer(100).toString('hex')).to.deep.equal('64')
    })

    it('CAVERJS-UNIT-ETC-155: caver.utils.toBuffer should throw error when input type is not supported with toBuffer function', () => {
        expect(() => caver.utils.toBuffer({})).to.throw(
            'To convert an object to a buffer, the toArray function must be implemented inside the object'
        )
        expect(() => caver.utils.toBuffer({ toArray: [1, 2, 3, 4, 5] })).to.throw(
            'To convert an object to a buffer, the toArray function must be implemented inside the object'
        )
    })
    it('CAVERJS-UNIT-ETC-156: caver.utils.toBuffer should throw error when String is not 0x-prefixed', () => {
        expect(() => caver.utils.toBuffer('010x')).to.throw(
            "Failed to convert string to Buffer. 'toBuffer' function only supports 0x-prefixed hex string"
        )
        expect(() => caver.utils.toBuffer('01')).to.throw(
            "Failed to convert string to Buffer. 'toBuffer' function only supports 0x-prefixed hex string"
        )
        expect(() => caver.utils.toBuffer('')).to.throw(
            "Failed to convert string to Buffer. 'toBuffer' function only supports 0x-prefixed hex string"
        )
        expect(() => caver.utils.toBuffer('0xqwer')).to.throw(
            "Failed to convert string to Buffer. 'toBuffer' function only supports 0x-prefixed hex string"
        )
        expect(() => caver.utils.toBuffer('qwer')).to.throw(
            "Failed to convert string to Buffer. 'toBuffer' function only supports 0x-prefixed hex string"
        )
    })
})

describe('CAVERJS-UNIT-ETC-157: caver.utils.numberToBuffer', () => {
    it('caver.utils.numberToBuffer should convert number to buffer', () => {
        expect(caver.utils.numberToBuffer(6003400).toString('hex')).to.equals('5b9ac8')
        expect(caver.utils.numberToBuffer(1).toString('hex')).to.equals('01')
        expect(caver.utils.numberToBuffer(12345).toString('hex')).to.equals('3039')
        expect(caver.utils.numberToBuffer(123456789).toString('hex')).to.equals('075bcd15')
        expect(caver.utils.numberToBuffer(100000000).toString('hex')).to.equals('05f5e100')
        expect(caver.utils.numberToBuffer(819263839023).toString('hex')).to.equals('bebfee1b2f')
    })
})

describe('caver.utils.isHexParameter', () => {
    it('CAVERJS-UNIT-ETC-158: caver.utils.isHexParameter should return true if input is hex string', () => {
        expect(caver.utils.isHexParameter('0x01')).to.be.true
        expect(caver.utils.isHexParameter('0xa')).to.be.true
        expect(caver.utils.isHexParameter('0x256d774a7a1bbd469d4fb08545d171df1c755a78')).to.be.true
        expect(caver.utils.isHexParameter('0x256d774a7a1bbd469d4fb08545d171df1c755a78171df1c755a78')).to.be.true
    })

    it('CAVERJS-UNIT-ETC-159: caver.utils.isHexParameter should return false if input is not hex string', () => {
        // string type input
        expect(caver.utils.isHexParameter('')).to.be.false
        expect(caver.utils.isHexParameter('1')).to.be.false
        expect(caver.utils.isHexParameter('0xqwer')).to.be.false
        expect(caver.utils.isHexParameter('10x')).to.be.false
        expect(caver.utils.isHexParameter('0x14qr')).to.be.false
        expect(caver.utils.isHexParameter('0x1!')).to.be.false
        expect(caver.utils.isHexParameter(' 0x256d774a7a1bbd469d4fb08545d171df1c755a78')).to.be.false
        // not string type input
        expect(caver.utils.isHexParameter(null)).to.be.false
        expect(caver.utils.isHexParameter(undefined)).to.be.false
        expect(caver.utils.isHexParameter(true)).to.be.false
        expect(caver.utils.isHexParameter(1)).to.be.false
        expect(caver.utils.isHexParameter({})).to.be.false
        expect(caver.utils.isHexParameter([])).to.be.false
        expect(caver.utils.isHexParameter(Buffer.alloc(0))).to.be.false
        expect(caver.utils.isHexParameter(new BN())).to.be.false
    })
})

describe('caver.utils.xyPointFromPublicKey', () => {
    it('CAVERJS-UNIT-ETC-160: caver.utils.xyPointFromPublicKey should return x, y point from publicKey', () => {
        const account = caver.klay.accounts.create()
        const publicKey = caver.klay.accounts.privateKeyToPublicKey(account.privateKey)
        const xyPoint = caver.utils.xyPointFromPublicKey(publicKey)
        expect(Array.isArray(xyPoint)).to.be.true
        expect(xyPoint.length).to.equals(2)
        expect(publicKey).to.equals(caver.utils.leftPad(xyPoint[0], 64) + caver.utils.leftPad(xyPoint[1], 64).slice(2))
    })

    it('CAVERJS-UNIT-ETC-161: caver.utils.xyPointFromPublicKey should return x, y point remove leading zeros', () => {
        const publicKey1 =
            '0x046241c7524030e5b44fff78021e35227d708c8630757b35090d56527b615f605b8d366782c86dee49356be574e1172f75ef5ce5d03b6e8c17dbf10f3fa2d9a3'
        const publicKey2 =
            '0xba7135b75cae89b958e7bb78009bda52f6a348150757cc078e3e5e5d25519c500ed4ccec1f78ba4e1c21c7b1e57751cec4cf42e3997a476e3ecbf360ad095336'
        const publicKey3 =
            '0x12b97e6756861ac0257a240d985d761cee9ca7719a29c233c644cfcc421885000c8e4c69cdb71665377b9e8ffb702355ca53917e66c7444619049c3dd0252ab6'
        const publicKey4 =
            '0x05b3b58259770871a1cc18534f2d438935fa2dcdb04116cbfbde8adfe858c23e50047c5aea3c2f55de7de04203f8fe8ccc3b491029338d038a7ef6d6903b302e'
        const publicKey5 =
            '0x04019b186993b620455077b6bc37bf61666725d8d87ab33eb113ac0414cd48d78ff46e5ea48c6f22e8f19a77e5dbba9d209df60cbcb841b7e3e81fe444ba829831'

        const xyPoint1 = caver.utils.xyPointFromPublicKey(publicKey1)
        const xyPoint2 = caver.utils.xyPointFromPublicKey(publicKey2)
        const xyPoint3 = caver.utils.xyPointFromPublicKey(publicKey3)
        const xyPoint4 = caver.utils.xyPointFromPublicKey(publicKey4)
        const xyPoint5 = caver.utils.xyPointFromPublicKey(publicKey5)

        expect(xyPoint1[0]).to.equals('0x46241c7524030e5b44fff78021e35227d708c8630757b35090d56527b615f60')
        expect(xyPoint1[1]).to.equals('0x5b8d366782c86dee49356be574e1172f75ef5ce5d03b6e8c17dbf10f3fa2d9a3')

        expect(xyPoint2[0]).to.equals('0xba7135b75cae89b958e7bb78009bda52f6a348150757cc078e3e5e5d25519c50')
        expect(xyPoint2[1]).to.equals('0xed4ccec1f78ba4e1c21c7b1e57751cec4cf42e3997a476e3ecbf360ad095336')

        expect(xyPoint3[0]).to.equals('0x12b97e6756861ac0257a240d985d761cee9ca7719a29c233c644cfcc42188500')
        expect(xyPoint3[1]).to.equals('0xc8e4c69cdb71665377b9e8ffb702355ca53917e66c7444619049c3dd0252ab6')

        expect(xyPoint4[0]).to.equals('0x5b3b58259770871a1cc18534f2d438935fa2dcdb04116cbfbde8adfe858c23e')
        expect(xyPoint4[1]).to.equals('0x50047c5aea3c2f55de7de04203f8fe8ccc3b491029338d038a7ef6d6903b302e')

        expect(xyPoint5[0]).to.equals('0x19b186993b620455077b6bc37bf61666725d8d87ab33eb113ac0414cd48d78f')
        expect(xyPoint5[1]).to.equals('0xf46e5ea48c6f22e8f19a77e5dbba9d209df60cbcb841b7e3e81fe444ba829831')
    })

    it('CAVERJS-UNIT-ETC-209: caver.utils.xyPointFromPublicKey should return x, y point with compressed public key', () => {
        const publicKey1 = '0x03046241c7524030e5b44fff78021e35227d708c8630757b35090d56527b615f60'
        const publicKey2 = '0x02ba7135b75cae89b958e7bb78009bda52f6a348150757cc078e3e5e5d25519c50'
        const publicKey3 = '0x0212b97e6756861ac0257a240d985d761cee9ca7719a29c233c644cfcc42188500'
        const publicKey4 = '0x0205b3b58259770871a1cc18534f2d438935fa2dcdb04116cbfbde8adfe858c23e'

        const xyPoint1 = caver.utils.xyPointFromPublicKey(publicKey1)
        const xyPoint2 = caver.utils.xyPointFromPublicKey(publicKey2)
        const xyPoint3 = caver.utils.xyPointFromPublicKey(publicKey3)
        const xyPoint4 = caver.utils.xyPointFromPublicKey(publicKey4)

        expect(xyPoint1[0]).to.equals('0x46241c7524030e5b44fff78021e35227d708c8630757b35090d56527b615f60')
        expect(xyPoint1[1]).to.equals('0x5b8d366782c86dee49356be574e1172f75ef5ce5d03b6e8c17dbf10f3fa2d9a3')

        expect(xyPoint2[0]).to.equals('0xba7135b75cae89b958e7bb78009bda52f6a348150757cc078e3e5e5d25519c50')
        expect(xyPoint2[1]).to.equals('0xed4ccec1f78ba4e1c21c7b1e57751cec4cf42e3997a476e3ecbf360ad095336')

        expect(xyPoint3[0]).to.equals('0x12b97e6756861ac0257a240d985d761cee9ca7719a29c233c644cfcc42188500')
        expect(xyPoint3[1]).to.equals('0xc8e4c69cdb71665377b9e8ffb702355ca53917e66c7444619049c3dd0252ab6')

        expect(xyPoint4[0]).to.equals('0x5b3b58259770871a1cc18534f2d438935fa2dcdb04116cbfbde8adfe858c23e')
        expect(xyPoint4[1]).to.equals('0x50047c5aea3c2f55de7de04203f8fe8ccc3b491029338d038a7ef6d6903b302e')
    })
})

describe('caver.utils.isValidPublicKey', () => {
    it('CAVERJS-UNIT-ETC-171: caver.utils.isValidPublicKey should true with valid uncompressed public key', () => {
        const account = caver.klay.accounts.create()

        const unCompressedPublicKey = caver.klay.accounts.privateKeyToPublicKey(account.privateKey)

        const isValid = caver.utils.isValidPublicKey(unCompressedPublicKey)
        expect(isValid).to.be.true
    })

    it('CAVERJS-UNIT-ETC-172: caver.utils.isValidPublicKey should true with valid compressed public key', () => {
        const account = caver.klay.accounts.create()

        const unCompressedPublicKey = caver.klay.accounts.privateKeyToPublicKey(account.privateKey)
        const compressed = caver.utils.compressPublicKey(unCompressedPublicKey)

        const isValid = caver.utils.isValidPublicKey(compressed)
        expect(isValid).to.be.true
    })

    it('CAVERJS-UNIT-ETC-173: caver.utils.isValidPublicKey should false with invalid uncompressed public key', () => {
        const account = caver.klay.accounts.create()

        const unCompressedPublicKey = caver.klay.accounts.privateKeyToPublicKey(account.privateKey)

        const isValid = caver.utils.isValidPublicKey(unCompressedPublicKey.slice(1))
        expect(isValid).to.be.false
    })

    it('CAVERJS-UNIT-ETC-174: caver.utils.isValidPublicKey should false with invalid compressed public key', () => {
        const account = caver.klay.accounts.create()

        const unCompressedPublicKey = caver.klay.accounts.privateKeyToPublicKey(account.privateKey)
        const compressed = caver.utils.compressPublicKey(unCompressedPublicKey)

        const isValid = caver.utils.isValidPublicKey(compressed.slice(1))
        expect(isValid).to.be.false
    })

    it('CAVERJS-UNIT-ETC-175: caver.utils.isValidPublicKey should false with invalid indicated compressed public key', () => {
        const account = caver.klay.accounts.create()

        const unCompressedPublicKey = caver.klay.accounts.privateKeyToPublicKey(account.privateKey)
        let compressed = caver.utils.compressPublicKey(unCompressedPublicKey)
        compressed = compressed.replace('0x', '')
        compressed = compressed.slice(2)
        compressed = `05${compressed}`

        const isValid = caver.utils.isValidPublicKey(compressed)
        expect(isValid).to.be.false
    })

    it('CAVERJS-UNIT-ETC-204: caver.utils.isValidPublicKey should false when point is not on curve', () => {
        const pub =
            '0x4be11ff42d8fc1954fb9ed52296db1657564c5e38517764664fb7cf4306a1e163a2686aa755dd0291aa2f291c3560ef4bf4b46c671983ff3e23f11a1b744ff4a'

        const isValid = caver.utils.isValidPublicKey(pub)
        expect(isValid).to.be.false
    })

    it('CAVERJS-UNIT-ETC-253: caver.utils.isValidPublicKey should true with 04 uncompressed prefixed public key string', () => {
        const pub =
            '0x04019b186993b620455077b6bc37bf61666725d8d87ab33eb113ac0414cd48d78ff46e5ea48c6f22e8f19a77e5dbba9d209df60cbcb841b7e3e81fe444ba829831'

        const isValid = caver.utils.isValidPublicKey(pub)
        expect(isValid).to.be.true
    })
})

describe('caver.utils.isValidRole', () => {
    it('CAVERJS-UNIT-ETC-176: caver.utils.isValidRole should true with valid role', () => {
        let isValid = caver.utils.isValidRole('transactionKey')
        expect(isValid).to.be.true

        isValid = caver.utils.isValidRole('updateKey')
        expect(isValid).to.be.true

        isValid = caver.utils.isValidRole('feePayerKey')
        expect(isValid).to.be.true

        isValid = caver.utils.isValidRole('roleTransactionKey')
        expect(isValid).to.be.true

        isValid = caver.utils.isValidRole('roleAccountUpdateKey')
        expect(isValid).to.be.true

        isValid = caver.utils.isValidRole('roleFeePayerKey')
        expect(isValid).to.be.true
    })

    it('CAVERJS-UNIT-ETC-177: caver.utils.isValidRole should false with invalid role', () => {
        let isValid = caver.utils.isValidRole('invalid')
        expect(isValid).to.be.false

        isValid = caver.utils.isValidRole(undefined)
        expect(isValid).to.be.false

        isValid = caver.utils.isValidRole({})
        expect(isValid).to.be.false
    })
})

describe('caver.utils.isEmptySig', () => {
    it('CAVERJS-UNIT-ETC-178: caver.utils.isEmptySig should true with default signatures', () => {
        let isDefault = caver.utils.isEmptySig(['0x01', '0x', '0x'])
        expect(isDefault).to.be.true

        isDefault = caver.utils.isEmptySig([['0x01', '0x', '0x']])
        expect(isDefault).to.be.true

        isDefault = caver.utils.isEmptySig([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])
        expect(isDefault).to.be.true
    })

    it('CAVERJS-UNIT-ETC-179: caver.utils.isEmptySig should false if signatures is not same with default signatures', () => {
        let isDefault = caver.utils.isEmptySig([
            '0x25',
            '0xb2a5a15550ec298dc7dddde3774429ed75f864c82caeb5ee24399649ad731be9',
            '0x29da1014d16f2011b3307f7bbe1035b6e699a4204fc416c763def6cefd976567',
        ])
        expect(isDefault).to.be.false

        isDefault = caver.utils.isEmptySig([
            [
                '0x25',
                '0xb2a5a15550ec298dc7dddde3774429ed75f864c82caeb5ee24399649ad731be9',
                '0x29da1014d16f2011b3307f7bbe1035b6e699a4204fc416c763def6cefd976567',
            ],
        ])
        expect(isDefault).to.be.false
    })

    it('CAVERJS-UNIT-ETC-180: caver.utils.isEmptySig should throw error with invalid length of signatures', () => {
        const expectedError = 'Invalid signatures length: 6'
        expect(() => caver.utils.isEmptySig(['0x01', '0x', '0x', '0x01', '0x', '0x'])).to.throws(expectedError)
        expect(() => caver.utils.isEmptySig([['0x01', '0x', '0x', '0x01', '0x', '0x']])).to.throws(expectedError)
    })
})

describe('caver.utils.bufferToHex', () => {
    it('CAVERJS-UNIT-ETC-181: caver.utils.bufferToHex should convert buffer to Hex', () => {
        const buf = Buffer.from('5b9ac8', 'hex')
        const ret = caver.utils.bufferToHex(buf)
        expect(ret).to.equals('0x5b9ac8')
    })

    it('CAVERJS-UNIT-ETC-182: caver.utils.bufferToHex should convert empty buffer to Hex', () => {
        const buf = Buffer.alloc(0)
        const ret = caver.utils.bufferToHex(buf)
        expect(ret).to.equals('0x')
    })
})

describe('caver.utils.transformSignaturesToObject', () => {
    it('CAVERJS-UNIT-ETC-183: should convert array format of signatures to object with single signature', () => {
        const signature = [
            '0x4e44',
            '0x1692a48f166e3ef146eba61cbd6b450926854bb340cf6f689239f27588159419',
            '0x277b9c6e97dfa6fdbcc15c201b5f7e05a2ef03f6247d9b9c541f98b8c4f1041a',
        ]

        const transformed = caver.utils.transformSignaturesToObject(signature)

        expect(transformed.V).to.equals(signature[0])
        expect(transformed.R).to.equals(signature[1])
        expect(transformed.S).to.equals(signature[2])
    })

    it('CAVERJS-UNIT-ETC-184: should convert array format of signatures to object with multiple signatures', () => {
        const signatures = [
            [
                '0x4e44',
                '0x1692a48f166e3ef146eba61cbd6b450926854bb340cf6f689239f27588159419',
                '0x277b9c6e97dfa6fdbcc15c201b5f7e05a2ef03f6247d9b9c541f98b8c4f1041a',
            ],
            [
                '0xfea',
                '0xf1998d3f1c22689998d565673182482c962d7b22cbcd7c5538af13fc25f452f8',
                '0x15111ea59ea6c9aeaa63523b422da3d57fc5dc7620cf5ac08c7e76a5691b53c7',
            ],
        ]

        const transformed = caver.utils.transformSignaturesToObject(signatures)

        for (let i = 0; i < signatures.length; i++) {
            expect(transformed[i].V).to.equals(signatures[i][0])
            expect(transformed[i].R).to.equals(signatures[i][1])
            expect(transformed[i].S).to.equals(signatures[i][2])
        }
    })

    it('CAVERJS-UNIT-ETC-185: should convert string format of signatures to object with single signature', () => {
        const signatureString =
            '0xf1998d3f1c22689998d565673182482c962d7b22cbcd7c5538af13fc25f452f815111ea59ea6c9aeaa63523b422da3d57fc5dc7620cf5ac08c7e76a5691b53c7fea'
        const expectedSignatures = {
            V: '0xfea',
            R: '0xf1998d3f1c22689998d565673182482c962d7b22cbcd7c5538af13fc25f452f8',
            S: '0x15111ea59ea6c9aeaa63523b422da3d57fc5dc7620cf5ac08c7e76a5691b53c7',
        }

        const transformed = caver.utils.transformSignaturesToObject(signatureString)

        expect(transformed).to.deep.equal(expectedSignatures)
    })

    it('CAVERJS-UNIT-ETC-186: should convert string format of signatures to object with multiple signatures', () => {
        const signatureStrings = [
            '0xf1998d3f1c22689998d565673182482c962d7b22cbcd7c5538af13fc25f452f815111ea59ea6c9aeaa63523b422da3d57fc5dc7620cf5ac08c7e76a5691b53c7fea',
            '0x53fe704c30cbddd8481035b01d0696120e960418e1d4f0f7e88d3de9354c6986299fdedce9ea38d62a69a63462af32122f3db70623a40fe9bfe815ae6ebfeb7d7f6',
        ]
        const expectedSignatures = [
            {
                V: '0xfea',
                R: '0xf1998d3f1c22689998d565673182482c962d7b22cbcd7c5538af13fc25f452f8',
                S: '0x15111ea59ea6c9aeaa63523b422da3d57fc5dc7620cf5ac08c7e76a5691b53c7',
            },
            {
                V: '0x7f6',
                R: '0x53fe704c30cbddd8481035b01d0696120e960418e1d4f0f7e88d3de9354c6986',
                S: '0x299fdedce9ea38d62a69a63462af32122f3db70623a40fe9bfe815ae6ebfeb7d',
            },
        ]

        const transformed = caver.utils.transformSignaturesToObject(signatureStrings)

        for (let i = 0; i < expectedSignatures.length; i++) {
            expect(transformed[i]).to.deep.equal(expectedSignatures[i])
        }
    })

    it('CAVERJS-UNIT-ETC-187: should convert object(lowercase key) format of signatures to object with single signature', () => {
        const signature = {
            v: '0xfea',
            r: '0xf1998d3f1c22689998d565673182482c962d7b22cbcd7c5538af13fc25f452f8',
            s: '0x15111ea59ea6c9aeaa63523b422da3d57fc5dc7620cf5ac08c7e76a5691b53c7',
        }

        const transformed = caver.utils.transformSignaturesToObject(signature)

        expect(transformed.V).to.equals(signature.v)
        expect(transformed.R).to.equals(signature.r)
        expect(transformed.S).to.equals(signature.s)
    })

    it('CAVERJS-UNIT-ETC-188: should convert object(uppercase key) format of signatures to object with single signature', () => {
        const signature = {
            V: '0xfea',
            R: '0xf1998d3f1c22689998d565673182482c962d7b22cbcd7c5538af13fc25f452f8',
            S: '0x15111ea59ea6c9aeaa63523b422da3d57fc5dc7620cf5ac08c7e76a5691b53c7',
        }

        const transformed = caver.utils.transformSignaturesToObject(signature)

        expect(transformed.V).to.equals(signature.V)
        expect(transformed.R).to.equals(signature.R)
        expect(transformed.S).to.equals(signature.S)
    })

    it('CAVERJS-UNIT-ETC-189: should convert object format of signatures to object with multiple signatures', () => {
        const signatures = [
            {
                v: '0xfea',
                r: '0xf1998d3f1c22689998d565673182482c962d7b22cbcd7c5538af13fc25f452f8',
                s: '0x15111ea59ea6c9aeaa63523b422da3d57fc5dc7620cf5ac08c7e76a5691b53c7',
            },
            {
                V: '0x7f6',
                R: '0x53fe704c30cbddd8481035b01d0696120e960418e1d4f0f7e88d3de9354c6986',
                S: '0x299fdedce9ea38d62a69a63462af32122f3db70623a40fe9bfe815ae6ebfeb7d',
            },
        ]

        const transformed = caver.utils.transformSignaturesToObject(signatures)

        expect(transformed[0].V).to.equals(signatures[0].v)
        expect(transformed[0].R).to.equals(signatures[0].r)
        expect(transformed[0].S).to.equals(signatures[0].s)
        expect(transformed[1].V).to.equals(signatures[1].V)
        expect(transformed[1].R).to.equals(signatures[1].R)
        expect(transformed[1].S).to.equals(signatures[1].S)
    })

    it('CAVERJS-UNIT-ETC-190: should throw error when type is invalid', () => {
        expect(() => caver.utils.transformSignaturesToObject(1)).to.throws('Unsupported signature type: number')
        expect(() => caver.utils.transformSignaturesToObject([1])).to.throws('Unsupported signature type: number')
        expect(() => caver.utils.transformSignaturesToObject(null)).to.throws(
            'Failed to transform signatures to object: invalid signatures null'
        )
        expect(() => caver.utils.transformSignaturesToObject([null])).to.throws('Unsupported signature type: object')
        expect(() => caver.utils.transformSignaturesToObject(undefined)).to.throws(
            'Failed to transform signatures to object: invalid signatures undefined'
        )
        expect(() => caver.utils.transformSignaturesToObject([undefined])).to.throws('Unsupported signature type: undefined')
        expect(() => caver.utils.transformSignaturesToObject(NaN)).to.throws(
            'Failed to transform signatures to object: invalid signatures NaN'
        )
        expect(() => caver.utils.transformSignaturesToObject([NaN])).to.throws('Unsupported signature type: number')
    })

    it('CAVERJS-UNIT-ETC-191: should throw error when input does not have enough signature information', () => {
        let signature = {
            V: '0xfea',
            S: '0x15111ea59ea6c9aeaa63523b422da3d57fc5dc7620cf5ac08c7e76a5691b53c7',
        }
        expect(() => caver.utils.transformSignaturesToObject(signature)).to.throws(
            `Failed to transform signatures to object: invalid signature`
        )

        signature = {
            V: '0xfea',
            invalidKey: '0x15111ea59ea6c9aeaa63523b422da3d57fc5dc7620cf5ac08c7e76a5691b53c7',
        }
        expect(() => caver.utils.transformSignaturesToObject(signature)).to.throws(
            'Failed to transform signatures to object: invalid key(invalidKey) is defined in signature object.'
        )

        signature = ['0x4e44', '0x1692a48f166e3ef146eba61cbd6b450926854bb340cf6f689239f27588159419']
        expect(() => caver.utils.transformSignaturesToObject(signature)).to.throws(
            `Failed to transform signatures to object: invalid length of signature (2)`
        )

        signature = [
            '0x4e44',
            '0x15111ea59ea6c9aeaa63523b422da3d57fc5dc7620cf5ac08c7e76a5691b53c7',
            '0x1692a48f166e3ef146eba61cbd6b450926854bb340cf6f689239f27588159419',
            '0x1692a48f166e3ef146eba61cbd6b450926854bb340cf6f689239f27588159419',
        ]
        expect(() => caver.utils.transformSignaturesToObject(signature)).to.throws(
            `Failed to transform signatures to object: invalid length of signature (4)`
        )
    })
})

describe('caver.utils.isKlaytnWalletKey', () => {
    it('CAVERJS-UNIT-ETC-193: should return true when key parameter is in the format of KlaytnWalletKey', () => {
        const key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'

        const isKlaytnWalletKey = caver.utils.isKlaytnWalletKey(key)

        expect(isKlaytnWalletKey).to.be.true
    })

    it('CAVERJS-UNIT-ETC-194: should return false when key is not in format of KlaytnWalletKey', () => {
        // private key is not in hex
        let key = '0xzza915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        let isKlaytnWalletKey = caver.utils.isKlaytnWalletKey(key)
        expect(isKlaytnWalletKey).to.be.false

        // human readable is not in hex
        key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80xzz0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        isKlaytnWalletKey = caver.utils.isKlaytnWalletKey(key)
        expect(isKlaytnWalletKey).to.be.false

        // address is not in hex
        key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x000xa94f5374fce5edbc8e2a8697c15331677e6ebfzz'
        isKlaytnWalletKey = caver.utils.isKlaytnWalletKey(key)
        expect(isKlaytnWalletKey).to.be.false

        // without '0x' separator
        key = '45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d800a94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        isKlaytnWalletKey = caver.utils.isKlaytnWalletKey(key)
        expect(isKlaytnWalletKey).to.be.false

        // too many '0x'
        key = '0x0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        isKlaytnWalletKey = caver.utils.isKlaytnWalletKey(key)
        expect(isKlaytnWalletKey).to.be.false

        // without '0x' for type
        key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d8000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        isKlaytnWalletKey = caver.utils.isKlaytnWalletKey(key)
        expect(isKlaytnWalletKey).to.be.false

        // without '0x' for address
        key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x00a94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        isKlaytnWalletKey = caver.utils.isKlaytnWalletKey(key)
        expect(isKlaytnWalletKey).to.be.false
    })

    it('CAVERJS-UNIT-ETC-195: should return false when private key is invalid', () => {
        // invalid length
        let key = '0xa915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        let isKlaytnWalletKey = caver.utils.isKlaytnWalletKey(key)
        expect(isKlaytnWalletKey).to.be.false

        // invalid range
        key = '0x00000000000000000000000000000000000000000000000000000000000000000x000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        isKlaytnWalletKey = caver.utils.isKlaytnWalletKey(key)
        expect(isKlaytnWalletKey).to.be.false
    })

    it('CAVERJS-UNIT-ETC-196: should return false when human readable is invalid', () => {
        // invalid value
        let key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x030xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        let isKlaytnWalletKey = caver.utils.isKlaytnWalletKey(key)
        expect(isKlaytnWalletKey).to.be.false

        // invalid length
        key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x0000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        isKlaytnWalletKey = caver.utils.isKlaytnWalletKey(key)
        expect(isKlaytnWalletKey).to.be.false
    })

    it('CAVERJS-UNIT-ETC-197: should return false when addresss is invalid', () => {
        let key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x000xa94f5374fce5edbc8e2a8697c15331677e6ebf'
        let isKlaytnWalletKey = caver.utils.isKlaytnWalletKey(key)
        expect(isKlaytnWalletKey).to.be.false

        key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x000xa94f5374fce5edbc8e2a8697c15331677e6ebf0baf'
        isKlaytnWalletKey = caver.utils.isKlaytnWalletKey(key)
        expect(isKlaytnWalletKey).to.be.false
    })
})

describe('caver.utils.parsePrivateKey', () => {
    it('CAVERJS-UNIT-ETC-198: should return parsed private key, address and type when key parameter is single private key string', () => {
        const key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d8'

        const parsed = caver.utils.parsePrivateKey(key)

        expect(parsed.privateKey).to.be.equals(key)
        expect(parsed.address).to.be.equals('')
        expect(parsed.isHumanReadable).to.be.undefined
        expect(parsed.type).to.be.equals('')
    })

    it('CAVERJS-UNIT-ETC-199: should return parsed private key, address and type when key parameter is in format of KlaytnWalletKey', () => {
        const key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'

        const parsed = caver.utils.parsePrivateKey(key)

        expect(parsed.privateKey).to.be.equals('0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d8')
        expect(parsed.address).to.be.equals('0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b')
        expect(parsed.isHumanReadable).to.be.undefined
        expect(parsed.type).to.be.equals('0x00')
    })

    it('CAVERJS-UNIT-ETC-200: should throw error when type is not 00', () => {
        const key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x010xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'

        const expectedError = 'Invalid type: Currently only type `0x00` is supported.'

        expect(() => caver.utils.parsePrivateKey(key)).to.throws(expectedError)
    })

    it('CAVERJS-UNIT-ETC-201: should throw error when key is in invalid format of KlaytnWalletKey', () => {
        const key = '0x00000000000000000000000000000000000000000000000000000000000000000x000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'

        const expectedError = 'Invalid KlaytnWalletKey format.'

        expect(() => caver.utils.parsePrivateKey(key)).to.throws(expectedError)
    })
})

describe('caver.utils.parseKlaytnWalletKey', () => {
    it('CAVERJS-UNIT-ETC-220: should parse KlaytnWalletKey and return an array', () => {
        const key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'

        const parsed = caver.utils.parseKlaytnWalletKey(key)

        expect(parsed[0]).to.be.equal('0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d8')
        expect(parsed[1]).to.be.equal('0x00')
        expect(parsed[2]).to.be.equal('0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b')
    })

    it('CAVERJS-UNIT-ETC-221: should throw error when key is not in format of KlaytnWalletKey', () => {
        // private key is not in hex
        let key = '0xzza915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        let expectedError = `Invalid KlaytnWalletKey format: ${key}`
        expect(() => caver.utils.parseKlaytnWalletKey(key)).to.throw(expectedError)

        // type is not in hex
        key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80xzz0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        expectedError = `Invalid KlaytnWalletKey format: ${key}`
        expect(() => caver.utils.parseKlaytnWalletKey(key)).to.throw(expectedError)

        // address is not in hex
        key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x000xa94f5374fce5edbc8e2a8697c15331677e6ebfzz'
        expectedError = `Invalid KlaytnWalletKey format: ${key}`
        expect(() => caver.utils.parseKlaytnWalletKey(key)).to.throw(expectedError)

        // without '0x' separator
        key = '45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d800a94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        expectedError = `Invalid KlaytnWalletKey format: ${key}`
        expect(() => caver.utils.parseKlaytnWalletKey(key)).to.throw(expectedError)

        // too many '0x'
        key = '0x0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        expectedError = `Invalid KlaytnWalletKey format: ${key}`
        expect(() => caver.utils.parseKlaytnWalletKey(key)).to.throw(expectedError)

        // without '0x' for type
        key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d8000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        expectedError = `Invalid KlaytnWalletKey format: ${key}`
        expect(() => caver.utils.parseKlaytnWalletKey(key)).to.throw(expectedError)

        // without '0x' for address
        key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x00a94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        expectedError = `Invalid KlaytnWalletKey format: ${key}`
        expect(() => caver.utils.parseKlaytnWalletKey(key)).to.throw(expectedError)
    })

    it('CAVERJS-UNIT-ETC-222: should throw error when private key is invalid', () => {
        // invalid length
        let key = '0xa915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        let expectedError = `Invalid KlaytnWalletKey format: ${key}`
        expect(() => caver.utils.parseKlaytnWalletKey(key)).to.throw(expectedError)

        // invalid range
        key = '0x00000000000000000000000000000000000000000000000000000000000000000x000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        expectedError = `Invalid KlaytnWalletKey format: ${key}`
        expect(() => caver.utils.parseKlaytnWalletKey(key)).to.throw(expectedError)
    })

    it('CAVERJS-UNIT-ETC-223: should throw error when human readable is invalid', () => {
        // invalid value
        let key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x030xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        let expectedError = `Invalid KlaytnWalletKey format: ${key}`
        expect(() => caver.utils.parseKlaytnWalletKey(key)).to.throw(expectedError)

        // invalid length
        key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x0000xa94f5374fce5edbc8e2a8697c15331677e6ebf0b'
        expectedError = `Invalid KlaytnWalletKey format: ${key}`
        expect(() => caver.utils.parseKlaytnWalletKey(key)).to.throw(expectedError)
    })

    it('CAVERJS-UNIT-ETC-224: should throw error when addresss is invalid', () => {
        let key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x000xa94f5374fce5edbc8e2a8697c15331677e6ebf'
        let expectedError = `Invalid KlaytnWalletKey format: ${key}`
        expect(() => caver.utils.parseKlaytnWalletKey(key)).to.throw(expectedError)

        key = '0x45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d80x000xa94f5374fce5edbc8e2a8697c15331677e6ebf0baf'
        expectedError = `Invalid KlaytnWalletKey format: ${key}`
        expect(() => caver.utils.parseKlaytnWalletKey(key)).to.throw(expectedError)
    })
})

describe('caver.utils.resolveSignature', () => {
    it('CAVERJS-UNIT-ETC-211: should return an array of signature from object(lowercase)', () => {
        const signature = {
            v: '0x0fe9',
            r: '0x02aca4ec6773a26c71340c2500cb45886a61797bcd82790f7f01150ced48b0ac',
            s: '0x20502f22a1b3c95a5f260a03dc3de0eaa1f4a618b1d2a7d4da643507302e523c',
        }

        const resolved = caver.utils.resolveSignature(signature)

        expect(resolved.length).to.be.equals(3)
        expect(resolved[0]).to.be.equals(signature.v)
        expect(resolved[1]).to.be.equals(signature.r)
        expect(resolved[2]).to.be.equals(signature.s)
    })

    it('CAVERJS-UNIT-ETC-212: should return an array of signature from object(uppercase)', () => {
        const signature = {
            V: '0x0fe9',
            R: '0x02aca4ec6773a26c71340c2500cb45886a61797bcd82790f7f01150ced48b0ac',
            S: '0x20502f22a1b3c95a5f260a03dc3de0eaa1f4a618b1d2a7d4da643507302e523c',
        }

        const resolved = caver.utils.resolveSignature(signature)

        expect(resolved.length).to.be.equals(3)
        expect(resolved[0]).to.be.equals(signature.V)
        expect(resolved[1]).to.be.equals(signature.R)
        expect(resolved[2]).to.be.equals(signature.S)
    })

    it('CAVERJS-UNIT-ETC-213: should return an array of signature', () => {
        const signature = [
            '0x0fe9',
            '0x02aca4ec6773a26c71340c2500cb45886a61797bcd82790f7f01150ced48b0ac',
            '0x20502f22a1b3c95a5f260a03dc3de0eaa1f4a618b1d2a7d4da643507302e523c',
        ]

        const resolved = caver.utils.resolveSignature(signature)

        expect(resolved.length).to.be.equals(3)
        expect(resolved[0]).to.be.equals(signature[0])
        expect(resolved[1]).to.be.equals(signature[1])
        expect(resolved[2]).to.be.equals(signature[2])
    })

    it('CAVERJS-UNIT-ETC-214: should return an array of signature from encoded signature', () => {
        const signature =
            '0x7e85aaff6a6ef0730308af49f6b512741e61f958a21df387a0d0e8973fb40ca0307a8b87f6ac249f7218b4ee1a1d2f7d764ec2d20d9824e7b7b842dd214f139c7f6'
        const expected = [
            '0x7f6',
            '0x7e85aaff6a6ef0730308af49f6b512741e61f958a21df387a0d0e8973fb40ca0',
            '0x307a8b87f6ac249f7218b4ee1a1d2f7d764ec2d20d9824e7b7b842dd214f139c',
        ]

        const resolved = caver.utils.resolveSignature(signature)

        expect(resolved.length).to.be.equals(3)
        expect(resolved[0]).to.be.equals(expected[0])
        expect(resolved[1]).to.be.equals(expected[1])
        expect(resolved[2]).to.be.equals(expected[2])
    })
})

describe('caver.utils.convertFromPeb', () => {
    it('CAVERJS-UNIT-ETC-225: should convert to peb from peb', () => {
        const amount = '1000000000000000000000000000'
        const expected = amount

        const converted = caver.utils.convertFromPeb(amount, 'peb')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-226: should convert to kpeb from peb', () => {
        const amount = '1000000000000000000000000000'
        const expected = '1000000000000000000000000'

        const converted = caver.utils.convertFromPeb(amount, 'kpeb')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-227: should convert to Mpeb from peb', () => {
        const amount = '1000000000000000000000000000'
        const expected = '1000000000000000000000'

        const converted = caver.utils.convertFromPeb(amount, 'Mpeb')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-228: should convert to Gpeb from peb', () => {
        const amount = '1000000000000000000000000000'
        const expected = '1000000000000000000'

        const converted = caver.utils.convertFromPeb(amount, 'Gpeb')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-229: should convert to Ston from peb', () => {
        const amount = '1000000000000000000000000000'
        const expected = '1000000000000000000'

        const converted = caver.utils.convertFromPeb(amount, 'Ston')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-230: should convert to uKLAY from peb', () => {
        const amount = '1000000000000000000000000000'
        const expected = '1000000000000000'

        const converted = caver.utils.convertFromPeb(amount, 'uKLAY')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-231: should convert to mKLAY from peb', () => {
        const amount = '1000000000000000000000000000'
        const expected = '1000000000000'

        const converted = caver.utils.convertFromPeb(amount, 'mKLAY')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-232: should convert to KLAY from peb', () => {
        const amount = '1000000000000000000000000000'
        const expected = '1000000000'

        const converted = caver.utils.convertFromPeb(amount, 'KLAY')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-233: should convert to kKLAY from peb', () => {
        const amount = '1000000000000000000000000000'
        const expected = '1000000'

        const converted = caver.utils.convertFromPeb(amount, 'kKLAY')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-234: should convert to MKLAY from peb', () => {
        const amount = '1000000000000000000000000000'
        const expected = '1000'

        const converted = caver.utils.convertFromPeb(amount, 'MKLAY')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-235: should convert to GKLAY from peb', () => {
        const amount = '1000000000000000000000000000'
        const expected = '1'

        const converted = caver.utils.convertFromPeb(amount, 'GKLAY')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })
})

describe('caver.utils.convertToPeb', () => {
    it('CAVERJS-UNIT-ETC-236: should convert to peb from peb', () => {
        const expected = '1'

        const converted = caver.utils.convertToPeb(1, 'peb')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-237: should convert to peb from kpeb', () => {
        const expected = '1000'

        const converted = caver.utils.convertToPeb(1, 'kpeb')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-238: should convert to peb from Mpeb', () => {
        const expected = '1000000'

        const converted = caver.utils.convertToPeb(1, 'Mpeb')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-239: should convert to peb from Gpeb', () => {
        const expected = '1000000000'

        const converted = caver.utils.convertToPeb(1, 'Gpeb')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-240: should convert to peb from Ston', () => {
        const expected = '1000000000'

        const converted = caver.utils.convertToPeb(1, 'Ston')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-241: should convert to peb from uKLAY', () => {
        const expected = '1000000000000'

        const converted = caver.utils.convertToPeb(1, 'uKLAY')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-242: should convert to peb from mKLAY', () => {
        const expected = '1000000000000000'

        const converted = caver.utils.convertToPeb(1, 'mKLAY')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-243: should convert to peb from KLAY', () => {
        const expected = '1000000000000000000'

        const converted = caver.utils.convertToPeb(1, 'KLAY')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true

        const expectedForDecimalPoints = '2500000000000000000'

        const convertingDecimalPoint = caver.utils.convertToPeb(new BigNumber(2.5), 'KLAY')

        expect(_.isString(convertingDecimalPoint)).to.be.true
        expect(convertingDecimalPoint === expectedForDecimalPoints).to.be.true
    })

    it('CAVERJS-UNIT-ETC-244: should convert to peb from kKLAY', () => {
        const expected = '1000000000000000000000'

        const converted = caver.utils.convertToPeb(1, 'kKLAY')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-245: should convert to peb from MKLAY', () => {
        const expected = '1000000000000000000000000'

        const converted = caver.utils.convertToPeb(1, 'MKLAY')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })

    it('CAVERJS-UNIT-ETC-246: should convert to peb from GKLAY', () => {
        const expected = '1000000000000000000000000000'

        const converted = caver.utils.convertToPeb(1, 'GKLAY')

        expect(_.isString(converted)).to.be.true
        expect(converted === expected).to.be.true
    })
})

describe('caver.utils.recover', () => {
    it('CAVERJS-UNIT-ETC-248: return recovered address when input is message, signature', () => {
        const keyring = caver.wallet.keyring.generate()
        const message = 'Some data'
        const signed = keyring.signMessage(message, caver.wallet.keyring.role.roleTransactionKey)

        const result = caver.utils.recover(signed.message, signed.signatures[0])
        expect(result).to.equal(keyring.address)
    })

    it('CAVERJS-UNIT-ETC-249: return recovered address when input is messageHash, signature, prefixed', () => {
        const keyring = caver.wallet.keyring.generate()
        const message = 'Some data'
        const signed = keyring.signMessage(message, caver.wallet.keyring.role.roleTransactionKey)

        const result = caver.utils.recover(signed.messageHash, signed.signatures[0], true)
        expect(result).to.equal(keyring.address)
    })

    it('CAVERJS-UNIT-ETC-387: return recovered address when signature is an array', () => {
        const message = 'Some Message'

        const result = caver.utils.recover(message, [
            '0x1b',
            '0x8213e560e7bbe1f2e28fd69cbbb41c9108b84c98cd7c2c88d3c8e3549fd6ab10',
            '0x3ca40c9e20c1525348d734a6724db152b9244bff6e0ff0c2b811d61d8f874f00',
        ])
        expect(result.toLowerCase()).to.equal('0xa84a1ce657e9d5b383cece6f4ba365e23fa234dd')
    })

    it('CAVERJS-UNIT-ETC-388: return recovered address when signature is an object', () => {
        const message = 'Some Message'

        const result = caver.utils.recover(message, {
            v: '0x1b',
            r: '0x8213e560e7bbe1f2e28fd69cbbb41c9108b84c98cd7c2c88d3c8e3549fd6ab10',
            s: '0x3ca40c9e20c1525348d734a6724db152b9244bff6e0ff0c2b811d61d8f874f00',
        })
        expect(result.toLowerCase()).to.equal('0xa84a1ce657e9d5b383cece6f4ba365e23fa234dd')
    })
})

describe('caver.utils.recoverPublicKey', () => {
    it('CAVERJS-UNIT-ETC-379: return recovered public key when input is message, signature', () => {
        const keyring = caver.wallet.keyring.generate()
        const message = 'Some data'
        const signed = keyring.signMessage(message, caver.wallet.keyring.role.roleTransactionKey)

        const result = caver.utils.recoverPublicKey(signed.message, signed.signatures[0])
        expect(result).to.equal(keyring.getPublicKey())
    })

    it('CAVERJS-UNIT-ETC-380: return recovered public key when input is messageHash, signature, prefixed', () => {
        const keyring = caver.wallet.keyring.generate()
        const message = 'Some data'
        const signed = keyring.signMessage(message, caver.wallet.keyring.role.roleTransactionKey)

        const result = caver.utils.recoverPublicKey(signed.messageHash, signed.signatures[0], true)
        expect(result).to.equal(keyring.getPublicKey())
    })

    it('CAVERJS-UNIT-ETC-385: return recovered public key when signature is an array', () => {
        const message = 'Some Message'

        const result = caver.utils.recoverPublicKey(message, [
            '0x1b',
            '0x8213e560e7bbe1f2e28fd69cbbb41c9108b84c98cd7c2c88d3c8e3549fd6ab10',
            '0x3ca40c9e20c1525348d734a6724db152b9244bff6e0ff0c2b811d61d8f874f00',
        ])
        expect(result.toLowerCase()).to.equal(
            '0xb5df4d5e6b4ee7a136460b911a69030fdd42c18ed067bcc2e25eda1b851314fad994c5fe946aad01ca2e348d4ff3094960661a8bc095f358538af54aeea48ff3'
        )
    })

    it('CAVERJS-UNIT-ETC-386: return recovered public key when signature is an object', () => {
        const message = 'Some Message'

        const result = caver.utils.recoverPublicKey(message, {
            v: '0x1b',
            r: '0x8213e560e7bbe1f2e28fd69cbbb41c9108b84c98cd7c2c88d3c8e3549fd6ab10',
            s: '0x3ca40c9e20c1525348d734a6724db152b9244bff6e0ff0c2b811d61d8f874f00',
        })
        expect(result.toLowerCase()).to.equal(
            '0xb5df4d5e6b4ee7a136460b911a69030fdd42c18ed067bcc2e25eda1b851314fad994c5fe946aad01ca2e348d4ff3094960661a8bc095f358538af54aeea48ff3'
        )
    })
})

describe('caver.utils.publicKeyToAddress', () => {
    it('CAVERJS-UNIT-ETC-381: return an address which is derived by public key', () => {
        const address = '0x5b2840bcbc2be07fb12d9129ed3a02d8e4465944'
        const publicKey =
            '0x68ffedd4a1d9fefa38f6ed9d58f0b85741a90ad604ab901c130c1fea42eab666dec186a48ad4db56b14898e8e18fe0176d926a2c1ffeeb6b6df805ec0bf41eb8'

        const result = caver.utils.publicKeyToAddress(publicKey)
        expect(result.toLowerCase()).to.equal(address)
    })

    it('CAVERJS-UNIT-ETC-382: return an address which is derived by uncompressed public key', () => {
        const address = '0x5b2840bcbc2be07fb12d9129ed3a02d8e4465944'
        const publicKey =
            '0x68ffedd4a1d9fefa38f6ed9d58f0b85741a90ad604ab901c130c1fea42eab666dec186a48ad4db56b14898e8e18fe0176d926a2c1ffeeb6b6df805ec0bf41eb8'

        const result = caver.utils.publicKeyToAddress(caver.utils.decompressPublicKey(publicKey))
        expect(result.toLowerCase()).to.equal(address)
    })

    it('CAVERJS-UNIT-ETC-383: return an address which is derived by compressed public key', () => {
        const address = '0x5b2840bcbc2be07fb12d9129ed3a02d8e4465944'
        const publicKey =
            '0x68ffedd4a1d9fefa38f6ed9d58f0b85741a90ad604ab901c130c1fea42eab666dec186a48ad4db56b14898e8e18fe0176d926a2c1ffeeb6b6df805ec0bf41eb8'

        const result = caver.utils.publicKeyToAddress(caver.utils.compressPublicKey(publicKey))
        expect(result.toLowerCase()).to.equal(address)
    })
})

describe('caver.utils.decodeSignature', () => {
    it('CAVERJS-UNIT-ETC-384: decode a raw signature string', () => {
        const rawSigs = [
            '0xc69018da9396c4b87947e0784625af7475caf46e2af9cf57a44673ff0f625258642d8993751ae67271bcc131aa065adccf9f16fc4953f9c48f4a80d675c09ae81b',
            '0x4c78ba080e717534772c4a9714b06a12f8d41062fca72885dafa8f1e1d6d78de35a50522df6361d16c05d1368bb9d86da1054f153301d5dedc6658d222616edd1b',
            '0xacfc5c417a8506eb1bd8394553fbde4a9097ea854bdbbe0de2bfaebcc9a26f45521773632317323f3d3da09bf06185af1ee0481ef0d1abb8a790f3a110eadfc31c',
        ]
        const expectedResult = [
            new SignatureData([
                '1b',
                'c69018da9396c4b87947e0784625af7475caf46e2af9cf57a44673ff0f625258',
                '642d8993751ae67271bcc131aa065adccf9f16fc4953f9c48f4a80d675c09ae8',
            ]),
            new SignatureData([
                '1b',
                '4c78ba080e717534772c4a9714b06a12f8d41062fca72885dafa8f1e1d6d78de',
                '35a50522df6361d16c05d1368bb9d86da1054f153301d5dedc6658d222616edd',
            ]),
            new SignatureData([
                '1c',
                'acfc5c417a8506eb1bd8394553fbde4a9097ea854bdbbe0de2bfaebcc9a26f45',
                '521773632317323f3d3da09bf06185af1ee0481ef0d1abb8a790f3a110eadfc3',
            ]),
        ]

        for (let i = 0; i < rawSigs.length; i++) {
            const decoded = caver.utils.decodeSignature(rawSigs[i])
            expect(expectedResult[i].v).to.equal(decoded.v)
            expect(expectedResult[i].r).to.equal(decoded.r)
            expect(expectedResult[i].s).to.equal(decoded.s)
        }
    })
})
