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

const { expect } = require('./extendedChai')

const Caver = require('../index')

const caver = new Caver()

const testCases = [
    {
        uncompressed:
            '0xdbac81e8486d68eac4e6ef9db617f7fbd79a04a3b323c982a09cdfc61f0ae0e8906d7170ba349c86879fb8006134cbf57bda9db9214a90b607b6b4ab57fc026e',
        compressed: '0x02dbac81e8486d68eac4e6ef9db617f7fbd79a04a3b323c982a09cdfc61f0ae0e8',
    },
    {
        uncompressed:
            '0x6b9edd63b1bb0ed12c7de51d9a7d672e97f6a937c371a545dfc5acf3799ccbf19a692c368625f0f43a17201517123b7e26d53ef722f012c893ab4a5f865f50b2',
        compressed: '0x026b9edd63b1bb0ed12c7de51d9a7d672e97f6a937c371a545dfc5acf3799ccbf1',
    },
    {
        uncompressed:
            '0x93e9b3177137bb792fa5ebcb3cece17121f81bfb8ae39f6a5c4074b9ca207b96a645fac91e884df17f335d2908eaf103675d12eb327768e816060d1f65c25ac8',
        compressed: '0x0293e9b3177137bb792fa5ebcb3cece17121f81bfb8ae39f6a5c4074b9ca207b96',
    },
    {
        uncompressed:
            '0x1e7bcc70c72770dbb72fea022e8a6d07f814d2ebe4de9ae3f7af75bf706902a7b73ff919898c836396a6b0c96812c3213b99372050853bd1678da0ead14487d7',
        compressed: '0x031e7bcc70c72770dbb72fea022e8a6d07f814d2ebe4de9ae3f7af75bf706902a7',
    },
    {
        uncompressed:
            '0xc5ae07417506b7351379f43b8745327d5e5bffecaa209109b03820072d02d6185cf4e5c13397d82e4b8ba9681fa093fc2a1d8788c19d89e4b024ca41b8a66067',
        compressed: '0x03c5ae07417506b7351379f43b8745327d5e5bffecaa209109b03820072d02d618',
    },
    {
        // Test with x point that starts with '0'
        uncompressed:
            '0x0b88d831c595f59b7fa50bebddd11d10c77017c3aeca47056e79b143383bd2a2db1dfff0728df2ee5c742729644831f2d39c6781ee32b98b13b708d0ca349c2a',
        compressed: '0x020b88d831c595f59b7fa50bebddd11d10c77017c3aeca47056e79b143383bd2a2',
    },
    {
        // Test with y point that starts with '0'
        uncompressed:
            '0x77e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f3570b1a104b67d1cd169bbf61dd557f15ab5ee8b661326096954caddadf34ae6ac8',
        compressed: '0x0277e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f357',
    },
    {
        // Test with 04 uncompressed prefixed public key string
        uncompressed:
            '0x04019b186993b620455077b6bc37bf61666725d8d87ab33eb113ac0414cd48d78ff46e5ea48c6f22e8f19a77e5dbba9d209df60cbcb841b7e3e81fe444ba829831',
        compressed: '0x03019b186993b620455077b6bc37bf61666725d8d87ab33eb113ac0414cd48d78f',
    },
]

describe('caver.utils.compressPublicKey', () => {
    it('CAVERJS-UNIT-SER-022 : Should return compressed public key if the argument is uncompressed public key', () => {
        expect(caver.utils.compressPublicKey(testCases[0].uncompressed)).to.equal(testCases[0].compressed)
        expect(caver.utils.compressPublicKey(testCases[1].uncompressed)).to.equal(testCases[1].compressed)
        expect(caver.utils.compressPublicKey(testCases[2].uncompressed)).to.equal(testCases[2].compressed)
        expect(caver.utils.compressPublicKey(testCases[3].uncompressed)).to.equal(testCases[3].compressed)
        expect(caver.utils.compressPublicKey(testCases[4].uncompressed)).to.equal(testCases[4].compressed)
        expect(caver.utils.compressPublicKey(testCases[5].uncompressed)).to.equal(testCases[5].compressed)
        expect(caver.utils.compressPublicKey(testCases[6].uncompressed)).to.equal(testCases[6].compressed)
        expect(caver.utils.compressPublicKey(testCases[7].uncompressed)).to.equal(testCases[7].compressed)
    })

    it('CAVERJS-UNIT-SER-023 : Should return same one with the argument if the argument is compressed public key', () => {
        expect(caver.utils.compressPublicKey(testCases[0].compressed)).to.equal(testCases[0].compressed)
        expect(caver.utils.compressPublicKey(testCases[1].compressed)).to.equal(testCases[1].compressed)
        expect(caver.utils.compressPublicKey(testCases[2].compressed)).to.equal(testCases[2].compressed)
        expect(caver.utils.compressPublicKey(testCases[3].compressed)).to.equal(testCases[3].compressed)
        expect(caver.utils.compressPublicKey(testCases[4].compressed)).to.equal(testCases[4].compressed)
        expect(caver.utils.compressPublicKey(testCases[5].compressed)).to.equal(testCases[5].compressed)
        expect(caver.utils.compressPublicKey(testCases[6].compressed)).to.equal(testCases[6].compressed)
        expect(caver.utils.compressPublicKey(testCases[7].compressed)).to.equal(testCases[7].compressed)
    })

    it('CAVERJS-UNIT-SER-068: Should throw error if public key is invalid', () => {
        const invalidFormat = '0x019b186993b620455077b6bc37bf61666725d8d87ab33eb113ac0414cd48d78f'
        const expectedError = `Invalid public key`
        expect(() => caver.utils.compressPublicKey(invalidFormat)).to.throw(expectedError)
    })
})

