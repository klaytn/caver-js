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

const Caver = require('../index.js')
const testRPCURL = require('./testrpc')

describe('caver.utils.isCompressedPublicKey', done => {
    it('CAVERJS-UNIT-SER-025 : Should return false if the argument is uncompressed public key', () => {
        const caver = new Caver(testRPCURL)

        const uncompressedPublicKey1 =
            '0xdbac81e8486d68eac4e6ef9db617f7fbd79a04a3b323c982a09cdfc61f0ae0e8906d7170ba349c86879fb8006134cbf57bda9db9214a90b607b6b4ab57fc026e'
        const uncompressedPublicKey2 =
            '0x6b9edd63b1bb0ed12c7de51d9a7d672e97f6a937c371a545dfc5acf3799ccbf19a692c368625f0f43a17201517123b7e26d53ef722f012c893ab4a5f865f50b2'
        const uncompressedPublicKey3 =
            '0x93e9b3177137bb792fa5ebcb3cece17121f81bfb8ae39f6a5c4074b9ca207b96a645fac91e884df17f335d2908eaf103675d12eb327768e816060d1f65c25ac8'

        expect(caver.utils.isCompressedPublicKey(uncompressedPublicKey1)).to.false
        expect(caver.utils.isCompressedPublicKey(uncompressedPublicKey2)).to.false
        expect(caver.utils.isCompressedPublicKey(uncompressedPublicKey3)).to.false
        expect(caver.utils.isCompressedPublicKey(uncompressedPublicKey1.slice(2))).to.false
        expect(caver.utils.isCompressedPublicKey(uncompressedPublicKey2.slice(2))).to.false
        expect(caver.utils.isCompressedPublicKey(uncompressedPublicKey3.slice(2))).to.false
    })

    it('CAVERJS-UNIT-SER-026 : Should return true if the argument is compressed public key', () => {
        const caver = new Caver(testRPCURL)

        const compressedPublicKey1 = '0x02dbac81e8486d68eac4e6ef9db617f7fbd79a04a3b323c982a09cdfc61f0ae0e8'
        const compressedPublicKey2 = '0x026b9edd63b1bb0ed12c7de51d9a7d672e97f6a937c371a545dfc5acf3799ccbf1'
        const compressedPublicKey3 = '0x0293e9b3177137bb792fa5ebcb3cece17121f81bfb8ae39f6a5c4074b9ca207b96'

        expect(caver.utils.isCompressedPublicKey(compressedPublicKey1)).to.true
        expect(caver.utils.isCompressedPublicKey(compressedPublicKey2)).to.true
        expect(caver.utils.isCompressedPublicKey(compressedPublicKey3)).to.true
        expect(caver.utils.isCompressedPublicKey(compressedPublicKey1.slice(2))).to.true
        expect(caver.utils.isCompressedPublicKey(compressedPublicKey2.slice(2))).to.true
        expect(caver.utils.isCompressedPublicKey(compressedPublicKey3.slice(2))).to.true
    })
})
