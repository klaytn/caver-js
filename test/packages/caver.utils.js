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

require('it-each')({ testPerIteration: true })
const BN = require('bn.js')
const BigNumber = require('bignumber.js')
const testRPCURL = require('../testrpc')
const { expect } = require('../extendedChai')

const utils = require('./utils')
const Caver = require('../../index.js')

let caver
beforeEach(() => {
    caver = new Caver(testRPCURL)
})

describe('caver.utils.randomHex', () => {
    context('CAVERJS-UNIT-ETC-097: input: valid value', () => {
        const tests = [0, 1, 2, 4, 32, 64]
        it.each(tests, 'should match with regex', size => {
            const data = caver.utils.randomHex(size)
            const regExp = new RegExp(`^0x[0-9a-f]{${size * 2}}$`)
            expect(data).to.match(regExp)
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
        ]
        it.each(tests, 'should return true', test => {
            expect(caver.utils.isBN(test.value)).to.be.equal(test.expected)
        })
    })

    context('CAVERJS-UNIT-ETC-100: input: not a BN type', () => {
        const tests = [
            { value: 255, expected: false },
            { value: 0xff, expected: false },
            { value: 0o377, expected: false },
            { value: 0b11111111, expected: false },
        ]
        it.each(tests, 'should return false', test => {
            expect(caver.utils.isBN(test.value)).to.be.equal(test.expected)
        })
    })
})

describe('caver.utils.isBigNumber', () => {
    context('CAVERJS-UNIT-ETC-101: input: BigNumber type', () => {
        const tests = [
            { value: new BigNumber(1.0000000000000001), expected: true },
            { value: new BigNumber(88259496234518.57), expected: true },
            { value: new BigNumber(99999999999999999999), expected: true },
            { value: new BigNumber(2e308), expected: true },
        ]
        it.each(tests, 'should return true', test => {
            expect(caver.utils.isBigNumber(test.value)).to.be.equal(test.expected)
        })
    })

    context('CAVERJS-UNIT-ETC-102: input: not a BigNumber type', () => {
        const tests = [
            { value: 1.0000000000000001, expected: false },
            { value: 88259496234518.57, expected: false },
            { value: 99999999999999999999, expected: false },
            { value: 2e308, expected: false },
        ]
        it.each(tests, 'should return false', test => {
            expect(caver.utils.isBigNumber(test.value)).to.be.equal(test.expected)
        })
    })
})

describe('caver.utils.sha3', () => {
    context('CAVERJS-UNIT-ETC-103: input: BN type', () => {
        const tests = [{ value: new BN('234'), expected: '0xc1912fee45d61c87cc5ea59dae311904cd86b84fee17cc96966216f811ce6a79' }]
        it.each(tests, 'should return 32 bytes hexstring', test => {
            expect(caver.utils.sha3(test.value)).to.be.equal(test.expected)
        })
    })

    context('CAVERJS-UNIT-ETC-104: input: number type', () => {
        const tests = [{ value: 234, expected: null }, { value: 0xea, expected: null }]
        it.each(tests, 'should return null', test => {
            expect(caver.utils.sha3(test.value)).to.be.equal(test.expected)
        })
    })

    context('CAVERJS-UNIT-ETC-105: input: String | HexString type', () => {
        const tests = [
            { value: '234', expected: '0xc1912fee45d61c87cc5ea59dae311904cd86b84fee17cc96966216f811ce6a79' },
            { value: '0xea', expected: '0x2f20677459120677484f7104c76deb6846a2c071f9b3152c103bb12cd54d1a4a' },
        ]
        it.each(tests, 'should return 32 bytes hexstring', test => {
            expect(caver.utils.sha3(test.value)).to.be.equal(test.expected)
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
    it.each(tests, 'should return 32 bytes hexstring', test => {
        expect(caver.utils.soliditySha3(...test.values)).to.be.equal(test.expected)
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
        it.each(tests, 'should return true', test => {
            expect(caver.utils.isHex(test.value)).to.be.equal(test.expected)
        })
    })

    context('CAVERJS-UNIT-ETC-108: input: invalid hexString', () => {
        const tests = [{ value: '0xZ1912', expected: false }, { value: 'Hello', expected: false }]
        it.each(tests, 'should return false', test => {
            expect(caver.utils.isHex(test.value)).to.be.equal(test.expected)
        })
    })
})

describe('caver.utils.isHexStrict', () => {
    context('CAVERJS-UNIT-ETC-109: input: strict hexString', () => {
        const tests = [{ value: '0xc1912', expected: true }]
        it.each(tests, 'should return true', test => {
            expect(caver.utils.isHexStrict(test.value)).to.be.equal(test.expected)
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
        it.each(tests, 'should return false', test => {
            expect(caver.utils.isHexStrict(test.value)).to.be.equal(test.expected)
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
        it.each(tests, 'should return true', test => {
            expect(caver.utils.isAddress(test.address)).to.be.equal(test.expected)
        })
    })

    context('CAVERJS-UNIT-ETC-112: input: invalid address', () => {
        const tests = [{ address: '0xC1912fEE45d61C87Cc5EA59DaE31190FFFFf232d', expected: false }]
        it.each(tests, 'should return false', test => {
            expect(caver.utils.isAddress(test.address)).to.be.equal(test.expected)
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
        it.each(tests, 'should return checksum address', test => {
            expect(caver.utils.toChecksumAddress(test.address)).to.be.equal(test.expected)
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
        it.each(tests, 'should return true', test => {
            expect(caver.utils.checkAddressChecksum(test.address)).to.be.equal(test.expected)
        })
    })

    context('CAVERJS-UNIT-ETC-116: input: invalid checksum address', () => {
        const tests = [
            { address: '0xc1912fee45d61c87cc5ea59dae31190fffff232d', expected: false },
            { address: 'c1912fee45d61c87cc5ea59dae31190fffff232d', expected: false },
            { address: '0XC1912FEE45D61C87CC5EA59DAE31190FFFFF232D', expected: false },
            { address: '0xC1912fEE45d61C87Cc5EA59DaE31190FFFFf232d', expected: false },
        ]
        it.each(tests, 'should return false', test => {
            expect(caver.utils.checkAddressChecksum(test.address)).to.be.equal(test.expected)
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
    ]

    it.each(tests, 'should return hexstring', test => {
        expect(caver.utils.toHex(test.value)).to.be.equal(test.expected)
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
        it.each(tests, 'should return true', test => {
            expect(caver.utils.isTxHashStrict(test.hash)).to.be.equal(test.expected)
        })
    })

    context('CAVERJS-UNIT-ETC-163: input: invalid strict transaction hex', () => {
        const tests = [
            { hash: `00${transactionHash.slice(2)}`, expected: false }, // doesn't start with 0x
            { hash: transactionHash.slice(2), expected: false }, // doesn't start with 0x
            { hash: `${transactionHash.slice(0, 64)}ZZ`, expected: false }, // not hex
            { hash: transactionHash.slice(0, 10), expected: false }, // length is not enough
        ]
        it.each(tests, 'should return false', test => {
            expect(caver.utils.isTxHashStrict(test.hash)).to.be.equal(test.expected)
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
        it.each(tests, 'should return true', test => {
            expect(caver.utils.isTxHash(test.hash)).to.be.equal(test.expected)
        })
    })

    context('CAVERJS-UNIT-ETC-165: input: invalid transaction hex', () => {
        const tests = [
            { hash: transactionHash.slice(4), expected: false }, // length is not enough (62)
            { hash: `${transactionHash.slice(0, 62)}ZZ`, expected: false }, // not hex
            { hash: `${transactionHash.slice(2)}00`, expected: false }, // length is too long (66 without 0x)
            { hash: `${transactionHash}00`, expected: false }, // length is too long (68)
        ]
        it.each(tests, 'should return false', test => {
            expect(caver.utils.isTxHash(test.tx)).to.be.equal(test.expected)
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
        it.each(tests, 'should return BigNumber type', test => {
            const bn = caver.utils.toBN(test.value)
            expect(caver.utils.isBN(bn)).to.be.true
            expect(bn.toString()).to.be.equal(test.expected)
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
        it.each(tests, 'should return numberString', test => {
            expect(caver.utils.hexToNumberString(test.value)).to.be.equal(test.expected)
        })
    })

    context('CAVERJS-UNIT-ETC-121: input: numberString', () => {
        const tests = [{ value: '1234', expected: (1234).toString() }]
        it.each(tests, 'should return numberString', test => {
            expect(caver.utils.hexToNumberString(test.value)).to.be.equal(test.expected)
        })
    })

    context('CAVERJS-UNIT-ETC-122: input: hexString', () => {
        const tests = [
            { value: '0x1234', expected: (0x1234).toString() },
            { value: '0x3e8', expected: '1000' },
            { value: '0x1f0fe294a36', expected: '2134567897654' },
        ]
        it.each(tests, 'should return numberString', test => {
            expect(caver.utils.hexToNumberString(test.value)).to.be.equal(test.expected)
        })
    })

    context('CAVERJS-UNIT-ETC-123: input: invalid hexString', () => {
        it('should throw an error', () => {
            const invalid = 'zzzz'
            const errorMessage = `Error: [number-to-bn] while converting number "${invalid}" to BN.js instance, error: invalid number value. Value must be an integer, hex string, BN or BigNumber instance. Note, decimals are not supported. Given value: "${invalid}"`
            expect(() => caver.utils.hexToNumberString(invalid)).to.throw(errorMessage)
        })
    })
})

// caver.utils.hexToNumber
describe('caver.utils.hexToNumber', () => {
    context('CAVERJS-UNIT-ETC-124: input: valid value', () => {
        const tests = [
            { value: 1234, expected: 1234 },
            { value: '1234', expected: 1234 },
            { value: 0x1234, expected: 4660 },
            { value: 0xea, expected: 234 },
            { value: '0xea', expected: 234 },
        ]
        it.each(tests, 'should return number', test => {
            expect(caver.utils.hexToNumber(test.value)).to.be.equal(test.expected)
        })
    })

    context('CAVERJS-UNIT-ETC-125: input: invalid value', () => {
        it('should throw an error', () => {
            const invalid = 'zzzz'
            const errorMessage = `Error: [number-to-bn] while converting number "${invalid}" to BN.js instance, error: invalid number value. Value must be an integer, hex string, BN or BigNumber instance. Note, decimals are not supported. Given value: "${invalid}"`
            expect(() => caver.utils.hexToNumber(invalid)).to.throw(errorMessage)
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
        it.each(tests, 'should return hexString', test => {
            expect(caver.utils.numberToHex(test.value)).to.equal(test.expected)
        })
    })

    context('CAVERJS-UNIT-ETC-127: input: invalid number', () => {
        it('should throw an error', () => {
            const invalid = 'zzzz'
            const errorMessage = `Given input "${invalid}" is not a number.`

            expect(() => caver.utils.numberToHex(invalid)).to.throw(errorMessage)
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
        it.each(tests, 'should return utf8 string', test => {
            expect(caver.utils.hexToUtf8(test.value)).to.be.equal(test.expected)
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
        it.each(tests, 'should return Ascii string', test => {
            expect(caver.utils.hexToAscii(test.value)).to.be.equal(test.expected)
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
    it.each(tests, 'should return hexString', test => {
        expect(caver.utils.utf8ToHex(test.value)).to.be.equal(test.expected)
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
    it.each(tests, 'should return hex String', test => {
        expect(caver.utils.asciiToHex(test.value)).to.be.equal(test.expected)
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
    it.each(tests, 'should return byteArray', test => {
        expect(caver.utils.bytesToHex(test.value)).deep.equal(test.expected)
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
        it.each(tests, 'should return string', test => {
            expect(caver.utils.toPeb(test.value).toString()).to.be.equal(test.expected.toString())
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
        it.each(tests, 'should return string', test => {
            expect(caver.utils.toPeb(test.value, test.unit)).to.be.equal(test.expected)
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
        it.each(tests, 'should return string based on unitMap', test => {
            const bn = new BigNumber(test.peb)
            const expected = (0.1 ** bn.e * test.value).toFixed(bn.e)

            expect(caver.utils.fromPeb(test.value)).to.be.equal(expected)
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
        it.each(tests, 'should return string based on unitMap', test => {
            const bn = new BigNumber(test.peb)
            const expected = (0.1 ** bn.e * test.value).toFixed(bn.e)

            expect(caver.utils.fromPeb(test.value, test.unit)).to.be.equal(expected)
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
        expect(result.uKLAY).to.equals('1000000000000')
        expect(result.mKLAY).to.equals('1000000000000000')
        expect(result.KLAY).to.equals('1000000000000000000')
        expect(result.kKLAY).to.equals('1000000000000000000000')
        expect(result.MKLAY).to.equals('1000000000000000000000000')
    })
})

describe('caver.utils.padLeft', () => {
    context('CAVERJS-UNIT-ETC-142: input: hex', () => {
        const tests = [
            { value: '0x3456ff', length: 20, expected: '0x000000000000003456ff' },
            { value: 0x3456ff, length: 20, expected: '0x000000000000003456ff' },
        ]
        it.each(tests, 'should be left-padded with 0', test => {
            expect(caver.utils.padLeft(test.value, test.length)).to.equal(test.expected)
        })
    })

    context('CAVERJS-UNIT-ETC-143: input: string', () => {
        const tests = [{ value: 'Hello', length: 20, sign: 'x', expected: 'xxxxxxxxxxxxxxxHello' }]
        it.each(tests, 'should be left padded with x', test => {
            expect(caver.utils.padLeft(test.value, test.length, test.sign)).to.equal(test.expected)
        })
    })
})

describe('caver.utils.padRight', () => {
    context('input: hex', () => {
        const tests = [
            { value: '0x3456ff', length: 20, expected: '0x3456ff00000000000000' },
            { value: 0x3456ff, length: 20, expected: '0x3456ff00000000000000' },
        ]
        it.each(tests, 'should be right padded with 0', test => {
            expect(caver.utils.padRight(test.value, test.length)).to.equal(test.expected)
        })
    })

    context('input: string', () => {
        const tests = [{ value: 'Hello', length: 20, sign: 'x', expected: 'Helloxxxxxxxxxxxxxxx' }]
        it.each(tests, 'should be right padded with x', test => {
            expect(caver.utils.padRight(test.value, test.length, test.sign)).to.equal(test.expected)
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
    it.each(tests, 'should return TwosComplement', test => {
        expect(caver.utils.toTwosComplement(test.value)).to.equal(test.expected)
    })
})

describe('CAVERJS-UNIT-ETC-145: caver.utils.isHexPrefixed', () => {
    it('caver.utils.isHexPrefixed should return boolean depends on parameter', () => {
        expect(caver.utils.isHexPrefixed('0x')).to.be.true
        expect(caver.utils.isHexPrefixed('0x0x')).to.be.true
        expect(caver.utils.isHexPrefixed('01')).to.be.false
        expect(caver.utils.isHexPrefixed({})).to.be.false
    })
})

describe('CAVERJS-UNIT-ETC-146: caver.utils.addHexPrefix', () => {
    it('caver.utils.addHexPrefix should return 0x hex format string', () => {
        expect(caver.utils.addHexPrefix('0x')).to.equals('0x')
        expect(caver.utils.addHexPrefix('01')).to.equals('0x01')
        expect(caver.utils.addHexPrefix('x')).to.equals('0xx')
        expect(typeof caver.utils.addHexPrefix({})).to.equals('object')
    })
})

describe('CAVERJS-UNIT-ETC-147: caver.utils.stripHexPrefix', () => {
    it('caver.utils.stripHexPrefix should strip 0x prefix and return string', () => {
        expect(caver.utils.stripHexPrefix('0x')).to.equals('')
        expect(caver.utils.stripHexPrefix('01')).to.equals('01')
        expect(caver.utils.stripHexPrefix('0x01')).to.equals('01')
        expect(caver.utils.stripHexPrefix('0xx')).to.equals('x')
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
})

describe('caver.utils.isValidRole', () => {
    it('CAVERJS-UNIT-ETC-176: caver.utils.isValidRole should true with valid role', () => {
        let isValid = caver.utils.isValidRole('transactionKey')
        expect(isValid).to.be.true

        isValid = caver.utils.isValidRole('updateKey')
        expect(isValid).to.be.true

        isValid = caver.utils.isValidRole('feePayerKey')
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
    })

    it('CAVERJS-UNIT-ETC-179: caver.utils.isEmptySig should false if signatures is not same with default signatures', () => {
        let isDefault = caver.utils.isEmptySig([['0x01', '0x', '0x'], ['0x01', '0x', '0x']])
        expect(isDefault).to.be.false

        isDefault = caver.utils.isEmptySig([
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