describe('caver.utils.isCompressedPublicKey', () => {
    it('CAVERJS-UNIT-SER-025: Should return false if the argument is uncompressed public key', () => {
        expect(caver.utils.isCompressedPublicKey(testCases[0].uncompressed)).to.be.false
        expect(caver.utils.isCompressedPublicKey(testCases[1].uncompressed)).to.be.false
        expect(caver.utils.isCompressedPublicKey(testCases[2].uncompressed)).to.be.false
        expect(caver.utils.isCompressedPublicKey(testCases[3].uncompressed)).to.be.false
        expect(caver.utils.isCompressedPublicKey(testCases[4].uncompressed)).to.be.false
        expect(caver.utils.isCompressedPublicKey(testCases[5].uncompressed)).to.be.false
        expect(caver.utils.isCompressedPublicKey(testCases[6].uncompressed)).to.be.false
    })

    it('CAVERJS-UNIT-SER-026: Should return true if the argument is compressed public key', () => {
        expect(caver.utils.isCompressedPublicKey(testCases[0].compressed)).to.be.true
        expect(caver.utils.isCompressedPublicKey(testCases[1].compressed)).to.be.true
        expect(caver.utils.isCompressedPublicKey(testCases[2].compressed)).to.be.true
        expect(caver.utils.isCompressedPublicKey(testCases[3].compressed)).to.be.true
        expect(caver.utils.isCompressedPublicKey(testCases[4].compressed)).to.be.true
        expect(caver.utils.isCompressedPublicKey(testCases[5].compressed)).to.be.true
        expect(caver.utils.isCompressedPublicKey(testCases[6].compressed)).to.be.true
    })
})

describe('caver.utils.decompressPublicKey', () => {
    it('CAVERJS-UNIT-SER-066: Should return uncompressed public key if the argument is compressed public key', () => {
        expect(caver.utils.decompressPublicKey(testCases[0].compressed)).to.equal(testCases[0].uncompressed)
        expect(caver.utils.decompressPublicKey(testCases[1].compressed)).to.equal(testCases[1].uncompressed)
        expect(caver.utils.decompressPublicKey(testCases[2].compressed)).to.equal(testCases[2].uncompressed)
        expect(caver.utils.decompressPublicKey(testCases[3].compressed)).to.equal(testCases[3].uncompressed)
        expect(caver.utils.decompressPublicKey(testCases[4].compressed)).to.equal(testCases[4].uncompressed)
        expect(caver.utils.decompressPublicKey(testCases[5].compressed)).to.equal(testCases[5].uncompressed)
        expect(caver.utils.decompressPublicKey(testCases[6].compressed)).to.equal(testCases[6].uncompressed)
    })

    it('CAVERJS-UNIT-SER-067: Should return same one with the argument if the argument is uncompressed public key', () => {
        expect(caver.utils.decompressPublicKey(testCases[0].uncompressed)).to.equal(testCases[0].uncompressed)
        expect(caver.utils.decompressPublicKey(testCases[1].uncompressed)).to.equal(testCases[1].uncompressed)
        expect(caver.utils.decompressPublicKey(testCases[2].uncompressed)).to.equal(testCases[2].uncompressed)
        expect(caver.utils.decompressPublicKey(testCases[3].uncompressed)).to.equal(testCases[3].uncompressed)
        expect(caver.utils.decompressPublicKey(testCases[4].uncompressed)).to.equal(testCases[4].uncompressed)
        expect(caver.utils.decompressPublicKey(testCases[5].uncompressed)).to.equal(testCases[5].uncompressed)
        expect(caver.utils.decompressPublicKey(testCases[6].uncompressed)).to.equal(testCases[6].uncompressed)
    })

    it('CAVERJS-UNIT-SER-069: Should throw error if public key is invalid', () => {
        const invalidFormat =
            '0xe05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f3570b1a104b67d1cd169bbf61dd557f15ab5ee8b661326096954caddadf34ae6ac8'
        const expectedError = `Invalid public key`
        expect(() => caver.utils.compressPublicKey(invalidFormat)).to.throw(expectedError)
    })
})
