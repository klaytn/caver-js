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

describe('caver.utils.isValidPrivateKey', done => {
    it('CAVERJS-UNIT-WALLET-086, CAVERJS-UNIT-WALLET-087 : should return false when given private key is invalid.', async () => {
        const caver = new Caver(testRPCURL)

        expect(caver.utils.isValidPrivateKey(1234)).to.equal(false)
        expect(caver.utils.isValidPrivateKey('1234')).to.equal(false)
        expect(caver.utils.isValidPrivateKey('zzzz')).to.equal(false)
        expect(caver.utils.isValidPrivateKey('aaaa')).to.equal(false)

        expect(caver.utils.isValidPrivateKey('0000000000000000000000000000000000000000000000000000000000000000')).to.equal(false)
        expect(caver.utils.isValidPrivateKey('0x0000000000000000000000000000000000000000000000000000000000000000')).to.equal(false)
        expect(caver.utils.isValidPrivateKey('0000000000000000000000000000000000000000000000000000000000000001')).to.equal(true)
        expect(caver.utils.isValidPrivateKey('0x0000000000000000000000000000000000000000000000000000000000000001')).to.equal(true)

        expect(caver.utils.isValidPrivateKey('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140')).to.equal(true)
        expect(caver.utils.isValidPrivateKey('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140FF')).to.equal(false)
        expect(caver.utils.isValidPrivateKey('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140')).to.equal(true)
        expect(caver.utils.isValidPrivateKey('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140'.toLowerCase())).to.equal(
            true
        )
        expect(caver.utils.isValidPrivateKey('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140'.toLowerCase())).to.equal(
            true
        )
    })
})
